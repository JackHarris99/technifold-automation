/**
 * Company Detail View - Comprehensive Single-Page View
 * Clean rebuild with all company data in one place
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AddContactModal from './modals/AddContactModal';
import AddToolModal from './modals/AddToolModal';
import AddSubscriptionToolModal from './modals/AddSubscriptionToolModal';
import ManageAddressModal from './modals/ManageAddressModal';
import EditBillingAddressModal from './modals/EditBillingAddressModal';
import CompanyStatusControl from './CompanyStatusControl';

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
  shippingAddresses: any[];
  quotes: any[];
  currentUser: any;
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
  shippingAddresses,
  quotes,
  currentUser,
}: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showAddSubToolModal, setShowAddSubToolModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showBillingAddressModal, setShowBillingAddressModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'products', label: 'Products', count: purchasedTools.length + purchasedConsumables.length + purchasedParts.length },
    { id: 'subscriptions', label: 'Subscriptions', count: subscriptionTools.length },
    { id: 'quotes', label: 'Quotes', count: quotes.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'engagement', label: 'Engagement', count: engagement.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/companies"
                className="text-sm text-gray-700 hover:text-gray-700 mb-2 inline-block"
              >
                ← Back to Companies
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
              <p className="text-gray-700 mt-1">{company.company_id}</p>
              <CompanyStatusControl
                companyId={company.company_id}
                companyName={company.company_name}
                currentStatus={company.status}
                accountOwner={company.account_owner}
                currentUserSalesRepId={currentUser.sales_rep_id}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/admin/send-reorder?company_id=${company.company_id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-block"
              >
                Send Reorder Email
              </Link>
              <Link
                href={`/admin/quote-builder/tools?company_id=${company.company_id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium inline-block"
              >
                🔧 Create Tools Quote
              </Link>
              <Link
                href={`/admin/quote-builder/consumables?company_id=${company.company_id}`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium inline-block"
              >
                📦 Create Consumables Quote
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
                    : 'text-gray-700 hover:text-gray-700'
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
          <OverviewTab
            company={company}
            contacts={contacts}
            shippingAddresses={shippingAddresses}
            onAddContact={() => setShowAddContactModal(true)}
            onAddAddress={() => {
              setEditingAddress(null);
              setShowAddressModal(true);
            }}
            onEditAddress={(address) => {
              setEditingAddress(address);
              setShowAddressModal(true);
            }}
            onEditBillingAddress={() => setShowBillingAddressModal(true)}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            tools={purchasedTools}
            consumables={purchasedConsumables}
            parts={purchasedParts}
            companyId={company.company_id}
            onAddTool={() => setShowAddToolModal(true)}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptionTools={subscriptionTools}
            subscriptions={subscriptions}
            companyId={company.company_id}
            onAddTool={() => setShowAddSubToolModal(true)}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesTab quotes={quotes} companyId={company.company_id} />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTab invoices={invoices} companyId={company.company_id} />
        )}

        {activeTab === 'engagement' && (
          <EngagementTab engagement={engagement} />
        )}
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        companyId={company.company_id}
      />
      <AddToolModal
        isOpen={showAddToolModal}
        onClose={() => setShowAddToolModal(false)}
        companyId={company.company_id}
      />
      <AddSubscriptionToolModal
        isOpen={showAddSubToolModal}
        onClose={() => setShowAddSubToolModal(false)}
        companyId={company.company_id}
        subscriptions={subscriptions}
      />
      <ManageAddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        companyId={company.company_id}
        companyName={company.company_name}
        existingAddress={editingAddress}
      />
      <EditBillingAddressModal
        isOpen={showBillingAddressModal}
        onClose={() => setShowBillingAddressModal(false)}
        companyId={company.company_id}
        companyName={company.company_name}
        currentBillingAddress={{
          billing_address_line_1: company.billing_address_line_1,
          billing_address_line_2: company.billing_address_line_2,
          billing_city: company.billing_city,
          billing_state_province: company.billing_state_province,
          billing_postal_code: company.billing_postal_code,
          billing_country: company.billing_country,
        }}
      />
    </div>
  );
}

// Overview Tab
function OverviewTab({
  company,
  contacts,
  shippingAddresses,
  onAddContact,
  onAddAddress,
  onEditAddress,
  onEditBillingAddress
}: {
  company: any;
  contacts: any[];
  shippingAddresses: any[];
  onAddContact: () => void;
  onAddAddress: () => void;
  onEditAddress: (address: any) => void;
  onEditBillingAddress: () => void;
}) {
  const defaultAddress = shippingAddresses.find(addr => addr.is_default);

  async function handleUpdateVAT() {
    const newVat = prompt('Enter VAT number:', company.vat_number || '');
    if (newVat === null) return; // User cancelled

    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/update-billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat_number: newVat }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update VAT number');
      }

      alert('VAT number updated successfully! Refresh the page to see changes.');
      window.location.reload();
    } catch (error: any) {
      console.error('[UpdateVAT] Error:', error);
      alert(`Failed to update VAT number: ${error.message}`);
    }
  }

  // Format billing address for display
  const formatBillingAddress = () => {
    const parts = [
      company.billing_address_line_1,
      company.billing_address_line_2,
      company.billing_city,
      company.billing_state_province,
      company.billing_postal_code,
      company.billing_country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const hasBillingAddress = company.billing_address_line_1 || company.billing_city || company.billing_postal_code;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-700">Account Owner</dt>
              <dd className="text-sm font-medium text-gray-900">{company.account_owner || 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-700">Category</dt>
              <dd className="text-sm font-medium text-gray-900">{company.category || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-700">Country</dt>
              <dd className="text-sm font-medium text-gray-900">{company.country || '-'}</dd>
            </div>

            {/* VAT Number - Editable */}
            <div className="border-t pt-3">
              <dt className="text-sm text-gray-700 mb-1">VAT Number</dt>
              <dd className="text-sm font-medium text-gray-900">
                {company.vat_number || <span className="text-gray-800 italic">Not set - click to add</span>}
              </dd>
              <button
                onClick={handleUpdateVAT}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                Edit VAT
              </button>
            </div>

            {/* Billing Address - Editable */}
            <div className="border-t pt-3">
              <dt className="text-sm text-gray-700 mb-1">Billing Address</dt>
              <dd className="text-sm">
                {hasBillingAddress ? (
                  <div className="text-gray-700">
                    {company.billing_address_line_1 && <div>{company.billing_address_line_1}</div>}
                    {company.billing_address_line_2 && <div>{company.billing_address_line_2}</div>}
                    {company.billing_city && <div>{company.billing_city}{company.billing_state_province ? `, ${company.billing_state_province}` : ''}</div>}
                    {company.billing_postal_code && <div>{company.billing_postal_code}</div>}
                    {company.billing_country && <div className="font-medium text-gray-900">{company.billing_country}</div>}
                  </div>
                ) : (
                  <span className="text-gray-800 italic">Not set - click to add</span>
                )}
              </dd>
              <button
                onClick={onEditBillingAddress}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                Edit Billing Address
              </button>
            </div>

            <div className="border-t pt-3">
              <dt className="text-sm text-gray-700">Website</dt>
              <dd className="text-sm font-medium text-gray-900">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                ) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-700">Stripe Customer ID</dt>
              <dd className="text-sm font-mono text-gray-800">{company.stripe_customer_id || 'Not set'}</dd>
            </div>
          </dl>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contacts ({contacts.length})</h2>
            <button
              onClick={onAddContact}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Contact
            </button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-gray-700 text-sm">No contacts yet</p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.contact_id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="font-medium text-sm text-gray-900">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                  <div className="text-sm text-gray-700">{contact.email}</div>
                  {contact.role && <div className="text-xs text-gray-800 mt-1">{contact.role}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Addresses */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses ({shippingAddresses.length})</h2>
          <button
            onClick={onAddAddress}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            + Add Address
          </button>
        </div>
        {shippingAddresses.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              No shipping address on file. Customer will be prompted to provide shipping details when placing orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shippingAddresses.map((address) => (
              <div
                key={address.address_id}
                className={`border rounded-lg p-4 relative ${address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                {address.is_default && (
                  <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded mb-2">
                    Default
                  </div>
                )}
                {address.label && (
                  <div className="font-medium text-sm text-gray-900 mb-2">{address.label}</div>
                )}
                <div className="text-sm text-gray-800 space-y-1 mb-3">
                  <div>{address.address_line_1}</div>
                  {address.address_line_2 && <div>{address.address_line_2}</div>}
                  <div>{address.city}{address.state_province && `, ${address.state_province}`}</div>
                  <div>{address.postal_code}</div>
                  <div className="font-medium text-gray-900">{address.country}</div>
                </div>
                <button
                  onClick={() => onEditAddress(address)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Products Tab
function ProductsTab({ tools, consumables, parts, companyId, onAddTool }: any) {
  return (
    <div className="space-y-6">
      {/* Purchased Tools */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Purchased Tools ({tools.length})</h2>
          <button
            onClick={onAddTool}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium"
          >
            + Add Tool
          </button>
        </div>
        <div className="p-6">
          {tools.length === 0 ? (
            <p className="text-gray-700 text-sm">No tools purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      <Image
                        src={item.products?.image_url || `/product_images/${item.product_code}.jpg`}
                        alt={item.products?.description || item.product_code}
                        fill
                        className="object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/product-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-gray-700 mt-1">SKU: {item.product_code}</div>
                      <div className="text-sm text-gray-800 mt-2">Qty: {item.total_quantity}</div>
                      <div className="text-xs text-gray-800 mt-1">
                        Last: {item.last_purchased_at}
                      </div>
                      {item.source === 'manual' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mt-2 inline-block">
                          Manually Added
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

      {/* Purchased Consumables */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purchased Consumables ({consumables.length})</h2>
        </div>
        <div className="p-6">
          {consumables.length === 0 ? (
            <p className="text-gray-700 text-sm">No consumables purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consumables.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      <Image
                        src={item.products?.image_url || `/product_images/${item.product_code}.jpg`}
                        alt={item.products?.description || item.product_code}
                        fill
                        className="object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/product-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-gray-700 mt-1">{item.product_code}</div>
                      <div className="text-xs text-gray-800 mt-2">
                        {item.total_purchases} orders • {item.total_quantity} total
                      </div>
                      <div className="text-xs text-gray-800 mt-1">Last: {item.last_purchased_at}</div>
                    </div>
                  </div>
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
            <h2 className="text-lg font-semibold text-gray-900">Other Parts ({parts.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parts.map((item: any) => (
                <div key={item.product_code} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      <Image
                        src={item.products?.image_url || `/product_images/${item.product_code}.jpg`}
                        alt={item.products?.description || item.product_code}
                        fill
                        className="object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/product-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-gray-700 mt-1">{item.product_code}</div>
                      <div className="text-xs text-gray-800 mt-2">Qty: {item.total_quantity}</div>
                      <div className="text-xs text-gray-800 mt-1">Last: {item.last_purchased_at}</div>
                    </div>
                  </div>
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
function SubscriptionsTab({ subscriptionTools, subscriptions, companyId, onAddTool }: any) {
  const activeSub = subscriptions[0];

  return (
    <div className="space-y-6">
      {/* Active Subscription Info */}
      {activeSub && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Active Subscription</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-700">Status</div>
              <div className="text-lg font-medium text-gray-900 text-gray-900 capitalize">{activeSub.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Monthly Price</div>
              <div className="text-lg font-medium text-gray-900 text-gray-900">£{activeSub.monthly_price}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Next Billing</div>
              <div className="text-sm">{activeSub.next_billing_date || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tools on Subscription */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tools on Subscription ({subscriptionTools.length})</h2>
          <button
            onClick={onAddTool}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium"
          >
            + Add Tool to Subscription
          </button>
        </div>
        <div className="p-6">
          {subscriptionTools.length === 0 ? (
            <p className="text-gray-700 text-sm">No tools on subscription</p>
          ) : (
            <div className="space-y-3">
              {subscriptionTools.map((item: any) => (
                <div key={item.tool_code} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                  <div>
                    <div className="font-medium text-gray-900">{item.products?.description || item.tool_code}</div>
                    <div className="text-xs text-gray-700 mt-1">SKU: {item.tool_code}</div>
                    <div className="text-xs text-gray-800 mt-1">
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
            <div className="text-sm text-gray-700">Total Revenue (Since Launch)</div>
            <div className="text-2xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-700">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-700">Paid</div>
            <div className="text-2xl font-bold text-gray-900">
              {invoices.filter((inv: any) => inv.payment_status === 'paid').length}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-6 text-gray-700 text-sm">No invoices yet</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.invoice_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {invoice.invoice_number || invoice.stripe_invoice_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.invoice_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
    </div>
  );
}

// Quotes Tab
function QuotesTab({ quotes, companyId }: { quotes: any[]; companyId: string }) {
  function getStatusBadge(quote: any) {
    const now = new Date();
    const expiresAt = quote.expires_at ? new Date(quote.expires_at) : null;
    const isExpired = expiresAt && expiresAt < now;

    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">Expired</span>;
    }

    if (quote.accepted_at) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Accepted</span>;
    }

    if (quote.viewed_at) {
      const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceViewed === 0) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Active</span>;
      } else if (daysSinceViewed <= 3) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">Viewed</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-700">Follow-up</span>;
      }
    }

    if (quote.sent_at) {
      const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceSent >= 7) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">Stale</span>;
      } else if (daysSinceSent >= 3) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">Not Viewed</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">Sent</span>;
      }
    }

    return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">Draft</span>;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quotes ({quotes.length})</h2>
      </div>
      <div className="overflow-x-auto">
        {quotes.length === 0 ? (
          <div className="p-6 text-gray-700 text-sm">No quotes yet</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quote ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote: any) => (
                <tr key={quote.quote_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                    {quote.quote_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      quote.quote_type === 'interactive'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {quote.quote_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    £{quote.total_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {formatDate(quote.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {formatDate(quote.sent_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/quotes/${quote.quote_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Engagement Tab
function EngagementTab({ engagement }: { engagement: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Engagement Timeline ({engagement.length})</h2>
      </div>
      <div className="p-6">
        {engagement.length === 0 ? (
          <p className="text-gray-700 text-sm">No engagement events yet</p>
        ) : (
          <div className="space-y-4">
            {engagement.map((event: any) => (
              <div key={event.event_id} className="flex gap-4 border-l-2 border-gray-200 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{event.event_name || event.event_type}</span>
                    {event.source && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{event.source}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {new Date(event.occurred_at).toLocaleString()}
                  </div>
                  {event.url && (
                    <div className="text-xs text-gray-800 mt-1 truncate">{event.url}</div>
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
