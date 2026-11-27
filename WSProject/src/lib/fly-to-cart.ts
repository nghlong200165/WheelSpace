"use client";

// Add-to-cart feedback: a copy of the product picture arcs into the header cart icon, then the
// cart toast announces it. Elements opt in with data-cart-target (the icon) and the caller passes
// the picture to fly from.

export const CART_ADDED_EVENT = "ws:cart-added";
export type CartAddedDetail = { message: string; ok: boolean };

export function announceCart(detail: CartAddedDetail) {
  window.dispatchEvent(new CustomEvent<CartAddedDetail>(CART_ADDED_EVENT, { detail }));
}

// Without `detail` only the flight runs (the caller shows its own message).
export function flyToCart(source: Element | null, detail?: CartAddedDetail) {
  const target = document.querySelector("[data-cart-target]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!source || !target || reduce) {
    if (detail) announceCart(detail);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const ghost = document.createElement("div");
  // The visible picture (a gallery keeps the hidden ones aria-hidden).
  const img = source.querySelector<HTMLImageElement>("img:not([aria-hidden=true])");
  Object.assign(ghost.style, {
    position: "fixed",
    zIndex: "100",
    pointerEvents: "none",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    overflow: "hidden",
    background: img ? `center / cover no-repeat url("${img.currentSrc || img.src}")` : "#161616",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  });
  document.body.append(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const flight = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy - 120}px) scale(.45)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08)`, opacity: 0.4 },
    ],
    { duration: 850, easing: "cubic-bezier(.5,0,.2,1)" },
  );
  flight.onfinish = flight.oncancel = () => {
    ghost.remove();
    if (detail) announceCart(detail);
  };
}
