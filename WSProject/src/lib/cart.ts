"use client";

import { useSyncExternalStore } from "react";

// Guest-friendly cart kept in localStorage (decision: no server cart). It only stores ids and
// quantities; prices and stock are always re-read from the server at checkout.

export type CartLine = { productId: string; quantity: number };

const STORAGE_KEY = "ws_cart_v1";
const MAX_QUANTITY = 99;
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (l): l is CartLine =>
            typeof l?.productId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
        )
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode / storage full: the cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((sum, l) => sum + l.quantity, 0);
}

// Adds up to `maxQuantity` (the stock); returns how many were actually added.
export function addToCart(productId: string, quantity: number, maxQuantity: number): number {
  const lines = read();
  const current = lines.find((l) => l.productId === productId)?.quantity ?? 0;
  const next = Math.min(current + quantity, maxQuantity, MAX_QUANTITY);
  const added = Math.max(next - current, 0);
  if (added > 0) {
    write(
      current > 0
        ? lines.map((l) => (l.productId === productId ? { ...l, quantity: next } : l))
        : [...lines, { productId, quantity: next }],
    );
  }
  return added;
}

export function setCartQuantity(productId: string, quantity: number) {
  const lines = read();
  write(
    quantity > 0
      ? lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, MAX_QUANTITY) } : l))
      : lines.filter((l) => l.productId !== productId),
  );
}

export function clearCart() {
  write([]);
}
