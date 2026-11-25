import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s · Quản trị WheelSpace" },
  robots: { index: false },
};

// Admin pages read the session cookie on every request, so navigations block on the server.
// That is fine for an internal tool; opt out of instant-navigation validation.
export const instant = false;

// Static shell only: each page checks the session itself behind loading.tsx's Suspense boundary.
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AdminNav />
      <main className="flex min-w-0 flex-1 flex-col gap-7 px-6 py-10 md:px-12">{children}</main>
    </div>
  );
}
