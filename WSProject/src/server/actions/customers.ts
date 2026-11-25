"use server";

import { requireAdmin } from "../auth/session";
import { adminResetPassword } from "../services/users";
import { failedForm, text } from "./form-helpers";
import type { FormState } from "@/lib/form-state";

export type ResetPasswordState = FormState & { tempPassword?: string };

export async function resetCustomerPasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  await requireAdmin();
  try {
    const tempPassword = await adminResetPassword(text(formData, "id"));
    return { ok: true, tempPassword };
  } catch (err) {
    return failedForm(err);
  }
}
