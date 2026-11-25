import "server-only";

// Contract for online payment (phase 4: checkout). Providers: "mock" (local simulation) and
// "payos" (VietQR). Implementations and ./index.ts are added together with checkout.

export type PaymentRequest = {
  orderCode: string; // our WS-XXXXXX code
  amount: number; // VND
  description: string;
  returnUrl: string;
  cancelUrl: string;
  expiresAt: Date;
};

export type PaymentLink = {
  providerRef: string; // the provider's id for this payment (payOS orderCode, mock id…)
  checkoutUrl: string;
  qrCode?: string;
};

export type PaymentEvent = {
  providerRef: string;
  status: "paid" | "cancelled" | "expired";
  amount: number;
};

export interface PaymentProvider {
  readonly name: string;
  createPaymentLink(request: PaymentRequest): Promise<PaymentLink>;
  // Verifies the webhook signature and returns the event, or null when it is not genuine.
  parseWebhook(body: unknown, headers: Headers): Promise<PaymentEvent | null>;
}
