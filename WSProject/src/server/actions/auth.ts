"use server";

import { redirect } from "next/navigation";
import { endAdminSession, startAdminSession } from "../auth/session";
import { verifyAdminCredentials } from "../services/auth";
import { invalidForm, text } from "./form-helpers";
import { loginInputSchema } from "@/lib/schemas/auth";
import type { FormState } from "@/lib/form-state";

// Only redirect back inside the admin area (prevents open redirects via ?next=).
function safeNext(next: string): string {
  return next.startsWith("/admin/") && !next.startsWith("/admin/login") ? next : "/admin/products";
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginInputSchema.safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  if (!verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
    return { message: "Email hoặc mật khẩu không đúng." };
  }

  await startAdminSession();
  redirect(safeNext(text(formData, "next")));
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
