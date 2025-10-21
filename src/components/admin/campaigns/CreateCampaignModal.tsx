/**
 * Create Campaign Modal
 * Wizard for creating new progressive campaigns
 */

'use client';

import { useState } from 'react';

interface MachineTaxonomy {
  id: string;
  level: number;
  slug: string;
  display_name: string;
  parent_id: string | null;
}

interface CreateCampaignModalProps {
  machineTaxonomy: MachineTaxonomy[];
  onClose: () => void;
}

export default function CreateCampaignModal({ machineTaxonomy, onClose }: CreateCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_type: 'progressive',
    product_codes: '',
    target_machine_category_id: '',
    target_knowledge_levels: [1, 2, 3],
    subject_line_template: '',
    tagline_template: '',
    description: '',
  });

  // Get only level 1 (top-level) machine types
  const topLevelMachines = machineTaxonomy.filter(m => m.level === 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productCodesArray = formData.product_codes.split(',').map(s => s.trim()).filter(Boolean);

      const response = await fetch('/api/admin/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_codes: productCodesArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      alert('Campaign created successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
              <p className="mt-1 text-sm text-gray-500">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-l ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-r ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6">
            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                    placeholder="e.g., Solve Fibre-Cracking Q1 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Internal notes about this campaign..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="progressive">Progressive (Learn & Adapt)</option>
                    <option value="one-time">One-Time Send</option>
                    <option value="seasonal">Seasonal Campaign</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Progressive campaigns adapt based on customer clicks
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Product & Machine Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Codes (Tools Being Sold) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_codes}
                    onChange={(e) => setFormData({ ...formData, product_codes: e.target.value })}
                    placeholder="e.g., FFTC-100, EFTC-200 (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter product codes separated by commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Machine Type *
                  </label>
                  <select
                    required
                    value={formData.target_machine_category_id}
                    onChange={(e) => setFormData({ ...formData, target_machine_category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select machine type...</option>
                    {topLevelMachines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.display_name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the broad category of machine this campaign targets
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Knowledge Levels to Target
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.target_knowledge_levels.includes(1)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, target_knowledge_levels: [...formData.target_knowledge_levels, 1] });
                          } else {
                            setFormData({ ...formData, target_knowledge_levels: formData.target_knowledge_levels.filter(l => l !== 1) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Level 1 - No machine data (generic messaging)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.target_knowledge_levels.includes(2)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, target_knowledge_levels: [...formData.target_knowledge_levels, 2] });
                          } else {
                            setFormData({ ...formData, target_knowledge_levels: formData.target_knowledge_levels.filter(l => l !== 2) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Level 2 - Know brand (e.g., Heidelberg Stahlfolder)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.target_knowledge_levels.includes(3)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, target_knowledge_levels: [...formData.target_knowledge_levels, 3] });
                          } else {
                            setFormData({ ...formData, target_knowledge_levels: formData.target_knowledge_levels.filter(l => l !== 3) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Level 3 - Know model (e.g., Ti52)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Marketing Copy */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Use {'{'}display_name{'}'} as a placeholder for the machine name.
                    It will be automatically replaced based on what we know about each customer.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject Line Template
                  </label>
                  <input
                    type="text"
                    value={formData.subject_line_template}
                    onChange={(e) => setFormData({ ...formData, subject_line_template: e.target.value })}
                    placeholder="e.g., Solve Fibre-Cracking on Your {display_name}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landing Page Headline Template
                  </label>
                  <input
                    type="text"
                    value={formData.tagline_template}
                    onChange={(e) => setFormData({ ...formData, tagline_template: e.target.value })}
                    placeholder="e.g., Fast-Fit Tri-Creaser for {display_name}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 rounded p-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Level 1 (No data):</span>
                      <div className="font-medium mt-1">
                        {formData.tagline_template?.replace('{display_name}', 'Your Folding Machine') || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Level 2 (Brand known):</span>
                      <div className="font-medium mt-1">
                        {formData.tagline_template?.replace('{display_name}', 'Your Heidelberg Stahlfolder') || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Level 3 (Model known):</span>
                      <div className="font-medium mt-1">
                        {formData.tagline_template?.replace('{display_name}', 'Your Heidelberg Stahlfolder Ti52') || 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Navigation */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
