/**
 * Machine Selector Component
 * Progressive picker: family → brand → model using asset_models
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AssetModel {
  model_id: string;
  level: number;
  parent_id: string | null;
  slug: string;
  display_name: string;
  brand: string | null;
  model: string | null;
}

interface MachineSelectorProps {
  token: string;
  companyId: string;
  contactId?: string | null;
  offerKey?: string | null;
  campaignKey?: string | null;
  families: AssetModel[];  // level 1
  brands: AssetModel[];    // level 2
  models: AssetModel[];    // level 3
}

export default function MachineSelector({
  token,
  companyId,
  contactId,
  offerKey,
  campaignKey,
  families,
  brands,
  models,
}: MachineSelectorProps) {
  const router = useRouter();
  const [step, setStep] = useState<'family' | 'brand' | 'model' | 'confirm'>('family');
  const [selectedFamily, setSelectedFamily] = useState<AssetModel | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<AssetModel | null>(null);
  const [selectedModel, setSelectedModel] = useState<AssetModel | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter brands by selected family
  const availableBrands = selectedFamily
    ? brands.filter(b => b.parent_id === selectedFamily.model_id)
    : [];

  // Filter models by selected brand
  const availableModels = selectedBrand
    ? models.filter(m => m.parent_id === selectedBrand.model_id)
    : [];

  const handleFamilySelect = (family: AssetModel) => {
    setSelectedFamily(family);
    setSelectedBrand(null);
    setSelectedModel(null);
    setStep('brand');
  };

  const handleBrandSelect = (brand: AssetModel) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setStep('model');
  };

  const handleModelSelect = (model: AssetModel) => {
    setSelectedModel(model);
    setStep('confirm');
  };

  const handleSkipBrand = () => {
    // User doesn't know specific brand, submit family only
    submitSelection(selectedFamily!);
  };

  const handleSkipModel = () => {
    // User doesn't know specific model, submit brand only
    submitSelection(selectedBrand!);
  };

  const submitSelection = async (selection: AssetModel) => {
    setLoading(true);

    try {
      const response = await fetch('/api/offers/machine-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          company_id: companyId,
          contact_id: contactId,
          model_id: selection.model_id,
          brand: selection.brand || selectedBrand?.display_name,
          model: selection.model || selection.display_name,
          offer_key: offerKey,
          campaign_key: campaignKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record selection');
      }

      // Redirect to product/offer page
      router.push(`/x/${token}/products`);
    } catch (error) {
      console.error('Error submitting selection:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`w-3 h-3 rounded-full ${step === 'family' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className="w-12 h-0.5 bg-gray-300" />
        <div className={`w-3 h-3 rounded-full ${step === 'brand' ? 'bg-blue-600' : step === 'model' || step === 'confirm' ? 'bg-gray-300' : 'bg-gray-200'}`} />
        <div className="w-12 h-0.5 bg-gray-300" />
        <div className={`w-3 h-3 rounded-full ${step === 'model' || step === 'confirm' ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      {/* Step 1: Select Family */}
      {step === 'family' && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            What type of machine do you have?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {families.map((family) => (
              <button
                key={family.model_id}
                onClick={() => handleFamilySelect(family)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-900">
                  {family.display_name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Brand */}
      {step === 'brand' && (
        <div>
          <button
            onClick={() => setStep('family')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Which brand?
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Selected: <span className="font-medium">{selectedFamily?.display_name}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBrands.map((brand) => (
              <button
                key={brand.model_id}
                onClick={() => handleBrandSelect(brand)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-900">
                  {brand.display_name}
                </div>
              </button>
            ))}
          </div>

          {/* Skip option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSkipBrand}
              className="text-gray-600 hover:text-gray-900 text-sm underline"
            >
              I don't know the brand / Skip
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Model */}
      {step === 'model' && (
        <div>
          <button
            onClick={() => setStep('brand')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Which model?
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Selected: <span className="font-medium">{selectedBrand?.display_name}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModels.map((model) => (
              <button
                key={model.model_id}
                onClick={() => handleModelSelect(model)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-900">
                  {model.display_name}
                </div>
              </button>
            ))}
          </div>

          {/* Skip option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSkipModel}
              className="text-gray-600 hover:text-gray-900 text-sm underline"
            >
              I don't know the specific model / Skip
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && selectedModel && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Perfect!
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            You selected: <span className="font-medium text-gray-900">{selectedModel.display_name}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Let us show you the perfect solution for your equipment.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep('family')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Change Selection
            </button>
            <button
              onClick={() => submitSelection(selectedModel)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'See Solutions →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
