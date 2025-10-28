/**
 * Admin Reorder Page
 * /admin/reorder - Push-button reorder reminder outreach
 */

import { getSupabaseClient } from '@/lib/supabase';
import ReorderTable from '@/components/admin/ReorderTable';

export default async function ReorderPage() {
  const supabase = getSupabaseClient();

  // Fetch companies due for reorder (using the existing views)
  const { data: reorder90 } = await supabase
    .from('vw_due_consumable_reminders_90')
    .select('*')
    .limit(100);

  const { data: reorder180 } = await supabase
    .from('vw_due_consumable_reminders_180')
    .select('*')
    .limit(100);

  const { data: reorder365 } = await supabase
    .from('vw_due_consumable_reminders_365')
    .select('*')
    .limit(100);

  // Combine and deduplicate by company_id
  const allReorders = [
    ...(reorder90 || []).map(r => ({ ...r, due_category: '90_days' })),
    ...(reorder180 || []).map(r => ({ ...r, due_category: '180_days' })),
    ...(reorder365 || []).map(r => ({ ...r, due_category: '365_days' }))
  ];

  // Get unique company IDs
  const companyIds = [...new Set(allReorders.map(r => r.company_id))];

  // Fetch company details
  let companiesData: Record<string, any> = {};
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .in('company_id', companyIds);

    if (companies) {
      companies.forEach(c => {
        companiesData[c.company_id] = c;
      });
    }
  }

  // Get contacts for each company
  let contactsData: Record<string, any[]> = {};
  if (companyIds.length > 0) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('contact_id, company_id, email, first_name, last_name, marketing_status')
      .in('company_id', companyIds)
      .in('marketing_status', ['opted_in', 'pending']);

    if (contacts) {
      contacts.forEach(c => {
        if (!contactsData[c.company_id]) {
          contactsData[c.company_id] = [];
        }
        contactsData[c.company_id].push(c);
      });
    }
  }

  // Group reorders by company
  const reordersByCompany: Record<string, any[]> = {};
  allReorders.forEach(r => {
    if (!reordersByCompany[r.company_id]) {
      reordersByCompany[r.company_id] = [];
    }
    reordersByCompany[r.company_id].push(r);
  });

  // Build final data structure
  const reorderData = companyIds.map(companyId => {
    const company = companiesData[companyId];
    const items = reordersByCompany[companyId] || [];
    const contacts = contactsData[companyId] || [];

    // Get most urgent category
    const urgency = items.some(i => i.due_category === '90_days')
      ? '90_days'
      : items.some(i => i.due_category === '180_days')
      ? '180_days'
      : '365_days';

    return {
      company_id: companyId,
      company_name: company?.company_name || companyId,
      account_owner: company?.account_owner,
      items,
      contacts,
      urgency
    };
  });

  // Sort by urgency
  reorderData.sort((a, b) => {
    const urgencyRank = { '90_days': 1, '180_days': 2, '365_days': 3 };
    return urgencyRank[a.urgency as keyof typeof urgencyRank] - urgencyRank[b.urgency as keyof typeof urgencyRank];
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consumables Reorder Reminders
          </h1>
          <p className="text-gray-600">
            Companies overdue for restocking • Send reminders in one click
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-red-800 uppercase tracking-wide">High Priority</div>
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-red-700 mb-1">{(reorder90 || []).length}</div>
            <div className="text-sm text-red-600">Due 90+ days ago</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-orange-800 uppercase tracking-wide">Medium</div>
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-orange-700 mb-1">{(reorder180 || []).length}</div>
            <div className="text-sm text-orange-600">Due 180+ days ago</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Low</div>
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-yellow-700 mb-1">{(reorder365 || []).length}</div>
            <div className="text-sm text-yellow-600">Due 365+ days ago</div>
          </div>
        </div>

        <ReorderTable reorders={reorderData} />
      </div>
    </div>
  );
}
