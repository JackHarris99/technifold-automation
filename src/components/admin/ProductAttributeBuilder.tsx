'use client';

import { useState, useEffect } from 'react';

// Preset attribute definitions
export const PRESET_ATTRIBUTES = [
  // Measurements & Specifications
  { key: 'tpi', label: 'TPI (Teeth Per Inch)', type: 'select', options: ['12', '17', '24', '28', '32'] },
  { key: 'gsm_range', label: 'GSM Range', type: 'text', placeholder: 'e.g. 200-400' },
  { key: 'material', label: 'Material', type: 'select', options: ['Steel', 'High Carbon Steel', 'Stainless Steel', 'Natural Rubber', 'Synthetic Rubber', 'Plastic', 'Aluminum', 'Brass'] },
  { key: 'colour', label: 'Colour', type: 'select', options: ['Black', 'Silver', 'Grey', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown'] },
  { key: 'shore_hardness', label: 'Shore Hardness', type: 'text', placeholder: 'e.g. 70A' },

  // Dimensions
  { key: 'thickness_mm', label: 'Thickness (mm)', type: 'number', placeholder: 'e.g. 2.5' },
  { key: 'diameter_mm', label: 'Diameter (mm)', type: 'number', placeholder: 'e.g. 50' },
  { key: 'length_mm', label: 'Length (mm)', type: 'number', placeholder: 'e.g. 1000' },

  // Electrical
  { key: 'voltage', label: 'Voltage', type: 'select', options: ['110V', '240V', '110V/240V'] },
  { key: 'power_watts', label: 'Power (Watts)', type: 'number', placeholder: 'e.g. 1500' },
  { key: 'frequency_hz', label: 'Frequency (Hz)', type: 'select', options: ['50Hz', '60Hz', '50/60Hz'] },

  // Performance
  { key: 'temperature_range', label: 'Temperature Range', type: 'text', placeholder: 'e.g. -10°C to 80°C' },
  { key: 'speed_rpm', label: 'Speed (RPM)', type: 'number', placeholder: 'e.g. 3000' },
  { key: 'capacity', label: 'Capacity', type: 'text', placeholder: 'e.g. 500 sheets' },

  // Material Properties
  { key: 'adhesive_type', label: 'Adhesive Type', type: 'select', options: ['Permanent', 'Removable', 'Semi-Permanent', 'Heat Activated', 'Pressure Sensitive'] },
  { key: 'finish', label: 'Finish', type: 'select', options: ['Gloss', 'Matte', 'Satin', 'Textured', 'Smooth'] },
  { key: 'coating', label: 'Coating', type: 'select', options: ['None', 'PTFE', 'Chrome', 'Zinc', 'Nickel', 'Powder Coated'] },

  // Compatibility
  { key: 'compatible_machines', label: 'Compatible Machines', type: 'text', placeholder: 'e.g. TF50, TF100' },
  { key: 'paper_types', label: 'Paper Types', type: 'text', placeholder: 'e.g. Coated, Uncoated, Board' },
  { key: 'max_paper_weight', label: 'Max Paper Weight (GSM)', type: 'number', placeholder: 'e.g. 400' },
] as const;

export type AttributeKey = typeof PRESET_ATTRIBUTES[number]['key'];
export type AttributeValue = string | number;

interface ProductAttributeBuilderProps {
  value: Record<string, AttributeValue>;
  onChange: (attributes: Record<string, AttributeValue>) => void;
  showCustom?: boolean;
}

export default function ProductAttributeBuilder({ value, onChange, showCustom = true }: ProductAttributeBuilderProps) {
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>(value || {});
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    setAttributes(value || {});
  }, [value]);

  const handleAttributeChange = (key: string, val: string) => {
    const newAttributes = { ...attributes };

    if (val === '' || val === null || val === undefined) {
      // Remove attribute if empty
      delete newAttributes[key];
    } else {
      newAttributes[key] = val;
    }

    setAttributes(newAttributes);
    onChange(newAttributes);
  };

  const handleAddCustom = () => {
    if (!customKey.trim() || !customValue.trim()) return;

    const key = customKey.toLowerCase().replace(/\s+/g, '_');
    const newAttributes = { ...attributes, [key]: customValue };

    setAttributes(newAttributes);
    onChange(newAttributes);

    setCustomKey('');
    setCustomValue('');
    setShowCustomInput(false);
  };

  const handleRemoveCustom = (key: string) => {
    const newAttributes = { ...attributes };
    delete newAttributes[key];
    setAttributes(newAttributes);
    onChange(newAttributes);
  };

  // Get custom attributes (not in preset list)
  const presetKeys = PRESET_ATTRIBUTES.map(a => a.key);
  const customAttributes = Object.entries(attributes).filter(([key]) => !presetKeys.includes(key as any));

  // Count filled attributes
  const filledCount = Object.keys(attributes).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Fill in relevant attributes for this product. Leave blank if not applicable.
          </p>
        </div>
        <div className="text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {filledCount} attribute{filledCount !== 1 ? 's' : ''} set
          </span>
        </div>
      </div>

      {/* Preset Attributes Grid */}
      <div className="grid grid-cols-2 gap-4">
        {PRESET_ATTRIBUTES.map((attr) => (
          <div key={attr.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attr.label}
            </label>

            {attr.type === 'select' ? (
              <select
                value={attributes[attr.key] || ''}
                onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Not applicable</option>
                {attr.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={attr.type}
                value={attributes[attr.key] || ''}
                onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                placeholder={attr.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      {/* Custom Attributes Section */}
      {showCustom && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Custom Attributes</h4>
            {!showCustomInput && (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Custom
              </button>
            )}
          </div>

          {/* Custom attributes list */}
          {customAttributes.length > 0 && (
            <div className="space-y-2 mb-4">
              {customAttributes.map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="font-medium text-sm text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm text-gray-900">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustom(key)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom input */}
          {showCustomInput && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attribute Name
                  </label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. Max Speed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="e.g. 5000 RPM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customKey.trim() || !customValue.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Add Attribute
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomKey('');
                    setCustomValue('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
