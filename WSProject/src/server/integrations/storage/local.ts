import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ServiceError } from "../../services/errors";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, type StorageProvider } from "./types";

// Free, dev/demo only: files live in ./uploads (gitignored) and are served by
// src/app/uploads/[...path]/route.ts. Does not work on Vercel (read-only filesystem).

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PUBLIC_PREFIX = "/uploads";
const FOLDERS = new Set(["products"]);
// Only names we generated ourselves: <uuid>.<ext>
const STORED_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export const localStorageProvider: StorageProvider = {
  name: "local",

  async saveImage(file, folder) {
    const ext = ALLOWED_IMAGE_TYPES[file.type];
    if (!ext) throw new ServiceError(`"${file.name}" không phải ảnh JPG, PNG hoặc WEBP`, "images");
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ServiceError(`"${file.name}" lớn hơn ${MAX_IMAGE_BYTES / 1024 / 1024}MB`, "images");
    }
    const name = `${randomUUID()}.${ext}`;
    await mkdir(path.join(UPLOAD_ROOT, folder), { recursive: true });
    await writeFile(path.join(UPLOAD_ROOT, folder, name), Buffer.from(await file.arrayBuffer()));
    return `${PUBLIC_PREFIX}/${folder}/${name}`;
  },

  async deleteImages(urls) {
    await Promise.all(
      urls.map(async (url) => {
        const [, prefix, folder, name] = url.split("/");
        if (`/${prefix}` !== PUBLIC_PREFIX || !FOLDERS.has(folder) || !STORED_NAME.test(name ?? "")) return;
        await unlink(path.join(UPLOAD_ROOT, folder, name)).catch(() => undefined);
      }),
    );
  },
};

// Used by the /uploads route handler to serve files saved by this provider.
export async function readLocalUpload(segments: string[]): Promise<{ data: Buffer; contentType: string } | null> {
  const [folder, name] = segments;
  if (segments.length !== 2 || !FOLDERS.has(folder) || !STORED_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_ROOT, folder, name));
    return { data, contentType: CONTENT_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}
