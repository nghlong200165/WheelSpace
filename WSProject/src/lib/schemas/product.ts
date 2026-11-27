import { z } from "zod";
import { BRANDS } from "../brands";

export const MAX_PRODUCT_IMAGES = 10;

export const RARITIES = ["normal", "chase", "limited"] as const;
export const CONDITIONS = ["new", "like_new", "used"] as const;

export type Rarity = (typeof RARITIES)[number];
export type Condition = (typeof CONDITIONS)[number];

export const RARITY_LABELS: Record<Rarity, string> = {
  normal: "Thường",
  chase: "Chase",
  limited: "Limited",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "New",
  like_new: "Lướt",
  used: "Used",
};

// Input accepted by the admin "create/update product" form.
export const productInputSchema = z.object({
  code: z.string().trim().min(1, "Nhập mã sản phẩm").max(32),
  name: z.string().trim().min(1, "Nhập tên sản phẩm").max(160),
  // Car maker from the fixed list in src/lib/brands.ts (storefront "Hãng xe" filter).
  brand: z.enum(BRANDS, { error: "Chọn hãng xe" }),
  price: z.coerce.number({ error: "Nhập giá" }).int().min(0, "Giá không hợp lệ"),
  rarity: z.enum(RARITIES),
  condition: z.enum(CONDITIONS),
  stock: z.coerce.number({ error: "Nhập số lượng tồn" }).int().min(0, "Tồn kho không hợp lệ"),
  conditionNote: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000).default(""),
  images: z.array(z.string()).max(MAX_PRODUCT_IMAGES, `Tối đa ${MAX_PRODUCT_IMAGES} ảnh`).default([]),
  isVisible: z.boolean().default(true),
  isNewArrival: z.boolean().default(false),
  // Shown in the home page hero slider (needs at least one image).
  isFeatured: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// Plain object returned by services to the UI (never a Mongoose document).
export type ProductDTO = ProductInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

// What the cart page needs per line. `available` is false for products hidden by the admin.
export type CartProductDTO = Pick<ProductDTO, "id" | "code" | "name" | "brand" | "price" | "stock"> & {
  image: string | null;
  available: boolean;
};
