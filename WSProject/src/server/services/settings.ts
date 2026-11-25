import "server-only";
import { connectDb } from "../db";
import { SETTINGS_KEY, Settings } from "../models/Settings";
import { DEFAULT_SETTINGS, type SettingsDTO, type SettingsInput } from "@/lib/schemas/settings";

export async function getSettings(): Promise<SettingsDTO> {
  await connectDb();
  const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
  if (!doc) return { ...DEFAULT_SETTINGS };
  return {
    shippingFee: doc.shippingFee,
    freeShippingThreshold: doc.freeShippingThreshold ?? null,
    messengerUrl: doc.messengerUrl ?? "",
    contactPhone: doc.contactPhone ?? "",
    contactEmail: doc.contactEmail ?? "",
    codEnabled: doc.codEnabled ?? true,
    payosEnabled: doc.payosEnabled ?? true,
  };
}

export async function updateSettings(input: SettingsInput): Promise<SettingsDTO> {
  await connectDb();
  await Settings.updateOne(
    { key: SETTINGS_KEY },
    { $set: input, $setOnInsert: { key: SETTINGS_KEY } },
    { upsert: true, runValidators: true },
  );
  return getSettings();
}
