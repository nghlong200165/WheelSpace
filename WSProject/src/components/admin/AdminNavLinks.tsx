"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export function NavLinks({ pathname }: { pathname: string | null }) {
  return LINKS.map((link) => {
    const active = !!pathname?.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={`px-3 py-3 text-sm ${active ? "bg-ground font-medium" : ""}`}
      >
        {link.label}
      </Link>
    );
  });
}

// The pathname is only known at request time, so this part streams in behind a Suspense boundary.
export function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}
