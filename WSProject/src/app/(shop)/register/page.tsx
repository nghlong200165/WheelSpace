import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/shop/RegisterForm";
import { safeNextPath } from "@/server/auth/google";
import { parseIdentifier } from "@/lib/schemas/user";

export const metadata: Metadata = { title: "Đăng ký", robots: { index: false } };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.2em] text-muted">TÀI KHOẢN</span>
        <h1 className="text-4xl font-light tracking-tight">Đăng ký</h1>
      </div>
      {/* ?id= (from the login step) and ?next= are only known at request time. */}
      <Suspense fallback={<p className="text-sm text-muted">Đang tải…</p>}>
        <RegisterContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function RegisterContent({ searchParams }: { searchParams: PageProps<"/register">["searchParams"] }) {
  const params = await searchParams;
  const prefill = typeof params.id === "string" ? parseIdentifier(params.id) : null;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);

  return (
    <div className="flex flex-col gap-6">
      {prefill && (
        <p className="border border-line bg-surface px-4 py-3 text-sm leading-relaxed">
          <strong className="font-medium">{prefill.value}</strong> chưa có tài khoản. Điền thông tin bên dưới để tạo tài khoản mới.
        </p>
      )}
      <RegisterForm prefill={prefill} next={next} />
      <p className="text-[13px] text-muted">
        Đã có tài khoản?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
