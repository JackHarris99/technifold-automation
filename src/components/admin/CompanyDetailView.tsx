/**
 * Company Detail View - Comprehensive Single-Page View
 * Clean rebuild with all company data in one place
 */

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface CompanyDetailViewProps {
  company: any;
  contacts: any[];
  purchasedTools: any[];
  purchasedConsumables: any[];
  purchasedParts: any[];
  subscriptionTools: any[];
  invoices: any[];
  engagement: any[];
  subscriptions: any[];
}

export default function CompanyDetailView({
  company,
  contacts,
  purchasedTools,
  purchasedConsumables,
  purchasedParts,
  subscriptionTools,
  invoices,
  engagement,
  subscriptions,
}: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Track when component is mounted (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: Track modal state changes
  useEffect(() => {
    console.log('[CompanyDetail] useEffect - showEmailModal changed to:', showEmailModal);
  }, [showEmailModal]);

  console.log('[CompanyDetail] Component render - showEmailModal:', showEmailModal);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'products', label: 'Products', count: purchasedTools.length + purchasedConsumables.length + purchasedParts.length },
    { id: 'subscriptions', label: 'Subscriptions', count: subscriptionTools.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'engagement', label: 'Engagement', count: engagement.length },
  ];

  async function handleSendReorderEmail() {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/admin/reorder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          contact_ids: selectedContacts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully sent reorder emails to ${selectedContacts.length} contact(s)!`);
        setShowEmailModal(false);
        setSelectedContacts([]);
      } else {
        alert(`Error: ${data.error || 'Failed to send emails'}`);
      }
    } catch (error) {
      alert('Error sending emails. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  }

  function toggleContact(contactId: string) {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/companies"
                className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
              >
                ← Back to Companies
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
              <p className="text-gray-500 mt-1">{company.company_id}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('[CompanyDetail] Opening email modal, contacts:', contacts.length);
                  setShowEmailModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send Reorder Email
              </button>
              <Link
                href={`/admin/invoices/new?company_id=${company.company_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Create Invoice
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab company={company} contacts={contacts} />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            tools={purchasedTools}
            consumables={purchasedConsumables}
            parts={purchasedParts}
            companyId={company.company_id}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptionTools={subscriptionTools}
            subscriptions={subscriptions}
            companyId={company.company_id}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTab invoices={invoices} companyId={company.company_id} />
        )}

        {activeTab === 'engagement' && (
          <EngagementTab engagement={engagement} />
        )}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ company, contacts }: { company: any; contacts: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Account Owner</dt>
            <dd className="text-sm font-medium">{company.account_owner || 'Unassigned'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Category</dt>
            <dd className="text-sm font-medium">{company.category || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Country</dt>
            <dd className="text-sm font-medium">{company.country || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Website</dt>
            <dd className="text-sm font-medium">
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {company.website}
                </a>
              ) : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Stripe Customer ID</dt>
            <dd className="text-sm font-mono text-gray-600">{company.stripe_customer_id || 'Not set'}</dd>
          </div>
        </dl>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contacts ({contacts.length})</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">+ Add Contact</button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-gray-500 text-sm">No contacts yet</p>
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.contact_id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="font-medium text-sm">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                <div className="text-sm text-gray-500">{contact.email}</div>
                {contact.role && <div className="text-xs text-gray-400 mt-1">{contact.role}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Products Tab
function ProductsTab({ tools, consumables, parts, companyId }: any) {
  return (
    <div className="space-y-6">
      {/* Purchased Tools */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Purchased Tools ({tools.length})</h2>
          <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
            + Add Tool
          </button>
        </div>
        <div className="p-6">
          {tools.length === 0 ? (
            <p className="text-gray-500 text-sm">No tools purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium">{item.products?.description || item.product_code}</div>
                  <div className="text-xs text-gray-500 mt-1">SKU: {item.product_code}</div>
                  <div className="text-sm text-gray-600 mt-2">Qty: {item.total_quantity}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Last: {item.last_purchased_at}
                  </div>
                  {item.source === 'manual' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mt-2 inline-block">
                      Manually Added
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchased Consumables */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Purchased Consumables ({consumables.length})</h2>
        </div>
        <div className="p-6">
          {consumables.length === 0 ? (
            <p className="text-gray-500 text-sm">No consumables purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consumables.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-sm">{item.products?.description || item.product_code}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.product_code}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {item.total_purchases} orders • {item.total_quantity} total
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Last: {item.last_purchased_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Other Parts */}
      {parts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Other Parts ({parts.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parts.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-sm">{item.products?.description || item.product_code}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.product_code}</div>
                  <div className="text-xs text-gray-600 mt-2">Qty: {item.total_quantity}</div>
                  <div className="text-xs text-gray-400 mt-1">Last: {item.last_purchased_at}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subscriptions Tab
function SubscriptionsTab({ subscriptionTools, subscriptions, companyId }: any) {
  const activeSub = subscriptions[0];

  return (
    <div className="space-y-6">
      {/* Active Subscription Info */}
      {activeSub && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Active Subscription</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-lg font-medium capitalize">{activeSub.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Monthly Price</div>
              <div className="text-lg font-medium">£{activeSub.monthly_price}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Next Billing</div>
              <div className="text-sm">{activeSub.next_billing_date || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tools on Subscription */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tools on Subscription ({subscriptionTools.length})</h2>
          <button className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
            + Add Tool to Subscription
          </button>
        </div>
        <div className="p-6">
          {subscriptionTools.length === 0 ? (
            <p className="text-gray-500 text-sm">No tools on subscription</p>
          ) : (
            <div className="space-y-3">
              {subscriptionTools.map((item: any) => (
                <div key={item.tool_code} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                  <div>
                    <div className="font-medium">{item.products?.description || item.tool_code}</div>
                    <div className="text-xs text-gray-500 mt-1">SKU: {item.tool_code}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Added: {item.added_at} {item.added_by && `by ${item.added_by}`}
                    </div>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Invoices Tab
function InvoicesTab({ invoices, companyId }: any) {
  const totalRevenue = invoices
    .filter((inv: any) => inv.payment_status === 'paid')
    .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total Revenue (Since Launch)</div>
            <div className="text-2xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Invoices</div>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Paid</div>
            <div className="text-2xl font-bold">
              {invoices.filter((inv: any) => inv.payment_status === 'paid').length}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-6 text-gray-500 text-sm">No invoices yet</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.invoice_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {invoice.invoice_number || invoice.stripe_invoice_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.invoice_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      £{invoice.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.invoice_url && (
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Send Reorder Email Modal - Rendered via Portal */}
      {showEmailModal && typeof window !== 'undefined' && (() => {
        console.log('[Portal] Creating portal for modal');
        return createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={(e) => {
              console.log('[Modal] Background clicked');
            if (e.target === e.currentTarget) {
              setShowEmailModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Send Reorder Email</h2>
                  <p className="text-gray-600 mt-1">
                    Select contacts to receive personalized reorder emails with tokenized links
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts found for this company. Add contacts first.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setSelectedContacts(contacts.map(c => c.contact_id))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedContacts([])}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Clear
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedContacts.length} of {contacts.length} selected
                    </span>
                  </div>

                  {contacts.map((contact) => (
                    <label
                      key={contact.contact_id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contact_id)}
                        onChange={() => toggleContact(contact.contact_id)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.full_name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedContacts([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendReorderEmail}
                disabled={sendingEmail || selectedContacts.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {sendingEmail ? 'Sending...' : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      );
      })()}
    </div>
  );
}

// Engagement Tab
function EngagementTab({ engagement }: { engagement: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Engagement Timeline ({engagement.length})</h2>
      </div>
      <div className="p-6">
        {engagement.length === 0 ? (
          <p className="text-gray-500 text-sm">No engagement events yet</p>
        ) : (
          <div className="space-y-4">
            {engagement.map((event: any) => (
              <div key={event.event_id} className="flex gap-4 border-l-2 border-gray-200 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{event.event_name || event.event_type}</span>
                    {event.source && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{event.source}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.occurred_at).toLocaleString()}
                  </div>
                  {event.url && (
                    <div className="text-xs text-gray-400 mt-1 truncate">{event.url}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
