import { getCurrentCustomer } from "@/server/auth/customer-session";
import { WishlistButton } from "./WishlistButton";

// Reads the session cookie to know whether the product is already saved; render inside <Suspense>.
export async function WishlistSlot({ productId, loginNext }: { productId: string; loginNext: string }) {
  const user = await getCurrentCustomer();
  return <WishlistButton productId={productId} saved={!!user?.wishlist.includes(productId)} loginNext={loginNext} />;
}
