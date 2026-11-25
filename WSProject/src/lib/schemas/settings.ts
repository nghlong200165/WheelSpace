import { z } from "zod";

export const settingsInputSchema = z.object({
  shippingFee: z.coerce.number({ error: "Nhập phí ship" }).int().min(0, "Phí ship không hợp lệ"),
  // null = no free-shipping threshold.
  freeShippingThreshold: z.coerce
    .number({ error: "Ngưỡng không hợp lệ" })
    .int()
    .min(0, "Ngưỡng không hợp lệ")
    .nullable(),
  // http(s) only: this value is rendered as a link href on the storefront.
  messengerUrl: z.union([
    z.url({ protocol: /^https?$/, error: "Link phải bắt đầu bằng http:// hoặc https://" }),
    z.literal(""),
  ]),
  contactPhone: z.string().trim().max(20),
  contactEmail: z.union([z.email("Email không hợp lệ"), z.literal("")]),
  codEnabled: z.boolean(),
  payosEnabled: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
export type SettingsDTO = SettingsInput;

export const DEFAULT_SETTINGS: SettingsDTO = {
  shippingFee: 30000,
  freeShippingThreshold: null,
  messengerUrl: "",
  contactPhone: "",
  contactEmail: "",
  codEnabled: true,
  payosEnabled: true,
};
