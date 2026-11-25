import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/server/auth/session";
import { listBrands } from "@/server/services/products";

export const metadata: Metadata = { title: "Thêm sản phẩm" };

export default async function NewProductPage() {
  await requireAdmin();
  const brands = await listBrands({ visibleOnly: false });
  return <ProductForm brands={brands} />;
}
