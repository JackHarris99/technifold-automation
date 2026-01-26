/**
 * Partner List Client Component
 * Shows all partner distributors with create new partner modal
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  company_id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  customer_count: number;
  pending_commission: number;
  paid_commission: number;
  total_commission: number;
  created_at: string;
}

interface PartnerListClientProps {
  partners: Partner[];
}

export default function PartnerListClient({ partners }: PartnerListClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    country: '',
    billing_address_line_1: '',
    billing_city: '',
    billing_postal_code: '',
    billing_country: '',
    vat_number: '',
    tool_commission_rate: 20,
    consumable_commission_rate: 10,
  });

  const handleCreatePartner = async () => {
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/admin/partners/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create partner');
      }

      // Success! Refresh and close modal
      setShowCreateModal(false);
      setFormData({
        company_name: '',
        website: '',
        country: '',
        billing_address_line_1: '',
        billing_city: '',
        billing_postal_code: '',
        billing_country: '',
        vat_number: '',
        tool_commission_rate: 20,
        consumable_commission_rate: 10,
      });
      router.refresh();
    } catch (error: any) {
      console.error('[Create Partner] Error:', error);
      setCreateError(error.message);
      setCreating(false);
    }
  };

  const totalCustomers = partners.reduce((sum, p) => sum + p.customer_count, 0);
  const totalPendingCommission = partners.reduce((sum, p) => sum + p.pending_commission, 0);

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700">Total Partners</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{partners.length}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700">Partner Customers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalCustomers}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700">Pending Commissions</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-600">
              £{totalPendingCommission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </dd>
          </div>
        </div>
      </div>

      {/* Partner List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Partner Distributors</h2>
            <p className="text-sm text-gray-800">Commission-based sales partners</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            + Create New Partner
          </button>
        </div>

        {partners.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Partners Yet</h3>
            <p className="text-gray-700 mb-6">
              Create your first commission-based partner distributor
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              Create First Partner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {partners.map((partner) => (
              <Link
                key={partner.company_id}
                href={`/admin/company/${partner.company_id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {partner.company_name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700">
                        PARTNER
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-700">
                      {partner.country && (
                        <span>📍 {partner.country}</span>
                      )}
                      {partner.website && (
                        <span>🌐 {partner.website}</span>
                      )}
                      <span>👥 {partner.customer_count} customer{partner.customer_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      £{partner.total_commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })} earned
                    </div>
                    {partner.pending_commission > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        £{partner.pending_commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })} pending
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Partner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create New Partner Distributor
              </h2>

              <div className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Partner Company Ltd"
                    required
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="United Kingdom"
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    value={formData.billing_address_line_1}
                    onChange={(e) => setFormData({ ...formData, billing_address_line_1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.billing_city}
                      onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.billing_postal_code}
                      onChange={(e) => setFormData({ ...formData, billing_postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Country
                  </label>
                  <input
                    type="text"
                    value={formData.billing_country}
                    onChange={(e) => setFormData({ ...formData, billing_country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* VAT Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.vat_number}
                    onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="GB123456789"
                  />
                </div>

                {/* Commission Rates */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-3">Default Commission Rates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teal-900 mb-1">
                        Tools (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.tool_commission_rate}
                        onChange={(e) => setFormData({ ...formData, tool_commission_rate: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teal-900 mb-1">
                        Consumables (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.consumable_commission_rate}
                        onChange={(e) => setFormData({ ...formData, consumable_commission_rate: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-teal-800 mt-2">
                    These are default rates. You can set custom rates per customer relationship.
                  </p>
                </div>
              </div>

              {createError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                  }}
                  disabled={creating}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePartner}
                  disabled={creating || !formData.company_name}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Partner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
