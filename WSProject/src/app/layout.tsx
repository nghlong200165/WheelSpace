import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import { HERO_SEEN_SCRIPT } from "@/lib/hero-seen";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  // Absolute base for share-preview images (Facebook / Messenger need full URLs).
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WheelSpace · Mô hình Mini GT 1:64",
    template: "%s · WheelSpace",
  },
  description: "Mô hình Mini GT 1:64 chính hãng, chụp ảnh thật từng chiếc. Hàng có sẵn và nhận order.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the hero-seen script may add a class before React hydrates.
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Script id="hero-seen" strategy="beforeInteractive">
          {HERO_SEEN_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
