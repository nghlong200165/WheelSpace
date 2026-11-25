// Temporary landing page for phase 1 (project skeleton). Replaced by the real shop home in phase 3.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-7 px-8 py-24">
      <span className="text-[15px] font-semibold tracking-brand">WHEELSPACE</span>
      <span className="text-xs tracking-eyebrow text-muted">MINI GT · TỈ LỆ 1:64</span>
      <h1 className="text-5xl leading-tight font-light tracking-tight">
        Từng chi tiết,
        <br />
        thu nhỏ hoàn hảo.
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted">
        Cửa hàng đang được xây dựng. Kiểm tra kết nối database tại{" "}
        <a href="/api/health" className="underline">
          /api/health
        </a>
        .
      </p>
    </main>
  );
}
