import { z } from "zod";
import { serviceBySlug, serviceSlugs } from "@/content/services";

/** Shared by the browser form and the API route, so both validate identically. */

export const urgencyOptions = [
  { value: "kohe", label: "Kohe, olen teel hätta jäänud" },
  { value: "tana", label: "Täna" },
  { value: "kokkuleppel", label: "Sobival ajal" },
] as const;

export type QuoteField =
  | "service"
  | "pickup"
  | "destination"
  | "details"
  | "urgency"
  | "date"
  | "message"
  | "name"
  | "phone"
  | "email";

export type QuoteInput = Record<QuoteField, string>;

export const emptyQuote: QuoteInput = {
  service: "",
  pickup: "",
  destination: "",
  details: "",
  urgency: "",
  date: "",
  message: "",
  name: "",
  phone: "",
  email: "",
};

const PHONE = /^\+?[0-9][0-9\s()-]{5,18}[0-9]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (max: number) =>
  z.preprocess((v) => v ?? "", z.string().trim().max(max, `Palun lühenda, kuni ${max} tähemärki.`));

const baseSchema = z.object({
  service: z.enum(serviceSlugs, { message: "Vali teenus." }),
  pickup: text(200),
  destination: text(200),
  details: text(500),
  urgency: text(20),
  date: text(10),
  message: text(2000),
  name: text(100),
  phone: text(30),
  email: text(200),
});

function todayIso() {
  const d = new Date();
  // Estonia is UTC+2/+3; allow "today" for anyone in Europe.
  d.setUTCHours(d.getUTCHours() - 12);
  return d.toISOString().slice(0, 10);
}

export const quoteSchema = baseSchema.superRefine((v, ctx) => {
  const svc = serviceBySlug(v.service);
  if (!svc) return;
  const add = (path: QuoteField, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

  if (v.pickup.length < 2) add("pickup", svc.urgent ? "Kirjuta, kus sõiduk asub." : "Kirjuta pealevõtmise koht.");
  if (svc.quote.destination === "required" && v.destination.length < 2) add("destination", "Kirjuta sihtkoht.");
  if (v.details.length < 2) add("details", `Kirjelda lühidalt: ${svc.quote.detailsLabel.toLowerCase()}.`);

  if (svc.quote.timing === "urgency") {
    if (!urgencyOptions.some((o) => o.value === v.urgency)) add("urgency", "Vali, kui kiiresti abi vajad.");
  } else if (v.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(Date.parse(v.date))) add("date", "Kontrolli kuupäeva.");
    else if (v.date < todayIso()) add("date", "Kuupäev ei saa olla minevikus.");
  }

  if (v.name.length < 2) add("name", "Kirjuta oma nimi.");
  if (!PHONE.test(v.phone)) add("phone", "Kirjuta telefoninumber, nt +372 5555 5555.");
  if (svc.quote.emailRequired || v.email) {
    if (!EMAIL.test(v.email)) add("email", svc.quote.emailRequired ? "Kirjuta e-posti aadress, kuhu pakkumine saata." : "Kontrolli e-posti aadressi.");
  }
});

export type QuoteData = z.infer<typeof baseSchema>;

export function validateQuote(input: unknown):
  | { ok: true; data: QuoteData }
  | { ok: false; errors: Partial<Record<QuoteField, string>> } {
  const r = quoteSchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: Partial<Record<QuoteField, string>> = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as QuoteField | undefined;
    if (key && !errors[key]) errors[key] = issue.message.startsWith("Invalid") ? "Kontrolli seda välja." : issue.message;
  }
  return { ok: false, errors };
}

export function minDateIso() {
  return new Date().toISOString().slice(0, 10);
}
