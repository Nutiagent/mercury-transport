import { NextResponse, type NextRequest } from "next/server";
import { validateQuote } from "@/lib/quote-schema";
import { checkToken, issueToken } from "@/lib/server/form-token";
import { rateLimit } from "@/lib/server/rate-limit";
import { mailConfig, sendEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: object, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Issues a form token and tells the UI whether delivery is configured. */
export async function GET() {
  return json({ token: issueToken(), configured: Boolean(mailConfig()) });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`quote:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return json({ ok: false, code: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfter) });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 20_000) return json({ ok: false, code: "too_large" }, 413);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  // Honeypot: real visitors never see or fill this field. Pretend success to bots.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, ref: "MT-000000" });
  }

  const token = checkToken(body.token);
  if (token === "too_fast") return json({ ok: false, code: "too_fast" }, 400);
  if (token === "invalid") return json({ ok: false, code: "expired" }, 400);

  const result = validateQuote(body);
  if (!result.ok) return json({ ok: false, code: "invalid", errors: result.errors }, 422);

  const d = result.data;
  const links = (d.message + d.details).match(/https?:\/\//gi)?.length || 0;
  if (links > 2) return json({ ok: false, code: "spam" }, 400);

  if (!mailConfig()) return json({ ok: false, code: "not_configured" }, 503);

  const ref = `MT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  try {
    await sendEmail(d, ref);
  } catch (e) {
    console.error("[quote] delivery failed", e instanceof Error ? e.message : e);
    return json({ ok: false, code: "delivery_failed" }, 502);
  }
  return json({ ok: true, ref });
}
