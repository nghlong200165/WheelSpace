import "server-only";

// Contract for text messages to a Vietnamese phone number (OTP, order updates).
// A Zalo ZNS provider can implement the same contract.
export interface SmsProvider {
  readonly name: string;
  send(phone: string, text: string): Promise<void>;
}
