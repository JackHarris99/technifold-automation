'use client';

import { useState } from 'react';

interface CompanyStatusControlProps {
  companyId: string;
  companyName: string;
  currentStatus: string;
  accountOwner: string;
  currentUserSalesRepId: string;
}

export default function CompanyStatusControl({
  companyId,
  companyName,
  currentStatus,
  accountOwner,
  currentUserSalesRepId,
}: CompanyStatusControlProps) {
  const [status, setStatus] = useState(currentStatus || 'active');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isOwner = accountOwner === currentUserSalesRepId;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    if (!isOwner) {
      alert('Only the account owner can change the company status');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(newStatus);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      console.log('[CompanyStatus] Updated:', data);
    } catch (err: any) {
      console.error('[CompanyStatus] Error:', err);
      setError(err.message);
      // Revert on error
      setStatus(status);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'dead':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'active':
        return '✓';
      case 'inactive':
        return '⏸';
      case 'dead':
        return '✕';
      default:
        return '';
    }
  };

  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="text-sm text-gray-600 font-medium">Status:</div>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating || !isOwner}
        className={`px-3 py-1.5 rounded-lg border-2 font-medium text-sm transition-colors ${getStatusColor(status)} ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${!isOwner ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}`}
      >
        <option value="active">{getStatusIcon('active')} Active</option>
        <option value="inactive">{getStatusIcon('inactive')} Inactive</option>
        <option value="dead">{getStatusIcon('dead')} Dead</option>
      </select>

      {isUpdating && <span className="text-sm text-gray-700">Updating...</span>}

      {success && (
        <span className="text-sm text-green-600 font-medium animate-pulse">
          Status updated!
        </span>
      )}

      {error && (
        <span className="text-sm text-red-600">
          Error: {error}
        </span>
      )}

      {!isOwner && (
        <span className="text-xs text-gray-700 italic">
          (Only {accountOwner} can change status)
        </span>
      )}
    </div>
  );
}
