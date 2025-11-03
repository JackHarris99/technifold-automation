/**
 * MediaImage Component
 * Smart image component with automatic placeholder fallback
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getImageUrl, isPlaceholder } from '@/lib/media';

interface MediaImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onClick?: () => void;
}

export default function MediaImage({
  src,
  alt,
  fallback,
  className = '',
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  onClick,
}: MediaImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Resolve the image URL with fallback logic
  const imageUrl = error ? (fallback || '/placeholder.svg') : getImageUrl(src, fallback);
  const isUsingPlaceholder = isPlaceholder(imageUrl);

  return (
    <div className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      {fill ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${
            isUsingPlaceholder ? 'opacity-30' : ''
          }`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          width={width || 200}
          height={height || 200}
          priority={priority}
          className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${
            isUsingPlaceholder ? 'opacity-30' : ''
          }`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      )}

      {/* Placeholder indicator */}
      {isUsingPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
            No Image
          </div>
        </div>
      )}
    </div>
  );
}
