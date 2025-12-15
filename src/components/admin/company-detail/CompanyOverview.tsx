/**
 * Company Overview Section
 * Basic company info and contacts
 */

'use client';

export default function CompanyOverview({ company, contacts }: { company: any; contacts: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Company Details</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-600">Country</div>
          <div className="font-semibold">{company.country || 'UK'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Type</div>
          <div className="font-semibold">{company.type || 'customer'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Category</div>
          <div className="font-semibold">{company.category || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Account Owner</div>
          <div className="font-semibold">{company.account_owner || 'Unassigned'}</div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Contacts ({contacts.length})</h3>
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <p className="text-gray-600 text-sm">No contacts</p>
          ) : (
            contacts.slice(0, 5).map((contact) => (
              <div key={contact.contact_id} className="text-sm">
                <div className="font-semibold">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                <div className="text-gray-600">{contact.email}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
