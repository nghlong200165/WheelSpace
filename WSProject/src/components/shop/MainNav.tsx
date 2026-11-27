"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/products", label: "SẢN PHẨM" },
  { href: "/products?rarity=rare", label: "CHASE & LIMITED" },
  { href: "/order-lookup", label: "TRA CỨU ĐƠN" },
];

// Main menu with a red underline that slides to whichever link the pointer is on.
export function MainNav() {
  const [ink, setInk] = useState({ left: 0, width: 0 });
  const [visible, setVisible] = useState(false);

  return (
    <nav
      aria-label="Điều hướng chính"
      onMouseLeave={() => setVisible(false)}
      className="relative order-3 flex w-full flex-wrap gap-x-5 gap-y-2 text-xs tracking-eyebrow sm:order-none sm:w-auto sm:gap-x-8"
    >
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onMouseEnter={(e) => {
            setInk({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
            setVisible(true);
          }}
          className="py-2"
        >
          {link.label}
        </Link>
      ))}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0.5 hidden h-0.5 bg-accent transition-[left,width,opacity] duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block"
        style={{ left: ink.left, width: ink.width, opacity: visible ? 1 : 0 }}
      />
    </nav>
  );
}
