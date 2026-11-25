import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { AddressForm } from "@/components/shop/AddressForm";
import { PasswordForm } from "@/components/shop/PasswordForm";
import { ProductCard } from "@/components/shop/ProductCard";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { buttonSecondary } from "@/components/ui/fields";
import { logoutCustomerAction } from "@/server/actions/account";
import { requireCustomer } from "@/server/auth/customer-session";
import { listVisibleProductsByIds } from "@/server/services/products";

export const metadata: Metadata = { title: "Tài khoản", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-14 sm:px-8">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.2em] text-muted">TÀI KHOẢN</span>
        <h1 className="text-4xl font-light tracking-tight">Tài khoản của tôi</h1>
      </div>
      {/* Reads the session cookie: streams in at request time. */}
      <Suspense fallback={<p className="text-sm text-muted">Đang tải…</p>}>
        <AccountContent />
      </Suspense>
    </div>
  );
}

async function AccountContent() {
  const user = await requireCustomer("/account");
  const wishlist = await listVisibleProductsByIds([...user.wishlist].reverse());

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-10">
        <div className="flex items-center gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-placeholder">
            {user.avatarUrl && <Image src={user.avatarUrl} alt="" fill sizes="56px" className="object-cover" />}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg">{user.name}</span>
            <span className="text-sm text-muted">
              {[user.phone, user.email].filter(Boolean).join(" · ")}
              {user.hasGoogle && " · đã liên kết Google"}
            </span>
          </div>
        </div>
        <form action={logoutCustomerAction}>
          <button type="submit" className={`${buttonSecondary} cursor-pointer`}>
            Đăng xuất
          </button>
        </form>
      </section>

      <section className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xs font-medium tracking-eyebrow">ĐỊA CHỈ GIAO HÀNG</h2>
            <p className="text-sm text-muted">Dùng để điền sẵn khi bạn đặt hàng.</p>
          </div>
          <div className="bg-surface p-6 sm:p-7">
            <AddressForm address={user.address} defaultName={user.name} />
          </div>

          <div className="flex flex-col gap-1.5 pt-6">
            <h2 className="text-xs font-medium tracking-eyebrow">MẬT KHẨU</h2>
            <p className="text-sm text-muted">
              {user.hasPassword
                ? "Đổi mật khẩu dùng để đăng nhập bằng số điện thoại / email."
                : "Bạn chưa có mật khẩu. Đặt mật khẩu để đăng nhập bằng số điện thoại / email, không cần Google."}
            </p>
          </div>
          <div className="bg-surface p-6 sm:p-7">
            <PasswordForm hasPassword={user.hasPassword} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xs font-medium tracking-eyebrow">ĐƠN HÀNG</h2>
            <p className="text-sm text-muted">Các đơn bạn đặt khi đã đăng nhập sẽ hiện ở đây.</p>
          </div>
          <p className="bg-surface px-7 py-10 text-sm text-muted">Bạn chưa có đơn hàng nào.</p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xs font-medium tracking-eyebrow">WISHLIST ({wishlist.length})</h2>
          <p className="text-sm text-muted">Mẫu bạn đã lưu. Mẫu hết hàng có thể nhắn tin để order.</p>
        </div>
        {wishlist.length === 0 ? (
          <p className="bg-surface px-7 py-10 text-sm text-muted">
            Chưa có mẫu nào. Bấm biểu tượng trái tim ở trang sản phẩm để lưu.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {wishlist.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
                <div className="absolute top-2 right-2">
                  <WishlistButton productId={p.id} saved loginNext="/account" compact />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
