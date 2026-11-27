import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductCard, RarityBadge } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { WishlistSlot } from "@/components/shop/WishlistSlot";
import { ChatIcon } from "@/components/shop/icons";
import { getProduct, getRelatedProducts, getStoreSettings } from "@/server/queries/storefront";
import { formatVnd } from "@/lib/format";
import { CONDITION_LABELS, RARITY_LABELS, type ProductDTO } from "@/lib/schemas/product";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  const description = `${product.brand} · ${product.code} · ${CONDITION_LABELS[product.condition]} · ${formatVnd(product.price)}${
    product.stock === 0 ? " · Nhận order" : ""
  }`;
  return {
    title: `${product.name} · ${product.code}`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-6 sm:px-8 sm:pt-8">
      {/* The id comes from the URL, which is only known at request time. */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/products/[id]">["params"] }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const [related, settings] = await Promise.all([getRelatedProducts(product, 4), getStoreSettings()]);
  const soldOut = product.stock === 0;

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="hover:text-ink">
          Sản phẩm
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="hover:text-ink">
          {product.brand}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink" aria-current="page">
          {product.name}
        </span>
      </nav>

      <section className="flex flex-col gap-10 pt-8 lg:flex-row lg:items-start lg:gap-16">
        <div className="min-w-0 lg:flex-[1.15]">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="flex min-w-0 flex-col gap-7 lg:sticky lg:top-8 lg:flex-1">
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap gap-2">
              <RarityBadge rarity={product.rarity} />
              <span className="border border-ink px-2.5 py-0.75 text-[10px] tracking-eyebrow">
                {CONDITION_LABELS[product.condition].toUpperCase()}
              </span>
            </div>
            <span className="text-xs tracking-eyebrow text-muted">
              {product.code} · {product.brand.toUpperCase()} · TỈ LỆ 1:64
            </span>
            <h1 className="text-[28px] leading-tight font-light tracking-tight sm:text-4xl">{product.name}</h1>
            <span className="text-2xl">{formatVnd(product.price)}</span>
          </div>

          <div className="flex flex-col gap-5 border-y border-line py-7">
            {soldOut ? (
              <SoldOutBox messengerUrl={settings.messengerUrl} phone={settings.contactPhone} />
            ) : (
              <>
                <span className="text-[13px] text-success">
                  ● Còn {product.stock} chiếc{product.stock === 1 ? " (chiếc cuối cùng)" : ""}
                </span>
                <AddToCart productId={product.id} stock={product.stock} />
              </>
            )}
            <Suspense fallback={<WishlistButton productId={product.id} saved={false} loginNext={`/products/${product.id}`} />}>
              <WishlistSlot productId={product.id} />
            </Suspense>
          </div>

          <ProductFacts product={product} />

          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-muted">
            <li>Thanh toán khi nhận hàng (COD) hoặc chuyển khoản qua mã QR.</li>
            <li>Hộp và blister được đóng gói chống móp nhiều lớp.</li>
          </ul>
        </div>
      </section>

      {product.description && (
        <section className="flex max-w-3xl flex-col gap-4 pt-20">
          <h2 className="text-xs font-medium tracking-eyebrow">MÔ TẢ</h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink/85">{product.description}</p>
        </section>
      )}

      {related.length > 0 && (
        <section className="flex flex-col gap-8 pt-24">
          <h2 className="text-2xl font-light">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ProductFacts({ product }: { product: ProductDTO }) {
  const rows: [string, React.ReactNode][] = [
    ["Mã sản phẩm", product.code],
    [
      "Hãng xe",
      <Link key="brand" href={`/products?brand=${encodeURIComponent(product.brand)}`} className="underline">
        {product.brand}
      </Link>,
    ],
    ["Độ hiếm", RARITY_LABELS[product.rarity]],
    ["Tình trạng", CONDITION_LABELS[product.condition]],
  ];
  if (product.conditionNote) rows.push(["Ghi chú", product.conditionNote]);
  return (
    <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="leading-relaxed">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SoldOutBox({ messengerUrl, phone }: { messengerUrl: string; phone: string }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[13px] text-muted">● Tạm hết hàng</span>
      <p className="text-sm leading-relaxed text-muted">
        Mẫu này có thể order. Nhắn tin để chúng tôi kiểm tra nguồn hàng, giá và thời gian về.
      </p>
      {messengerUrl ? (
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-13 items-center justify-center gap-2.5 bg-ink px-6 text-[13px] tracking-[0.12em] text-white hover:text-white"
        >
          <ChatIcon /> NHẮN TIN ĐỂ ORDER
        </a>
      ) : phone ? (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex min-h-13 items-center justify-center bg-ink px-6 text-[13px] tracking-[0.12em] text-white hover:text-white">
          GỌI {phone} ĐỂ ORDER
        </a>
      ) : null}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-10 pt-14 lg:flex-row lg:gap-16" aria-hidden="true">
      <div className="aspect-4/3 bg-placeholder lg:flex-[1.15]" />
      <div className="flex flex-col gap-4 lg:flex-1">
        <div className="h-4 w-40 bg-placeholder" />
        <div className="h-10 w-3/4 bg-placeholder" />
        <div className="h-7 w-32 bg-placeholder" />
      </div>
    </div>
  );
}
