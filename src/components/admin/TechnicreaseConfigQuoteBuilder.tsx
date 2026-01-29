'use client';

import { useState } from 'react';

interface MachineConfig {
  id: string;
  machineType: 'TECHNICREASE-V1' | 'TECHNICREASE-V2';
  machineName: string;
  width: string;
  price: number;
  tools: ToolConfig[];
  imageUrl?: string;
}

interface ToolConfig {
  id: string;
  productCode: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Props {
  onConfigurationsChange: (configs: MachineConfig[]) => void;
  configurations: MachineConfig[];
}

export default function TechnicreaseConfigQuoteBuilder({ onConfigurationsChange, configurations }: Props) {
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<MachineConfig | null>(null);

  function startNewMachine() {
    setEditingConfig({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      machineType: 'TECHNICREASE-V1',
      machineName: 'TechniCrease V1',
      width: '',
      price: 0,
      tools: [],
      imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-V1.png',
    });
    setShowMachineModal(true);
  }

  function editMachine(config: MachineConfig) {
    setEditingConfig(config);
    setShowMachineModal(true);
  }

  function saveMachine(config: MachineConfig) {
    const existingIndex = configurations.findIndex(c => c.id === config.id);
    if (existingIndex >= 0) {
      const updated = [...configurations];
      updated[existingIndex] = config;
      onConfigurationsChange(updated);
    } else {
      onConfigurationsChange([...configurations, config]);
    }
    setShowMachineModal(false);
    setEditingConfig(null);
  }

  function removeMachine(id: string) {
    if (confirm('Remove this machine configuration?')) {
      onConfigurationsChange(configurations.filter(c => c.id !== id));
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={startNewMachine}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          + Add Machine Configuration
        </button>
      </div>

      {/* Display Configurations */}
      <div className="space-y-4">
        {configurations.map((config) => (
          <div key={config.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-4 mb-3">
              {config.imageUrl && (
                <img
                  src={config.imageUrl}
                  alt={config.machineName}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {config.machineName} (Width: {config.width})
                    </h3>
                    <p className="text-xl font-bold text-orange-600">£{config.price.toLocaleString('en-GB')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editMachine(config)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeMachine(config.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools for this machine */}
            {config.tools.length > 0 && (
              <div className="ml-6 mt-3 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Tools for this machine:</p>
                {config.tools.map((tool) => (
                  <div key={tool.id} className="flex items-center gap-3 text-sm bg-white p-2 rounded border border-gray-200">
                    {tool.imageUrl && (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-12 h-12 object-cover rounded border border-gray-200"
                      />
                    )}
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-gray-900">
                        └ {tool.name} <span className="text-gray-600">(x{tool.quantity})</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        £{tool.price.toLocaleString('en-GB')}
                        {tool.price === 0 && <span className="ml-2 text-green-600 text-xs">(Included)</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Machine Configuration Modal */}
      {showMachineModal && editingConfig && (
        <MachineConfigModal
          config={editingConfig}
          onSave={saveMachine}
          onCancel={() => {
            setShowMachineModal(false);
            setEditingConfig(null);
          }}
        />
      )}
    </div>
  );
}

// Machine Configuration Modal Component
function MachineConfigModal({
  config,
  onSave,
  onCancel,
}: {
  config: MachineConfig;
  onSave: (config: MachineConfig) => void;
  onCancel: () => void;
}) {
  const [localConfig, setLocalConfig] = useState<MachineConfig>(config);
  const [showAddTool, setShowAddTool] = useState(false);
  const [newTool, setNewTool] = useState<Partial<ToolConfig>>({
    productCode: 'TECHNICREASE-MICROPERF',
    name: 'TechniCrease Microperf',
    quantity: 1,
    price: 0,
  });

  const availableTools = [
    {
      code: 'TECHNICREASE-MICROPERF',
      name: 'TechniCrease Microperf',
      imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-MICROPERF.jpg',
    },
    {
      code: 'TECHNICREASE-TRICREASER',
      name: 'TechniCrease Tri-Creaser',
      imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-TRICREASER.jpg',
    },
    {
      code: 'TECHNICREASE-SCORING',
      name: 'TechniCrease Scoring Device',
      imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-SCORING.jpg',
    },
  ];

  function addTool() {
    if (!newTool.productCode || !newTool.name) return;

    const selectedTool = availableTools.find(t => t.code === newTool.productCode);
    const tool: ToolConfig = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productCode: newTool.productCode,
      name: newTool.name,
      quantity: newTool.quantity || 1,
      price: newTool.price || 0,
      imageUrl: selectedTool?.imageUrl,
    };

    setLocalConfig({
      ...localConfig,
      tools: [...localConfig.tools, tool],
    });

    setNewTool({
      productCode: 'TECHNICREASE-MICROPERF',
      name: 'TechniCrease Microperf',
      quantity: 1,
      price: 0,
    });
    setShowAddTool(false);
  }

  function removeTool(id: string) {
    setLocalConfig({
      ...localConfig,
      tools: localConfig.tools.filter(t => t.id !== id),
    });
  }

  function handleSave() {
    if (!localConfig.width || localConfig.price === 0) {
      alert('Please enter machine width and price');
      return;
    }
    onSave(localConfig);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configure Machine</h2>

          {/* Machine Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Machine Type</label>
            <select
              value={localConfig.machineType}
              onChange={(e) => {
                const isV1 = e.target.value === 'TECHNICREASE-V1';
                setLocalConfig({
                  ...localConfig,
                  machineType: e.target.value as any,
                  machineName: isV1 ? 'TechniCrease V1' : 'TechniCrease V2',
                  imageUrl: isV1
                    ? 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-V1.png'
                    : 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/TECHNICREASE-V2.webp',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="TECHNICREASE-V1">TechniCrease V1 - Webfed finishing system</option>
              <option value="TECHNICREASE-V2">TechniCrease V2 - Enhanced Webfed finishing system</option>
            </select>
          </div>

          {/* Width */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Machine Width</label>
            <input
              type="text"
              value={localConfig.width}
              onChange={(e) => setLocalConfig({ ...localConfig, width: e.target.value })}
              placeholder="e.g. 500mm, 20 inches"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Machine Price (£)</label>
            <input
              type="number"
              step="0.01"
              value={localConfig.price}
              onChange={(e) => setLocalConfig({ ...localConfig, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Tools Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Tools for this Machine</h3>
              <button
                onClick={() => setShowAddTool(!showAddTool)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {showAddTool ? 'Cancel' : '+ Add Tool'}
              </button>
            </div>

            {/* Add Tool Form */}
            {showAddTool && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tool</label>
                  <select
                    value={newTool.productCode}
                    onChange={(e) => {
                      const selected = availableTools.find(t => t.code === e.target.value);
                      setNewTool({
                        ...newTool,
                        productCode: e.target.value,
                        name: selected?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {availableTools.map((tool) => (
                      <option key={tool.code} value={tool.code}>{tool.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newTool.quantity}
                      onChange={(e) => setNewTool({ ...newTool, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTool.price}
                      onChange={(e) => setNewTool({ ...newTool, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0.00 for included"
                    />
                  </div>
                </div>
                <button
                  onClick={addTool}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                >
                  Add Tool to Configuration
                </button>
              </div>
            )}

            {/* Tool List */}
            <div className="space-y-2">
              {localConfig.tools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">{tool.name}</div>
                    <div className="text-sm text-gray-600">Quantity: {tool.quantity} • £{tool.price.toLocaleString('en-GB')}</div>
                  </div>
                  <button
                    onClick={() => removeTool(tool.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {localConfig.tools.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No tools added yet</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
            >
              Save Configuration
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
