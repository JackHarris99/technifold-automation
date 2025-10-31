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
  image_url?: string | null;
  video_url?: string | null;
  logo_url?: string | null;
  hero_url?: string | null;
  solution_id?: string;
  problem_id?: string;
  machine_solution_id?: string;
  category?: string;
  type?: string;
}

interface MissingMediaData {
  products?: MissingMediaItem[];
  solutions?: MissingMediaItem[];
  problems?: MissingMediaItem[];
  solution_problem?: MissingMediaItem[];
  machine_solution_problem?: MissingMediaItem[];
  brands?: MissingMediaItem[];
}

type TabType = 'products' | 'solutions' | 'problems' | 'solution_problem' | 'machine_solution_problem' | 'brands';

const TABS: { id: TabType; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'problems', label: 'Problems' },
  { id: 'solution_problem', label: 'Solution × Problem' },
  { id: 'machine_solution_problem', label: 'Machine × Solution × Problem' },
  { id: 'brands', label: 'Brands' },
];

export default function MissingMediaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [data, setData] = useState<MissingMediaData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissingMedia();
  }, []);

  const fetchMissingMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/media/missing');
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
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All products have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
            <div className="text-xs text-gray-500 mb-3">
              {item.category} • {item.type}
            </div>

            <div className="space-y-3">
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

              {item.missing_video && (
                <MediaUpload
                  mediaType="product"
                  identifier={item.id}
                  table="products"
                  column="video_url"
                  recordId={item.id}
                  idColumn="product_code"
                  currentUrl={item.video_url}
                  label="Product Video"
                  type="video"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSolutionsTab = () => {
    const items = data.solutions || [];
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All solutions have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {item.missing_image && (
                <MediaUpload
                  mediaType="solution"
                  identifier={item.id}
                  table="solutions"
                  column="default_image_url"
                  recordId={item.id}
                  idColumn="solution_id"
                  currentUrl={item.image_url}
                  label="Solution Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {item.missing_video && (
                <MediaUpload
                  mediaType="solution"
                  identifier={item.id}
                  table="solutions"
                  column="default_video_url"
                  recordId={item.id}
                  idColumn="solution_id"
                  currentUrl={item.video_url}
                  label="Solution Video"
                  type="video"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProblemsTab = () => {
    const items = data.problems || [];
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All problems have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {item.missing_image && (
                <MediaUpload
                  mediaType="problem"
                  identifier={item.id}
                  table="problems"
                  column="default_image_url"
                  recordId={item.id}
                  idColumn="problem_id"
                  currentUrl={item.image_url}
                  label="Problem Image"
                  type="image"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {item.missing_video && (
                <MediaUpload
                  mediaType="problem"
                  identifier={item.id}
                  table="problems"
                  column="default_video_url"
                  recordId={item.id}
                  idColumn="problem_id"
                  currentUrl={item.video_url}
                  label="Problem Video"
                  type="video"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSolutionProblemTab = () => {
    const items = data.solution_problem || [];
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All solution × problem pairs have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {item.missing_image && (
                <MediaUpload
                  mediaType="solution_problem"
                  identifier={item.id}
                  table="solution_problem"
                  column="default_image_url"
                  recordId={item.id}
                  currentUrl={item.image_url}
                  label="Image"
                  type="image"
                  solution_id={item.solution_id}
                  problem_id={item.problem_id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {item.missing_video && (
                <MediaUpload
                  mediaType="solution_problem"
                  identifier={item.id}
                  table="solution_problem"
                  column="default_video_url"
                  recordId={item.id}
                  currentUrl={item.video_url}
                  label="Video"
                  type="video"
                  solution_id={item.solution_id}
                  problem_id={item.problem_id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMachineSolutionProblemTab = () => {
    const items = data.machine_solution_problem || [];
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All machine × solution × problem records have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm mb-3">{item.name}</h3>

            <div className="space-y-3">
              {item.missing_image && (
                <MediaUpload
                  mediaType="machine_solution_problem"
                  identifier={item.id}
                  table="machine_solution_problem"
                  column="override_image_url"
                  recordId={item.id}
                  currentUrl={item.image_url}
                  label="Override Image"
                  type="image"
                  machine_solution_id={item.machine_solution_id}
                  problem_id={item.problem_id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {item.missing_video && (
                <MediaUpload
                  mediaType="machine_solution_problem"
                  identifier={item.id}
                  table="machine_solution_problem"
                  column="override_video_url"
                  recordId={item.id}
                  currentUrl={item.video_url}
                  label="Override Video"
                  type="video"
                  machine_solution_id={item.machine_solution_id}
                  problem_id={item.problem_id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBrandsTab = () => {
    const items = data.brands || [];
    if (items.length === 0) {
      return <div className="text-center py-12 text-gray-500">All brands have media!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
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
      case 'products':
        return renderProductsTab();
      case 'solutions':
        return renderSolutionsTab();
      case 'problems':
        return renderProblemsTab();
      case 'solution_problem':
        return renderSolutionProblemTab();
      case 'machine_solution_problem':
        return renderMachineSolutionProblemTab();
      case 'brands':
        return renderBrandsTab();
      default:
        return null;
    }
  };

  const getTabCount = (tabId: TabType): number => {
    const items = data[tabId] || [];
    return items.length;
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
          <h1 className="text-3xl font-bold mb-2">Missing Media Upload</h1>
          <p className="text-gray-600">Upload images and videos for records that are still using placeholders</p>
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
