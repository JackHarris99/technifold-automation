/**
 * Unified Company Detail Page - Everything on one page, no tabs
 * Sales reps can instantly edit company details and contacts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanySelector from './CompanySelector';
import MediaImage from '@/components/shared/MediaImage';
import CreateInvoiceModal from './CreateInvoiceModal';

interface CompanyDetailUnifiedProps {
  company: any;
  salesRep?: { rep_name: string; email: string | null } | null;
  machines: any[];
  contacts: any[];
  recentEngagement: any[];
  orders: any[];
  permissions: {
    canSendMarketing: boolean;
    canCreateQuote: boolean;
    canEditContacts: boolean;
    canViewDetails: boolean;
    canChangeAccountOwner: boolean;
    canChangeCompanyType: boolean;
  };
}

// Color scheme for account owners
const OWNER_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'Lee': { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Callum': { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Steve': { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'jack_harris': { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
};

export default function CompanyDetailUnified({
  company,
  salesRep,
  machines,
  contacts,
  recentEngagement,
  orders,
  permissions
}: CompanyDetailUnifiedProps) {
  const router = useRouter();

  // Company editing
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: company.company_name || '',
    account_owner: company.account_owner || '',
    category: company.category || '',
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // Contact editing
  const [addingContact, setAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    marketing_status: 'subscribed',
  });
  const [savingContact, setSavingContact] = useState(false);

  // Expandable sections
  const [showEngagement, setShowEngagement] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // Invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Get color scheme for this company's owner
  const ownerColors = OWNER_COLORS[company.account_owner || ''] || {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700'
  };

  const canAct = permissions.canSendMarketing;

  const handleCompanyChange = (companyId: string) => {
    router.push(`/admin/company/${companyId}`);
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) throw new Error('Failed to save');

      setEditingCompany(false);
      alert('Company updated!');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save company');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.email) {
      alert('Email is required');
      return;
    }

    setSavingContact(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          company_id: company.company_id,
          full_name: `${newContact.first_name} ${newContact.last_name}`.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add contact');

      setAddingContact(false);
      setNewContact({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        marketing_status: 'subscribed',
      });
      alert('Contact added!');
      router.refresh();
    } catch (error) {
      console.error('Add contact error:', error);
      alert('Failed to add contact');
    } finally {
      setSavingContact(false);
    }
  };

  const handleUpdateContactMarketingStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketing_status: status }),
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('Marketing status updated!');
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update marketing status');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/admin/companies/${company.company_id}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Contact deleted!');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    }
  };

  const lastOrder = orders.length > 0 ? orders[0] : null;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Header - Sticky */}
      <div className={`bg-white border-l-4 ${ownerColors.border} shadow-sm sticky top-0 z-10`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Company Selector */}
            <div className="flex-1 max-w-md">
              <CompanySelector
                currentCompanyId={company.company_id}
                currentCompanyName={company.company_name}
                onCompanySelect={handleCompanyChange}
              />
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 text-sm">
              <div>
                <div className="text-gray-500 text-xs uppercase">Machines</div>
                <div className="font-bold text-xl text-gray-900">{machines.length}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase">Contacts</div>
                <div className="font-bold text-xl text-gray-900">{contacts.length}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase">Last Order</div>
                <div className="font-bold text-xl text-gray-900">
                  {lastOrder ? new Date(lastOrder.created_at).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase">Revenue</div>
                <div className="font-bold text-xl text-gray-900">£{totalRevenue.toFixed(0)}</div>
              </div>
            </div>

            {/* Account Owner Badge */}
            <div className={`px-6 py-3 rounded-lg ${ownerColors.bg} ${ownerColors.border} border-2`}>
              <div className={`font-bold ${ownerColors.text} text-lg`}>{salesRep?.rep_name || 'Unassigned'}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Account Owner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Warning */}
      {!canAct && (
        <div className="bg-yellow-50 border-b-2 border-yellow-200 px-6 py-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-semibold">
              View-only access: You cannot perform actions on this company (owned by {salesRep?.rep_name || 'another rep'})
            </span>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Company Details Card - Always Visible & Editable */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
              {!editingCompany && permissions.canEditContacts && (
                <button
                  onClick={() => setEditingCompany(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Edit Company
                </button>
              )}
            </div>

            {editingCompany ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Owner
                    {!permissions.canChangeAccountOwner && <span className="text-xs text-yellow-600 ml-2">(Directors only)</span>}
                  </label>
                  <input
                    type="text"
                    value={companyData.account_owner}
                    onChange={(e) => setCompanyData({ ...companyData, account_owner: e.target.value })}
                    placeholder="Sales rep name"
                    disabled={!permissions.canChangeAccountOwner}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category
                    {!permissions.canChangeCompanyType && <span className="text-xs text-yellow-600 ml-2">(Directors only)</span>}
                  </label>
                  <select
                    value={companyData.category}
                    onChange={(e) => setCompanyData({ ...companyData, category: e.target.value })}
                    disabled={!permissions.canChangeCompanyType}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select category...</option>
                    <option value="customer">Customer</option>
                    <option value="prospect">Prospect</option>
                    <option value="distributor">Distributor</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCompany}
                    disabled={savingCompany}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {savingCompany ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCompany(false);
                      setCompanyData({
                        company_name: company.company_name || '',
                        account_owner: company.account_owner || '',
                        category: company.category || '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-bold text-gray-700">Company Name</div>
                  <div className="text-gray-900 text-lg">{company.company_name}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-700">Category</div>
                  <div className="text-gray-900 capitalize">{company.category || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-700">Company ID</div>
                  <div className="text-gray-500 text-sm font-mono">{company.company_id}</div>
                </div>
              </div>
            )}
          </div>

          {/* Contacts Card - Always Visible & Editable */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Contacts ({contacts.length})</h2>
              <button
                onClick={() => setAddingContact(!addingContact)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                {addingContact ? 'Cancel' : '+ Add Contact'}
              </button>
            </div>

            {/* Add Contact Form */}
            {addingContact && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-4">New Contact</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={newContact.marketing_status}
                    onChange={(e) => setNewContact({ ...newContact, marketing_status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
                <button
                  onClick={handleAddContact}
                  disabled={savingContact || !newContact.email}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {savingContact ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            )}

            {/* Contacts List */}
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No contacts yet. Add one above!</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.contact_id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{contact.full_name || 'No name'}</div>
                        <div className="text-sm text-gray-600">{contact.email}</div>
                        {contact.role && (
                          <div className="text-xs text-gray-500 mt-1">{contact.role}</div>
                        )}
                      </div>

                      {/* Marketing Status & Actions */}
                      <div className="flex items-center gap-2">
                        <select
                          value={contact.marketing_status || 'pending'}
                          onChange={(e) => handleUpdateContactMarketingStatus(contact.contact_id, e.target.value)}
                          className={`px-3 py-1 text-xs border rounded-lg font-semibold ${
                            contact.marketing_status === 'subscribed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : contact.marketing_status === 'unsubscribed'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="subscribed">Subscribed</option>
                          <option value="unsubscribed">Unsubscribed</option>
                          <option value="bounced">Bounced</option>
                          <option value="pending">Pending</option>
                        </select>

                        <button
                          onClick={() => handleDeleteContact(contact.contact_id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Machines Card */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Known Machines ({machines.length})</h2>

            {machines.length === 0 ? (
              <p className="text-gray-500">No machines tracked yet</p>
            ) : (
              <div className="space-y-3">
                {machines.map((cm) => (
                  <div key={cm.company_machine_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{cm.machines.display_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {cm.confirmed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            {cm.source}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">Confidence: {cm.confidence_score}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/admin/company/${company.company_id}/marketing`)}
              disabled={!canAct}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-bold text-lg text-gray-900 mb-2">📧 Send Marketing</div>
              <div className="text-sm text-gray-600">Create machine-specific campaigns</div>
            </button>

            <button
              onClick={() => router.push(`/admin/company/${company.company_id}/reorder`)}
              disabled={!canAct}
              className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl hover:shadow-lg transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-bold text-lg text-gray-900 mb-2">🔄 Send Reorder</div>
              <div className="text-sm text-gray-600">Consumable reminders</div>
            </button>

            <button
              onClick={() => router.push(`/admin/quote-builder-v2?company_id=${company.company_id}`)}
              disabled={!canAct}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-bold text-lg text-gray-900 mb-2">📄 Create Quote</div>
              <div className="text-sm text-gray-600">Build custom quote</div>
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              disabled={!canAct}
              className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-bold text-lg text-gray-900 mb-2">💳 Create Invoice</div>
              <div className="text-sm text-gray-600">Send Stripe invoice via email</div>
            </button>
          </div>

          {/* Recent Activity - Expandable */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <button
              onClick={() => setShowEngagement(!showEngagement)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-bold text-gray-900">Recent Activity ({recentEngagement.length})</h2>
              <span className="text-2xl">{showEngagement ? '−' : '+'}</span>
            </button>

            {showEngagement && (
              <div className="mt-4 space-y-2">
                {recentEngagement.length === 0 ? (
                  <p className="text-gray-500">No recent activity</p>
                ) : (
                  recentEngagement.slice(0, 20).map((event, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="font-medium text-gray-700">
                        {event.event_name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {new Date(event.occurred_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Order History - Expandable */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-bold text-gray-900">Order History ({orders.length})</h2>
              <span className="text-2xl">{showOrders ? '−' : '+'}</span>
            </button>

            {showOrders && (
              <div className="mt-4 space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  orders.slice(0, 10).map((order: any) => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

                    return (
                      <div key={order.order_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-900">
                              {order.books_invoice_id ? `Invoice #${order.books_invoice_id}` : `Order #${order.order_id.split('-')[0].toUpperCase()}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()} • {itemCount} items
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              £{order.total_amount?.toFixed(2) || '0.00'}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <CreateInvoiceModal
          companyId={company.company_id}
          companyName={company.company_name}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
