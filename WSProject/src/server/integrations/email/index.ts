import "server-only";
import { env } from "../../env";
import { consoleEmailProvider } from "./console";
import type { EmailProvider } from "./types";

export type { EmailMessage, EmailProvider } from "./types";

// Picks the provider from EMAIL_PROVIDER. To add one (e.g. Resend): see ../README.md.
export function email(): EmailProvider {
  switch (env().EMAIL_PROVIDER) {
    case "console":
      return consoleEmailProvider;
  }
}
