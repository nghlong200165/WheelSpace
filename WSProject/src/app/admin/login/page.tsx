import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-100 flex-col gap-6 bg-surface px-10 py-12">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold tracking-brand">WHEELSPACE</span>
          <span className="text-xs tracking-eyebrow text-muted">QUẢN TRỊ</span>
        </div>
        {/* LoginForm reads ?next= from the URL, which is only known at request time. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
