import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/server/auth/session";
import { getProductById } from "@/server/services/products";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <ProductForm key={product.updatedAt} product={product} />
      <div className="flex justify-end border-t border-line pt-6">
        <DeleteProductButton id={product.id} name={product.name} />
      </div>
    </>
  );
}
