/**
 * Shipping Manifests Tab
 * Manage international shipments and customs declarations
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getViewMode } from '@/lib/viewMode';

interface ShippingManifest {
  manifest_id: string;
  company_id: string;
  destination_country: string;
  shipment_type: string;
  courier?: string;
  tracking_number?: string;
  customs_invoice_number: string;
  total_customs_value_gbp: number;
  total_weight_kg: number;
  items: any[];
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  companies?: {
    company_name: string;
  };
  invoices?: {
    invoice_number: string;
  };
}

export default function ManifestsTab() {
  const [manifests, setManifests] = useState<ShippingManifest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('pending');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadManifests();
  }, [filter]);

  async function loadManifests() {
    setLoading(true);
    try {
      const viewMode = getViewMode();
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (viewMode === 'my_customers') params.set('viewMode', 'my_customers');

      const url = params.toString()
        ? `/api/admin/shipping-manifests?${params}`
        : '/api/admin/shipping-manifests';

      const response = await fetch(url);
      const data = await response.json();
      setManifests(data.manifests || []);
    } catch (err) {
      console.error('Failed to load manifests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsShipped(manifestId: string) {
    const courier = prompt('Enter courier name (e.g., DHL, FedEx):');
    const tracking = prompt('Enter tracking number:');

    if (!courier) return;

    try {
      const response = await fetch('/api/admin/shipping-manifests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifest_id: manifestId,
          shipped_at: new Date().toISOString(),
          courier,
          tracking_number: tracking || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('Manifest marked as shipped');
      loadManifests();
    } catch (err) {
      alert('Failed to mark as shipped');
      console.error(err);
    }
  }

  async function markAsDelivered(manifestId: string) {
    if (!confirm('Mark this shipment as delivered?')) return;

    try {
      const response = await fetch('/api/admin/shipping-manifests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifest_id: manifestId,
          delivered_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('Manifest marked as delivered');
      loadManifests();
    } catch (err) {
      alert('Failed to mark as delivered');
      console.error(err);
    }
  }

  function getStatusBadge(manifest: ShippingManifest) {
    if (manifest.delivered_at) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Delivered</span>;
    }
    if (manifest.shipped_at) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Shipped</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending</span>;
  }

  return (
    <div>
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">International Shipments</h3>
        <p className="text-sm text-blue-800">
          Track customs declarations, manifests, and delivery status for international orders.
          Manifests are automatically created when orders are marked as shipped internationally.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'shipped', 'delivered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                filter === tab
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Create Manifest
        </button>
      </div>

      {/* Manifests List */}
      {loading ? (
        <div className="text-center py-12 text-gray-800">Loading manifests...</div>
      ) : manifests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-800">No manifests found for this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {manifests.map((manifest) => (
            <div
              key={manifest.manifest_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {manifest.companies?.company_name || manifest.company_id}
                    </h3>
                    {getStatusBadge(manifest)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-800">Destination:</span>
                      <div className="font-semibold">{manifest.destination_country}</div>
                    </div>
                    <div>
                      <span className="text-gray-800">Type:</span>
                      <div className="font-semibold">{manifest.shipment_type}</div>
                    </div>
                    <div>
                      <span className="text-gray-800">Value:</span>
                      <div className="font-semibold">£{manifest.total_customs_value_gbp.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-800">Weight:</span>
                      <div className="font-semibold">{manifest.total_weight_kg.toFixed(2)} kg</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier/Tracking Info */}
              {manifest.courier && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-800">Courier:</span>
                      <div className="font-semibold">{manifest.courier}</div>
                    </div>
                    {manifest.tracking_number && (
                      <div>
                        <span className="text-gray-800">Tracking:</span>
                        <div className="font-semibold">{manifest.tracking_number}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Items ({manifest.items.length}):
                </div>
                <div className="space-y-1">
                  {manifest.items.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm text-gray-800">
                      {item.quantity}x {item.description} ({item.product_code}) - HS: {item.hs_code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-700">
                  Customs Invoice: {manifest.customs_invoice_number}
                </div>
                <div className="flex-1"></div>
                {!manifest.shipped_at && (
                  <button
                    onClick={() => markAsShipped(manifest.manifest_id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                  >
                    Mark as Shipped
                  </button>
                )}
                {manifest.shipped_at && !manifest.delivered_at && (
                  <button
                    onClick={() => markAsDelivered(manifest.manifest_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                  >
                    Mark as Delivered
                  </button>
                )}
                <Link
                  href={`/admin/shipping-manifests/${manifest.manifest_id}/packing-slip`}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-50"
                >
                  View Packing Slip
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Manifest Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold mb-4">Create Shipping Manifest</h2>
            <p className="text-gray-800 mb-6">
              Manifest creation UI coming soon. For now, manifests are created automatically when orders are marked as
              shipped internationally.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
