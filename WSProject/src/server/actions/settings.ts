"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "../auth/session";
import { CACHE_TAGS } from "../cache-tags";
import { updateSettings } from "../services/settings";
import { checkbox, digits, failedForm, invalidForm, text } from "./form-helpers";
import { settingsInputSchema } from "@/lib/schemas/settings";
import type { FormState } from "@/lib/form-state";

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = settingsInputSchema.safeParse({
    shippingFee: digits(formData, "shippingFee"),
    freeShippingThreshold: digits(formData, "freeShippingThreshold") ?? null,
    messengerUrl: text(formData, "messengerUrl").trim(),
    contactPhone: text(formData, "contactPhone"),
    contactEmail: text(formData, "contactEmail").trim(),
    codEnabled: checkbox(formData, "codEnabled"),
    payosEnabled: checkbox(formData, "payosEnabled"),
  });
  if (!parsed.success) return invalidForm(parsed.error);

  try {
    await updateSettings(parsed.data);
  } catch (err) {
    return failedForm(err);
  }

  updateTag(CACHE_TAGS.settings);
  return { ok: true, message: "Đã lưu cài đặt." };
}
