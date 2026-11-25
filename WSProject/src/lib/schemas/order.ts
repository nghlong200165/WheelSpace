import { z } from "zod";

export const PAYMENT_METHODS = ["cod", "payos"] as const;
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "expired"] as const;
export const ORDER_STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "COD",
  payos: "Chuyển khoản (payOS)",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  expired: "Hết hạn thanh toán",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

// Vietnamese mobile numbers: 10 digits starting with 0, or +84 followed by 9 digits.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)\d{9}$/, "Số điện thoại không hợp lệ");

// Input accepted from the checkout form.
export const checkoutInputSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Nhập họ tên").max(120),
    phone: phoneSchema,
    email: z.union([z.email("Email không hợp lệ"), z.literal("")]).default(""),
    province: z.string().trim().min(1, "Nhập tỉnh / thành phố").max(120),
    ward: z.string().trim().min(1, "Nhập phường / xã").max(120),
    address: z.string().trim().min(1, "Nhập địa chỉ").max(300),
    note: z.string().trim().max(500).default(""),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Giỏ hàng trống"),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const orderLookupSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Nhập mã đơn"),
  phone: phoneSchema,
});

export type OrderItemDTO = {
  productId: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type OrderDTO = {
  id: string;
  code: string;
  customer: CheckoutInput["customer"];
  items: OrderItemDTO[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  paymentExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
