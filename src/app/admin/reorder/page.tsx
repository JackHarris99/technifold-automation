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
            Reorder Reminders
          </h1>
          <p className="text-gray-600">
            Companies due for consumable restock - send reminders with one click
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-red-600">{(reorder90 || []).length}</div>
            <div className="text-sm text-gray-600">Due 90+ days</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-600">{(reorder180 || []).length}</div>
            <div className="text-sm text-gray-600">Due 180+ days</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-600">{(reorder365 || []).length}</div>
            <div className="text-sm text-gray-600">Due 365+ days</div>
          </div>
        </div>

        <ReorderTable reorders={reorderData} />
      </div>
    </div>
  );
}
