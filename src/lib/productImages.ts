// Utility functions for product images

/**
 * Get the product image source with proper fallback handling
 * Prioritizes database image_url (Supabase storage), falls back to placeholder
 *
 * @param imageUrl - The image URL from the database (typically Supabase storage URL)
 * @param productCode - The product code (for logging/debugging purposes)
 * @returns Image URL or placeholder path
 */
export function getProductImageSrc(imageUrl: string | null | undefined, productCode?: string): string {
  // If we have a valid image URL from the database, use it
  if (imageUrl) {
    return imageUrl;
  }

  // Otherwise, fall back to placeholder
  return '/product-placeholder.svg';
}

/**
 * Get the image path for a product code (DEPRECATED - use getProductImageSrc instead)
 * @deprecated Use getProductImageSrc with database image_url instead
 */
export function getProductImagePath(productCode: string): string | null {
  if (!productCode) return null;
  return `/product_images/${productCode}.jpg`;
}

/**
 * Get the image path with a fallback placeholder (DEPRECATED - use getProductImageSrc instead)
 * @deprecated Use getProductImageSrc with database image_url instead
 */
export function getProductImageWithFallback(productCode: string): string {
  const imagePath = getProductImagePath(productCode);
  return imagePath || '/product-placeholder.svg';
}

/**
 * Check if we should attempt to load an image for this product
 */
export function hasProductImage(imageUrl: string | null | undefined): boolean {
  return !!imageUrl;
}
