import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-5 px-4 py-24 sm:px-8">
      <span className="text-xs tracking-[0.2em] text-muted">404</span>
      <h1 className="text-4xl font-light tracking-tight">Không tìm thấy sản phẩm</h1>
      <p className="text-[15px] leading-relaxed text-muted">
        Mẫu này có thể đã ngừng bán hoặc đường dẫn không đúng. Xem các mẫu đang có, hoặc nhắn tin để chúng tôi kiểm tra
        nguồn order.
      </p>
      <Link href="/products" className="bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white hover:text-white">
        XEM BỘ SƯU TẬP
      </Link>
    </section>
  );
}
