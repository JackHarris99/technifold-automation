/**
 * Addresses Client Component
 * Manage shipping addresses with add/edit/delete/set default
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Address {
  address_id: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Props {
  addresses: Address[];
  userName: string;
}

export default function AddressesClient({ addresses: initialAddresses, userName }: Props) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/customer/login');
  };

  const handleAddAddress = async (formData: Omit<Address, 'address_id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add address');
      }

      setAddresses([data.address, ...addresses]);
      setIsAddModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (addressId: string, formData: Omit<Address, 'address_id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update address');
      }

      setAddresses(addresses.map(a => a.address_id === addressId ? data.address : a));
      setEditingAddress(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete address');
      }

      setAddresses(addresses.filter(a => a.address_id !== addressId));
      setDeletingAddressId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const address = addresses.find(a => a.address_id === addressId);
    if (!address) return;

    await handleUpdateAddress(addressId, { ...address, is_default: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                  alt="Technifold"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <nav className="flex items-center gap-6">
                <a
                  href="/customer/portal"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Reorder
                </a>
                <a
                  href="/customer/orders"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Order History
                </a>
                <a
                  href="/customer/addresses"
                  className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
                >
                  Addresses
                </a>
                <a
                  href="/customer/account"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Account
                </a>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#666]">
                Welcome, <strong>{userName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-[#666] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2">Shipping Addresses</h1>
            <p className="text-[#666]">Manage your delivery addresses</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            + Add Address
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Addresses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.address_id}
              className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6 hover:shadow-md transition-all relative"
            >
              {address.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Default
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="font-semibold text-[#0a0a0a] mb-1">{address.address_line_1}</div>
                {address.address_line_2 && (
                  <div className="text-[#666] text-sm">{address.address_line_2}</div>
                )}
                <div className="text-[#666] text-sm">
                  {address.city}
                  {address.state_province && `, ${address.state_province}`}
                </div>
                <div className="text-[#666] text-sm">
                  {address.postal_code}, {address.country}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.address_id)}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => setEditingAddress(address)}
                  disabled={loading}
                  className="text-sm text-[#666] hover:text-[#0a0a0a] font-medium disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingAddressId(address.address_id)}
                  disabled={loading || addresses.length === 1}
                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">No Addresses</h2>
            <p className="text-[#666] mb-6">Add your first shipping address to start ordering.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Address Modal */}
      {(isAddModalOpen || editingAddress) && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAddress(null);
            setError(null);
          }}
          onSave={(formData) => {
            if (editingAddress) {
              handleUpdateAddress(editingAddress.address_id, formData);
            } else {
              handleAddAddress(formData);
            }
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAddressId && (
        <DeleteConfirmationModal
          onConfirm={() => handleDeleteAddress(deletingAddressId)}
          onCancel={() => setDeletingAddressId(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

/* Address Modal Component */
interface AddressModalProps {
  address: Address | null;
  onClose: () => void;
  onSave: (formData: Omit<Address, 'address_id'>) => void;
  loading: boolean;
}

function AddressModal({ address, onClose, onSave, loading }: AddressModalProps) {
  const [formData, setFormData] = useState({
    address_line_1: address?.address_line_1 || '',
    address_line_2: address?.address_line_2 || '',
    city: address?.city || '',
    state_province: address?.state_province || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'GB',
    is_default: address?.is_default || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#0a0a0a]">
            {address ? 'Edit Address' : 'Add Address'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state_province}
                  onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                  Country *
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="CH">Switzerland</option>
                  <option value="AT">Austria</option>
                  <option value="IE">Ireland</option>
                  <option value="PL">Poland</option>
                  <option value="SE">Sweden</option>
                  <option value="DK">Denmark</option>
                  <option value="NO">Norway</option>
                  <option value="FI">Finland</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_default" className="ml-2 text-sm text-[#666]">
                Set as default address
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Delete Confirmation Modal */
interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteConfirmationModal({ onConfirm, onCancel, loading }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">Delete Address?</h2>
        <p className="text-[#666] mb-6">
          Are you sure you want to delete this address? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
