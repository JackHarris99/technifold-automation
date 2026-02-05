'use client';

import { useState, useMemo } from 'react';
import ImageUpload from './ImageUpload';
import AddProductModal from './modals/AddProductModal';

interface Product {
  product_code: string;
  description: string | null;
  type: string;
  category: string | null;
  active: boolean;
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
  extra: any;
}

interface ProductsManagementV2Props {
  products: Product[];
}

export default function ProductsManagementV2({ products: initialProducts }: ProductsManagementV2Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showImageUpload, setShowImageUpload] = useState<string | null>(null);
  const [showBulkImageUpload, setShowBulkImageUpload] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Group products by type + category
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();

    products.forEach((product) => {
      const groupKey = `${product.type}|||${product.category || 'Uncategorized'}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(product);
    });

    // Sort groups by type, then category
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      const [aType, aCategory] = a[0].split('|||');
      const [bType, bCategory] = b[0].split('|||');

      if (aType !== bType) {
        return aType.localeCompare(bType);
      }
      return aCategory.localeCompare(bCategory);
    });

    return sortedGroups;
  }, [products]);

  // Filter groups by type tab and search term
  const filteredGroups = useMemo(() => {
    let filtered = groupedProducts;

    // Filter by type tab
    if (activeTypeTab !== 'all') {
      filtered = filtered.filter(([groupKey]) => {
        const [type] = groupKey.split('|||');
        return type === activeTypeTab;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered
        .map(([groupKey, prods]) => {
          const searchFiltered = prods.filter((p) =>
            p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return [groupKey, searchFiltered] as [string, Product[]];
        })
        .filter(([, prods]) => prods.length > 0);
    }

    return filtered;
  }, [groupedProducts, searchTerm, activeTypeTab]);

  const toggleCategory = (groupKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(filteredGroups.map(([key]) => key)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleImageUploaded = (productCode: string, imageUrl: string) => {
    setProducts(products.map(p =>
      p.product_code === productCode ? { ...p, image_url: imageUrl } : p
    ));
    setShowImageUpload(null);
  };

  const handleBulkImageUploaded = async (imageUrl: string, categoryKey: string) => {
    // Bulk upload completed - refresh the page to show updated images
    setShowBulkImageUpload(null);
    window.location.reload();
  };

  const handleProductCreated = () => {
    // Refresh the page to show the new product
    setShowAddProductModal(false);
    window.location.reload();
  };

  // Stats based on current tab filter
  const getFilteredProducts = () => {
    if (activeTypeTab === 'all') return products;
    return products.filter(p => p.type === activeTypeTab);
  };

  const getTotalProducts = () => getFilteredProducts().length;
  const getProductsWithImages = () => getFilteredProducts().filter(p => p.image_url).length;
  const getProductsWithoutImages = () => getFilteredProducts().filter(p => !p.image_url).length;

  // Get product counts by type for tab badges
  const getTypeCount = (type: string) => products.filter(p => p.type === type).length;

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTypeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Products
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTypeTab('tool')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTypeTab === 'tool'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tools
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {getTypeCount('tool')}
              </span>
            </button>
            <button
              onClick={() => setActiveTypeTab('consumable')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTypeTab === 'consumable'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consumables
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                {getTypeCount('consumable')}
              </span>
            </button>
            <button
              onClick={() => setActiveTypeTab('part')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTypeTab === 'part'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Parts
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">
                {getTypeCount('part')}
              </span>
            </button>
            <button
              onClick={() => setActiveTypeTab('accessory')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTypeTab === 'accessory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Accessories
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                {getTypeCount('accessory')}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Header Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
            <p className="text-sm text-gray-800 mt-1">Organized by type and category</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
            <a
              href="/admin/products/bulk-attributes"
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              Bulk Edit Attributes
            </a>
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">{getTotalProducts()}</div>
            <div className="text-sm text-blue-700 mt-1">Total Products</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-900">{getProductsWithImages()}</div>
            <div className="text-sm text-green-700 mt-1">With Images</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-900">{getProductsWithoutImages()}</div>
            <div className="text-sm text-orange-700 mt-1">Missing Images</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-900">
              {Math.round((getProductsWithImages() / getTotalProducts()) * 100)}%
            </div>
            <div className="text-sm text-purple-700 mt-1">Image Coverage</div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search by product code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-3">
        {filteredGroups.map(([groupKey, groupProducts]) => {
          const [type, category] = groupKey.split('|||');
          const isExpanded = expandedCategories.has(groupKey);
          const productsWithImages = groupProducts.filter(p => p.image_url).length;
          const productsWithoutImages = groupProducts.filter(p => !p.image_url).length;

          return (
            <div key={groupKey} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(groupKey)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-800">
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase rounded-full">
                        {type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">
                      {groupProducts.length} products • {productsWithImages} with images • {productsWithoutImages} missing images
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {productsWithoutImages > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBulkImageUpload(groupKey);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 font-medium"
                    >
                      Bulk Add Image to {productsWithoutImages} Products
                    </button>
                  )}
                  <div className={`w-24 h-2 rounded-full bg-gray-200 overflow-hidden`}>
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(productsWithImages / groupProducts.length) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Products Table */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupProducts.map((product) => (
                        <tr key={product.product_code} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {product.image_url ? (
                              <div className="relative group">
                                <img
                                  src={product.image_url}
                                  alt={product.image_alt || product.description || ''}
                                  className="h-16 w-16 object-cover rounded border border-gray-200"
                                />
                                <button
                                  onClick={() => setShowImageUpload(product.product_code)}
                                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                >
                                  <span className="text-white text-xs font-medium">Change</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowImageUpload(product.product_code)}
                                className="h-16 w-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-200 hover:border-gray-400 transition-colors group"
                              >
                                <div className="text-center">
                                  <svg className="w-6 h-6 mx-auto text-gray-800 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="text-xs text-gray-700 group-hover:text-gray-800 mt-1">Add</span>
                                </div>
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{product.product_code}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{product.description || '-'}</div>
                            {product.extra && Object.keys(product.extra).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(product.extra).slice(0, 3).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {key.replace(/_/g, ' ')}: {value}
                                  </span>
                                ))}
                                {Object.keys(product.extra).length > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    +{Object.keys(product.extra).length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {product.price ? `£${product.price.toFixed(2)}` : '-'}
                            </div>
                            {product.rental_price_monthly && (
                              <div className="text-xs text-gray-700">
                                £{product.rental_price_monthly}/mo
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {product.active ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`/admin/products/${product.product_code.replace(/\//g, '--')}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit Details
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-800 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-800">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          productCode={showImageUpload}
          onClose={() => setShowImageUpload(null)}
          onSuccess={handleImageUploaded}
        />
      )}

      {/* Bulk Image Upload Modal */}
      {showBulkImageUpload && (
        <BulkImageUploadModal
          categoryKey={showBulkImageUpload}
          onClose={() => setShowBulkImageUpload(null)}
          onSuccess={handleBulkImageUploaded}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={handleProductCreated}
      />
    </div>
  );
}

interface ImageUploadModalProps {
  productCode: string;
  onClose: () => void;
  onSuccess: (productCode: string, imageUrl: string) => void;
}

function ImageUploadModal({ productCode, onClose, onSuccess }: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', 'product');
      formData.append('identifier', productCode);
      formData.append('table', 'products');
      formData.append('column', 'image_url');
      formData.append('recordId', productCode);
      formData.append('idColumn', 'product_code');

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onSuccess(productCode, data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Upload Image for {productCode}</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 text-2xl">
            ✕
          </button>
        </div>

        <div className="p-6">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 cursor-pointer transition-colors">
              <svg className="w-12 h-12 mx-auto text-gray-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-800 mb-2">
                {uploading ? 'Uploading...' : 'Click to select image or drag & drop'}
              </p>
              <p className="text-xs text-gray-700">PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkImageUploadModalProps {
  categoryKey: string;
  onClose: () => void;
  onSuccess: (imageUrl: string, categoryKey: string) => void;
}

function BulkImageUploadModal({ categoryKey, onClose, onSuccess }: BulkImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [type, category] = categoryKey.split('|||');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Get products that need this image
      const response = await fetch('/api/admin/products/bulk-upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          file_name: file.name,
          file_type: file.type
        })
      });

      const { product_codes } = await response.json();

      if (!response.ok || !product_codes || product_codes.length === 0) {
        throw new Error('No products found to update');
      }

      setUploadProgress(`Uploading to ${product_codes.length} products...`);

      // Upload the same image for each product code
      const uploadResults = [];
      for (let i = 0; i < product_codes.length; i++) {
        const productCode = product_codes[i];
        setUploadProgress(`Uploading ${i + 1}/${product_codes.length}: ${productCode}`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mediaType', 'product');
        formData.append('identifier', productCode);
        formData.append('table', 'products');
        formData.append('column', 'image_url');
        formData.append('recordId', productCode);
        formData.append('idColumn', 'product_code');

        const uploadResponse = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          console.error(`Failed to upload for ${productCode}:`, uploadData.error);
          continue;
        }

        uploadResults.push({ productCode, url: uploadData.url });
      }

      setUploadProgress(`Completed ${uploadResults.length}/${product_codes.length} uploads`);

      // Trigger success callback (will refresh the page)
      onSuccess('bulk-complete', categoryKey);
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">Bulk Upload Image</h2>
            <p className="text-sm text-gray-800 mt-1">
              {type} • {category}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 text-2xl">
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                This image will be applied to <strong>all products in this category that don't have an image yet</strong>.
              </div>
            </div>
          </div>

          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 cursor-pointer transition-colors">
              <svg className="w-12 h-12 mx-auto text-gray-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-800 mb-2">
                {uploading ? 'Uploading...' : 'Click to select image'}
              </p>
              <p className="text-xs text-gray-700">PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
