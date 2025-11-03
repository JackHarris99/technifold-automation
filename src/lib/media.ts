/**
 * Media Management Utility
 * Handles image/video URLs with Supabase Storage and fallback logic
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const PLACEHOLDER_IMAGE = '/placeholder.png';
const PLACEHOLDER_VIDEO = '/placeholder-video.png';

export type MediaType =
  | 'product'
  | 'solution'
  | 'problem'
  | 'solution_problem'
  | 'machine_solution_problem'
  | 'brand_logo'
  | 'brand_hero'
  | 'machine_hero';

/**
 * Get the Supabase Storage path for a given media type and identifier
 */
export function getStoragePath(type: MediaType, identifier: string, extension: string = 'jpg'): string {
  // NOTE: Files are stored in media/ subfolder within the media bucket
  // This creates paths like: media/products/MOULD-01.jpg
  // Which results in URLs: /storage/v1/object/public/media/media/products/MOULD-01.jpg
  // This is intentional to match existing folder structure
  switch (type) {
    case 'product':
      return `media/products/${identifier}.${extension}`;

    case 'solution':
      return `media/solutions/${identifier}.${extension}`;

    case 'problem':
      return `media/problems/${identifier}.${extension}`;

    case 'solution_problem':
      // identifier should be "solution_id__problem_id"
      return `media/ps/${identifier}.${extension}`;

    case 'machine_solution_problem':
      // identifier should be "machine_solution_id__problem_id"
      return `media/msp/${identifier}.${extension}`;

    case 'brand_logo':
      return `media/brands/${identifier}.png`;

    case 'brand_hero':
      return `media/machines/${identifier}.${extension}`;

    case 'machine_hero':
      return `media/machines/${identifier}.${extension}`;

    default:
      throw new Error(`Unknown media type: ${type}`);
  }
}

/**
 * Get the full public URL from a Supabase Storage path
 */
export function getPublicUrl(storagePath: string): string {
  if (!SUPABASE_URL) {
    console.warn('SUPABASE_URL not configured');
    return PLACEHOLDER_IMAGE;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
}

/**
 * Get image URL with fallback logic
 */
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  if (url) return url;
  return fallback || PLACEHOLDER_IMAGE;
}

/**
 * Get video URL with fallback logic
 */
export function getVideoUrl(url: string | null | undefined): string {
  if (url) return url;
  return PLACEHOLDER_VIDEO;
}

/**
 * Image hierarchy resolver for machine × solution × problem cards
 * Most specific wins: override → solution_problem → solution/problem → placeholder
 */
export interface ImageHierarchy {
  override_image_url?: string | null;
  solution_problem_image_url?: string | null;
  solution_image_url?: string | null;
  problem_image_url?: string | null;
}

export function resolveImageHierarchy(hierarchy: ImageHierarchy): string {
  return (
    hierarchy.override_image_url ||
    hierarchy.solution_problem_image_url ||
    hierarchy.solution_image_url ||
    hierarchy.problem_image_url ||
    PLACEHOLDER_IMAGE
  );
}

/**
 * Check if URL is a placeholder
 */
export function isPlaceholder(url: string | null | undefined): boolean {
  return !url || url === PLACEHOLDER_IMAGE || url === PLACEHOLDER_VIDEO || url.includes('placeholder');
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
}

/**
 * Validate file is an image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Validate file is a video
 */
export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validTypes.includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
