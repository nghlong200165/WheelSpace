"use client";

import { useState } from "react";

// − [typed number] +. Asking for more than `max` keeps the value at `max` and calls `onExceed`
// so the parent can tell the customer why.
export function QuantityInput({
  value,
  max,
  onChange,
  onExceed,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (quantity: number) => void;
  onExceed: () => void;
  size?: "md" | "sm";
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const box = size === "md" ? "h-13 w-11 text-lg" : "h-10 w-10";

  function commit(requested: number) {
    setDraft(null);
    const next = Number.isInteger(requested) && requested >= 1 ? requested : 1;
    onChange(Math.min(next, max));
    if (next > max) onExceed();
  }

  return (
    <div role="group" aria-label="Số lượng" className="flex items-center border border-line bg-surface">
      <button
        type="button"
        onClick={() => commit(value - 1)}
        disabled={value <= 1}
        aria-label="Giảm số lượng"
        className={`${box} cursor-pointer disabled:cursor-default disabled:text-line`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Số lượng"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={() => draft !== null && commit(Number(draft))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`${size === "md" ? "w-10 text-[15px]" : "w-9 text-sm"} bg-transparent text-center outline-none`}
      />
      <button
        type="button"
        onClick={() => commit(value + 1)}
        aria-label="Tăng số lượng"
        className={`${box} cursor-pointer`}
      >
        +
      </button>
    </div>
  );
}
