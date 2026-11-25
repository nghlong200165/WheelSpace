import "server-only";
import { env } from "../../env";
import { localStorageProvider } from "./local";
import type { StorageProvider } from "./types";

export type { StorageProvider } from "./types";

// Picks the provider from STORAGE_PROVIDER. To add one (e.g. Cloudinary): see ../README.md.
export function storage(): StorageProvider {
  switch (env().STORAGE_PROVIDER) {
    case "local":
      return localStorageProvider;
  }
}
