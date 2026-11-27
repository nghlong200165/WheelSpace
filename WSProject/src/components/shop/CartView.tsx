"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getCartProductsAction } from "@/server/actions/cart";
import { setCartQuantity, useCart, type CartLine } from "@/lib/cart";
import { formatVnd } from "@/lib/format";
import type { CartProductDTO } from "@/lib/schemas/product";
import { ChatIcon } from "./icons";
import { QuantityInput } from "./QuantityInput";

type Props = {
  shippingFee: number;
  freeShippingThreshold: number | null;
  messengerUrl: string;
  contactPhone: string;
};

// id -> product, or null when the product no longer exists.
type Known = Record<string, CartProductDTO | null>;

const noopSubscribe = () => () => {};

// The cart only stores ids and quantities, so prices and stock are fetched fresh on every visit.
// Lines that can't be bought (sold out, hidden, deleted) stay visible but are left out of the total.
export function CartView({ shippingFee, freeShippingThreshold, messengerUrl, contactPhone }: Props) {
  const lines = useCart();
  // The server render can't see localStorage; show the skeleton until the browser takes over.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [known, setKnown] = useState<Known>({});
  const [notices, setNotices] = useState<string[]>([]);

  const missing = lines.filter((l) => !(l.productId in known)).map((l) => l.productId);
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let cancelled = false;
    const ids = missingKey.split(",");
    getCartProductsAction(ids).then((products) => {
      if (cancelled) return;
      const byId = new Map(products.map((p) => [p.id, p]));
      const found: Known = Object.fromEntries(ids.map((id) => [id, byId.get(id) ?? null]));
      setKnown((prev) => ({ ...prev, ...found }));
      // Less stock than the customer picked: lower the quantity and say so.
      const lowered: string[] = [];
      for (const product of products) {
        const line = lines.find((l) => l.productId === product.id);
        if (line && product.available && product.stock > 0 && line.quantity > product.stock) {
          setCartQuantity(product.id, product.stock);
          lowered.push(`${product.name}: kho chỉ còn ${product.stock} chiếc, số lượng đã được giảm lại.`);
        }
      }
      if (lowered.length) setNotices((prev) => [...prev, ...lowered]);
    });
    return () => {
      cancelled = true;
    };
    // Only refetch when new ids show up; quantity changes don't need fresh data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey]);

  if (!hydrated || (lines.length > 0 && missing.length === lines.length)) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5 border-t border-line pt-10">
        <p className="text-[15px] text-muted">Giỏ hàng đang trống.</p>
        <Link href="/products" className="bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white hover:text-white">
          XEM BỘ SƯU TẬP
        </Link>
      </div>
    );
  }

  const buyable = lines.flatMap((line) => {
    const product = known[line.productId];
    return product && isBuyable(product) ? [{ line, product }] : [];
  });
  const subtotal = buyable.reduce((sum, { line, product }) => sum + product.price * line.quantity, 0);
  const itemCount = buyable.reduce((sum, { line }) => sum + line.quantity, 0);
  const freeShipping = freeShippingThreshold !== null && subtotal >= freeShippingThreshold;
  const shipping = subtotal === 0 || freeShipping ? 0 : shippingFee;

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex min-w-0 flex-col gap-6 lg:flex-[1.6]">
        {notices.length > 0 && (
          <div role="status" className="flex flex-col gap-1.5 border border-warning/40 bg-surface px-5 py-4 text-[13px] text-warning">
            {notices.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
        <ul className="flex flex-col border-t border-line">
          {lines.map((line) => (
            <CartRow
              key={line.productId}
              line={line}
              product={known[line.productId]}
              messengerUrl={messengerUrl}
              contactPhone={contactPhone}
            />
          ))}
        </ul>
        <Link href="/products" className="self-start text-[13px] underline">
          Tiếp tục mua sắm
        </Link>
      </div>

      <aside className="flex flex-col gap-6 border border-line bg-surface p-6 lg:sticky lg:top-8 lg:flex-1 sm:p-8">
        <h2 className="text-xs font-medium tracking-eyebrow">TÓM TẮT ĐƠN HÀNG</h2>
        {freeShippingThreshold !== null && freeShippingThreshold > 0 && subtotal > 0 && (
          <FreeShippingProgress subtotal={subtotal} threshold={freeShippingThreshold} />
        )}
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Tạm tính ({itemCount} sản phẩm)</dt>
            <dd>{formatVnd(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Phí vận chuyển</dt>
            <dd>{subtotal === 0 ? "—" : shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-4 text-base">
            <dt>Tổng cộng</dt>
            <dd className="text-xl">{formatVnd(subtotal + shipping)}</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled
          className="min-h-13 cursor-default bg-[#8a8780] px-6 text-[13px] tracking-[0.12em] text-white"
        >
          ĐẶT HÀNG · SẮP RA MẮT
        </button>
        <p className="text-[13px] leading-relaxed text-muted">
          Đặt hàng trực tuyến sắp ra mắt.{" "}
          {messengerUrl ? (
            <>
              Trong lúc chờ, bạn có thể{" "}
              <a href={messengerUrl} target="_blank" rel="noopener noreferrer" className="text-ink underline">
                nhắn tin qua Messenger
              </a>{" "}
              để chốt đơn.
            </>
          ) : contactPhone ? (
            <>
              Trong lúc chờ, bạn có thể gọi{" "}
              <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="text-ink underline">
                {contactPhone}
              </a>{" "}
              để chốt đơn.
            </>
          ) : null}
        </p>
      </aside>
    </div>
  );
}

function isBuyable(product: CartProductDTO): boolean {
  return product.available && product.stock > 0;
}

function CartRow({
  line,
  product,
  messengerUrl,
  contactPhone,
}: {
  line: CartLine;
  product: CartProductDTO | null | undefined;
  messengerUrl: string;
  contactPhone: string;
}) {
  const [limitWarning, setLimitWarning] = useState(false);

  if (product === undefined) {
    return (
      <li className="flex gap-4 border-b border-line py-6 sm:gap-6" aria-hidden="true">
        <div className="aspect-4/3 w-24 shrink-0 bg-placeholder sm:w-32" />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="h-3 w-24 bg-placeholder" />
          <div className="h-4 w-3/4 bg-placeholder" />
        </div>
      </li>
    );
  }

  const remove = (
    <button
      type="button"
      onClick={() => setCartQuantity(line.productId, 0)}
      className="cursor-pointer text-[13px] text-muted underline hover:text-ink"
    >
      Xóa
    </button>
  );

  if (product === null) {
    return (
      <li className="flex items-center justify-between gap-4 border-b border-line py-6">
        <p className="text-sm text-muted">Sản phẩm này không còn tồn tại.</p>
        {remove}
      </li>
    );
  }

  const buyable = isBuyable(product);
  const href = `/products/${product.id}`;
  const orderLink = messengerUrl || (contactPhone ? `tel:${contactPhone.replace(/\s/g, "")}` : "");

  return (
    <li className="flex gap-4 border-b border-line py-6 sm:gap-6">
      <Link
        href={product.available ? href : "/products"}
        className={`relative aspect-4/3 w-24 shrink-0 overflow-hidden bg-placeholder sm:w-32 ${buyable ? "" : "opacity-50"}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.image && <Image src={product.image} alt="" fill sizes="128px" className="object-cover" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex min-w-0 flex-col gap-1 ${buyable ? "" : "text-muted"}`}>
            <span className="text-[11px] tracking-[0.14em] text-muted">
              {product.code} · {product.brand.toUpperCase()}
            </span>
            {product.available ? (
              <Link href={href} className="text-[15px] leading-snug font-medium">
                {product.name}
              </Link>
            ) : (
              <span className="text-[15px] leading-snug font-medium">{product.name}</span>
            )}
            <span className="text-sm">{formatVnd(product.price)}</span>
          </div>
          {buyable && <span className="shrink-0 text-[15px]">{formatVnd(product.price * line.quantity)}</span>}
        </div>

        {buyable ? (
          <>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <QuantityInput
                size="sm"
                value={line.quantity}
                max={product.stock}
                onChange={(n) => {
                  setCartQuantity(line.productId, n);
                  setLimitWarning(false);
                }}
                onExceed={() => setLimitWarning(true)}
              />
              {remove}
            </div>
            {limitWarning && (
              <p role="alert" className="text-[13px] text-warning">
                Mẫu này chỉ còn {product.stock} chiếc.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[13px] text-muted">
              ● {product.available ? "Tạm hết hàng" : "Ngừng bán"} · không tính vào đơn
            </span>
            {product.available && orderLink && (
              <a
                href={orderLink}
                target={messengerUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] underline"
              >
                <ChatIcon size={14} /> Nhắn tin để order
              </a>
            )}
            {remove}
          </div>
        )}
      </div>
    </li>
  );
}

function FreeShippingProgress({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  const reached = subtotal >= threshold;
  const percent = Math.min((subtotal / threshold) * 100, 100);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[13px]">
        {reached ? (
          <span className="text-success">Đơn của bạn được miễn phí vận chuyển.</span>
        ) : (
          <>
            Mua thêm <strong className="font-medium">{formatVnd(threshold - subtotal)}</strong> để được miễn phí vận
            chuyển.
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Tiến độ miễn phí vận chuyển"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-1 bg-line-soft"
      >
        <div className={`h-full ${reached ? "bg-success" : "bg-ink"}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-16" aria-hidden="true">
      <div className="flex flex-col gap-6 border-t border-line pt-6 lg:flex-[1.6]">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-6">
            <div className="aspect-4/3 w-24 bg-placeholder sm:w-32" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="h-3 w-24 bg-placeholder" />
              <div className="h-4 w-3/4 bg-placeholder" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 bg-placeholder lg:flex-1" />
    </div>
  );
}
