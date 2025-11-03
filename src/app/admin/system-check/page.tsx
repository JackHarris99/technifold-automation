/**
 * Admin System Check - No-code testing panel
 * Tests offer sending, outbox processing, and checkout flows
 */

import { getSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import SystemCheckStatus from '@/components/admin/SystemCheckStatus';
import SendOfferForm from '@/components/admin/SendOfferForm';

export default async function SystemCheckPage() {
  const supabase = getSupabaseClient();

  // Fetch companies for dropdowns
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .order('company_name', { ascending: true })
    .limit(5000);

  // Contacts are now fetched dynamically by SendOfferForm when a company is selected
  // This avoids the Supabase 1000-row pagination issue where first 1000 companies
  // don't align with first 1000 contacts (only 20.2% overlap)

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

    // Get contacts (for testing: no filtering by marketing_status or consent)
    let contactQuery = supabase
      .from('contacts')
      .select('contact_id, full_name, email')
      .eq('company_id', companyId);

    // If specific contact selected, filter by it
    if (contactId) {
      contactQuery = contactQuery.eq('contact_id', contactId);
    }

    const { data: contacts, error: contactsError } = await contactQuery;

    if (contactsError) {
      console.error('[system-check] Contact query error:', contactsError);
      console.error('[system-check] Query params - companyId:', companyId, 'contactId:', contactId);
      redirect(`/admin/system-check?error=${encodeURIComponent('Contact query failed: ' + contactsError.message)}`);
    }

    console.log('[system-check] Found contacts:', contacts?.length || 0);

    // For testing: use all contacts without filtering
    // In production, you would filter by: marketing_status='subscribed' AND gdpr_consent_at IS NOT NULL
    const eligibleContacts = contacts || [];

    console.log('[system-check] Using contacts for testing:', eligibleContacts.length);

    if (eligibleContacts.length === 0) {
      redirect('/admin/system-check?error=No+contacts+found+for+this+company');
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
      })
      .select('job_id')
      .single();

    if (jobError || !job) {
      console.error('[system-check] Failed to insert outbox job:', jobError);
      console.error('[system-check] Job payload:', JSON.stringify(jobPayload, null, 2));
      redirect(`/admin/system-check?error=${encodeURIComponent('Failed to enqueue job: ' + (jobError?.message || 'Unknown error'))}`);
    }

    revalidatePath('/admin/system-check');
    redirect(`/admin/system-check?success=offer_enqueued&job_id=${job.job_id}`);
  }

  async function runOutbox(formData: FormData) {
    'use server';

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
            <SendOfferForm
              companies={companies || []}
              sendOfferAction={sendOffer}
            />
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
