import "server-only";
import type { EmailProvider } from "./types";

// Free, dev only: prints the email to the server log instead of sending it.
export const consoleEmailProvider: EmailProvider = {
  name: "console",
  async send(message) {
    console.info(`[email:console] to=${message.to} subject="${message.subject}"\n${message.text}`);
  },
};
