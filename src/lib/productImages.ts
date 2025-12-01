// Utility functions for product images

/**
 * Get the image path for a product code
 * Checks if the image exists in public/product_images/
 * Returns the path if it exists, null otherwise
 */
export function getProductImagePath(productCode: string): string | null {
  if (!productCode) return null;

  // Product images are named exactly as the product code with .jpg extension
  // Note: We can't check file existence on client-side, so we'll return the path
  // and let Next.js Image component handle fallback
  return `/product_images/${productCode}.jpg`;
}

/**
 * Get the image path with a fallback placeholder
 */
export function getProductImageWithFallback(productCode: string): string {
  const imagePath = getProductImagePath(productCode);
  // Return the image path if it might exist, otherwise return a placeholder
  return imagePath || '/product_images/placeholder.jpg';
}

/**
 * Check if we should attempt to load an image for this product
 * This is a simple check - in production you might want to maintain
 * a list of available images or check against the database
 */
export function hasProductImage(productCode: string): boolean {
  // For now, we'll assume an image might exist if we have a product code
  // The Image component will handle the error if it doesn't exist
  return !!productCode;
}