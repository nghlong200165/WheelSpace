"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endCustomerSession, getCurrentCustomer, getCustomerId, startCustomerSession } from "../auth/customer-session";
import { safeNextPath } from "../auth/google";
import { hitRateLimit } from "../services/rate-limit";
import {
  changePassword,
  loginWithPassword,
  lookupIdentifier,
  registerUser,
  toggleWishlist,
  updateUserAddress,
} from "../services/users";
import { failedForm, invalidForm, text } from "./form-helpers";
import {
  addressInputSchema,
  parseIdentifier,
  passwordChangeSchema,
  registerInputSchema,
} from "@/lib/schemas/user";
import type { FormState } from "@/lib/form-state";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

const TOO_MANY = "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.";

// --- Login (two steps on one form: identifier, then password)

export type LoginState = FormState & {
  step: "identifier" | "password" | "google-only";
  identifier?: string;
};

export async function loginStepAction(prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = text(formData, "identifier");
  const next = safeNextPath(text(formData, "next"));
  const identifier = parseIdentifier(raw);
  if (!identifier) {
    return { step: "identifier", identifier: raw, fieldErrors: { identifier: "Nhập số điện thoại (10 số) hoặc email hợp lệ" } };
  }

  // Step 2: password submitted
  if (formData.has("password")) {
    if (hitRateLimit(`login:${await clientIp()}`, 20, 10 * 60_000)) {
      return { step: "password", identifier: identifier.value, message: TOO_MANY };
    }
    let user;
    try {
      user = await loginWithPassword(identifier, text(formData, "password"));
    } catch (err) {
      return { step: "password", identifier: identifier.value, ...failedForm(err) };
    }
    await startCustomerSession(user);
    redirect(next);
  }

  // Step 1: identifier only
  if (hitRateLimit(`lookup:${await clientIp()}`, 30, 10 * 60_000)) {
    return { step: "identifier", identifier: raw, message: TOO_MANY };
  }
  const account = await lookupIdentifier(identifier);
  if (!account.exists) {
    redirect(`/register?id=${encodeURIComponent(identifier.value)}&next=${encodeURIComponent(next)}`);
  }
  return { step: account.hasPassword ? "password" : "google-only", identifier: identifier.value };
}

// --- Register

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (hitRateLimit(`register:${await clientIp()}`, 10, 60 * 60_000)) return { message: TOO_MANY };

  const parsed = registerInputSchema.safeParse({
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  let user;
  try {
    user = await registerUser(parsed.data);
  } catch (err) {
    return failedForm(err);
  }
  await startCustomerSession(user);
  redirect(safeNextPath(text(formData, "next")));
}

// --- Account page

export async function logoutCustomerAction(): Promise<void> {
  await endCustomerSession();
  redirect("/");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentCustomer();
  if (!user) redirect("/login?next=/account");

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: text(formData, "currentPassword"),
    newPassword: text(formData, "newPassword"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  try {
    const sessionVersion = await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    // Other devices are logged out; keep this one signed in with a fresh cookie.
    await startCustomerSession({ id: user.id, sessionVersion });
  } catch (err) {
    return failedForm(err);
  }
  revalidatePath("/account");
  return { ok: true, message: user.hasPassword ? "Đã đổi mật khẩu." : "Đã đặt mật khẩu." };
}

export async function saveAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getCustomerId();
  if (!userId) redirect("/login?next=/account");

  const parsed = addressInputSchema.safeParse({
    name: text(formData, "name"),
    phone: text(formData, "phone").replace(/[\s.-]/g, ""),
    province: text(formData, "province"),
    ward: text(formData, "ward"),
    address: text(formData, "address"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  try {
    await updateUserAddress(userId, parsed.data);
  } catch (err) {
    return failedForm(err);
  }
  return { ok: true, message: "Đã lưu địa chỉ." };
}

// Returns the new state, or null when the visitor must log in first.
export async function toggleWishlistAction(productId: string): Promise<{ saved: boolean } | null> {
  const userId = await getCustomerId();
  if (!userId) return null;
  const saved = await toggleWishlist(userId, productId);
  revalidatePath("/account");
  return { saved };
}
