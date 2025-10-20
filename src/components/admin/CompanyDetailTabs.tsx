/**
 * Company Detail Tabs Component
 * Tab navigation and content for company detail page
 */

'use client';

import { useState } from 'react';
import SuggestionsPanel from './SuggestionsPanel';
import EngagementTimeline from './EngagementTimeline';

interface Contact {
  contact_id: string;
  full_name: string;
  email: string;
  marketing_status: string;
  gdpr_consent_at: string | null;
  zoho_contact_id: string | null;
}

interface Order {
  order_id: string;
  created_at: string;
  amount_total: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  zoho_invoice_id: string | null;
}

interface Machine {
  machine_id: string;
  tool_family: string;
  model_name: string | null;
  confirmed: boolean;
  evidence_type: string | null;
}

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  engagementScore: number;
  lastOrderDate: string | null;
}

interface CompanyDetailTabsProps {
  company: any;
  contacts: Contact[];
  orders: Order[];
  machines: Machine[];
  metrics: Metrics;
  compatibleProducts: any;
}

type TabKey = 'overview' | 'timeline' | 'contacts' | 'orders' | 'machines' | 'portal';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'orders', label: 'Quotes & Orders' },
  { key: 'machines', label: 'Machines & Fitment' },
  { key: 'portal', label: 'Portal Preview' },
];

export default function CompanyDetailTabs({
  company,
  contacts,
  orders,
  machines,
  metrics,
  compatibleProducts,
}: CompanyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const handleSendTokenizedLink = async (contactId: string) => {
    // TODO: Implement send tokenized link
    alert(`Send tokenized link to contact ${contactId} - To be implemented`);
  };

  const handleEmailViaZoho = async (contactId: string) => {
    // TODO: Implement email via Zoho
    alert(`Email via Zoho to contact ${contactId} - To be implemented`);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            company={company}
            metrics={metrics}
            compatibleProducts={compatibleProducts}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab companyId={company.company_id} />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            onSendTokenizedLink={handleSendTokenizedLink}
            onEmailViaZoho={handleEmailViaZoho}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab orders={orders} />
        )}

        {activeTab === 'machines' && (
          <MachinesTab machines={machines} companyId={company.company_id} />
        )}

        {activeTab === 'portal' && (
          <PortalTab company={company} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function OverviewTab({ company, metrics, compatibleProducts }: any) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.totalOrders}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              £{(metrics.totalRevenue / 100).toFixed(2)}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Engagement Score</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.engagementScore}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Last Order</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {metrics.lastOrderDate
                ? new Date(metrics.lastOrderDate).toLocaleDateString()
                : 'Never'}
            </dd>
          </div>
        </div>
      </div>

      {/* Next Best Action */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Next Best Action</h3>
        <SuggestionsPanel companyId={company.company_id} />
      </div>

      {/* Compatible Products */}
      {compatibleProducts && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compatible Products</h3>
          <div className="space-y-4">
            {compatibleProducts.reorder_items && compatibleProducts.reorder_items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reorder Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compatibleProducts.reorder_items.slice(0, 6).map((item: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-3">
                      <div className="text-sm font-medium text-gray-900">{item.product_code}</div>
                      <div className="text-xs text-gray-500">{item.product_name}</div>
                      {item.product_category && (
                        <div className="text-xs text-gray-400 mt-1">{item.product_category}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ companyId }: { companyId: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Timeline</h3>
      <EngagementTimeline companyId={companyId} />
    </div>
  );
}

function ContactsTab({
  contacts,
  onSendTokenizedLink,
  onEmailViaZoho,
}: {
  contacts: Contact[];
  onSendTokenizedLink: (contactId: string) => void;
  onEmailViaZoho: (contactId: string) => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No contacts found for this company</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Marketing Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GDPR Consent
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contacts.map((contact) => (
            <tr key={contact.contact_id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{contact.full_name}</div>
                <div className="text-xs text-gray-500">{contact.contact_id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {contact.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    contact.marketing_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : contact.marketing_status === 'opted_out'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {contact.marketing_status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {contact.gdpr_consent_at
                  ? new Date(contact.gdpr_consent_at).toLocaleDateString()
                  : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => onEmailViaZoho(contact.contact_id)}
                  disabled={!contact.zoho_contact_id}
                  className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Email via Zoho
                </button>
                <button
                  onClick={() => onSendTokenizedLink(contact.contact_id)}
                  disabled={contact.marketing_status !== 'active'}
                  className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Send Link
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No orders found for this company</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stripe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zoho
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.order_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.currency.toUpperCase()} {(order.amount_total / 100).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.stripe_payment_intent_id ? (
                  <a
                    href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View →
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.zoho_invoice_id ? (
                  <a
                    href={`https://books.zoho.com/app#/invoices/${order.zoho_invoice_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View →
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MachinesTab({ machines, companyId }: { machines: Machine[]; companyId: string }) {
  const handleConfirmMachine = async (machineId: string) => {
    // TODO: Implement confirm machine
    alert(`Confirm machine ${machineId} - To be implemented`);
  };

  const handleAddMachine = () => {
    // TODO: Implement add machine
    alert(`Add machine for company ${companyId} - To be implemented`);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Machines & Fitment</h3>
        <button
          onClick={handleAddMachine}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + Add Machine
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No machines found for this company</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tool Family
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evidence
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.machine_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {machine.tool_family}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.model_name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        machine.confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {machine.confirmed ? 'Confirmed' : 'Believed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.evidence_type || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!machine.confirmed && (
                      <button
                        onClick={() => handleConfirmMachine(machine.machine_id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PortalTab({ company }: { company: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const portalUrl = company.portal_token
    ? `${baseUrl}/portal/${company.portal_token}`
    : null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Preview</h3>

      {portalUrl ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portal URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={portalUrl}
                readOnly
                className="flex-1 rounded-md border-gray-300 bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(portalUrl);
                  alert('Portal URL copied to clipboard!');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Copy
              </button>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Open →
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              This is a read-only preview of the customer portal. The portal allows customers to:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>View their order history</li>
              <li>Browse compatible products for their machines</li>
              <li>Reorder consumables</li>
              <li>Manage their consent preferences</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No portal token generated for this company yet. Create a tokenized offer or quote to
            generate a portal link.
          </p>
        </div>
      )}
    </div>
  );
}
