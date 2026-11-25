import "server-only";
import type { SmsProvider } from "./types";

// Free, dev only: prints the message to the server log instead of sending it.
export const consoleSmsProvider: SmsProvider = {
  name: "console",
  async send(phone, text) {
    console.info(`[sms:console] to=${phone}\n${text}`);
  },
};
