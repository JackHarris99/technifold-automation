'use client';

import { useState } from 'react';

interface Company {
  company_id: string;
  company_name: string;
  type: string;
}

interface DistributorUser {
  user_id: string;
  company_id: string;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  password_hash: string | null;
  invitation_token: string | null;
  invitation_expires_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

interface Contact {
  contact_id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: string | null;
}

interface DistributorUsersClientProps {
  companies: Company[];
  users: DistributorUser[];
  contacts: Contact[];
}

export default function DistributorUsersClient({ companies, users, contacts }: DistributorUsersClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAddDistributorModal, setShowAddDistributorModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'user' });
  const [newDistributor, setNewDistributor] = useState({
    company_name: '',
    country: '',
    account_owner: '',
    contact_name: '',
    contact_email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const companyUsers = users.filter(u => u.company_id === selectedCompanyId);
  const companyContacts = contacts.filter(c => c.company_id === selectedCompanyId);

  // Find contacts that don't have portal users yet
  const availableContacts = companyContacts.filter(contact =>
    !companyUsers.some(user => user.email.toLowerCase() === contact.email.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!selectedCompanyId || !newUser.full_name || !newUser.email) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/distributor-users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      alert(`User created! Invitation email sent to ${newUser.email}`);
      setShowAddModal(false);
      setNewUser({ full_name: '', email: '', role: 'user' });
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvitation = async (userId: string, email: string) => {
    if (!confirm(`Resend invitation email to ${email}?`)) return;

    try {
      const response = await fetch('/api/admin/distributor-users/resend-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation');
      }

      alert(`Invitation email sent to ${email}`);
    } catch (error: any) {
      alert(`Failed to resend invitation: ${error.message}`);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await fetch('/api/admin/distributor-users/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, active: !currentActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      alert(`User ${action}d successfully`);
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to ${action} user: ${error.message}`);
    }
  };

  const handleLoginAs = async (userId: string, userName: string) => {
    if (!confirm(`Preview portal as ${userName}?`)) return;

    try {
      const response = await fetch('/api/admin/distributor-users/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create preview session');
      }

      // Redirect to distributor portal
      window.location.href = data.redirect;
    } catch (error: any) {
      alert(`Failed to login as user: ${error.message}`);
    }
  };

  const handleCreateFromContact = async (contact: Contact, role: string) => {
    if (!confirm(`Create portal user for ${contact.full_name} (${contact.email}) with role: ${role}?`)) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/distributor-users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: contact.company_id,
          full_name: contact.full_name,
          email: contact.email,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      alert(`Portal user created! Welcome email sent to ${contact.email}`);
      setShowContactsModal(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDistributor = async () => {
    if (!newDistributor.company_name) {
      alert('Company name is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/distributors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDistributor),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create distributor');
      }

      alert(`Distributor "${newDistributor.company_name}" created successfully!`);
      setShowAddDistributorModal(false);
      setNewDistributor({
        company_name: '',
        country: '',
        account_owner: '',
        contact_name: '',
        contact_email: '',
      });

      // Redirect to the new distributor's detail page
      window.location.href = `/admin/distributor-company/${data.company_id}`;
    } catch (error: any) {
      console.error('Error creating distributor:', error);
      alert(`Failed to create distributor: ${error.message}`);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Distributor Companies ({companies.length})</h3>
            <button
              onClick={() => setShowAddDistributorModal(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              + Add Distributor
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {companies.map((company) => {
              const companyUserCount = users.filter(u => u.company_id === company.company_id).length;
              const isSelected = selectedCompanyId === company.company_id;

              return (
                <div key={company.company_id} className="relative">
                  <button
                    onClick={() => setSelectedCompanyId(company.company_id)}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{company.company_name}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      {companyUserCount} user{companyUserCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                  <a
                    href={`/admin/distributor-company/${company.company_id}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="View details"
                  >
                    →
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {selectedCompany ? `${selectedCompany.company_name} - Users` : 'Select a Company'}
            </h3>
            {selectedCompany && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContactsModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  + From Contacts {availableContacts.length > 0 && `(${availableContacts.length})`}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  + Manual Entry
                </button>
              </div>
            )}
          </div>

          {!selectedCompany && (
            <div className="p-12 text-center text-gray-700">
              <p>Select a distributor company to view and manage users</p>
            </div>
          )}

          {selectedCompany && companyUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-700 mb-4">No users yet for this company</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add First User
              </button>
            </div>
          )}

          {selectedCompany && companyUsers.length > 0 && (
            <div className="divide-y divide-gray-100">
              {companyUsers.map((user) => {
                const hasPassword = !!user.password_hash;
                const invitationExpired = user.invitation_expires_at
                  ? new Date(user.invitation_expires_at) < new Date()
                  : false;

                return (
                  <div key={user.user_id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{user.full_name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'user' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                          {!user.active && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span>
                            {hasPassword ? '✅ Password set' : '⏳ Pending invitation'}
                          </span>
                          {user.last_login_at && (
                            <span>
                              Last login: {new Date(user.last_login_at).toLocaleDateString()}
                            </span>
                          )}
                          <span>
                            Added: {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {hasPassword && user.active && (
                          <button
                            onClick={() => handleLoginAs(user.user_id, user.full_name)}
                            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                          >
                            👁 Login As
                          </button>
                        )}
                        {!hasPassword && (
                          <button
                            onClick={() => handleResendInvitation(user.user_id, user.email)}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                          >
                            Resend Invitation
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(user.user_id, user.active)}
                          className={`px-3 py-1.5 text-sm rounded font-medium ${
                            user.active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add User to {selectedCompany?.company_name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="admin">Admin (can manage users + order)</option>
                  <option value="user">User (can order)</option>
                  <option value="viewer">Viewer (read only)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ full_name: '', email: '', role: 'user' });
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create & Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create from Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                Create Portal Users from Contacts
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                {selectedCompany?.company_name}
              </p>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              {availableContacts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-700 mb-2">No available contacts</p>
                  <p className="text-sm text-gray-600">
                    All contacts for this company already have portal users.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableContacts.map((contact) => (
                    <div
                      key={contact.contact_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{contact.full_name}</h4>
                          <p className="text-sm text-gray-700 mt-1">{contact.email}</p>
                          {contact.role && (
                            <p className="text-xs text-gray-600 mt-1">
                              Contact Role: {contact.role}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleCreateFromContact(contact, 'admin')}
                            disabled={submitting}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Create as Admin
                          </button>
                          <button
                            onClick={() => handleCreateFromContact(contact, 'user')}
                            disabled={submitting}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Create as User
                          </button>
                          <button
                            onClick={() => handleCreateFromContact(contact, 'viewer')}
                            disabled={submitting}
                            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Create as Viewer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowContactsModal(false)}
                disabled={submitting}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Distributor Modal */}
      {showAddDistributorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Add New Distributor
            </h3>
            <p className="text-sm text-gray-700 mb-6">
              Create a new distributor company in the system
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newDistributor.company_name}
                  onChange={(e) => setNewDistributor({ ...newDistributor, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Acme Distribution Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={newDistributor.country}
                  onChange={(e) => setNewDistributor({ ...newDistributor, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="United Kingdom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Owner (Sales Rep)
                </label>
                <input
                  type="text"
                  value={newDistributor.account_owner}
                  onChange={(e) => setNewDistributor({ ...newDistributor, account_owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="GH"
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Primary Contact (Optional)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={newDistributor.contact_name}
                      onChange={(e) => setNewDistributor({ ...newDistributor, contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={newDistributor.contact_email}
                      onChange={(e) => setNewDistributor({ ...newDistributor, contact_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="john@acmedist.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddDistributorModal(false);
                  setNewDistributor({
                    company_name: '',
                    country: '',
                    account_owner: '',
                    contact_name: '',
                    contact_email: '',
                  });
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDistributor}
                disabled={submitting || !newDistributor.company_name}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Distributor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
