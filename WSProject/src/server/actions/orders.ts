"use server";

import { headers } from "next/headers";
import { hitRateLimit } from "../services/rate-limit";
import { lookupOrder } from "../services/orders";
import { invalidForm, text } from "./form-helpers";
import { orderLookupSchema, type OrderLookupDTO } from "@/lib/schemas/order";
import type { FormState } from "@/lib/form-state";

export type OrderLookupState = FormState & { order?: OrderLookupDTO };

const LOOKUPS_PER_WINDOW = 10;
const WINDOW_MS = 15 * 60 * 1000;

// Order code + phone -> order. Rate limited per IP so codes can't be guessed in bulk.
export async function lookupOrderAction(_prev: OrderLookupState, formData: FormData): Promise<OrderLookupState> {
  const parsed = orderLookupSchema.safeParse({ code: text(formData, "code"), phone: text(formData, "phone") });
  if (!parsed.success) return invalidForm(parsed.error);

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  // Off in local development so the lookup can be tested freely; production keeps the limit.
  if (process.env.NODE_ENV === "production" && hitRateLimit(`order-lookup:${ip}`, LOOKUPS_PER_WINDOW, WINDOW_MS)) {
    return { message: "Bạn tra cứu quá nhiều lần, vui lòng thử lại sau 15 phút." };
  }

  const order = await lookupOrder(parsed.data.code, parsed.data.phone);
  if (!order) {
    return { message: "Không tìm thấy đơn hàng. Kiểm tra lại mã đơn và số điện thoại đã dùng khi đặt hàng." };
  }
  return { ok: true, order };
}
