/**
 * MediaUpload Component
 * Reusable file upload component for admin panels
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MediaType, formatFileSize, isValidImageFile, isValidVideoFile } from '@/lib/media';
import MediaImage from '@/components/shared/MediaImage';

interface MediaUploadProps {
  mediaType: MediaType;
  identifier: string;
  table: string;
  column: string;
  recordId: string;
  idColumn?: string;
  currentUrl?: string | null;
  label?: string;
  type?: 'image' | 'video';
  onUploadSuccess?: (url: string) => void;
  compact?: boolean;
  // Composite key support
  solution_id?: string;
  problem_id?: string;
  machine_solution_id?: string;
}

export default function MediaUpload({
  mediaType,
  identifier,
  table,
  column,
  recordId,
  idColumn = 'id',
  currentUrl,
  label,
  type = 'image',
  onUploadSuccess,
  compact = false,
  solution_id,
  problem_id,
  machine_solution_id,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentUrl when it changes (e.g., after parent refetch)
  // Always add cache-busting to prevent browser from showing cached images
  useEffect(() => {
    if (currentUrl) {
      setPreview(currentUrl + '?t=' + Date.now());
    } else {
      setPreview(null);
    }
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const isValid = type === 'image' ? isValidImageFile(file) : isValidVideoFile(file);
    if (!isValid) {
      setError(`Invalid ${type} file type`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File too large (max 10MB, current: ${formatFileSize(file.size)})`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);
      formData.append('identifier', identifier);
      formData.append('table', table);
      formData.append('column', column);
      formData.append('recordId', recordId);
      formData.append('idColumn', idColumn);

      // Add composite key fields if provided
      if (solution_id) formData.append('solution_id', solution_id);
      if (problem_id) formData.append('problem_id', problem_id);
      if (machine_solution_id) formData.append('machine_solution_id', machine_solution_id);

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Add cache-busting timestamp to force browser to reload new image
      const cacheBustedUrl = data.url + '?t=' + Date.now();
      setPreview(cacheBustedUrl);
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    setUploading(true);
    setError(null);

    try {
      const storagePath = currentUrl?.split('/storage/v1/object/public/')[1];
      if (!storagePath) throw new Error('Invalid storage path');

      const response = await fetch(
        `/api/admin/media/upload?path=${encodeURIComponent(storagePath)}&table=${table}&column=${column}&recordId=${recordId}&idColumn=${idColumn}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess('');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Delete failed');
    } finally {
      setUploading(false);
    }
  };

  if (compact) {
    return (
      <div className="relative group">
        <div className="w-16 h-16 border border-gray-300 rounded overflow-hidden bg-gray-50">
          {type === 'image' && <MediaImage src={preview} alt={label || 'Media'} fill />}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
        >
          {uploading ? 'Uploading...' : preview ? 'Change' : 'Upload'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && <div className="absolute -bottom-6 left-0 text-xs text-red-600">{error}</div>}
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div className="space-y-4">
        {/* Preview */}
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          {type === 'image' && <MediaImage src={preview} alt={label || 'Preview'} fill />}
          {type === 'video' && preview && (
            <video src={preview} controls className="w-full h-full object-contain" />
          )}
        </div>

        {/* Upload button */}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {uploading ? 'Uploading...' : preview ? `Change ${type}` : `Upload ${type}`}
          </button>

          {preview && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        {/* File info */}
        {preview && (
          <div className="text-xs text-gray-700">
            {preview.startsWith('data:') ? 'Uploading...' : 'Uploaded successfully'}
          </div>
        )}
      </div>
    </div>
  );
}
