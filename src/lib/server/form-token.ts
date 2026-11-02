import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Signed timestamp issued when the form loads. Submissions must arrive
 * between MIN_MS and MAX_MS after issue, which blocks instant bot posts and replays.
 */
const MIN_MS = 2500;
const MAX_MS = 1000 * 60 * 60 * 6;
const secret = process.env.FORM_SECRET || randomBytes(32).toString("hex");

const sign = (ts: string) => createHmac("sha256", secret).update(ts).digest("base64url");

export function issueToken() {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

export function checkToken(token: unknown): "ok" | "too_fast" | "invalid" {
  if (typeof token !== "string") return "invalid";
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return "invalid";
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = Date.now() - Number(ts);
  if (age < MIN_MS) return "too_fast";
  if (age > MAX_MS) return "invalid";
  return "ok";
}
