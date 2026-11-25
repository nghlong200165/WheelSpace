import "server-only";
import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";
import { DEFAULT_SETTINGS } from "@/lib/schemas/settings";

// Single document holding store-wide settings editable from the admin.
export const SETTINGS_KEY = "store";

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SETTINGS_KEY },
    shippingFee: { type: Number, required: true, min: 0, default: DEFAULT_SETTINGS.shippingFee },
    freeShippingThreshold: { type: Number, min: 0, default: null },
    messengerUrl: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    codEnabled: { type: Boolean, default: true },
    payosEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof settingsSchema>;

// Replace the cached model on dev hot reload (see Product.ts).
if (models.Settings) deleteModel("Settings");
export const Settings: Model<SettingsDoc> = model<SettingsDoc>("Settings", settingsSchema);
