"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toggleWishlistAction } from "@/server/actions/account";
import { HeartIcon } from "./icons";

// Heart toggle. Guests are sent to /login and come back to the current page.
export function WishlistButton({
  productId,
  saved,
  loginNext,
  compact = false,
}: {
  productId: string;
  saved: boolean;
  loginNext: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);

  function toggle() {
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved);
      const result = await toggleWishlistAction(productId);
      if (!result) router.push(`/login?next=${encodeURIComponent(loginNext)}`);
      else router.refresh();
    });
  }

  const label = optimisticSaved ? "Bỏ khỏi wishlist" : "Thêm vào wishlist";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimisticSaved}
      aria-label={compact ? label : undefined}
      className={`inline-flex cursor-pointer items-center gap-2 ${optimisticSaved ? "text-accent" : "text-ink"} ${
        compact ? "bg-surface/90 p-2.5" : "min-h-11 border border-line px-4 text-[13px]"
      }`}
    >
      <HeartIcon filled={optimisticSaved} />
      {!compact && label}
    </button>
  );
}
