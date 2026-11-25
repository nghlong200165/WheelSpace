import "server-only";

// Small in-memory fixed-window limiter. Good enough for one server/demo; on serverless each
// instance keeps its own counters, so per-account lockout (stored in MongoDB) is the real guard.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function hitRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count++;
  return bucket.count > limit;
}
