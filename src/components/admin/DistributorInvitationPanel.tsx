/**
 * Distributor Invitation Panel
 * Shows distributor users for a company and allows sending invitations
 */

'use client';

import { useState } from 'react';

interface DistributorUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  invitation_token: string | null;
  last_login_at: string | null;
  password_hash?: string | null;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name: string;
}

interface Props {
  company: {
    company_id: string;
    sage_customer_code: string;
    company_name: string;
    type: string;
  };
  distributorUsers: DistributorUser[];
  contacts: Contact[];
}

export default function DistributorInvitationPanel({ company, distributorUsers, contacts }: Props) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Only show if company is a distributor
  if (company.type !== 'distributor') {
    return null;
  }

  // Get contacts who don't have distributor accounts yet
  const existingEmails = new Set(distributorUsers.map(u => u.email.toLowerCase()));
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

  const sendInvitations = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const contactsToInvite = eligibleContacts
        .filter(c => selectedContacts.has(c.contact_id))
        .map(c => ({
          email: c.email,
          full_name: c.full_name || c.email.split('@')[0]
        }));

      const response = await fetch('/api/admin/distributors/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitations: [{
            company_id: company.company_id,
            sage_customer_code: company.sage_customer_code,
            company_name: company.company_name,
            contacts: contactsToInvite
          }]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successful = data.results[0]?.contacts?.filter((c: any) => c.success).length || 0;
        setResult(`✓ Sent ${successful} invitations successfully`);
        setSelectedContacts(new Set());

        // Refresh page after 2 seconds
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`✗ Failed to send invitations: ${data.error}`);
      }
    } catch (error) {
      console.error('Invitation error:', error);
      setResult('✗ Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const resendInvitation = async (user: DistributorUser) => {
    if (!user.invitation_token) {
      alert('This user has already activated their account');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/distributors/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitations: [{
            company_id: company.company_id,
            sage_customer_code: company.sage_customer_code,
            company_name: company.company_name,
            contacts: [{
              email: user.email,
              full_name: user.full_name
            }]
          }]
        }),
      });

      if (response.ok) {
        setResult(`✓ Resent invitation to ${user.email}`);
      } else {
        setResult(`✗ Failed to resend invitation`);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResult('✗ Failed to resend invitation');
    } finally {
      setSending(false);
    }
  };

  const handleLoginAs = async (user: DistributorUser) => {
    if (!confirm(`Preview portal as ${user.full_name}?`)) return;

    try {
      const response = await fetch('/api/admin/distributor-users/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distributor Portal Access
      </h3>

      {/* Existing Users */}
      {distributorUsers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Existing Users ({distributorUsers.length})
          </h4>
          <div className="space-y-2">
            {distributorUsers.map(user => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                    {user.invitation_token && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Pending Invitation
                      </span>
                    )}
                    {user.last_login_at && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.password_hash && user.active && (
                    <button
                      onClick={() => handleLoginAs(user)}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                      title="Preview portal as this user"
                    >
                      👁 Login As
                    </button>
                  )}
                  {user.invitation_token && (
                    <button
                      onClick={() => resendInvitation(user)}
                      disabled={sending}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Resend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite New Users */}
      {eligibleContacts.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Send Invitations ({selectedContacts.size} selected)
            </h4>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              {selectedContacts.size > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {eligibleContacts.map(contact => (
              <label
                key={contact.contact_id}
                className="flex items-center p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.contact_id)}
                  onChange={() => toggleContact(contact.contact_id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{contact.full_name || 'No name'}</div>
                  <div className="text-sm text-gray-600">{contact.email}</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={sendInvitations}
            disabled={sending || selectedContacts.size === 0}
            className={`w-full py-2 px-4 rounded font-medium transition-colors ${
              selectedContacts.size > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? 'Sending...' : `Send ${selectedContacts.size} Invitation${selectedContacts.size !== 1 ? 's' : ''}`}
          </button>

          {result && (
            <div className={`mt-3 p-3 rounded text-sm ${
              result.startsWith('✓')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {result}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          {distributorUsers.length > 0
            ? 'All contacts already have distributor accounts'
            : 'No contacts available - add contacts first'}
        </div>
      )}
    </div>
  );
}
