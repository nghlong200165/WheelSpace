import { connection } from "next/server";
import { checkHealth } from "@/server/services/health";

export async function GET() {
  // Always run at request time; a prerendered health check would be meaningless.
  await connection();
  const health = await checkHealth();
  return Response.json(health, { status: health.ok ? 200 : 503 });
}
