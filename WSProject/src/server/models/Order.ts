import "server-only";
import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/schemas/order";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // Snapshot at purchase time so later product edits do not change past orders.
    code: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: null },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      province: { type: String, required: true },
      ward: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, required: true },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "pending" },
    // payOS requires a numeric order code; kept separate from our human-readable code.
    payosOrderCode: { type: Number, default: null },
    // Unpaid payOS orders are cancelled and their stock restored after this time.
    paymentExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ payosOrderCode: 1 }, { sparse: true });
orderSchema.index({ paymentStatus: 1, paymentExpiresAt: 1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;

// Replace the cached model on dev hot reload (see Product.ts).
if (models.Order) deleteModel("Order");
export const Order: Model<OrderDoc> = model<OrderDoc>("Order", orderSchema);
