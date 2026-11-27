import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { getStoreSettings } from "@/server/queries/storefront";

export const metadata: Metadata = { title: "Giỏ hàng", robots: { index: false } };

export default async function CartPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:px-8">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.2em] text-muted">GIỎ HÀNG</span>
        <h1 className="text-4xl font-light tracking-tight">Giỏ hàng của bạn</h1>
      </div>
      <CartView
        shippingFee={settings.shippingFee}
        freeShippingThreshold={settings.freeShippingThreshold}
        messengerUrl={settings.messengerUrl}
        contactPhone={settings.contactPhone}
      />
    </div>
  );
}
