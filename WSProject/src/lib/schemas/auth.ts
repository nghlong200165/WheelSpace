import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().trim().min(1, "Nhập email"),
  password: z.string().min(1, "Nhập mật khẩu"),
});
