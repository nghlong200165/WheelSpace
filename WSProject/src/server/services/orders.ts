import "server-only";
import { connectDb } from "../db";
import { Order, type OrderDoc } from "../models/Order";
import {
  normalizePhone,
  type OrderLookupDTO,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/schemas/order";

type LeanOrder = OrderDoc & { createdAt: Date };

// "0901234567" -> "090****567"
function maskPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length > 6 ? `${p.slice(0, 3)}${"*".repeat(p.length - 6)}${p.slice(-3)}` : "***";
}

// Public order lookup. Returns null for an unknown code and for a wrong phone alike, so the
// response never tells whether a code exists.
export async function lookupOrder(code: string, phone: string): Promise<OrderLookupDTO | null> {
  await connectDb();
  const doc = await Order.findOne({ code }).lean<LeanOrder>();
  const customer = doc?.customer;
  if (!doc || !customer || normalizePhone(customer.phone) !== normalizePhone(phone)) return null;

  return {
    code: doc.code,
    status: doc.status as OrderStatus,
    statusHistory: (doc.statusHistory ?? []).map((h) => ({ status: h.status as OrderStatus, at: h.at.toISOString() })),
    recipient: {
      name: customer.name,
      phone: maskPhone(customer.phone),
      area: [customer.ward, customer.province].filter(Boolean).join(", "),
    },
    items: doc.items.map((i) => ({ code: i.code, name: i.name, price: i.price, quantity: i.quantity, image: i.image ?? null })),
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    total: doc.total,
    paymentMethod: doc.paymentMethod as PaymentMethod,
    paymentStatus: doc.paymentStatus as PaymentStatus,
    createdAt: doc.createdAt.toISOString(),
  };
}
