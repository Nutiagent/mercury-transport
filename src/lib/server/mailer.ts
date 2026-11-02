import "server-only";
import { serviceBySlug } from "@/content/services";
import { urgencyOptions, type QuoteData } from "@/lib/quote-schema";

export function mailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.QUOTE_FROM_EMAIL;
  return apiKey && to && from ? { apiKey, to, from } : null;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function buildEmail(d: QuoteData, ref: string) {
  const svc = serviceBySlug(d.service)!;
  const urgency = urgencyOptions.find((o) => o.value === d.urgency)?.label;
  const rows: [string, string][] = [
    ["Teenus", svc.title],
    [svc.urgent ? "Asukoht" : "Pealevõtmine", d.pickup],
    ["Sihtkoht", d.destination || "–"],
    [svc.quote.detailsLabel, d.details],
    ["Aeg", svc.quote.timing === "urgency" ? urgency || "–" : d.date || "Paindlik"],
    ["Lisainfo", d.message || "–"],
    ["Nimi", d.name],
    ["Telefon", d.phone],
    ["E-post", d.email || "–"],
  ];
  const subject = `${svc.urgent && d.urgency === "kohe" ? "KIIRE: " : ""}Päring: ${svc.shortTitle} · ${d.name} · ${ref}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nViide: ${ref}`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111">
<h2 style="margin:0 0 12px">Uus päring veebilehelt</h2>
<table cellpadding="8" style="border-collapse:collapse;font-size:14px">
${rows.map(([k, v]) => `<tr><th align="left" style="border-bottom:1px solid #ddd;color:#555;vertical-align:top">${esc(k)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}
</table>
<p style="color:#777;font-size:12px">Viide ${esc(ref)}. Vasta sellele kirjale, et kirjutada otse kliendile${d.email ? "" : " (klient e-posti ei lisanud, helista)"}.</p>
</body></html>`;
  return { subject, text, html };
}

export async function sendEmail(d: QuoteData, ref: string) {
  const cfg = mailConfig();
  if (!cfg) throw new Error("not_configured");
  const { subject, text, html } = buildEmail(d, ref);
  const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: cfg.from,
      to: cfg.to.split(",").map((s) => s.trim()),
      reply_to: d.email || undefined,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`provider_${res.status}: ${body.slice(0, 200)}`);
  }
}
