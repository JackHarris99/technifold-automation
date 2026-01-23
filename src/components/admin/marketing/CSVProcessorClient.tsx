/**
 * CSV Processor Client Component
 * Upload, review, and import prospect CSVs
 */

'use client';

import { useState } from 'react';

interface CSVProcessorClientProps {
  jobs: any[];
}

export default function CSVProcessorClient({ jobs: initialJobs }: CSVProcessorClientProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const handleUpload = async () => {
    if (!file || !source) {
      alert('Please select a file and enter a source name');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source);

      const response = await fetch('/api/admin/marketing/process-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Refresh page to show new job
      window.location.reload();

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    if (!confirm('Import this CSV? This will add all valid prospects to the database.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/marketing/approve-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      alert(`Successfully imported ${data.imported_count} prospects`);
      window.location.reload();

    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      uploaded: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      ready_for_review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-purple-100 text-purple-700',
      imported: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Upload CSV</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-[14px] text-[#0a0a0a] border border-[#e8e8e8] rounded-lg cursor-pointer"
            />
            <p className="text-[12px] text-[#64748b] mt-1">
              Expected columns: company_name, email, first_name, last_name, phone, website, country, industry
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Source Label
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., trade_show_jan_2025, purchased_list_webfed"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[14px]"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !source}
            className={`px-6 py-2 rounded-lg font-[600] text-[14px] ${
              uploading || !file || !source
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
      </div>

      {/* Processing Jobs */}
      <div className="bg-white rounded-xl border border-[#e8e8e8]">
        <div className="border-b border-[#e8e8e8] p-6">
          <h2 className="text-[18px] font-[700] text-[#0a0a0a]">Processing Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
              <tr>
                <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">File</th>
                <th className="text-center py-3 px-4 text-[12px] font-[600] text-[#64748b]">Status</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Total Rows</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Valid</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Duplicates</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Invalid</th>
                <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Uploaded</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748b]">
                    No CSVs uploaded yet
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.job_id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                    <td className="py-3 px-4">
                      <div className="font-[600] text-[13px] text-[#0a0a0a]">{job.filename}</div>
                      <div className="text-[12px] text-[#64748b] mt-1">{job.source}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${getStatusColor(job.status)}`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                      {job.total_rows}
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-green-600 font-[600]">
                      {job.valid_rows}
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-orange-600">
                      {job.duplicate_emails + job.existing_customers + job.existing_prospects}
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-red-600">
                      {job.invalid_emails}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[#64748b]">
                      {new Date(job.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {job.status === 'ready_for_review' && (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="text-blue-600 hover:text-blue-700 font-[600] text-[13px]"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleApprove(job.job_id)}
                            className="px-3 py-1 bg-green-600 text-white rounded font-[600] text-[12px] hover:bg-green-700"
                          >
                            Import
                          </button>
                        </div>
                      )}
                      {job.status === 'imported' && (
                        <span className="text-[12px] text-[#64748b]">
                          Imported {job.imported_count}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b border-[#e8e8e8] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-[700] text-[#0a0a0a]">
                  Review: {selectedJob.filename}
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-[#64748b] hover:text-[#0a0a0a]"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#f8fafc] rounded-lg p-4">
                    <div className="text-[12px] text-[#64748b] mb-1">Total Rows</div>
                    <div className="text-[20px] font-[700] text-[#0a0a0a]">{selectedJob.total_rows}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-[12px] text-green-700 mb-1">Valid</div>
                    <div className="text-[20px] font-[700] text-green-700">{selectedJob.valid_rows}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-[12px] text-orange-700 mb-1">Duplicates</div>
                    <div className="text-[20px] font-[700] text-orange-700">
                      {selectedJob.duplicate_emails + selectedJob.existing_customers + selectedJob.existing_prospects}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-[12px] text-red-700 mb-1">Invalid</div>
                    <div className="text-[20px] font-[700] text-red-700">{selectedJob.invalid_emails}</div>
                  </div>
                </div>

                {selectedJob.issues && selectedJob.issues.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-[600] text-[#0a0a0a] mb-2">Issues Found</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedJob.issues.map((issue: any, idx: number) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-[13px]">
                          <div className="font-[600] text-yellow-800">{issue.type}</div>
                          <div className="text-yellow-700 mt-1">{issue.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[14px] font-[600] text-[#0a0a0a] mb-2">
                    Sample Data (First 10 Valid Records)
                  </h3>
                  <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead className="bg-[#f8fafc]">
                        <tr>
                          <th className="text-left py-2 px-3 text-[11px] font-[600] text-[#64748b]">Company</th>
                          <th className="text-left py-2 px-3 text-[11px] font-[600] text-[#64748b]">Email</th>
                          <th className="text-left py-2 px-3 text-[11px] font-[600] text-[#64748b]">Name</th>
                          <th className="text-left py-2 px-3 text-[11px] font-[600] text-[#64748b]">Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJob.cleaned_data.slice(0, 10).map((row: any, idx: number) => (
                          <tr key={idx} className="border-t border-[#f1f5f9]">
                            <td className="py-2 px-3">{row.company_name}</td>
                            <td className="py-2 px-3">{row.email}</td>
                            <td className="py-2 px-3">{row.first_name} {row.last_name}</td>
                            <td className="py-2 px-3">{row.country}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-[#e8e8e8] p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-[#e8e8e8] rounded-lg font-[600] text-[14px] hover:bg-[#f8fafc]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedJob.job_id);
                  setSelectedJob(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-[600] text-[14px] hover:bg-green-700"
              >
                Import {selectedJob.valid_rows} Prospects
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
