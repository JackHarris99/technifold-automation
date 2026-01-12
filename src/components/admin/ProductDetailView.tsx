/**
 * Product Detail View Component
 * Beautiful product detail and edit interface matching portal aesthetic
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  product_code: string;
  description: string | null;
  type: string;
  category: string | null;
  active: boolean;
  is_marketable: boolean;
  is_reminder_eligible: boolean;
  price: number | null;
  currency: string;
  site_visibility: string[];
  image_url: string | null;
  image_alt: string | null;
  video_url: string | null;
  weight_kg: number | null;
  dimensions_cm: string | null;
  hs_code: string | null;
  country_of_origin: string;
  rental_price_monthly: number | null;
  customs_value_gbp: number | null;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  cost_price: number | null;
  pricing_tier: string;
}

interface ProductDetailViewProps {
  product: Product;
  relatedData: {
    linkedConsumables?: any[];
    linkedTools?: any[];
    availableConsumables?: any[];
    availableTools?: any[];
  };
}

export default function ProductDetailView({ product: initialProduct, relatedData }: ProductDetailViewProps) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Product>>({});

  const handleFieldChange = (field: keyof Product, value: any) => {
    setEditedFields({ ...editedFields, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Encode product code: replace / with -- for URL routing
      const encodedProductCode = product.product_code.replace(/\//g, '--');
      const response = await fetch(`/api/admin/products/${encodedProductCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFields),
      });

      if (!response.ok) throw new Error('Failed to save');

      const { product: updatedProduct } = await response.json();
      setProduct(updatedProduct);
      setEditedFields({});
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFields({});
    setEditing(false);
  };

  const currentValue = (field: keyof Product) => {
    return editedFields[field] !== undefined ? editedFields[field] : product[field];
  };

  const handleLinkToggle = async (relatedCode: string, isLinked: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/link`, {
        method: isLinked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_code: product.type === 'tool' ? product.product_code : relatedCode,
          consumable_code: product.type === 'consumable' ? product.product_code : relatedCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to update link');

      router.refresh();
    } catch (error) {
      console.error('Link error:', error);
      alert('Failed to update link');
    }
  };

  const linkedCodes = product.type === 'tool'
    ? relatedData.linkedConsumables?.map(c => c.product_code) || []
    : relatedData.linkedTools?.map(t => t.product_code) || [];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <Link
            href="/admin/products"
            className="text-[13px] text-[#475569] hover:text-[#1e40af] font-[500] transition-colors flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Product Catalog
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-[700] uppercase tracking-wide rounded-[6px] ${
                  product.type === 'tool'
                    ? 'bg-blue-100 text-blue-800'
                    : product.type === 'consumable'
                    ? 'bg-green-100 text-green-800'
                    : product.type === 'part'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {product.type}
                </span>
                {product.active ? (
                  <span className="px-2 py-1 text-[9px] font-[700] uppercase tracking-wide rounded-[6px] bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-[9px] font-[700] uppercase tracking-wide rounded-[6px] bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em] mb-2">
                {product.description || product.product_code}
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] font-mono">
                {product.product_code}
              </p>
            </div>

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 bg-white border-2 border-[#e8e8e8] text-[#475569] rounded-[10px] text-[14px] font-[600] hover:border-[#cbd5e1] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-[10px] text-[14px] font-[600] hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-[10px] text-[14px] font-[600] hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all"
                >
                  Edit Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Product Details */}
          <div className="col-span-8 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
                <h2 className="text-[20px] font-[600] text-[#1e40af] tracking-[-0.01em]">Basic Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Description</label>
                    {editing ? (
                      <input
                        type="text"
                        value={currentValue('description') || ''}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                      />
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.description || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Category</label>
                    {editing ? (
                      <input
                        type="text"
                        value={currentValue('category') || ''}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                      />
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.category || '-'}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Active</label>
                    {editing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentValue('active')}
                          onChange={(e) => handleFieldChange('active', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-[#1e40af]"
                        />
                        <span className="text-[13px] text-[#0a0a0a] font-[500]">{currentValue('active') ? 'Yes' : 'No'}</span>
                      </label>
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.active ? 'Yes' : 'No'}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Marketable</label>
                    {editing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentValue('is_marketable')}
                          onChange={(e) => handleFieldChange('is_marketable', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-[#1e40af]"
                        />
                        <span className="text-[13px] text-[#0a0a0a] font-[500]">{currentValue('is_marketable') ? 'Yes' : 'No'}</span>
                      </label>
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.is_marketable ? 'Yes' : 'No'}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Reminder Eligible</label>
                    {editing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentValue('is_reminder_eligible')}
                          onChange={(e) => handleFieldChange('is_reminder_eligible', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-[#1e40af]"
                        />
                        <span className="text-[13px] text-[#0a0a0a] font-[500]">{currentValue('is_reminder_eligible') ? 'Yes' : 'No'}</span>
                      </label>
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.is_reminder_eligible ? 'Yes' : 'No'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent border-b border-[#e8e8e8]">
                <h2 className="text-[20px] font-[600] text-[#15803d] tracking-[-0.01em]">Pricing</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Sale Price</label>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#475569] font-[600]">£</span>
                        <input
                          type="number"
                          step="0.01"
                          value={currentValue('price') || ''}
                          onChange={(e) => handleFieldChange('price', e.target.value ? parseFloat(e.target.value) : null)}
                          className="flex-1 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                        />
                      </div>
                    ) : (
                      <div className="text-[18px] text-[#0a0a0a] font-[700]">
                        {product.price ? `£${product.price.toFixed(2)}` : '-'}
                      </div>
                    )}
                  </div>

                  {product.type === 'tool' && (
                    <div>
                      <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Rental Price</label>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] text-[#475569] font-[600]">£</span>
                          <input
                            type="number"
                            step="0.01"
                            value={currentValue('rental_price_monthly') || ''}
                            onChange={(e) => handleFieldChange('rental_price_monthly', e.target.value ? parseFloat(e.target.value) : null)}
                            className="flex-1 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                          />
                          <span className="text-[13px] text-[#475569] font-[500]">/mo</span>
                        </div>
                      ) : (
                        <div className="text-[18px] text-[#0a0a0a] font-[700]">
                          {product.rental_price_monthly ? `£${product.rental_price_monthly.toFixed(2)}/mo` : '-'}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Cost Price</label>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#475569] font-[600]">£</span>
                        <input
                          type="number"
                          step="0.01"
                          value={currentValue('cost_price') || ''}
                          onChange={(e) => handleFieldChange('cost_price', e.target.value ? parseFloat(e.target.value) : null)}
                          className="flex-1 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                        />
                      </div>
                    ) : (
                      <div className="text-[18px] text-[#0a0a0a] font-[700]">
                        {product.cost_price ? `£${product.cost_price.toFixed(2)}` : '-'}
                      </div>
                    )}
                  </div>
                </div>

                {product.price && product.cost_price && (
                  <div className="pt-4 border-t border-[#e8e8e8]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[600] text-[#475569]">Profit Margin</span>
                      <span className="text-[16px] font-[700] text-[#15803d]">
                        {((((product.price - product.cost_price) / product.price) * 100).toFixed(1))}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Image */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-[#e8e8e8]">
                <h2 className="text-[20px] font-[600] text-[#7c3aed] tracking-[-0.01em]">Product Image</h2>
              </div>
              <div className="p-6">
                {product.image_url ? (
                  <div className="relative w-full h-64 bg-[#f9fafb] rounded-[12px] overflow-hidden border border-[#e8e8e8]">
                    <Image
                      src={product.image_url}
                      alt={product.image_alt || product.description || ''}
                      fill
                      className="object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/product-placeholder.svg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-[#f9fafb] rounded-[12px] border-2 border-dashed border-[#e2e8f0] flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-[#cbd5e1] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[13px] text-[#475569] font-[500]">No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50/50 to-transparent border-b border-[#e8e8e8]">
                <h2 className="text-[20px] font-[600] text-[#ea580c] tracking-[-0.01em]">Technical Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Weight (kg)</label>
                    {editing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={currentValue('weight_kg') || ''}
                        onChange={(e) => handleFieldChange('weight_kg', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                      />
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.weight_kg || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">HS Code</label>
                    {editing ? (
                      <input
                        type="text"
                        value={currentValue('hs_code') || ''}
                        onChange={(e) => handleFieldChange('hs_code', e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                      />
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500] font-mono">{product.hs_code || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">Country of Origin</label>
                    {editing ? (
                      <input
                        type="text"
                        value={currentValue('country_of_origin') || ''}
                        onChange={(e) => handleFieldChange('country_of_origin', e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                      />
                    ) : (
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{product.country_of_origin || '-'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Related Products */}
          <div className="col-span-4 space-y-6">
            {/* Linked Products */}
            {product.type === 'tool' && (
              <div className="bg-white rounded-[16px] shadow-sm border-2 border-green-100">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent border-b border-[#e8e8e8]">
                  <h2 className="text-[17px] font-[600] text-[#15803d] tracking-[-0.01em]">Linked Consumables</h2>
                  <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
                    {relatedData.linkedConsumables?.length || 0} linked
                  </p>
                </div>
                <div className="p-6">
                  {relatedData.linkedConsumables && relatedData.linkedConsumables.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {relatedData.linkedConsumables.map((consumable: any) => (
                        <div key={consumable.product_code} className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] flex items-center gap-3">
                          {consumable.image_url && (
                            <div className="relative w-10 h-10 bg-white rounded-[6px] flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
                              <Image
                                src={consumable.image_url}
                                alt={consumable.description}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-[600] text-[#0a0a0a] truncate">{consumable.description}</div>
                            <div className="text-[10px] text-[#475569] font-mono">{consumable.product_code}</div>
                          </div>
                          <button
                            onClick={() => handleLinkToggle(consumable.product_code, true)}
                            className="text-red-600 hover:text-red-700 text-[11px] font-[600]"
                          >
                            Unlink
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#475569] italic mb-4">No consumables linked</p>
                  )}

                  {editing && relatedData.availableConsumables && (
                    <div className="border-t border-[#e8e8e8] pt-4">
                      <p className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">Available to Link</p>
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {relatedData.availableConsumables
                          .filter((c: any) => !linkedCodes.includes(c.product_code))
                          .map((consumable: any) => (
                            <button
                              key={consumable.product_code}
                              onClick={() => handleLinkToggle(consumable.product_code, false)}
                              className="w-full text-left p-2 hover:bg-blue-50 rounded-[8px] transition-colors"
                            >
                              <div className="text-[11px] font-[600] text-[#0a0a0a]">{consumable.description}</div>
                              <div className="text-[10px] text-[#475569] font-mono">{consumable.product_code}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.type === 'consumable' && (
              <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
                  <h2 className="text-[17px] font-[600] text-[#1e40af] tracking-[-0.01em]">Used By Tools</h2>
                  <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
                    {relatedData.linkedTools?.length || 0} tools
                  </p>
                </div>
                <div className="p-6">
                  {relatedData.linkedTools && relatedData.linkedTools.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {relatedData.linkedTools.map((tool: any) => (
                        <div key={tool.product_code} className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] flex items-center gap-3">
                          {tool.image_url && (
                            <div className="relative w-10 h-10 bg-white rounded-[6px] flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
                              <Image
                                src={tool.image_url}
                                alt={tool.description}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-[600] text-[#0a0a0a] truncate">{tool.description}</div>
                            <div className="text-[10px] text-[#475569] font-mono">{tool.product_code}</div>
                          </div>
                          <button
                            onClick={() => handleLinkToggle(tool.product_code, true)}
                            className="text-red-600 hover:text-red-700 text-[11px] font-[600]"
                          >
                            Unlink
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#475569] italic mb-4">Not linked to any tools</p>
                  )}

                  {editing && relatedData.availableTools && (
                    <div className="border-t border-[#e8e8e8] pt-4">
                      <p className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">Available Tools</p>
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {relatedData.availableTools
                          .filter((t: any) => !linkedCodes.includes(t.product_code))
                          .map((tool: any) => (
                            <button
                              key={tool.product_code}
                              onClick={() => handleLinkToggle(tool.product_code, false)}
                              className="w-full text-left p-2 hover:bg-blue-50 rounded-[8px] transition-colors"
                            >
                              <div className="text-[11px] font-[600] text-[#0a0a0a]">{tool.description}</div>
                              <div className="text-[10px] text-[#475569] font-mono">{tool.product_code}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
