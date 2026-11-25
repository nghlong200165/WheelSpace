import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/server/auth/session";
import { env } from "@/server/env";
import { getSettings } from "@/server/services/settings";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return <SettingsForm settings={settings} payosLive={env().PAYMENT_PROVIDER === "payos"} />;
}
