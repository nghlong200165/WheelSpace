import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
});

// Absolute base for share-preview images (Facebook / Messenger need full URLs).
// APP_URL when set, else the Vercel production domain, else local dev.
const siteUrl =
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WheelSpace · Mô hình Mini GT 1:64",
    template: "%s · WheelSpace",
  },
  description: "Mô hình Mini GT 1:64 chính hãng, chụp ảnh thật từng chiếc. Hàng có sẵn và nhận order.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
