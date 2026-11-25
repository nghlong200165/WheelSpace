"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../auth/session";
import { CACHE_TAGS } from "../cache-tags";
import { createProduct, deleteProduct, updateProduct } from "../services/products";
import { checkbox, digits, failedForm, invalidForm, text } from "./form-helpers";
import { productInputSchema } from "@/lib/schemas/product";
import type { FormState } from "@/lib/form-state";

function keptImages(formData: FormData): string[] {
  try {
    const value: unknown = JSON.parse(text(formData, "keepImages") || "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = productInputSchema.safeParse({
    code: text(formData, "code"),
    name: text(formData, "name"),
    price: digits(formData, "price"),
    rarity: text(formData, "rarity"),
    condition: text(formData, "condition"),
    stock: digits(formData, "stock"),
    conditionNote: text(formData, "conditionNote"),
    description: text(formData, "description"),
    images: keptImages(formData),
    isVisible: checkbox(formData, "isVisible"),
    isNewArrival: checkbox(formData, "isNewArrival"),
    isFeatured: checkbox(formData, "isFeatured"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  const newImages = formData
    .getAll("newImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const id = text(formData, "id");
  try {
    if (id) await updateProduct(id, parsed.data, newImages);
    else await createProduct(parsed.data, newImages);
  } catch (err) {
    return failedForm(err);
  }

  updateTag(CACHE_TAGS.products);
  redirect(`/admin/products?saved=${id ? "updated" : "created"}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteProduct(text(formData, "id"));
  updateTag(CACHE_TAGS.products);
  redirect("/admin/products?saved=deleted");
}
