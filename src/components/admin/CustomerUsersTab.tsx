/**
 * Customer Portal Users Tab
 * User management for customer companies
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  invitation_token: string | null;
  last_login_at: string | null;
  password_hash?: string | null;
  created_at: string;
}

interface Contact {
  contact_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Props {
  company: {
    company_id: string;
    company_name: string;
  };
  customerUsers: CustomerUser[];
  contacts: Contact[];
}

export default function CustomerUsersTab({ company, customerUsers, contacts }: Props) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
  });

  // Get contacts who don't have customer accounts yet
  const existingEmails = new Set(customerUsers.map(u => u.email.toLowerCase()));
  const eligibleContacts = contacts.filter(c =>
    c.email && !existingEmails.has(c.email.toLowerCase())
  );

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedContacts(new Set(eligibleContacts.map(c => c.contact_id)));
  };

  const clearAll = () => {
    setSelectedContacts(new Set());
  };

  const resendInvitation = async (userId: string) => {
    setResendingInvitation(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/customer-users/${userId}/resend-invitation`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation');
      }

      setSuccess('Invitation resent successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setResendingInvitation(null);
    }
  };

  const sendInvitationsToContacts = async () => {
    if (selectedContacts.size === 0) {
      setError('Please select at least one contact');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contactsToInvite = eligibleContacts.filter(c => selectedContacts.has(c.contact_id));

      // Send invitations for each selected contact and collect detailed results
      const results = await Promise.all(
        contactsToInvite.map(async contact => {
          const response = await fetch('/api/admin/customer-users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: company.company_id,
              email: contact.email,
              first_name: contact.first_name,
              last_name: contact.last_name,
              role: 'user',
            }),
          });

          const data = await response.json();

          return {
            contact,
            success: response.ok,
            error: response.ok ? null : data.error || 'Unknown error',
          };
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      const failedContacts = results.filter(r => !r.success);

      if (successCount > 0) {
        let message = `${successCount} invitation${successCount > 1 ? 's' : ''} sent successfully`;
        if (failCount > 0) {
          const failedNames = failedContacts.map(r => `${r.contact.first_name} ${r.contact.last_name} (${r.error})`).join(', ');
          message += `. ${failCount} failed: ${failedNames}`;
        }
        setSuccess(message);
        setSelectedContacts(new Set());
        setShowAddModal(false);
        router.refresh();
      } else {
        const errorDetails = failedContacts.map(r => `${r.contact.first_name} ${r.contact.last_name}: ${r.error}`).join('; ');
        throw new Error(`All invitations failed: ${errorDetails}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/customer-users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('Invitation sent successfully!');
      setFormData({ email: '', first_name: '', last_name: '', role: 'user' });
      setShowAddManualModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePreviewPortal = async () => {
    try {
      const response = await fetch(`/api/admin/customer-users/preview-portal?company_id=${company.company_id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview portal');
      }

      if (data.has_content) {
        alert(`✅ ${data.message}\n\nProducts available:\n• ${data.summary.reorder_items} reorder items\n• ${data.summary.tool_tabs} tool categories\n• ${data.summary.total_products} total products`);
      } else {
        alert(`⚠️ ${data.message}\n\nThe customer portal will be empty until they have made their first order.`);
      }
    } catch (error: any) {
      alert(`Failed to preview portal: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Portal Users</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer portal access for {company.company_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviewPortal}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all"
          >
            👁 Preview Portal Content
          </button>
          {eligibleContacts.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
              Invite Contacts ({eligibleContacts.length})
            </button>
          )}
          <button
            onClick={() => setShowAddManualModal(true)}
            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all"
          >
            + Add Manually
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Users List */}
      {customerUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portal Users</h3>
          <p className="text-gray-600 mb-4">Add users to give them access to the customer portal.</p>
          <div className="flex items-center gap-3 justify-center">
            {eligibleContacts.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
              >
                Invite Contacts
              </button>
            )}
            <button
              onClick={() => setShowAddManualModal(true)}
              className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.invitation_token ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Invited
                      </span>
                    ) : user.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {user.invitation_token && !user.password_hash && (
                      <button
                        onClick={() => resendInvitation(user.user_id)}
                        disabled={resendingInvitation === user.user_id}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendingInvitation === user.user_id ? 'Sending...' : 'Resend Invitation'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Contacts Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Invite Existing Contacts</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select contacts to send customer portal invitations
              </p>
            </div>

            <div className="p-6">
              {eligibleContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">All contacts already have portal access</p>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {selectedContacts.size} of {eligibleContacts.length} selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={clearAll}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                    {eligibleContacts.map((contact) => (
                      <label
                        key={contact.contact_id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.contact_id)}
                          onChange={() => toggleContact(contact.contact_id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedContacts(new Set());
                      }}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendInvitationsToContacts}
                      disabled={loading || selectedContacts.size === 0}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : `Send ${selectedContacts.size} Invitation${selectedContacts.size !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Manually Modal */}
      {showAddManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Customer Portal User</h2>
              <p className="text-sm text-gray-600 mt-1">
                They'll receive an email invitation to set their password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Admins can manage team members, users can only place orders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddManualModal(false);
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
