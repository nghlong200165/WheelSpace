"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart, useCart } from "@/lib/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import { QuantityInput } from "./QuantityInput";

// Quantity picker + "Thêm vào giỏ". Never lets the cart exceed the stock shown on the page
// (the server checks stock again at checkout) and says so when the customer asks for more.
export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const inCart = useCart().find((l) => l.productId === productId)?.quantity ?? 0;
  const room = Math.max(stock - inCart, 0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const qty = Math.min(quantity, Math.max(room, 1));

  function limitText(): string {
    if (room === 0) return `Giỏ của bạn đã có đủ ${stock} chiếc còn lại của mẫu này.`;
    if (inCart > 0) return `Mẫu này còn ${stock} chiếc, giỏ của bạn đã có ${inCart} nên chỉ thêm được ${room}.`;
    return `Mẫu này chỉ còn ${stock} chiếc.`;
  }

  function add() {
    if (room === 0) {
      setWarning(limitText());
      return;
    }
    const added = addToCart(productId, qty, stock);
    flyToCart(document.querySelector("[data-gallery-main]"));
    setMessage(`Đã thêm ${added} sản phẩm vào giỏ.`);
    setWarning(null);
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-stretch gap-3">
        <QuantityInput
          value={qty}
          max={Math.max(room, 1)}
          onChange={(n) => {
            setQuantity(n);
            setWarning(null);
            setMessage(null);
          }}
          onExceed={() => setWarning(limitText())}
        />
        <button
          type="button"
          onClick={add}
          className="btn-sweep min-h-13 flex-[1_1_200px] cursor-pointer bg-ink px-6 text-[13px] tracking-[0.12em] text-white"
        >
          THÊM VÀO GIỎ
        </button>
      </div>
      {warning && (
        <p role="alert" className="text-[13px] text-warning">
          {warning}
        </p>
      )}
      {inCart > 0 && (
        <span className="text-[13px] text-muted">
          Trong giỏ: {inCart} / {stock} chiếc ·{" "}
          <Link href="/cart" className="text-ink underline">
            Xem giỏ hàng
          </Link>
        </span>
      )}
      {message && (
        <p role="status" className="text-[13px] text-success">
          {message}
        </p>
      )}
    </div>
  );
}
