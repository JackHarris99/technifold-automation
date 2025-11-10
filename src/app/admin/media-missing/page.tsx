/**
 * Missing Media Upload Page
 * Shows all records with missing images/videos organized by type
 */

'use client';

import { useState, useEffect } from 'react';
import MediaUpload from '@/components/admin/MediaUpload';
import { MediaType } from '@/lib/media';

interface MissingMediaItem {
  id: string;
  name: string;
  missing_image?: boolean;
  missing_video?: boolean;
  missing_logo?: boolean;
  missing_hero?: boolean;
  missing_before?: boolean;
  missing_after?: boolean;
  missing_product?: boolean;
  image_url?: string | null;
  video_url?: string | null;
  logo_url?: string | null;
  hero_url?: string | null;
  before_image_url?: string | null;
  after_image_url?: string | null;
  product_image_url?: string | null;
  solution_id?: string;
  problem_id?: string;
  machine_solution_id?: string;
  category?: string;
  type?: string;
}

interface MissingMediaData {
  products?: MissingMediaItem[];
  problem_solution?: MissingMediaItem[];
  problem_solution_machine?: MissingMediaItem[];
  brands?: MissingMediaItem[];
  site_logos?: MissingMediaItem[];
}

type TabType = 'products' | 'problem_solution' | 'problem_solution_machine' | 'brands' | 'site_logos';

const TABS: { id: TabType; label: string }[] = [
  { id: 'site_logos', label: 'Site Logos' },
  { id: 'products', label: 'Products' },
  { id: 'problem_solution', label: 'Problem/Solution (Generic)' },
  { id: 'problem_solution_machine', label: 'Problem/Solution (Machine-Specific)' },
  { id: 'brands', label: 'Machine Brands' },
];

export default function MissingMediaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('site_logos');
  const [data, setData] = useState<MissingMediaData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchMissingMedia();
  }, [showAll]);

  const fetchMissingMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = showAll ? '/api/admin/media/missing?show_all=true' : '/api/admin/media/missing';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch missing media');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh data after successful upload
    fetchMissingMedia();
  };

  const renderProductsTab = () => {
    const items = data.products || [];
    const filteredItems = searchTerm
      ? items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : items;

    if (filteredItems.length === 0 && searchTerm) {
      return <div className="text-center py-12 text-gray-500">No products found matching "{searchTerm}"</div>;
    }

    if (filteredItems.length === 0) {
      return <div className="text-center py-12 text-gray-500">All products have images!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
            <div className="text-xs text-gray-500 mb-3">
              {item.category} • {item.type}
            </div>

            {item.missing_image && (
              <MediaUpload
                mediaType="product"
                identifier={item.id}
                table="products"
                column="image_url"
                recordId={item.id}
                idColumn="product_code"
                currentUrl={item.image_url}
                label="Product Image"
                type="image"
                onUploadSuccess={handleUploadSuccess}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderProblemSolutionTab = () => {
    const items = data.problem_solution || [];
    const filteredItems = searchTerm
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    if (filteredItems.length === 0 && searchTerm) {
      return <div className="text-center py-12 text-gray-500">No problem/solutions found matching "{searchTerm}"</div>;
    }

    if (filteredItems.length === 0) {
      return <div className="text-center py-12 text-gray-500">All problem/solutions have images!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {(item.missing_image || showAll) && (
                <MediaUpload
                  mediaType="problem_solution"
                  identifier={item.id}
                  table="problem_solution"
                  column="image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.image_url}
                  label="Hero Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_before || showAll) && (
                <MediaUpload
                  mediaType="problem_solution"
                  identifier={item.id}
                  table="problem_solution"
                  column="before_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.before_image_url}
                  label="Before Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_after || showAll) && (
                <MediaUpload
                  mediaType="problem_solution"
                  identifier={item.id}
                  table="problem_solution"
                  column="after_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.after_image_url}
                  label="After Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_product || showAll) && (
                <MediaUpload
                  mediaType="problem_solution"
                  identifier={item.id}
                  table="problem_solution"
                  column="product_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.product_image_url}
                  label="Product Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProblemSolutionMachineTab = () => {
    const items = data.problem_solution_machine || [];
    const filteredItems = searchTerm
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    if (filteredItems.length === 0 && searchTerm) {
      return <div className="text-center py-12 text-gray-500">No machine-specific problem/solutions found matching "{searchTerm}"</div>;
    }

    if (filteredItems.length === 0) {
      return <div className="text-center py-12 text-gray-500">All machine-specific problem/solutions have images!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {(item.missing_image || showAll) && (
                <MediaUpload
                  mediaType="problem_solution_machine"
                  identifier={item.id}
                  table="problem_solution_machine"
                  column="image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.image_url}
                  label="Machine-Specific Hero Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_before || showAll) && (
                <MediaUpload
                  mediaType="problem_solution_machine"
                  identifier={item.id}
                  table="problem_solution_machine"
                  column="before_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.before_image_url}
                  label="Machine-Specific Before Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_after || showAll) && (
                <MediaUpload
                  mediaType="problem_solution_machine"
                  identifier={item.id}
                  table="problem_solution_machine"
                  column="after_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.after_image_url}
                  label="Machine-Specific After Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {(item.missing_product || showAll) && (
                <MediaUpload
                  mediaType="problem_solution_machine"
                  identifier={item.id}
                  table="problem_solution_machine"
                  column="product_image_url"
                  recordId={item.id}
                  idColumn="id"
                  currentUrl={item.product_image_url}
                  label="Machine-Specific Product Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSiteLogosTab = () => {
    const items = data.site_logos || [];
    const filteredItems = searchTerm
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    if (filteredItems.length === 0 && searchTerm) {
      return <div className="text-center py-12 text-gray-500">No site logos found matching "{searchTerm}"</div>;
    }

    if (filteredItems.length === 0) {
      return <div className="text-center py-12 text-gray-500">All site logos uploaded!</div>;
    }

    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Company Branding Logos</h3>
            <p className="text-sm text-blue-700">
              These logos appear in the header across your entire marketing site. Upload PNG files with transparent backgrounds for best results.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="border-2 border-blue-200 bg-white rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">{item.name}</h3>

              {item.missing_logo && (
                <MediaUpload
                  mediaType="site_logo"
                  identifier={item.id}
                  table="site_branding"
                  column="logo_url"
                  recordId={item.id}
                  idColumn="brand_key"
                  currentUrl={item.logo_url}
                  label="Company Logo"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {!item.missing_logo && (
                <div className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Logo uploaded
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBrandsTab = () => {
    const items = data.brands || [];
    const filteredItems = searchTerm
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    if (filteredItems.length === 0 && searchTerm) {
      return <div className="text-center py-12 text-gray-500">No brands found matching "{searchTerm}"</div>;
    }

    if (filteredItems.length === 0) {
      return <div className="text-center py-12 text-gray-500">All brands have images!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {item.missing_logo && (
                <MediaUpload
                  mediaType="brand_logo"
                  identifier={item.id}
                  table="brand_media"
                  column="logo_url"
                  recordId={item.id}
                  idColumn="brand_slug"
                  currentUrl={item.logo_url}
                  label="Brand Logo"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {item.missing_hero && (
                <MediaUpload
                  mediaType="brand_hero"
                  identifier={item.id}
                  table="brand_media"
                  column="hero_url"
                  recordId={item.id}
                  idColumn="brand_slug"
                  currentUrl={item.hero_url}
                  label="Hero Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'site_logos':
        return renderSiteLogosTab();
      case 'products':
        return renderProductsTab();
      case 'problem_solution':
        return renderProblemSolutionTab();
      case 'problem_solution_machine':
        return renderProblemSolutionMachineTab();
      case 'brands':
        return renderBrandsTab();
      default:
        return null;
    }
  };

  const getTabCount = (tabId: TabType): number => {
    const items = data[tabId] || [];
    if (!searchTerm) return items.length;

    // Show filtered count when searching
    return items.filter((item: MissingMediaItem) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Missing Media Upload</h1>
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Missing Media Upload</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Missing Image Upload</h1>
          <p className="text-gray-600">Upload images for records that are still using placeholders</p>
        </div>

        {/* Search Bar and Filter */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 mb-6">
          <div className="flex gap-4 items-center mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product code, name, solution, problem, or machine..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-3 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-blue-900 whitespace-nowrap">Show All (not just missing)</span>
            </label>
          </div>
          {searchTerm && (
            <div className="text-sm text-gray-600">
              Press Escape to clear search
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
