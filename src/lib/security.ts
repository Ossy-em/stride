/**
 * Small server-side safety helpers shared by the API routes.
 */
import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/** Escape text before it goes into an HTML email. */
export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Compare secrets without leaking how many characters matched. */
export function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

/** Best guess at the caller's IP (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Simple fixed-window rate limit kept in memory. Each server instance counts
 * on its own, so it's a speed bump against floods, not an exact quota.
 */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.n += 1;
  return b.n <= max;
}
