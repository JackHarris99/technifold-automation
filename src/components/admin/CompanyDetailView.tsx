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
import { LogActivityModal } from './LogActivityModal';
import DistributorCatalogManager from './DistributorCatalogManager';
import DistributorPortalProducts from './DistributorPortalProducts';

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
  products: any[];
  catalogEntries: any[];
  distributorPricing: any[];
  companyPricing: any[];
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
  products,
  catalogEntries,
  distributorPricing,
  companyPricing,
  currentUser,
}: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showAddSubToolModal, setShowAddSubToolModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showBillingAddressModal, setShowBillingAddressModal] = useState(false);

  // Activity logging state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'call' | 'visit' | 'email' | 'followup' | 'meeting'>('call');

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convert type state
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Change owner state
  const [showChangeOwner, setShowChangeOwner] = useState(false);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [isChangingOwner, setIsChangingOwner] = useState(false);

  const isDirector = currentUser.role === 'director';
  const isDistributor = company.type === 'distributor';
  const isCustomer = company.type === 'customer' || !company.type;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Redirect to companies list
        window.location.href = '/admin/companies';
      } else {
        const data = await response.json();
        alert('Failed to delete company: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: Failed to delete company');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleConvertType = async () => {
    setIsConverting(true);
    const newType = isDistributor ? 'customer' : 'distributor';

    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/convert-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_type: newType }),
      });

      if (response.ok) {
        // Reload page to show updated type
        window.location.reload();
      } else {
        const data = await response.json();
        alert('Failed to convert company: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: Failed to convert company');
    } finally {
      setIsConverting(false);
      setShowConvertConfirm(false);
    }
  };

  const handleOpenChangeOwner = async () => {
    // Fetch active sales reps
    try {
      const response = await fetch('/api/admin/users/list?role=sales_rep&is_active=true');
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data.users || []);
        setSelectedOwner(company.account_owner || '');
        setShowChangeOwner(true);
      } else {
        alert('Failed to load sales reps');
      }
    } catch (err) {
      alert('Network error: Failed to load sales reps');
    }
  };

  const handleChangeOwner = async () => {
    if (!selectedOwner) {
      alert('Please select a sales rep');
      return;
    }

    setIsChangingOwner(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/change-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_owner: selectedOwner }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert('Failed to change owner: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: Failed to change owner');
    } finally {
      setIsChangingOwner(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'products', label: 'Products', count: purchasedTools.length + purchasedConsumables.length + purchasedParts.length },
    { id: 'subscriptions', label: 'Subscriptions', count: subscriptionTools.length },
    { id: 'quotes', label: 'Quotes', count: quotes.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'engagement', label: 'Engagement', count: engagement.length },
    ...(isDistributor ? [
      { id: 'portal-products', label: 'Portal Products', count: null },
      { id: 'catalog', label: 'Catalog & Pricing', count: catalogEntries.filter((e: any) => e.visible).length }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/companies"
                className="text-[13px] text-[#475569] hover:text-[#1e40af] font-[500] transition-colors flex items-center gap-2 mb-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Companies
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">{company.company_name}</h1>
                {isDistributor && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[13px] font-[600] uppercase tracking-wide">
                    Distributor
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#64748b] font-[500] mt-2">{company.company_id}</p>
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
                className="px-5 py-2.5 bg-white border-2 border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[600] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-block"
              >
                Send Reorder Email
              </Link>
              <Link
                href={`/admin/quote-builder/tools?company_id=${company.company_id}`}
                className="px-5 py-2.5 bg-white border-2 border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[600] hover:border-[#4f46e5] hover:bg-[#eef2ff] transition-all shadow-sm inline-block"
              >
                Create Tools Quote
              </Link>
              <Link
                href={`/admin/quote-builder/consumables?company_id=${company.company_id}`}
                className="px-5 py-2.5 bg-white border-2 border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[600] hover:border-[#9333ea] hover:bg-[#faf5ff] transition-all shadow-sm inline-block"
              >
                Create Consumables Quote
              </Link>
              {isDirector && (
                <>
                  <button
                    onClick={() => setShowConvertConfirm(true)}
                    className="px-5 py-2.5 bg-white border-2 border-[#e8e8e8] text-[#1e40af] rounded-lg text-[13px] font-[600] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm"
                  >
                    {isDistributor ? 'Convert to Customer' : 'Convert to Distributor'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-5 py-2.5 bg-white border-2 border-[#e8e8e8] text-[#dc2626] rounded-lg text-[13px] font-[600] hover:border-[#dc2626] hover:bg-[#fef2f2] transition-all shadow-sm"
                  >
                    Delete Company
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-6 border-b border-[#e8e8e8]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-[14px] font-[600] transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#1e40af] border-b-2 border-[#1e40af]'
                    : 'text-[#64748b] hover:text-[#0a0a0a]'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 text-[11px] bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-full font-[600]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
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
            onLogActivity={(type) => {
              setActivityType(type);
              setShowActivityModal(true);
            }}
            isDirector={isDirector}
            onChangeOwner={handleOpenChangeOwner}
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

        {activeTab === 'portal-products' && isDistributor && (
          <DistributorPortalProducts
            companyId={company.company_id}
            products={products}
            catalogEntries={catalogEntries}
            distributorPricing={distributorPricing}
            companyPricing={companyPricing}
            purchasedProducts={[...purchasedTools, ...purchasedConsumables, ...purchasedParts].map(p => ({
              product_code: p.product_code,
              total_quantity: p.total_quantity,
              last_purchased_at: p.last_purchased_at,
            }))}
          />
        )}

        {activeTab === 'catalog' && isDistributor && (
          <DistributorCatalogManager
            companyId={company.company_id}
            products={products}
            catalogEntries={catalogEntries}
            distributorPricing={distributorPricing}
            companyPricing={companyPricing}
          />
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
      <LogActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        companyId={company.company_id}
        companyName={company.company_name}
        activityType={activityType}
        context="general"
        onSuccess={() => window.location.reload()}
      />

      {/* Convert Type Confirmation Modal */}
      {showConvertConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Convert to {isDistributor ? 'Customer' : 'Distributor'}?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to convert <strong>{company.company_name}</strong> from a{' '}
              <strong>{isDistributor ? 'distributor' : 'customer'}</strong> to a{' '}
              <strong>{isDistributor ? 'customer' : 'distributor'}</strong>?
            </p>
            {!isDistributor && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                ℹ️ Converting to distributor will allow this company to access the distributor portal and place orders with wholesale pricing.
              </p>
            )}
            {isDistributor && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                ℹ️ Converting to customer will remove distributor portal access. Any existing distributor users will no longer be able to log in.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConvertConfirm(false)}
                disabled={isConverting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertType}
                disabled={isConverting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isConverting ? 'Converting...' : `Convert to ${isDistributor ? 'Customer' : 'Distributor'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Company?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to permanently delete <strong>{company.company_name}</strong>?
            </p>
            <p className="text-sm text-red-600 font-semibold mb-6">
              ⚠️ This action cannot be undone. All related data (contacts, quotes, invoices, etc.) will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Owner Modal */}
      {showChangeOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Sales Rep</h2>
            <p className="text-sm text-gray-600 mb-4">
              Assign <strong>{company.company_name}</strong> to a different sales rep.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sales Rep
              </label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a sales rep --</option>
                {salesReps.map((rep) => (
                  <option key={rep.sales_rep_id} value={rep.sales_rep_id}>
                    {rep.full_name} ({rep.sales_rep_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangeOwner(false)}
                disabled={isChangingOwner}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeOwner}
                disabled={isChangingOwner || !selectedOwner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isChangingOwner ? 'Changing...' : 'Change Sales Rep'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  onEditBillingAddress,
  onLogActivity,
  isDirector,
  onChangeOwner
}: {
  company: any;
  contacts: any[];
  shippingAddresses: any[];
  onAddContact: () => void;
  onAddAddress: () => void;
  onEditAddress: (address: any) => void;
  onEditBillingAddress: () => void;
  onLogActivity: (type: 'call' | 'visit' | 'email' | 'followup' | 'meeting') => void;
  isDirector: boolean;
  onChangeOwner: () => void;
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
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
        <h2 className="text-[18px] font-[600] mb-5 text-[#0a0a0a]">Log Activity</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => onLogActivity('call')}
            className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[500] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>
          <button
            onClick={() => onLogActivity('visit')}
            className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[500] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Visit
          </button>
          <button
            onClick={() => onLogActivity('email')}
            className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[500] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
          <button
            onClick={() => onLogActivity('meeting')}
            className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[500] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Meeting
          </button>
          <button
            onClick={() => onLogActivity('followup')}
            className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#0a0a0a] rounded-lg text-[13px] font-[500] hover:border-[#1e40af] hover:bg-[#eff6ff] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Follow-up
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
          <h2 className="text-[18px] font-[600] mb-4 text-[#0a0a0a]">Company Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-[#475569] mb-1">Account Owner</dt>
              <dd className="text-[13px] font-[600] text-[#0a0a0a]">{company.account_owner || 'Unassigned'}</dd>
              {isDirector && (
                <button
                  onClick={onChangeOwner}
                  className="text-[12px] text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-medium mt-1"
                >
                  Change Sales Rep
                </button>
              )}
            </div>
            <div>
              <dt className="text-sm text-[#475569]">Type</dt>
              <dd className="text-[13px] font-[600] text-[#0a0a0a]">{company.type || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#475569]">Country</dt>
              <dd className="text-[13px] font-[600] text-[#0a0a0a]">{company.country || '-'}</dd>
            </div>

            {/* VAT Number - Editable */}
            <div className="border-t pt-3">
              <dt className="text-sm text-[#475569] mb-1">VAT Number</dt>
              <dd className="text-[13px] font-[600] text-[#0a0a0a]">
                {company.vat_number || <span className="text-[#64748b] italic">Not set - click to add</span>}
              </dd>
              <button
                onClick={handleUpdateVAT}
                className="text-[12px] text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-medium mt-1"
              >
                Edit VAT
              </button>
            </div>

            {/* Billing Address - Editable */}
            <div className="border-t pt-3">
              <dt className="text-sm text-[#475569] mb-1">Billing Address</dt>
              <dd className="text-sm">
                {hasBillingAddress ? (
                  <div className="text-[#475569]">
                    {company.billing_address_line_1 && <div>{company.billing_address_line_1}</div>}
                    {company.billing_address_line_2 && <div>{company.billing_address_line_2}</div>}
                    {company.billing_city && <div>{company.billing_city}{company.billing_state_province ? `, ${company.billing_state_province}` : ''}</div>}
                    {company.billing_postal_code && <div>{company.billing_postal_code}</div>}
                    {company.billing_country && <div className="font-medium text-[#0a0a0a]">{company.billing_country}</div>}
                  </div>
                ) : (
                  <span className="text-[#64748b] italic">Not set - click to add</span>
                )}
              </dd>
              <button
                onClick={onEditBillingAddress}
                className="text-[12px] text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-medium mt-1"
              >
                Edit Billing Address
              </button>
            </div>

            <div className="border-t pt-3">
              <dt className="text-sm text-[#475569]">Website</dt>
              <dd className="text-[13px] font-[600] text-[#0a0a0a]">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                ) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[#475569]">Stripe Customer ID</dt>
              <dd className="text-sm font-mono text-[#64748b]">{company.stripe_customer_id || 'Not set'}</dd>
            </div>
          </dl>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Contacts ({contacts.length})</h2>
            <button
              onClick={onAddContact}
              className="text-[13px] text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-medium"
            >
              + Add Contact
            </button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-[#475569] text-sm">No contacts yet</p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.contact_id} className="border-b border-[#f1f5f9] pb-3 last:border-0">
                  <div className="font-medium text-sm text-[#0a0a0a]">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                  <div className="text-sm text-[#475569]">{contact.email}</div>
                  {contact.role && <div className="text-xs text-[#64748b] mt-1">{contact.role}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Addresses */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Shipping Addresses ({shippingAddresses.length})</h2>
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
                className={`border rounded-lg p-4 relative ${address.is_default ? 'border-blue-500 bg-blue-50' : 'border-[#e8e8e8]'}`}
              >
                {address.is_default && (
                  <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded mb-2">
                    Default
                  </div>
                )}
                {address.label && (
                  <div className="font-medium text-sm text-[#0a0a0a] mb-2">{address.label}</div>
                )}
                <div className="text-sm text-[#64748b] space-y-1 mb-3">
                  <div>{address.address_line_1}</div>
                  {address.address_line_2 && <div>{address.address_line_2}</div>}
                  <div>{address.city}{address.state_province && `, ${address.state_province}`}</div>
                  <div>{address.postal_code}</div>
                  <div className="font-medium text-[#0a0a0a]">{address.country}</div>
                </div>
                <button
                  onClick={() => onEditAddress(address)}
                  className="text-[12px] text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-medium"
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
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
        <div className="px-6 py-4 border-b border-[#e8e8e8] flex items-center justify-between">
          <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Purchased Tools ({tools.length})</h2>
          <button
            onClick={onAddTool}
            className="text-[13px] bg-[#1e40af] text-white px-4 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium"
          >
            + Add Tool
          </button>
        </div>
        <div className="p-6">
          {tools.length === 0 ? (
            <p className="text-[#475569] text-sm">No tools purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((item: any) => (
                <div key={item.product_code} className="border border-[#e8e8e8] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-[#f8fafc] rounded-lg flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
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
                      <div className="font-medium text-[#0a0a0a]">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-[#475569] mt-1">SKU: {item.product_code}</div>
                      <div className="text-sm text-[#64748b] mt-2">Qty: {item.total_quantity}</div>
                      <div className="text-xs text-[#64748b] mt-1">
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
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
        <div className="px-6 py-4 border-b border-[#e8e8e8]">
          <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Purchased Consumables ({consumables.length})</h2>
        </div>
        <div className="p-6">
          {consumables.length === 0 ? (
            <p className="text-[#475569] text-sm">No consumables purchased yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consumables.map((item: any) => (
                <div key={item.product_code} className="border border-[#e8e8e8] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-[#f8fafc] rounded-lg flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
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
                      <div className="font-medium text-sm text-[#0a0a0a]">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-[#475569] mt-1">{item.product_code}</div>
                      <div className="text-xs text-[#64748b] mt-2">
                        {item.total_purchases} orders • {item.total_quantity} total
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">Last: {item.last_purchased_at}</div>
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
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
          <div className="px-6 py-4 border-b border-[#e8e8e8]">
            <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Other Parts ({parts.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parts.map((item: any) => (
                <div key={item.product_code} className="border border-[#e8e8e8] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 bg-[#f8fafc] rounded-lg flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
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
                      <div className="font-medium text-sm text-[#0a0a0a]">{item.products?.description || item.product_code}</div>
                      <div className="text-xs text-[#475569] mt-1">{item.product_code}</div>
                      <div className="text-xs text-[#64748b] mt-2">Qty: {item.total_quantity}</div>
                      <div className="text-xs text-[#64748b] mt-1">Last: {item.last_purchased_at}</div>
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
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
          <h2 className="text-[18px] font-[600] mb-4 text-[#0a0a0a]">Active Subscription</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-[#475569]">Status</div>
              <div className="text-lg font-medium text-[#0a0a0a] text-[#0a0a0a] capitalize">{activeSub.status}</div>
            </div>
            <div>
              <div className="text-sm text-[#475569]">Monthly Price</div>
              <div className="text-lg font-medium text-[#0a0a0a] text-[#0a0a0a]">£{activeSub.monthly_price}</div>
            </div>
            <div>
              <div className="text-sm text-[#475569]">Next Billing</div>
              <div className="text-sm">{activeSub.next_billing_date || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tools on Subscription */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
        <div className="px-6 py-4 border-b border-[#e8e8e8] flex items-center justify-between">
          <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Tools on Subscription ({subscriptionTools.length})</h2>
          <button
            onClick={onAddTool}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium"
          >
            + Add Tool to Subscription
          </button>
        </div>
        <div className="p-6">
          {subscriptionTools.length === 0 ? (
            <p className="text-[#475569] text-sm">No tools on subscription</p>
          ) : (
            <div className="space-y-3">
              {subscriptionTools.map((item: any) => (
                <div key={item.tool_code} className="flex items-center justify-between border border-[#e8e8e8] rounded-lg p-4">
                  <div>
                    <div className="font-medium text-[#0a0a0a]">{item.products?.description || item.tool_code}</div>
                    <div className="text-xs text-[#475569] mt-1">SKU: {item.tool_code}</div>
                    <div className="text-xs text-[#64748b] mt-1">
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
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-[#475569]">Total Revenue (Since Launch)</div>
            <div className="text-[28px] font-[700] text-[#16a34a]">£{totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-[#475569]">Total Invoices</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">{invoices.length}</div>
          </div>
          <div>
            <div className="text-sm text-[#475569]">Paid</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {invoices.filter((inv: any) => inv.payment_status === 'paid').length}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
        <div className="px-6 py-4 border-b border-[#e8e8e8]">
          <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-6 text-[#475569] text-sm">No invoices yet</div>
          ) : (
            <table className="min-w-full divide-y divide-[#f1f5f9]">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#f1f5f9]">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.invoice_id} className="transition-colors hover:bg-[#f8fafc]">
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono text-[#475569] font-[500]">
                      {invoice.invoice_number || invoice.stripe_invoice_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#64748b] font-[500]">{invoice.invoice_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] font-[600] text-[#0a0a0a]">
                      £{invoice.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-[11px] font-[600] rounded-full ${
                          invoice.payment_status === 'paid'
                            ? 'bg-[#dcfce7] text-[#166534]'
                            : 'bg-[#fef9c3] text-[#854d0e]'
                        }`}
                      >
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px]">
                      {invoice.invoice_url && (
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-[500]"
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
      return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#f1f5f9] text-[#64748b]">Expired</span>;
    }

    if (quote.accepted_at) {
      return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#dcfce7] text-[#166534]">Accepted</span>;
    }

    if (quote.viewed_at) {
      const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceViewed === 0) {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#dcfce7] text-[#166534]">Active</span>;
      } else if (daysSinceViewed <= 3) {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#dbeafe] text-[#1e40af]">Viewed</span>;
      } else {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#fed7aa] text-[#92400e]">Follow-up</span>;
      }
    }

    if (quote.sent_at) {
      const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceSent >= 7) {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#fee2e2] text-[#991b1b]">Stale</span>;
      } else if (daysSinceSent >= 3) {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#fef9c3] text-[#854d0e]">Not Viewed</span>;
      } else {
        return <span className="px-3 py-1 text-[11px] font-[600] rounded-full bg-[#fef9c3] text-[#854d0e]">Sent</span>;
      }
    }

    return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-[#475569]">Draft</span>;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
      <div className="px-6 py-4 border-b border-[#e8e8e8]">
        <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Quotes ({quotes.length})</h2>
      </div>
      <div className="overflow-x-auto">
        {quotes.length === 0 ? (
          <div className="p-6 text-[#475569] text-sm">No quotes yet</div>
        ) : (
          <table className="min-w-full divide-y divide-[#f1f5f9]">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Quote ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#f1f5f9]">
              {quotes.map((quote: any) => (
                <tr key={quote.quote_id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono text-[#475569] font-[500]">
                    {quote.quote_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-[600] ${
                      quote.quote_type === 'interactive'
                        ? 'bg-[#f3e8ff] text-[#7e22ce]'
                        : 'bg-[#dbeafe] text-[#1e40af]'
                    }`}>
                      {quote.quote_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-[600] text-[#0a0a0a]">
                    £{quote.total_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#64748b] font-[500]">
                    {formatDate(quote.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#64748b] font-[500]">
                    {formatDate(quote.sent_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[13px]">
                    <Link
                      href={`/admin/quotes/${quote.quote_id}`}
                      className="text-[#1e40af] hover:text-[#1e3a8a] transition-colors font-[500]"
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
  // Get icon for activity type
  const getActivityIcon = (eventName: string) => {
    if (eventName.includes('call')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    } else if (eventName.includes('visit')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    } else if (eventName.includes('email')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (eventName.includes('meeting')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (eventName.includes('followup')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (eventName.includes('quote')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    // Default icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Format activity title
  const getActivityTitle = (eventName: string) => {
    return eventName
      .replace('manual_contact_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ' at ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
      <div className="px-6 py-4 border-b border-[#e8e8e8]">
        <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Activity Timeline</h2>
        <p className="text-[13px] text-[#64748b] mt-1">{engagement.length} event{engagement.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="p-6">
        {engagement.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-[#cbd5e1] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#64748b] text-[14px] font-[500]">No activity yet</p>
            <p className="text-[#94a3b8] text-[13px] mt-1">Log calls, visits, and emails to track engagement</p>
          </div>
        ) : (
          <div className="space-y-6">
            {engagement.map((event: any, index: number) => (
              <div key={event.event_id} className="relative">
                {/* Timeline line */}
                {index !== engagement.length - 1 && (
                  <div className="absolute left-[11px] top-[40px] bottom-[-24px] w-[2px] bg-[#f1f5f9]"></div>
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#eff6ff] text-[#1e40af] flex items-center justify-center relative z-10">
                    {getActivityIcon(event.event_name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[14px] font-[600] text-[#0a0a0a]">
                            {getActivityTitle(event.event_name)}
                          </h3>
                          {event.source && (
                            <span className="text-[11px] bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-full font-[500]">
                              {event.source}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#64748b] mt-1 font-[500]">
                          {formatDate(event.occurred_at)}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    {event.meta && (
                      <div className="mt-3 space-y-2">
                        {/* Logged by */}
                        {event.meta.logged_by_name && (
                          <div className="text-[13px]">
                            <span className="text-[#64748b]">By:</span>{' '}
                            <span className="text-[#0a0a0a] font-[500]">{event.meta.logged_by_name}</span>
                          </div>
                        )}

                        {/* Outcome */}
                        {event.meta.outcome && (
                          <div className="text-[13px]">
                            <span className="text-[#64748b]">Outcome:</span>{' '}
                            <span className="text-[#0a0a0a] font-[500]">
                              {event.meta.outcome.replace(/_/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {event.meta.notes && (
                          <div className="mt-2 p-3 bg-[#f8fafc] border border-[#e8e8e8] rounded-lg">
                            <p className="text-[13px] text-[#475569] leading-relaxed">{event.meta.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* URL for non-manual events */}
                    {event.url && !event.event_name.includes('manual') && (
                      <div className="mt-2 text-[12px] text-[#64748b] truncate font-mono">
                        {event.url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
