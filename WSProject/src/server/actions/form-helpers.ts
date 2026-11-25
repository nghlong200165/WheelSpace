import "server-only";
import type { z } from "zod";
import { ServiceError } from "../services/errors";
import type { FormState } from "@/lib/form-state";

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// "350.000" / "350,000 ₫" -> "350000"; empty stays undefined so the schema reports it as missing.
export function digits(formData: FormData, name: string): string | undefined {
  const value = text(formData, name).replace(/\D/g, "");
  return value === "" ? undefined : value;
}

export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export function invalidForm(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { message: "Vui lòng kiểm tra lại các trường được đánh dấu.", fieldErrors };
}

export function failedForm(err: unknown): FormState {
  if (err instanceof ServiceError) {
    return { message: err.message, fieldErrors: err.field ? { [err.field]: err.message } : undefined };
  }
  console.error(err);
  return { message: "Có lỗi xảy ra, vui lòng thử lại." };
}
