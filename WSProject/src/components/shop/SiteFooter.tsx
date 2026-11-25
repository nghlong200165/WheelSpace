import Link from "next/link";
import type { SettingsDTO } from "@/lib/schemas/settings";

export function SiteFooter({ settings }: { settings: SettingsDTO }) {
  const { messengerUrl, contactPhone, contactEmail } = settings;
  return (
    <footer className="mt-28 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-10 px-4 pt-12 pb-6 text-[13px] text-muted sm:px-8">
        <div className="flex max-w-80 flex-col gap-3">
          <span className="text-sm font-semibold tracking-brand text-ink">WHEELSPACE</span>
          <span className="leading-relaxed">Mô hình Mini GT 1:64 chính hãng.</span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[11px] tracking-eyebrow text-ink">CỬA HÀNG</span>
          <Link href="/products">Sản phẩm</Link>
          <Link href="/order-lookup">Tra cứu đơn</Link>
        </div>
        {(messengerUrl || contactPhone || contactEmail) && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-eyebrow text-ink">LIÊN HỆ</span>
            {messengerUrl && (
              <a href={messengerUrl} target="_blank" rel="noopener noreferrer">
                Messenger
              </a>
            )}
            {contactPhone && <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>}
            {contactEmail && <a href={`mailto:${contactEmail}`}>{contactEmail}</a>}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 text-xs text-muted sm:px-8">© 2026 WheelSpace</div>
    </footer>
  );
}
