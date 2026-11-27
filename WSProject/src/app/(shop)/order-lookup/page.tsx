import type { Metadata } from "next";
import { OrderLookup } from "@/components/shop/OrderLookup";
import { getStoreSettings } from "@/server/queries/storefront";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng",
  description: "Xem tình trạng đơn hàng WheelSpace bằng mã đơn và số điện thoại đặt hàng.",
  robots: { index: false },
};

export default async function OrderLookupPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-14 sm:px-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs tracking-[0.2em] text-muted">TRA CỨU ĐƠN</span>
        <h1 className="text-[clamp(36px,5vw,56px)] leading-[1.05] font-extralight tracking-tight">
          Đơn của bạn
          <br />
          đang ở đâu?
        </h1>
        <p className="max-w-110 text-[15px] leading-relaxed text-muted">
          Nhập mã đơn trong tin nhắn xác nhận và số điện thoại bạn dùng khi đặt hàng.
        </p>
      </div>
      <OrderLookup messengerUrl={settings.messengerUrl} />
    </div>
  );
}
