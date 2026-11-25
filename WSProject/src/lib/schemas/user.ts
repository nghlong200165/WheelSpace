import { z } from "zod";
import { phoneSchema } from "./order";

export const MIN_PASSWORD_LENGTH = 8;

// "0901 234 567" / "+84901234567" -> "0901234567"
export function normalizePhone(input: string): string {
  const compact = input.replace(/[\s.()-]/g, "");
  return compact.startsWith("+84") ? `0${compact.slice(3)}` : compact;
}

export type Identifier = { kind: "phone"; value: string } | { kind: "email"; value: string };

// Login step 1 accepts either a Vietnamese phone number or an email address.
export function parseIdentifier(input: string): Identifier | null {
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    const email = trimmed.toLowerCase();
    return z.email().safeParse(email).success ? { kind: "email", value: email } : null;
  }
  const phone = normalizePhone(trimmed);
  return /^0\d{9}$/.test(phone) ? { kind: "phone", value: phone } : null;
}

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`)
  .max(128, "Mật khẩu quá dài");

export const registerInputSchema = z
  .object({
    name: z.string().trim().min(1, "Nhập họ tên").max(120),
    phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.union([z.email("Email không hợp lệ"), z.literal("")])),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Mật khẩu nhập lại không khớp" });

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Mật khẩu nhập lại không khớp" });

// Default shipping address saved on the customer's account (pre-fills checkout).
export const addressInputSchema = z.object({
  name: z.string().trim().min(1, "Nhập họ tên").max(120),
  phone: phoneSchema,
  province: z.string().trim().min(1, "Nhập tỉnh / thành phố").max(120),
  ward: z.string().trim().min(1, "Nhập phường / xã").max(120),
  address: z.string().trim().min(1, "Nhập địa chỉ").max(300),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export type UserDTO = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  sessionVersion: number;
  address: AddressInput | null;
  wishlist: string[];
  createdAt: string;
};
