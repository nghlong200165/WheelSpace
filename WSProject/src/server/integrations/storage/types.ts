import "server-only";

// Contract every image storage provider implements (local disk today, Cloudinary later).
export interface StorageProvider {
  readonly name: string;
  // Validates and stores an uploaded image; returns the URL to save on the product.
  saveImage(file: File, folder: "products"): Promise<string>;
  // Best effort: unknown or already-deleted URLs are ignored.
  deleteImages(urls: string[]): Promise<void>;
}

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
