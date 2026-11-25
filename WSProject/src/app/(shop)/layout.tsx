import { MessengerButton } from "@/components/shop/MessengerButton";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { getStoreSettings } from "@/server/queries/storefront";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const settings = await getStoreSettings();
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter settings={settings} />
      <MessengerButton url={settings.messengerUrl} />
    </>
  );
}
