import "server-only";
import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { CONDITIONS, RARITIES } from "@/lib/schemas/product";

const productSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    rarity: { type: String, enum: RARITIES, required: true, default: "normal" },
    condition: { type: String, enum: CONDITIONS, required: true, default: "new" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    conditionNote: { type: String, default: "" },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    isVisible: { type: Boolean, default: true },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ isVisible: 1, createdAt: -1 });
productSchema.index({ name: "text", code: "text" });

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", productSchema);
