import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginFlow } from "@/components/shop/LoginFlow";
import { GoogleIcon } from "@/components/shop/icons";
import { googleConfig, safeNextPath } from "@/server/auth/google";
import { getStoreSettings } from "@/server/queries/storefront";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

const ERRORS: Record<string, string> = {
  cancelled: "Bạn đã hủy đăng nhập bằng Google.",
  expired: "Phiên đăng nhập đã hết hạn, vui lòng thử lại.",
  failed: "Không đăng nhập được bằng Google, vui lòng thử lại.",
  not_configured: "Đăng nhập Google chưa được cấu hình.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.2em] text-muted">TÀI KHOẢN</span>
        <h1 className="text-4xl font-light tracking-tight">Đăng nhập</h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Không bắt buộc. Bạn vẫn có thể mua hàng mà không cần tài khoản.
        </p>
      </div>

      {/* ?next= and ?error= come from the URL, which is only known at request time. */}
      <Suspense fallback={<p className="text-sm text-muted">Đang tải…</p>}>
        <LoginContent searchParams={searchParams} />
      </Suspense>

      <Link href="/" className="text-[13px] text-muted underline">
        ← Tiếp tục mua sắm không cần đăng nhập
      </Link>
    </section>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const [params, settings] = await Promise.all([searchParams, getStoreSettings()]);
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const googleEnabled = googleConfig() !== null;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p role="alert" className="border border-accent px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}
      <LoginFlow next={next} messengerUrl={settings.messengerUrl} />

      <div className="flex items-center gap-4 text-xs tracking-eyebrow text-muted">
        <span className="h-px flex-1 bg-line" />
        HOẶC
        <span className="h-px flex-1 bg-line" />
      </div>

      {googleEnabled ? (
        // Plain <a>: this is a full-page redirect to Google, not a client-side navigation.
        <a
          href={`/auth/google?next=${encodeURIComponent(next)}`}
          className="flex min-h-13 items-center justify-center gap-3 border border-ink bg-surface px-6 text-sm font-medium"
        >
          <GoogleIcon />
          Tiếp tục với Google
        </a>
      ) : (
        <p className="border border-line bg-surface px-4 py-3 text-sm text-muted">
          Đăng nhập Google chưa được cấu hình (thiếu GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).
        </p>
      )}
    </div>
  );
}
