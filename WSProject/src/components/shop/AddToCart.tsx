"use client";

import { useState } from "react";
import { addToCart, useCart } from "@/lib/cart";

// Quantity stepper + "Thêm vào giỏ". Never lets the cart exceed the stock shown on the page
// (the server checks stock again at checkout).
export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const inCart = useCart().find((l) => l.productId === productId)?.quantity ?? 0;
  const room = Math.max(stock - inCart, 0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const qty = Math.min(quantity, Math.max(room, 1));

  function add() {
    const added = addToCart(productId, qty, stock);
    setMessage(added > 0 ? `Đã thêm ${added} sản phẩm vào giỏ.` : "Bạn đã có đủ số lượng còn lại trong giỏ.");
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-stretch gap-3">
        <div role="group" aria-label="Số lượng" className="flex items-center border border-line bg-surface">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(qty - 1, 1))}
            disabled={qty <= 1}
            aria-label="Giảm số lượng"
            className="h-13 w-11 cursor-pointer text-lg disabled:cursor-default disabled:text-line"
          >
            −
          </button>
          <span className="min-w-8 text-center text-[15px]" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(qty + 1, room))}
            disabled={qty >= room}
            aria-label="Tăng số lượng"
            className="h-13 w-11 cursor-pointer text-lg disabled:cursor-default disabled:text-line"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={room === 0}
          className="min-h-13 flex-[1_1_200px] cursor-pointer bg-ink px-6 text-[13px] tracking-[0.12em] text-white disabled:cursor-default disabled:bg-[#8a8780]"
        >
          THÊM VÀO GIỎ
        </button>
      </div>
      {inCart > 0 && (
        <span className="text-[13px] text-muted">
          Trong giỏ: {inCart} / {stock} chiếc
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
