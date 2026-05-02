/**
 * Image utilities for storefront
 * Handles different image formats from backend (Cloudinary)
 */

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface CloudinaryImage {
  url?: string;
  secure_url?: string;
  public_id?: string;
}

/**
 * Extract the actual URL from various image formats
 */
export function getImageUrl(image: string | ProductImage | CloudinaryImage | null | undefined): string {
  if (!image) return '';
  
  // If it's already a string, return it
  if (typeof image === 'string') return image;
  
  // If it has secure_url (Cloudinary format)
  if (typeof image === 'object' && 'secure_url' in image && image.secure_url) {
    return image.secure_url;
  }
  
  // If it has url property
  if (typeof image === 'object' && 'url' in image && image.url) {
    return image.url;
  }
  
  return '';
}

/**
 * Get the primary image from a product's images array
 * Falls back to first image if no primary is marked
 */
export function getProductMainImage(product: any): string {
  if (!product) return getPlaceholderImage();
  
  const images = product.images;
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return getPlaceholderImage(product._id || product.id);
  }
  
  // Try to find primary image first
  const primaryImage = images.find((img: any) => 
    typeof img === 'object' && img.isPrimary === true
  );
  
  if (primaryImage) {
    const url = getImageUrl(primaryImage);
    if (url) return url;
  }
  
  // Fall back to first image
  const firstImage = images[0];
  const url = getImageUrl(firstImage);
  
  return url || getPlaceholderImage(product._id || product.id);
}

/**
 * Get all product images as an array of URLs
 */
export function getProductImagesArray(product: any): string[] {
  if (!product?.images || !Array.isArray(product.images)) {
    return [getPlaceholderImage(product?._id || product?.id)];
  }
  
  const urls = product.images
    .map((img: any) => getImageUrl(img))
    .filter((url: string) => url !== '');
  
  return urls.length > 0 ? urls : [getPlaceholderImage(product._id || product.id)];
}

/**
 * Optimize Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(
  url: string, 
  options: { 
    width?: number; 
    height?: number; 
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // Extract the base URL and image path
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;
  
  const [baseUrl, imagePath] = urlParts;
  
  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format && format !== 'auto') transformations.push(`f_${format}`);
  
  // Add automatic quality and format optimization
  if (format === 'auto') transformations.push('f_auto');
  
  const transformString = transformations.join(',');
  
  return `${baseUrl}/upload/${transformString}/${imagePath}`;
}

/**
 * Get placeholder image URL
 */
export function getPlaceholderImage(seed?: string): string {
  // Use a reliable placeholder service
  const id = seed || Math.random().toString(36).substring(7);
  return `https://placehold.co/600x800/e2e8f0/64748b?text=No+Image&seed=${id}`;
}

/**
 * Check if a product has valid images
 */
export function hasValidImages(product: any): boolean {
  if (!product?.images || !Array.isArray(product.images)) {
    return false;
  }
  
  return product.images.some((img: any) => {
    const url = getImageUrl(img);
    return url && url.length > 0;
  });
}

/**
 * Sort images by primary first, then by order
 */
export function sortImagesByPrimary(images: any[]): any[] {
  if (!Array.isArray(images)) return [];
  
  return [...images].sort((a: any, b: any) => {
    const aIsPrimary = typeof a === 'object' && a.isPrimary === true;
    const bIsPrimary = typeof b === 'object' && b.isPrimary === true;
    
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;
    return 0;
  });
}
