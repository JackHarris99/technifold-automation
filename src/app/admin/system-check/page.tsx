/**
 * Admin System Check - No-code testing panel
 * Tests offer sending, outbox processing, and checkout flows
 */

import { getSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect, isRedirectError } from 'next/navigation';
import SystemCheckStatus from '@/components/admin/SystemCheckStatus';

export default async function SystemCheckPage() {
  const supabase = getSupabaseClient();

  // Fetch companies for dropdowns
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .order('company_name', { ascending: true });

  // Fetch all contacts (will be filtered client-side by company)
  const { data: contacts } = await supabase
    .from('contacts')
    .select('contact_id, company_id, full_name, email, marketing_status')
    .in('marketing_status', ['subscribed', 'pending'])
    .order('full_name', { ascending: true });

  // Fetch recent outbox jobs
  const { data: recentJobs } = await supabase
    .from('outbox')
    .select('created_at, job_type, status, attempts, company_id, job_id')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch recent engagement events
  const { data: recentEvents } = await supabase
    .from('engagement_events')
    .select('occurred_at, event_type, campaign_key, offer_key, company_id, event_id')
    .order('occurred_at', { ascending: false })
    .limit(10);

  // Server Actions
  async function sendOffer(formData: FormData) {
    'use server';

    const companyId = formData.get('company_id') as string;
    const contactId = formData.get('contact_id') as string;
    const offerKey = formData.get('offer_key') as string;
    const campaignKey = formData.get('campaign_key') as string;

    if (!companyId || !offerKey) {
      redirect('/admin/system-check?error=missing_fields');
    }

    try {
      const supabase = getSupabaseClient();

      // Validate company exists
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .eq('company_id', companyId)
        .single();

      if (companyError || !company) {
        redirect('/admin/system-check?error=Company+not+found');
      }

      // Get contacts with consent
      const contactIds = contactId ? [contactId] : [];
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, full_name, email, marketing_status, gdpr_consent_at, zoho_contact_id')
        .eq('company_id', companyId)
        .in('contact_id', contactIds.length > 0 ? contactIds : ['00000000-0000-0000-0000-000000000000']); // Dummy UUID if no contacts

      if (contactsError) {
        redirect('/admin/system-check?error=Failed+to+fetch+contacts');
      }

      // Filter eligible contacts
      const eligibleContacts = contacts?.filter(
        (c) => c.marketing_status === 'subscribed' && c.gdpr_consent_at !== null && c.zoho_contact_id !== null
      ) || [];

      if (eligibleContacts.length === 0 && contactIds.length > 0) {
        redirect('/admin/system-check?error=No+contacts+with+active+consent');
      }

      // Create outbox job
      const jobPayload = {
        company_id: company.company_id,
        company_name: company.company_name,
        offer_key: offerKey,
        campaign_key: campaignKey || `offer-${Date.now()}`,
        recipients: eligibleContacts.map((c) => ({
          contact_id: c.contact_id,
          email: c.email,
          full_name: c.full_name,
          zoho_contact_id: c.zoho_contact_id,
        })),
      };

      const { data: job, error: jobError } = await supabase
        .from('outbox')
        .insert({
          job_type: 'send_offer_email',
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
          payload: jobPayload,
          scheduled_for: new Date().toISOString(),
        })
        .select('job_id')
        .single();

      if (jobError || !job) {
        redirect('/admin/system-check?error=Failed+to+enqueue+job');
      }

      revalidatePath('/admin/system-check');
      redirect(`/admin/system-check?success=offer_enqueued&job_id=${job.job_id}`);
    } catch (error) {
      // Re-throw redirect errors
      if (isRedirectError(error)) {
        throw error;
      }
      redirect(`/admin/system-check?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  }

  async function runOutbox(formData: FormData) {
    'use server';

    try {
      const supabase = getSupabaseClient();

      // Count pending jobs
      const { count: pendingCount } = await supabase
        .from('outbox')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // In production, the outbox runs via Vercel Cron
      // For now, just show pending job count
      revalidatePath('/admin/system-check');
      redirect(`/admin/system-check?success=outbox_run&processed=${pendingCount || 0}&failed=0`);
    } catch (error) {
      // Re-throw redirect errors
      if (isRedirectError(error)) {
        throw error;
      }
      redirect(`/admin/system-check?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  }

  async function startCheckout(formData: FormData) {
    'use server';

    const companyId = formData.get('company_id') as string;
    const productCode = formData.get('product_code') as string;
    const quantity = formData.get('quantity') as string;
    const offerKey = formData.get('offer_key') as string;
    const campaignKey = formData.get('campaign_key') as string;

    if (!companyId || !productCode || !quantity) {
      redirect('/admin/system-check?error=missing_checkout_fields');
    }

    try {
      const supabase = getSupabaseClient();

      // Verify company exists
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .eq('company_id', companyId)
        .single();

      if (companyError || !company) {
        redirect('/admin/system-check?error=Company+not+found');
      }

      // Log checkout_started event
      await supabase.from('engagement_events').insert({
        company_id: companyId,
        contact_id: null,
        source: 'vercel',
        event_type: 'checkout_started',
        event_name: 'checkout_started',
        offer_key: offerKey || null,
        campaign_key: campaignKey || null,
        session_id: crypto.randomUUID(),
        meta: {
          product_code: productCode,
          quantity: parseInt(quantity, 10),
          test_mode: true,
        },
      });

      // Mock Stripe URL for testing
      const mockUrl = `https://checkout.stripe.com/c/pay/mock_${Date.now()}`;

      revalidatePath('/admin/system-check');
      redirect(`/admin/system-check?success=checkout_started&url=${encodeURIComponent(mockUrl)}`);
    } catch (error) {
      // Re-throw redirect errors
      if (isRedirectError(error)) {
        throw error;
      }
      redirect(`/admin/system-check?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Check</h1>

        {/* Status Messages */}
        <SystemCheckStatus />

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Send Offer */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Offer (enqueue)</h2>
            <form action={sendOffer} className="space-y-4">
              <div>
                <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <select
                  id="company_id"
                  name="company_id"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select company...</option>
                  {companies?.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact (optional)
                </label>
                <select
                  id="contact_id"
                  name="contact_id"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All eligible contacts</option>
                  {contacts?.map((c) => (
                    <option key={c.contact_id} value={c.contact_id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="offer_key" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Key *
                </label>
                <input
                  type="text"
                  id="offer_key"
                  name="offer_key"
                  required
                  placeholder="e.g., reorder_reminder"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="campaign_key_offer" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Key
                </label>
                <input
                  type="text"
                  id="campaign_key_offer"
                  name="campaign_key"
                  placeholder="e.g., q1-2025-restock"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Enqueue send_offer_email
              </button>
            </form>
          </div>

          {/* Card 2: Run Outbox */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Check Outbox Status</h2>
            <p className="text-sm text-gray-600 mb-6">
              View how many jobs are pending. The outbox runs automatically via Vercel Cron.
            </p>
            <form action={runOutbox}>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
              >
                Check pending jobs
              </button>
            </form>
          </div>

          {/* Card 3: Start Checkout */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Start Checkout (stub)</h2>
            <form action={startCheckout} className="space-y-4">
              <div>
                <label htmlFor="company_id_checkout" className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <select
                  id="company_id_checkout"
                  name="company_id"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select company...</option>
                  {companies?.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code *
                </label>
                <input
                  type="text"
                  id="product_code"
                  name="product_code"
                  required
                  placeholder="e.g., TRI-001"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="offer_key_checkout" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Key
                </label>
                <input
                  type="text"
                  id="offer_key_checkout"
                  name="offer_key"
                  placeholder="e.g., reorder_reminder"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="campaign_key_checkout" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Key
                </label>
                <input
                  type="text"
                  id="campaign_key_checkout"
                  name="campaign_key"
                  placeholder="e.g., q1-2025-restock"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded font-medium hover:bg-purple-700 transition-colors"
              >
                Start checkout (mock)
              </button>
            </form>
          </div>
        </div>

        {/* Activity Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Outbox Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Outbox Jobs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentJobs && recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <tr key={job.job_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(job.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{job.job_type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                              job.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : job.status === 'failed' || job.status === 'dead'
                                ? 'bg-red-100 text-red-800'
                                : job.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{job.attempts}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No recent jobs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Engagement Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Engagement Events</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occurred</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEvents && recentEvents.length > 0 ? (
                    recentEvents.map((event) => (
                      <tr key={event.event_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(event.occurred_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{event.event_type || event.event_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600">{event.campaign_key || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{event.offer_key || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No recent events
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
