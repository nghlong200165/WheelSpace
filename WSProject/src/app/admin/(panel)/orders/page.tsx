import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: "Đơn hàng" };

// Placeholder until phase 4 (checkout + order management).
export default async function AdminOrdersPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-[28px] font-normal">Đơn hàng</h1>
      <p className="bg-surface px-7 py-10 text-sm text-muted">Quản lý đơn hàng sẽ có ở phần 4 (đặt hàng & thanh toán).</p>
    </>
  );
}
