import "server-only";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

// Contract for sending email (order confirmation, OTP, password reset, back-in-stock…).
export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}
