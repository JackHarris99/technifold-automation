'use client';

import { useState, useEffect } from 'react';

interface Match {
  company_id: string;
  company_name: string;
  current_stripe_customer_id: string | null;
  stripe_customer_id: string;
  stripe_customer_name: string;
  stripe_customer_email: string;
  match_type: 'exact_email' | 'exact_name' | 'partial_name' | 'already_linked';
  confidence: 'high' | 'medium' | 'low';
}

interface MatchData {
  success: boolean;
  total_companies: number;
  total_stripe_customers: number;
  matched: number;
  unmatched: number;
  matches: Match[];
  unmatched_companies: any[];
  summary: {
    already_linked: number;
    exact_email: number;
    exact_name: number;
    partial_name: number;
  };
}

export default function LinkStripeClient() {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/companies/match-stripe-customers');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch matches');
        setLoading(false);
        return;
      }

      setMatchData(data);

      // Auto-select high confidence matches (exact_email and already_linked)
      const autoSelect = new Set<string>();
      data.matches.forEach((match: Match) => {
        if (match.confidence === 'high' && match.match_type !== 'already_linked') {
          autoSelect.add(match.company_id);
        }
      });
      setSelectedMatches(autoSelect);

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError('An error occurred while fetching matches');
      setLoading(false);
    }
  };

  const toggleMatch = (companyId: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedMatches(newSelected);
  };

  const selectAll = () => {
    if (!matchData) return;
    const allIds = new Set(
      matchData.matches
        .filter(m => m.match_type !== 'already_linked')
        .map(m => m.company_id)
    );
    setSelectedMatches(allIds);
  };

  const deselectAll = () => {
    setSelectedMatches(new Set());
  };

  const handleLink = async () => {
    if (!matchData || selectedMatches.size === 0) return;

    if (!confirm(`Link ${selectedMatches.size} companies to Stripe customers?`)) {
      return;
    }

    setLinking(true);

    try {
      const links = matchData.matches
        .filter(m => selectedMatches.has(m.company_id))
        .map(m => ({
          company_id: m.company_id,
          stripe_customer_id: m.stripe_customer_id,
        }));

      const response = await fetch('/api/admin/companies/link-stripe-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to link companies: ${data.error}`);
        setLinking(false);
        return;
      }

      alert(`Successfully linked ${data.updated} companies. ${data.errors} errors.`);

      // Refresh matches
      await fetchMatches();
      setSelectedMatches(new Set());
      setLinking(false);
    } catch (err: any) {
      console.error('Error linking companies:', err);
      alert('An error occurred while linking companies');
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-600">Loading matches from Stripe...</div>
        <div className="text-sm text-gray-500 mt-2">This may take a moment</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!matchData) {
    return null;
  }

  const newMatches = matchData.matches.filter(m => m.match_type !== 'already_linked');
  const alreadyLinked = matchData.matches.filter(m => m.match_type === 'already_linked');

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-lg p-5">
          <div className="text-sm text-gray-800 mb-1">Total Companies</div>
          <div className="text-2xl font-bold text-gray-900">{matchData.total_companies}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-lg p-5">
          <div className="text-sm text-gray-800 mb-1">Already Linked</div>
          <div className="text-2xl font-bold text-gray-900">{matchData.summary.already_linked}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded-lg p-5">
          <div className="text-sm text-gray-800 mb-1">New Matches</div>
          <div className="text-2xl font-bold text-gray-900">{newMatches.length}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-red-500 rounded-lg p-5">
          <div className="text-sm text-gray-800 mb-1">Unmatched</div>
          <div className="text-2xl font-bold text-gray-900">{matchData.unmatched}</div>
        </div>
      </div>

      {/* Match Quality Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Match Quality Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
          <div>
            <span className="font-medium">Email Match:</span> {matchData.summary.exact_email} (High confidence)
          </div>
          <div>
            <span className="font-medium">Name Match:</span> {matchData.summary.exact_name} (Medium confidence)
          </div>
          <div>
            <span className="font-medium">Partial Match:</span> {matchData.summary.partial_name} (Low confidence)
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          High confidence matches are auto-selected. Review all matches before confirming.
        </p>
      </div>

      {/* Controls */}
      {newMatches.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Select All ({newMatches.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Deselect All
            </button>
            <span className="text-sm text-gray-600">
              {selectedMatches.size} selected
            </span>
          </div>
          <button
            onClick={handleLink}
            disabled={linking || selectedMatches.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {linking ? 'Linking...' : `Link ${selectedMatches.size} Companies`}
          </button>
        </div>
      )}

      {/* New Matches Table */}
      {newMatches.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">New Matches to Review</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12"></th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stripe Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Match Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {newMatches.map((match) => (
                  <tr key={match.company_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedMatches.has(match.company_id)}
                        onChange={() => toggleMatch(match.company_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {match.company_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {match.stripe_customer_name || '(No name)'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {match.stripe_customer_email || '(No email)'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        match.match_type === 'exact_email' ? 'bg-green-100 text-green-700' :
                        match.match_type === 'exact_name' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {match.match_type === 'exact_email' ? 'Email' :
                         match.match_type === 'exact_name' ? 'Name' :
                         'Partial'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        match.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        match.confidence === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">All companies are already linked to Stripe customers.</p>
        </div>
      )}

      {/* Already Linked (collapsed by default) */}
      {alreadyLinked.length > 0 && (
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <summary className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer font-semibold text-gray-900 text-sm">
            Already Linked Companies ({alreadyLinked.length})
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stripe Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alreadyLinked.map((match) => (
                  <tr key={match.company_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{match.company_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{match.stripe_customer_name || '(No name)'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{match.stripe_customer_email || '(No email)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* Unmatched Companies */}
      {matchData.unmatched_companies.length > 0 && (
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
          <summary className="px-4 py-3 bg-red-50 border-b border-red-200 cursor-pointer font-semibold text-red-900 text-sm">
            Unmatched Companies ({matchData.unmatched_companies.length}) - Manual Action Required
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matchData.unmatched_companies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{company.company_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{company.contact_email || '(No email)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-700">
              These companies don't have a matching Stripe customer. You may need to manually add the stripe_customer_id in the companies table, or create a new Stripe customer for them.
            </p>
          </div>
        </details>
      )}
    </>
  );
}
