import Image from "next/image";
import Link from "next/link";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { GiantType } from "@/components/home/GiantType";
import { ProductRail, RailItem } from "@/components/home/ProductRail";
import { HeroSeen } from "@/components/motion/HeroSeen";
import { Spotlight, TiltCard } from "@/components/home/Spotlight";
import { HeroSlider, type HeroSlide } from "@/components/shop/HeroSlider";
import { ProductCard } from "@/components/shop/ProductCard";
import { SpecPlate } from "@/components/shop/SpecPlate";
import { ArrowRightIcon, ChatIcon } from "@/components/shop/icons";
import {
  getBannerProducts,
  getBrandCounts,
  getNewArrivals,
  getRareProducts,
  getStoreSettings,
} from "@/server/queries/storefront";
import { BRANDS } from "@/lib/brands";
import { formatVnd } from "@/lib/format";
import { parseCatalogParams } from "@/lib/schemas/catalog";
import { productHref } from "@/lib/slug";

const PROMISES = [
  { title: "Ảnh chụp thật", text: "Bạn thấy đúng chiếc xe và tình trạng hộp mình sẽ nhận." },
  { title: "Đóng gói chống móp", text: "Hộp và blister được bảo vệ nhiều lớp khi vận chuyển." },
  { title: "COD hoặc chuyển khoản", text: "Thanh toán khi nhận hàng, hoặc quét mã QR qua payOS." },
];

const ORDER_STEPS = ["Gửi mã hoặc ảnh mẫu xe", "Nhận báo giá và thời gian về", "Đặt cọc, nhận hàng tận tay"];

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default async function HomePage() {
  const [bannerProducts, newArrivals, rareProducts, brandCounts, settings] = await Promise.all([
    getBannerProducts(6),
    getNewArrivals(8),
    getRareProducts(3),
    getBrandCounts(parseCatalogParams({})),
    getStoreSettings(),
  ]);
  const slides: HeroSlide[] = bannerProducts.map((p) => ({ id: p.id, name: p.name, code: p.code, image: p.images[0] }));
  const brands = BRANDS.filter((b) => b !== "Khác" && brandCounts[b]);

  return (
    <>
      {/* Hero. data-hero drives the once-per-session "corner entry" (globals.css). */}
      <section className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-14 px-4 pt-12 sm:px-8 sm:pt-18">
        <HeroSeen />
        <div className="flex flex-[1_1_380px] flex-col gap-7">
          <span data-hero="fade" className="text-xs tracking-[0.2em] text-muted">
            MINI GT · TỈ LỆ 1:64
          </span>
          <h1 className="text-[40px] leading-[1.08] font-light tracking-tight sm:text-[56px]">
            {/* The padding keeps Vietnamese accents from being clipped while the line slides in. */}
            <span data-hero="line" className="-my-[0.12em] block overflow-hidden py-[0.12em]">
              <span className="block">Từng chi tiết,</span>
            </span>
            <span data-hero="line" className="-my-[0.12em] block overflow-hidden py-[0.12em]">
              <span className="block">thu nhỏ hoàn hảo.</span>
            </span>
          </h1>
          <p data-hero="fade" style={stagger(2)} className="max-w-110 text-base leading-relaxed text-muted">
            Mô hình Mini GT chính hãng, chụp ảnh thật từng chiếc. Hàng có sẵn giao ngay, mẫu hiếm nhận order theo yêu cầu.
          </p>
          <div data-hero="fade" style={stagger(3)} className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="btn-sweep inline-flex items-center gap-2.5 bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white"
            >
              XEM BỘ SƯU TẬP <ArrowRightIcon size={16} />
            </Link>
            <Link
              href="/products?rarity=rare"
              className="inline-flex items-center border border-ink px-7 py-4 text-[13px] tracking-[0.12em] transition-colors duration-300 hover:bg-ink hover:text-white"
            >
              CHASE &amp; LIMITED
            </Link>
          </div>
        </div>
        <div data-hero="frame" className="relative aspect-16/10 flex-[1_1_560px] overflow-hidden bg-placeholder">
          {slides.length > 0 ? (
            <HeroSlider slides={slides} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs tracking-eyebrow text-muted">
              WHEELSPACE · MINI GT 1:64
            </span>
          )}
          <span
            data-hero="streak"
            aria-hidden="true"
            className="pointer-events-none absolute top-[58%] -left-[40%] z-10 h-0.5 w-[40%] bg-[linear-gradient(90deg,transparent,#fff_70%,transparent)] opacity-0"
          />
        </div>
      </section>

      <GiantType />
      {brands.length > 0 && <BrandMarquee brands={brands} />}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <ProductRail
          eyebrow="01 — MỚI VỀ"
          title={
            <>
              Vừa cập bến
              <br />
              tuần này
            </>
          }
        >
          {newArrivals.map((p, i) => (
            <RailItem key={p.id}>
              <ProductCard product={p} sizes="340px" index={i} />
            </RailItem>
          ))}
        </ProductRail>
      )}

      {/* Chase & Limited */}
      {rareProducts.length > 0 && (
        <Spotlight className="mt-32 bg-[#0d0d0d] text-white">
          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-28 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div data-reveal className="flex flex-col gap-3">
                <span className="text-[13px] tracking-[0.14em] text-[#ff5a64] tabular-nums">02 — CHASE &amp; LIMITED</span>
                <h2 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05] font-extralight tracking-tight">
                  Số lượng có hạn.
                  <br />
                  Đến trước, có trước.
                </h2>
              </div>
              <div data-reveal style={stagger(1)} className="flex max-w-95 flex-col items-start gap-6">
                <p className="text-sm leading-relaxed text-[#a5a5a5]">
                  Những mẫu Chase và Limited Edition sản xuất số lượng giới hạn. Mỗi chiếc được kiểm tra hộp và chụp ảnh riêng.
                </p>
                <Link
                  href="/products?rarity=rare"
                  className="inline-flex items-center gap-2.5 text-[13px] tracking-[0.12em] text-white underline-offset-8 hover:text-white hover:underline"
                >
                  KHÁM PHÁ TẤT CẢ <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {rareProducts.map((p, i) => (
                <div key={p.id} data-reveal style={stagger(i)}>
                  <TiltCard className="h-full">
                    <Link
                      href={productHref(p)}
                      className="group/card flex h-full flex-col gap-4 border border-[#262626] bg-[#111] p-3.5 text-white transition-colors duration-500 hover:border-accent/70 hover:text-white"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-[#1a1a1a]">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="object-cover transition-transform duration-1100 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.07]"
                          />
                        ) : (
                          <SpecPlate code={p.code} brand={p.brand} size="lg" />
                        )}
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] tracking-eyebrow ${
                            p.rarity === "chase" ? "bg-accent" : "bg-white text-ink"
                          }`}
                        >
                          {p.rarity === "chase" ? "CHASE" : "LIMITED"}
                        </span>
                        {p.stock === 0 && (
                          <span className="absolute top-3 right-3 bg-white px-2.5 py-1 text-[10px] tracking-eyebrow text-ink">
                            HẾT HÀNG
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] tracking-[0.14em] text-[#8d8d8d]">
                        {p.code} · {p.brand.toUpperCase()}
                      </span>
                      <span className="text-lg leading-snug">{p.name}</span>
                      <span className="mt-auto tabular-nums">{formatVnd(p.price)}</span>
                    </Link>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </Spotlight>
      )}

      {/* Order on request */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-30 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col items-start">
          <span data-reveal className="text-[13px] tracking-[0.14em] text-accent tabular-nums">
            03 — NHẬN ORDER
          </span>
          <h2 data-reveal style={stagger(1)} className="mt-4 text-[clamp(34px,5vw,64px)] leading-[1.05] font-extralight tracking-tight">
            Chưa thấy mẫu
            <br />
            bạn cần?
          </h2>
          <p data-reveal style={stagger(2)} className="mt-6 mb-8 max-w-115 text-[15px] leading-relaxed text-muted">
            Nhắn tin cho chúng tôi mã hoặc tên mẫu xe. Chúng tôi kiểm tra nguồn hàng, báo giá và thời gian về.
          </p>
          {settings.messengerUrl && (
            <a
              data-reveal
              style={stagger(3)}
              href={settings.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sweep inline-flex items-center gap-2.5 bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white"
            >
              <ChatIcon /> NHẮN TIN ĐỂ ORDER
            </a>
          )}
        </div>
        <ol className="flex flex-col border-t border-line">
          {ORDER_STEPS.map((step, i) => (
            <li key={step} data-reveal style={stagger(i + 1)} className="flex items-baseline gap-6 border-b border-line py-6">
              <span className="w-7 shrink-0 text-[13px] font-medium tracking-[0.1em] text-accent tabular-nums">0{i + 1}</span>
              <span className="text-base">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Promises */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-8 px-4 pt-28 sm:px-8">
        {PROMISES.map((item, i) => (
          <div key={item.title} data-reveal style={stagger(i)} className="flex flex-col gap-2 border-t border-ink pt-5">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-sm leading-relaxed text-muted">{item.text}</span>
          </div>
        ))}
      </section>
    </>
  );
}
