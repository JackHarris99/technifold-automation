/**
 * Prospect Import Client Component
 * CSV upload with deduplication and validation
 */

'use client';

import { useState } from 'react';

export default function ProspectImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [source, setSource] = useState('');
  const [sourceDetails, setSourceDetails] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!source) {
      alert('Please enter a source (e.g., "trade_show_2024")');
      return;
    }

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source);
      formData.append('source_details', sourceDetails);

      const response = await fetch('/api/admin/marketing/prospects/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResults(data);
      setFile(null);
      setSource('');
      setSourceDetails('');
    } catch (error: any) {
      alert(error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-[14px] font-[600] text-blue-900 mb-2">CSV Format</h3>
        <p className="text-[13px] text-blue-800 mb-3">
          Your CSV should have these columns (case-insensitive):
        </p>
        <ul className="text-[13px] text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>company_name</strong> (required)</li>
          <li><strong>email</strong> (required - contact email)</li>
          <li>first_name, last_name (optional)</li>
          <li>phone, role, seniority (optional)</li>
          <li>website, industry, country (optional)</li>
        </ul>
        <p className="text-[13px] text-blue-800 mt-3">
          The system will automatically check for duplicates against existing companies and contacts.
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
        <div className="space-y-4">
          {/* Source */}
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., trade_show_2024, magazine_ad_Q1, purchased_list_UK"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[12px] text-[#64748b] mt-1">
              Use underscores, no spaces. This helps track campaign performance.
            </p>
          </div>

          {/* Source Details (Optional) */}
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Source Details (Optional)
            </label>
            <textarea
              value={sourceDetails}
              onChange={(e) => setSourceDetails(e.target.value)}
              placeholder="Additional notes about this import batch..."
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              CSV File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-[13px]"
            />
            {file && (
              <p className="text-[12px] text-[#64748b] mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing || !file || !source}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-[600] text-[14px] hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Prospects'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-[16px] font-[600] text-green-900 mb-4">Import Complete!</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-[24px] font-[700] text-green-600">{results.imported}</div>
              <div className="text-[12px] text-[#64748b]">Imported</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="text-[24px] font-[700] text-yellow-600">{results.duplicates}</div>
              <div className="text-[12px] text-[#64748b]">Duplicates Skipped</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="text-[24px] font-[700] text-red-600">{results.errors}</div>
              <div className="text-[12px] text-[#64748b]">Errors</div>
            </div>
          </div>

          {results.error_details && results.error_details.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[13px] font-[600] text-[#0a0a0a] mb-2">Errors:</h4>
              <ul className="text-[12px] text-[#64748b] space-y-1">
                {results.error_details.slice(0, 10).map((error: string, i: number) => (
                  <li key={i}>• {error}</li>
                ))}
                {results.error_details.length > 10 && (
                  <li className="text-[#94a3b8]">... and {results.error_details.length - 10} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
