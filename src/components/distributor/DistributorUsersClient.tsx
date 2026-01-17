'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  password_hash: string | null;
  invitation_expires_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

interface DistributorUsersClientProps {
  companyName: string;
  companyId: string;
  users: User[];
}

export default function DistributorUsersClient({
  companyName,
  companyId,
  users: initialUsers,
}: DistributorUsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'viewer',
  });
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/distributor/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      alert('User added and invitation sent!');
      setShowAddModal(false);
      setNewUser({ full_name: '', email: '', role: 'user' });
      router.refresh();
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (userId: string) => {
    if (!confirm('Resend invitation email to this user?')) return;

    try {
      const response = await fetch('/api/distributor/users/resend-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation');
      }

      alert('Invitation resent!');
      router.refresh();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      alert(error.message || 'Failed to resend invitation');
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await fetch('/api/distributor/users/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, active: !currentActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} user`);
      }

      alert(`User ${action}d successfully!`);
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      alert(error.message || `Failed to ${action} user`);
    }
  };

  const isPendingInvitation = (user: User) => {
    return !user.password_hash;
  };

  const isInvitationExpired = (user: User) => {
    if (!user.invitation_expires_at) return false;
    return new Date(user.invitation_expires_at) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <a
                  href="/distributor"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ← Back to Portal
                </a>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-800 mt-1">{companyName}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Add User
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-700">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'user'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isPendingInvitation(user) ? (
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isInvitationExpired(user)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {isInvitationExpired(user) ? 'Invitation Expired' : 'Pending Invitation'}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {isPendingInvitation(user) && (
                        <button
                          onClick={() => handleResendInvitation(user.user_id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Resend Invitation
                        </button>
                      )}
                      {!isPendingInvitation(user) && (
                        <button
                          onClick={() => handleToggleActive(user.user_id, user.active)}
                          className={
                            user.active
                              ? 'text-orange-600 hover:text-orange-900'
                              : 'text-green-600 hover:text-green-900'
                          }
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-700">No users found. Add your first team member!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Team Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' | 'viewer' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User - Can place orders</option>
                  <option value="admin">Admin - Can manage team</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ full_name: '', email: '', role: 'user' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={
                  loading || !newUser.full_name || !newUser.email || !newUser.role
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
