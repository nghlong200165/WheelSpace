import "server-only";
import { env } from "../../env";
import { consoleSmsProvider } from "./console";
import type { SmsProvider } from "./types";

export type { SmsProvider } from "./types";

// Picks the provider from SMS_PROVIDER. To add one (e.g. eSMS, SpeedSMS, Zalo ZNS): see ../README.md.
export function sms(): SmsProvider {
  switch (env().SMS_PROVIDER) {
    case "console":
      return consoleSmsProvider;
  }
}
