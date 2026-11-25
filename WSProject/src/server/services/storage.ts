import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ServiceError } from "./errors";

// Demo storage on the local disk. Swap this module for Cloudinary before deploying to Vercel
// (its filesystem is read-only); callers only depend on the functions below.

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PRODUCT_DIR = "products";
const PUBLIC_PREFIX = "/uploads";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Only names we generated ourselves: products/<uuid>.<ext>
const STORED_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export async function saveProductImage(file: File): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new ServiceError(`"${file.name}" không phải ảnh JPG, PNG hoặc WEBP`, "images");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ServiceError(`"${file.name}" lớn hơn ${MAX_IMAGE_BYTES / 1024 / 1024}MB`, "images");
  }

  const name = `${randomUUID()}.${ext}`;
  await mkdir(path.join(UPLOAD_ROOT, PRODUCT_DIR), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, PRODUCT_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `${PUBLIC_PREFIX}/${PRODUCT_DIR}/${name}`;
}

// Best effort: a missing file must not fail the surrounding operation.
export async function deleteImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      const name = url.startsWith(`${PUBLIC_PREFIX}/${PRODUCT_DIR}/`) ? url.split("/").pop()! : "";
      if (!STORED_NAME.test(name)) return;
      await unlink(path.join(UPLOAD_ROOT, PRODUCT_DIR, name)).catch(() => undefined);
    }),
  );
}

export async function readUpload(segments: string[]): Promise<{ data: Buffer; contentType: string } | null> {
  const [dir, name] = segments;
  if (segments.length !== 2 || dir !== PRODUCT_DIR || !STORED_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_ROOT, PRODUCT_DIR, name));
    return { data, contentType: CONTENT_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}
