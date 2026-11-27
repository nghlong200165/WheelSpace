import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: "Thêm sản phẩm" };

export default async function NewProductPage() {
  await requireAdmin();
  return <ProductForm />;
}
