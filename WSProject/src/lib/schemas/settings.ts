import { z } from "zod";

export const settingsInputSchema = z.object({
  shippingFee: z.coerce.number().int().min(0, "Phí ship không hợp lệ"),
  // null = no free-shipping threshold.
  freeShippingThreshold: z.coerce.number().int().min(0).nullable(),
  messengerUrl: z.union([z.url("Link không hợp lệ"), z.literal("")]),
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
