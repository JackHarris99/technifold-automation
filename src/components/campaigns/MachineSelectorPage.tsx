/**
 * Machine Selector Page
 * Multi-step machine selection with progressive learning
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MachineSelectorPageProps {
  token: string;
  campaign: any;
  company: any;
  contact: any;
  currentKnowledge: any;
  knowledgeLevel: number;
  machineTaxonomy: any[];
  parentMachineId: string;
}

export default function MachineSelectorPage({
  token,
  campaign,
  company,
  contact,
  currentKnowledge,
  knowledgeLevel,
  machineTaxonomy,
  parentMachineId,
}: MachineSelectorPageProps) {
  const router = useRouter();
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select-brand' | 'select-model' | 'confirm'>('select-brand');

  // Get machines to show based on current knowledge level
  const getMachinesToShow = () => {
    if (knowledgeLevel === 1) {
      // Show all level 1 machines under the campaign's target category
      return machineTaxonomy.filter(
        m => m.parent_id === parentMachineId || (parentMachineId && m.id === parentMachineId)
      );
    } else if (knowledgeLevel === 2) {
      // Show level 2 machines (brands) under the target
      return machineTaxonomy.filter(
        m => m.parent_id === parentMachineId && m.level === 2
      );
    } else {
      // Show level 3+ machines (models) under the known brand
      return machineTaxonomy.filter(
        m => m.parent_id === parentMachineId && m.level >= 3
      );
    }
  };

  const machinesToShow = getMachinesToShow();
  const selectedMachineData = machineTaxonomy.find(m => m.id === selectedMachine);

  const handleMachineSelection = async (machineId: string) => {
    setSelectedMachine(machineId);

    // Check if this machine has children (more specific options)
    const hasChildren = machineTaxonomy.some(m => m.parent_id === machineId);

    if (hasChildren && knowledgeLevel < 3) {
      // User can go deeper - show them the option
      setStep('select-model');
    } else {
      // This is as specific as we can get, or user doesn't want to go deeper
      setStep('confirm');
    }
  };

  const handleSkipToConfirm = () => {
    // User doesn't know the specific model
    setStep('confirm');
  };

  const handleSubmitSelection = async () => {
    if (!selectedMachine) return;

    setLoading(true);

    try {
      const response = await fetch('/api/campaigns/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          interaction_type: 'machine_selection',
          machine_taxonomy_id: selectedMachine,
          clicked_option: selectedMachineData?.display_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track interaction');
      }

      // Redirect to product page or thank you page
      router.push(`/c/${token}/products`);
    } catch (error) {
      console.error('Error submitting selection:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate personalized headline
  const getHeadline = () => {
    if (campaign.tagline_template && currentKnowledge && currentKnowledge.machine_taxonomy) {
      return campaign.tagline_template.replace(
        '{display_name}',
        (currentKnowledge.machine_taxonomy as any).display_name
      );
    } else if (campaign.tagline_template) {
      return campaign.tagline_template.replace(
        '{display_name}',
        machineTaxonomy.find(m => m.id === parentMachineId)?.display_name || 'Your Machine'
      );
    }
    return campaign.campaign_name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Technifold</h1>
              <p className="text-xs text-gray-500">Print Finishing Solutions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getHeadline()}
          </h2>
          {contact && (
            <p className="text-lg text-gray-600">
              Hi {contact.first_name || 'there'}, thanks for your interest!
            </p>
          )}
        </div>

        {/* Step: Select Brand */}
        {step === 'select-brand' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Which machine do you have?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machinesToShow.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => handleMachineSelection(machine.id)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="font-medium text-gray-900">{machine.display_name}</div>
                  {machine.short_description && (
                    <div className="text-sm text-gray-500 mt-1">{machine.short_description}</div>
                  )}
                </button>
              ))}
            </div>

            {/* "Not Sure" Option */}
            <div className="mt-6 text-center">
              <button
                onClick={() => handleSkipToConfirm()}
                className="text-gray-600 hover:text-gray-900 text-sm underline"
              >
                I'm not sure / Other machine
              </button>
            </div>
          </div>
        )}

        {/* Step: Select Model */}
        {step === 'select-model' && selectedMachine && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <button
                onClick={() => setStep('select-brand')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Which model?
            </h3>
            <p className="text-gray-600 mb-6">
              Selected: <span className="font-medium">{selectedMachineData?.display_name}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machineTaxonomy
                .filter(m => m.parent_id === selectedMachine)
                .map((machine) => (
                  <button
                    key={machine.id}
                    onClick={() => {
                      setSelectedMachine(machine.id);
                      setStep('confirm');
                    }}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="font-medium text-gray-900">{machine.display_name}</div>
                  </button>
                ))}
            </div>

            {/* "Don't Know Model" Option */}
            <div className="mt-6 text-center">
              <button
                onClick={() => handleSkipToConfirm()}
                className="text-gray-600 hover:text-gray-900 text-sm underline"
              >
                I don't know the specific model
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm Selection */}
        {step === 'confirm' && selectedMachine && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Perfect!
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                You selected: <span className="font-medium text-gray-900">{selectedMachineData?.display_name}</span>
              </p>
              <p className="text-gray-600">
                Let us show you the perfect solution for your equipment.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('select-brand')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Change Selection
              </button>
              <button
                onClick={handleSubmitSelection}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'See Solutions →'}
              </button>
            </div>
          </div>
        )}

        {/* No Machines Available */}
        {machinesToShow.length === 0 && step === 'select-brand' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              We're still building our machine database. Please contact us directly.
            </p>
            <a
              href="mailto:sales@technifold.com"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Contact Sales
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
