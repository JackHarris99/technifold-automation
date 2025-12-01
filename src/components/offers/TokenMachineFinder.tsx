/**
 * Token Machine Finder - Client component for /x/[token]
 * Captures machine ownership when user selects their machine
 */

'use client';

import { useState } from 'react';
import MachineFinder from '@/components/marketing/MachineFinder';

interface TokenMachineFinderProps {
  token: string;
  companyId: string;
  contactId?: string | null;
  offerKey?: string | null;
  campaignKey?: string | null;
}

export default function TokenMachineFinder({
  token,
  companyId,
  contactId,
  offerKey,
  campaignKey
}: TokenMachineFinderProps) {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  const handleMachineSelect = async (machineSlug: string) => {
    setCapturing(true);
    setError('');

    try {
      // Get the full machine data to find machine_id from slug
      const machinesResponse = await fetch('/api/machines/brands');
      // We need to fetch by slug, so let's redirect to machine page and capture there
      // OR we can create an API to capture the machine

      // For now, let's create the API call
      const response = await fetch('/api/machines/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_id: contactId,
          machine_slug: machineSlug,
          source: 'self_report',
          offer_key: offerKey,
          campaign_key: campaignKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to capture machine');
      }

      // Reload page to show solutions
      window.location.reload();
    } catch (err) {
      console.error('Machine capture error:', err);
      setError('Failed to save your machine selection. Please try again.');
      setCapturing(false);
    }
  };

  return (
    <div>
      <MachineFinder onMachineSelect={handleMachineSelect} />

      {capturing && (
        <div className="mt-4 text-center">
          <p className="text-blue-600">Saving your machine selection...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
