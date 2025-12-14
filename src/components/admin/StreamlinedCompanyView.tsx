/**
 * Streamlined Company View for Sales Center
 * Shows ONLY: Tools, Subscriptions, Consumables (NO order history bloat)
 */

'use client';

interface StreamlinedCompanyViewProps {
  company: any;
  tools: any[];
  subscriptions: any[];
  consumables: any[];
  contacts: any[];
}

export default function StreamlinedCompanyView({
  company,
  tools,
  subscriptions,
  consumables,
  contacts,
}: StreamlinedCompanyViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{tools.length}</div>
          <div className="text-sm text-gray-600">Machines Installed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{subscriptions.length}</div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{consumables.length}</div>
          <div className="text-sm text-gray-600">Recent Consumables</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tools Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Machines</h2>
            </div>
            <div className="p-6">
              {tools.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No machines installed yet</p>
              ) : (
                <div className="space-y-4">
                  {tools.map((tool) => (
                    <div
                      key={tool.tool_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{tool.model}</h3>
                          <p className="text-sm text-gray-600">S/N: {tool.serial_number}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Installed: {tool.install_date ? new Date(tool.install_date).toLocaleDateString('en-GB') : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {subscriptions.some(s => s.tools?.includes(tool.tool_id)) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Subscribed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              No Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Active Subscriptions</h2>
            </div>
            <div className="p-6">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No active subscriptions</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Start Trial
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.subscription_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {sub.status === 'trial' ? 'Trial Subscription' : 'Active Subscription'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {sub.tools?.length || 0} machine(s) covered
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sub.status === 'trial'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      {sub.status === 'trial' && sub.trial_end_date && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-3">
                          <p className="text-sm text-orange-800">
                            <strong>Trial ends:</strong>{' '}
                            {new Date(sub.trial_end_date).toLocaleDateString('en-GB')} (
                            {Math.ceil((new Date(sub.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
                          </p>
                        </div>
                      )}

                      {sub.next_billing_date && sub.status === 'active' && (
                        <p className="text-sm text-gray-600">
                          Next billing: {new Date(sub.next_billing_date).toLocaleDateString('en-GB')}
                        </p>
                      )}

                      {sub.status === 'trial' && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                            Convert to Paid
                          </button>
                          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                            Extend Trial
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consumables Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Consumables</h2>
              <p className="text-sm text-gray-600 mt-1">Last 3 orders only (not full history)</p>
            </div>
            <div className="p-6">
              {consumables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No recent consumable orders</p>
              ) : (
                <div className="space-y-3">
                  {consumables.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{item.description}</h4>
                        <p className="text-xs text-gray-500">Code: {item.product_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(item.order_date).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.floor((Date.now() - new Date(item.order_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {consumables.length > 0 && (
                <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
                  Send Reorder Reminder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Contacts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Contacts</h2>
            </div>
            <div className="p-6">
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-600">No contacts</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.contact_id} className="pb-3 border-b border-gray-100 last:border-b-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                      </h4>
                      <p className="text-xs text-gray-600">{contact.email}</p>
                      {contact.phone && <p className="text-xs text-gray-600">{contact.phone}</p>}
                      {contact.is_primary && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Company Info</h2>
            </div>
            <div className="p-6 space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Country:</span>{' '}
                <span className="font-medium text-gray-900">{company.country || 'UK'}</span>
              </div>
              {company.vat_number && (
                <div>
                  <span className="text-gray-600">VAT:</span>{' '}
                  <span className="font-medium text-gray-900">{company.vat_number}</span>
                </div>
              )}
              {company.eori_number && (
                <div>
                  <span className="text-gray-600">EORI:</span>{' '}
                  <span className="font-medium text-gray-900">{company.eori_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Need full audit history?</h3>
            <a
              href={`/admin/company/${company.company_id}`}
              className="block w-full px-4 py-2 bg-white text-blue-700 text-center rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              View in CRM →
            </a>
            <p className="text-xs text-blue-700 mt-2">
              Full order history, invoices, and complete audit trail available in CRM section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
