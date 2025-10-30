/**
 * Contacts & Details Tab - Manage contacts and company info
 */

'use client';

export default function ContactsTab({ companyId, company, contacts }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Contacts & Company Details</h2>

      {/* Contacts List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contacts ({contacts.length})</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {contacts.map((contact: any) => (
            <div key={contact.contact_id} className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900">
                {contact.full_name || `${contact.first_name} ${contact.last_name}`}
              </div>
              {contact.email && <div className="text-sm text-gray-600">{contact.email}</div>}
              {contact.marketing_status && (
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  contact.marketing_status === 'opted_in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {contact.marketing_status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
