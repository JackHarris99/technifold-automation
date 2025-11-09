/**
 * Settings Tab - Company and contact management
 * Edit company details, manage contacts, assign owner
 */

'use client';

import { useState } from 'react';

interface SettingsTabProps {
  companyId: string;
  company: any;
  contacts: any[];
  permissions: {
    canSendMarketing: boolean;
    canCreateQuote: boolean;
    canEditContacts: boolean;
    canViewDetails: boolean;
    canChangeAccountOwner: boolean;
    canChangeCompanyType: boolean;
  };
  onRefresh?: () => void;
}

export default function SettingsTab({ companyId, company, contacts, permissions, onRefresh }: SettingsTabProps) {
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: company.company_name || '',
    account_owner: company.account_owner || '',
    category: company.category || '',
  });
  const [saving, setSaving] = useState(false);

  // Contact editing
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    marketing_status: 'subscribed',
  });

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) throw new Error('Failed to save');

      setEditingCompany(false);
      alert('Company updated successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          company_id: companyId,
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
      alert('Contact added successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Add contact error:', error);
      alert('Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContactMarketingStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketing_status: status }),
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('Marketing status updated!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update marketing status');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Contact deleted!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
          {!editingCompany && permissions.canEditContacts && (
            <button
              onClick={() => setEditingCompany(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Edit Company
            </button>
          )}
          {!permissions.canEditContacts && (
            <span className="text-sm text-yellow-600 font-semibold">⚠️ View only</span>
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save'}
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-gray-700">Company Name</div>
              <div className="text-gray-900">{company.company_name}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700">Account Owner</div>
              <div className="text-gray-900">{company.account_owner || 'Unassigned'}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700">Category</div>
              <div className="text-gray-900">{company.category || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700">Company ID</div>
              <div className="text-gray-500 text-sm font-mono">{company.company_id}</div>
            </div>
          </div>
        )}
      </div>

      {/* Contacts Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          <button
            onClick={() => setAddingContact(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            + Add Contact
          </button>
        </div>

        {/* Add Contact Form */}
        {addingContact && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                placeholder="Email"
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
            <div className="flex gap-2">
              <button
                onClick={handleAddContact}
                disabled={saving || !newContact.email}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving ? 'Adding...' : 'Add Contact'}
              </button>
              <button
                onClick={() => setAddingContact(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contacts yet</p>
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

                  {/* Marketing Status */}
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

                {contact.gdpr_consent_at && (
                  <div className="text-xs text-gray-400 mt-2">
                    GDPR consent: {new Date(contact.gdpr_consent_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Additional Settings Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">Advanced Marketing Preferences</h3>
        <p className="text-sm text-gray-600">
          Granular opt-in/out by problem, solution, or machine type coming soon.
        </p>
      </div>
    </div>
  );
}
