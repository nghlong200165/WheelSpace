"use server";

import { z } from "zod";
import { listCartProducts } from "../services/products";
import type { CartProductDTO } from "@/lib/schemas/product";

// Same cap as the number of distinct products a cart can sensibly hold.
const idsSchema = z.array(z.string().max(64)).max(100);

// Read-only: the cart lives in the browser, so the cart page asks for fresh prices and stock here.
export async function getCartProductsAction(ids: string[]): Promise<CartProductDTO[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  return listCartProducts(parsed.data);
}
