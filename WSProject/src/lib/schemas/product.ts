import { z } from "zod";

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
  price: z.coerce.number().int().min(0, "Giá không hợp lệ"),
  rarity: z.enum(RARITIES),
  condition: z.enum(CONDITIONS),
  stock: z.coerce.number().int().min(0, "Tồn kho không hợp lệ"),
  conditionNote: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000).default(""),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  isNewArrival: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// Plain object returned by services to the UI (never a Mongoose document).
export type ProductDTO = ProductInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
