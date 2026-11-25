import "server-only";
import { connectDb } from "../db";

export type HealthStatus = { ok: boolean; database: "up" | "down"; error?: string };

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const mongoose = await connectDb();
    await mongoose.connection.db?.admin().ping();
    return { ok: true, database: "up" };
  } catch (err) {
    return { ok: false, database: "down", error: err instanceof Error ? err.message : String(err) };
  }
}
