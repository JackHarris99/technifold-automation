/**
 * Prospects List Client Component
 * Filterable table of prospects
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Prospect {
  company_id: string;
  company_name: string;
  country: string | null;
  source: string | null;
  lead_score: number;
  lead_temperature: string;
  created_at: string;
  updated_at: string;
}

interface ProspectsListClientProps {
  prospects: Prospect[];
}

export default function ProspectsListClient({ prospects: initialProspects }: ProspectsListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Get unique sources
  const sources = useMemo(() => {
    const uniqueSources = new Set(initialProspects.map(p => p.source));
    return Array.from(uniqueSources).sort();
  }, [initialProspects]);

  // Filter prospects
  const prospects = useMemo(() => {
    return initialProspects.filter(prospect => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          prospect.company_name.toLowerCase().includes(search) ||
          prospect.country?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && prospect.lead_temperature !== statusFilter) {
        return false;
      }

      // Source filter
      if (sourceFilter !== 'all' && prospect.source !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [initialProspects, searchTerm, statusFilter, sourceFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      cold: 'bg-gray-100 text-gray-700',
      warm: 'bg-yellow-100 text-yellow-700',
      hot: 'bg-orange-100 text-orange-700',
      qualified: 'bg-purple-100 text-purple-700',
      converted: 'bg-green-100 text-green-700',
      dead: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'text-green-600 font-[700]';
    if (score >= 50) return 'text-orange-600 font-[600]';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8e8e8]">
      {/* Filters */}
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search prospects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Temperatures</option>
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="hot">Hot</option>
            <option value="qualified">Qualified</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="text-[12px] text-[#64748b] mt-3">
          Showing {prospects.length} of {initialProspects.length} prospects
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
            <tr>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Company</th>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Country</th>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Source</th>
              <th className="text-center py-3 px-4 text-[12px] font-[600] text-[#64748b]">Temperature</th>
              <th className="text-center py-3 px-4 text-[12px] font-[600] text-[#64748b]">Score</th>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Last Updated</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#64748b]">
                  No prospects found
                </td>
              </tr>
            ) : (
              prospects.map((prospect) => (
                <tr key={prospect.company_id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 text-[13px] font-[500] text-[#0a0a0a]">
                    {prospect.company_name}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-[#64748b]">
                    {prospect.country || '—'}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-[#64748b]">
                    {prospect.source || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${getStatusColor(prospect.lead_temperature)}`}>
                      {prospect.lead_temperature}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[13px] ${getScoreColor(prospect.lead_score)}`}>
                      {prospect.lead_score}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-[#64748b]">
                    {new Date(prospect.updated_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/marketing/prospects/${prospect.company_id}`}
                      className="text-blue-600 hover:text-blue-700 font-[500] text-[13px]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
