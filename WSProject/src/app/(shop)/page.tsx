import Image from "next/image";
import Link from "next/link";
import { HeroSlider, type HeroSlide } from "@/components/shop/HeroSlider";
import { ProductCard } from "@/components/shop/ProductCard";
import { ArrowRightIcon, ChatIcon } from "@/components/shop/icons";
import { getBannerProducts, getNewArrivals, getRareProducts, getStoreSettings } from "@/server/queries/storefront";

const PROMISES = [
  { title: "Ảnh chụp thật", text: "Bạn thấy đúng chiếc xe và tình trạng hộp mình sẽ nhận." },
  { title: "Đóng gói chống móp", text: "Hộp và blister được bảo vệ nhiều lớp khi vận chuyển." },
  { title: "COD hoặc chuyển khoản", text: "Thanh toán khi nhận hàng, hoặc quét mã QR qua payOS." },
];

export default async function HomePage() {
  const [bannerProducts, newArrivals, rareProducts, settings] = await Promise.all([
    getBannerProducts(6),
    getNewArrivals(4),
    getRareProducts(3),
    getStoreSettings(),
  ]);
  const slides: HeroSlide[] = bannerProducts.map((p) => ({ id: p.id, name: p.name, code: p.code, image: p.images[0] }));

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-14 px-4 pt-12 sm:px-8 sm:pt-18">
        <div className="flex flex-[1_1_380px] flex-col gap-7">
          <span className="text-xs tracking-[0.2em] text-muted">MINI GT · TỈ LỆ 1:64</span>
          <h1 className="text-[40px] leading-[1.08] font-light tracking-tight sm:text-[56px]">
            Từng chi tiết,
            <br />
            thu nhỏ hoàn hảo.
          </h1>
          <p className="max-w-110 text-base leading-relaxed text-muted">
            Mô hình Mini GT chính hãng, chụp ảnh thật từng chiếc. Hàng có sẵn giao ngay, mẫu hiếm nhận order theo yêu cầu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white hover:text-white"
            >
              XEM BỘ SƯU TẬP <ArrowRightIcon size={16} />
            </Link>
            <Link
              href="/products?rarity=rare"
              className="inline-flex items-center border border-ink px-7 py-4 text-[13px] tracking-[0.12em]"
            >
              CHASE &amp; LIMITED
            </Link>
          </div>
        </div>
        <div className="relative aspect-16/10 flex-[1_1_560px] overflow-hidden bg-placeholder">
          {slides.length > 0 ? (
            <HeroSlider slides={slides} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs tracking-eyebrow text-muted">
              WHEELSPACE · MINI GT 1:64
            </span>
          )}
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-28 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs tracking-[0.2em] text-muted">MỚI VỀ</span>
              <h2 className="text-[32px] font-light tracking-tight">Hàng mới cập bến</h2>
            </div>
            <Link href="/products" className="py-3 text-[13px] tracking-[0.12em]">
              XEM TẤT CẢ →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 50vw" />
            ))}
          </div>
        </section>
      )}

      {/* Chase & Limited */}
      {rareProducts.length > 0 && (
        <section className="mt-28 bg-ink text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-4 py-22 sm:px-8">
            <div className="flex flex-[1_1_320px] flex-col gap-5">
              <span className="text-xs tracking-[0.2em] text-[#a8a8a8]">PHIÊN BẢN ĐẶC BIỆT</span>
              <h2 className="text-4xl leading-tight font-light">Chase &amp; Limited</h2>
              <p className="max-w-95 text-[15px] leading-relaxed text-[#c9c9c9]">
                Những mẫu số lượng giới hạn và bản Chase hiếm gặp. Mỗi chiếc được kiểm tra hộp và chụp ảnh riêng.
              </p>
              <Link
                href="/products?rarity=rare"
                className="self-start border border-white px-7 py-4 text-[13px] tracking-[0.12em] text-white hover:text-white"
              >
                KHÁM PHÁ
              </Link>
            </div>
            <div className="grid flex-[2_1_560px] grid-cols-3 gap-2 sm:gap-4">
              {rareProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group flex flex-col gap-3 text-white hover:text-white">
                  <div className="relative aspect-3/4 overflow-hidden bg-[#2a2a2a]">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1280px) 260px, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-eyebrow text-[#a8a8a8]">
                        CHƯA CÓ ẢNH
                      </span>
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] tracking-eyebrow ${
                        p.rarity === "chase" ? "bg-accent" : "bg-white text-ink"
                      }`}
                    >
                      {p.rarity === "chase" ? "CHASE" : "LIMITED"}
                    </span>
                  </div>
                  <span className="text-xs leading-snug sm:text-sm">{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order on request */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-28 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-8 border border-line px-6 py-12 sm:px-12 sm:py-14">
          <div className="flex max-w-140 flex-col gap-3">
            <h2 className="text-[28px] font-light">Chưa thấy mẫu bạn cần?</h2>
            <p className="text-[15px] leading-relaxed text-muted">
              Nhắn tin cho chúng tôi để kiểm tra nguồn hàng, giá và thời gian order.
            </p>
          </div>
          {settings.messengerUrl && (
            <a
              href={settings.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-ink px-7 py-4 text-[13px] tracking-[0.12em] text-white hover:text-white"
            >
              <ChatIcon /> NHẮN TIN ĐỂ ORDER
            </a>
          )}
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-8 px-4 pt-24 sm:px-8">
        {PROMISES.map((item) => (
          <div key={item.title} className="flex flex-col gap-2 border-t border-ink pt-5">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-sm leading-relaxed text-muted">{item.text}</span>
          </div>
        ))}
      </section>
    </>
  );
}
