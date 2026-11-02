"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/config/site";
import { serviceBySlug, services, type ServiceSlug } from "@/content/services";
import {
  emptyQuote,
  minDateIso,
  urgencyOptions,
  validateQuote,
  type QuoteField,
  type QuoteInput,
} from "@/lib/quote-schema";
import { PhoneIcon, buttonClass } from "../Button";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; ref: string }
  | { kind: "error"; code: string };

type Errors = Partial<Record<QuoteField, string>>;

const fieldBase =
  "block w-full min-h-13 border bg-ink/60 px-4 py-3 text-base text-bone placeholder:text-steel/80 transition-colors focus:border-signal focus:bg-ink focus:outline-none";

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span>
          {label}
          {required && <span className="text-signal"> *</span>}
        </span>
        {!required && <span className="label text-[0.6rem] text-steel">Valikuline</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-steel">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-sm text-error">
          <span aria-hidden>!</span>
          {error}
        </p>
      )}
    </div>
  );
}

function mailtoFallback(v: QuoteInput) {
  const svc = serviceBySlug(v.service);
  const lines = [
    `Teenus: ${svc?.title || "-"}`,
    `Asukoht / pealevõtmine: ${v.pickup}`,
    `Sihtkoht: ${v.destination}`,
    `${svc?.quote.detailsLabel || "Veos"}: ${v.details}`,
    `Aeg: ${v.urgency || v.date || "-"}`,
    `Lisainfo: ${v.message}`,
    `Nimi: ${v.name}`,
    `Telefon: ${v.phone}`,
  ];
  return `mailto:${site.email}?subject=${encodeURIComponent(`Päring: ${svc?.shortTitle || "vedu"}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

const errorCopy: Record<string, { title: string; text: string }> = {
  not_configured: {
    title: "Veebivorm ei ole veel ühendatud",
    text: "Päringute saatmine veebilehelt ei ole praegu seadistatud, seega sinu päringut ei saadetud. Palun helista või saada sama info e-postiga, nupp avab valmis kirja.",
  },
  delivery_failed: {
    title: "Päringut ei õnnestunud edastada",
    text: "Meie e-postiteenus ei võtnud päringut vastu. Sinu andmed on vormis alles. Proovi mõne hetke pärast uuesti, helista või saada päring e-postiga.",
  },
  rate_limited: {
    title: "Liiga palju päringuid",
    text: "Samalt ühenduselt on lühikese aja jooksul saadetud mitu päringut. Palun helista või proovi veidi aja pärast uuesti.",
  },
  too_fast: {
    title: "Proovi uuesti",
    text: "Vorm saadeti liiga kiiresti pärast lehe avamist. Vajuta palun uuesti nuppu „Saada päring“.",
  },
  expired: {
    title: "Vormi seanss aegus",
    text: "Laadisime vormi uuesti. Sinu andmed on alles, vajuta palun uuesti „Saada päring“.",
  },
  network: {
    title: "Ühendus katkes",
    text: "Päringut ei saadetud, sest serveriga ei saadud ühendust. Kontrolli internetiühendust ja proovi uuesti või helista.",
  },
  default: {
    title: "Midagi läks valesti",
    text: "Päringut ei saadetud. Proovi uuesti või helista meile.",
  },
};

export function QuoteForm() {
  const params = useSearchParams();
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const initialService = (serviceBySlug(params.get("teenus") || "")?.slug || "") as ServiceSlug | "";

  const [values, setValues] = useState<QuoteInput>({ ...emptyQuote, service: initialService });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<QuoteField, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [token, setToken] = useState<string>("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Keep preselection in sync when navigating between /kontakt?teenus=… links
  const [lastParam, setLastParam] = useState(initialService);
  if (initialService && initialService !== lastParam) {
    setLastParam(initialService);
    setValues((v) => ({ ...v, service: initialService }));
  }

  const loadToken = async () => {
    try {
      const r = await fetch("/api/quote", { cache: "no-store" });
      const j = await r.json();
      setToken(j.token);
      setConfigured(Boolean(j.configured));
    } catch {
      setConfigured(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadToken();
  }, []);

  const svc = serviceBySlug(values.service);

  const set = (f: QuoteField, v: string) => {
    const next = { ...values, [f]: v };
    setValues(next);
    if (touched[f] || errors[f]) {
      const r = validateQuote(next);
      setErrors((e) => ({ ...e, [f]: r.ok ? undefined : r.errors[f] }));
    }
  };

  const blur = (f: QuoteField) => {
    setTouched((t) => ({ ...t, [f]: true }));
    if (!values.service) return;
    const r = validateQuote(values);
    setErrors((e) => ({ ...e, [f]: r.ok ? undefined : r.errors[f] }));
  };

  const chooseService = (slug: ServiceSlug) => {
    setValues((v) => ({ ...v, service: slug }));
    setErrors({});
    setTouched({});
    if (status.kind === "error") setStatus({ kind: "idle" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validateQuote(values);
    if (!r.ok) {
      setErrors(r.errors);
      const order: QuoteField[] = ["service", "pickup", "destination", "details", "urgency", "date", "message", "name", "phone", "email"];
      const first = order.find((f) => r.errors[f]);
      if (first) {
        const el = first === "service" ? formRef.current?.querySelector<HTMLElement>("input[name=service]") : document.getElementById(id(first));
        el?.focus();
      }
      return;
    }
    setErrors({});
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token, website: honeypot.current?.value || "" }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setStatus({ kind: "success", ref: j.ref });
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }
      if (j.code === "invalid" && j.errors) {
        setErrors(j.errors);
        setStatus({ kind: "idle" });
        return;
      }
      if (j.code === "expired" || j.code === "too_fast") await loadToken();
      if (j.code === "not_configured") setConfigured(false);
      setStatus({ kind: "error", code: j.code || "default" });
    } catch {
      setStatus({ kind: "error", code: "network" });
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const describedBy = (f: QuoteField, hint = false) =>
    [hint ? `${id(f)}-hint` : "", errors[f] ? `${id(f)}-error` : ""].filter(Boolean).join(" ") || undefined;
  const cls = (f: QuoteField) => `${fieldBase} ${errors[f] ? "border-error" : "border-line hover:border-steel/60"}`;

  if (status.kind === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="border border-ok/40 bg-ok/5 p-6 outline-none sm:p-10">
        <p className="label text-ok">Päring vastu võetud · {status.ref}</p>
        <h3 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">Aitäh, {values.name.split(" ")[0]}!</h3>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-bone-dim">
          Saime sinu päringu kätte ja võtame sinuga ühendust telefonil {values.phone}
          {values.email ? ` või e-postil ${values.email}` : ""}.
          {svc?.urgent ? " Kui abi on vaja kohe, helista kindlasti ka otse." : ""}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={site.phone.href} className={buttonClass("primary", "md")}>
            <PhoneIcon /> {site.phone.display}
          </a>
          <Link href="/" className={buttonClass("secondary", "md")}>
            Tagasi avalehele
          </Link>
        </div>
      </div>
    );
  }

  const err = status.kind === "error" ? errorCopy[status.code] || errorCopy.default : null;
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-describedby={`${uid}-req`} className="relative">
      {configured === false && status.kind !== "error" && (
        <div className="mb-8 border border-amber/40 bg-amber/5 p-4 text-sm leading-relaxed text-bone-dim">
          <strong className="text-bone">Teadmiseks:</strong> veebivormi e-posti saatmine ei ole veel seadistatud. Kiireima
          vastuse saad telefonil{" "}
          <a href={site.phone.href} className="font-semibold text-bone underline underline-offset-4">
            {site.phone.display}
          </a>
          .
        </div>
      )}

      {/* 1 — service */}
      <fieldset>
        <legend className="label flex w-full items-center justify-between text-steel">
          <span>
            <span className="text-signal">01</span> · Vali teenus <span className="text-signal">*</span>
          </span>
        </legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((s) => {
            const checked = values.service === s.slug;
            return (
              <label
                key={s.slug}
                className={`relative flex min-h-16 cursor-pointer items-center gap-4 border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                  checked ? "border-signal bg-signal/10" : "border-line bg-ink/40 hover:border-steel/60"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={s.slug}
                  checked={checked}
                  onChange={() => chooseService(s.slug)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${checked ? "border-signal" : "border-steel"}`}
                >
                  {checked && <span className="size-2.5 rounded-full bg-signal" />}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold">{s.title}</span>
                  {s.urgent && <span className="label mt-1 text-[0.6rem] text-amber">24/7 · kiire abi</span>}
                </span>
              </label>
            );
          })}
        </div>
        {errors.service && (
          <p id={`${uid}-service-error`} className="mt-2 text-sm text-error">
            {errors.service}
          </p>
        )}
      </fieldset>

      {svc?.urgent && (
        <div className="mt-6 flex flex-col gap-4 border border-signal bg-signal p-5 text-ink sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold leading-tight">Seisad tee ääres? Helista, nii on kõige kiirem.</p>
            <p className="mt-1 text-sm font-medium text-ink/75">Ööpäevaringselt, ka nädalavahetusel.</p>
          </div>
          <a
            href={site.phone.href}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 bg-ink px-6 text-lg font-semibold text-bone hover:bg-carbon"
          >
            <PhoneIcon /> {site.phone.display}
          </a>
        </div>
      )}

      {!svc && <p className="mt-6 text-sm text-steel">Vali teenus, et näha sellele sobivaid välju.</p>}

      {svc && (
        <div key={svc.slug} className="rise">
          {/* 2 — route & cargo */}
          <fieldset className="mt-10">
            <legend className="label text-steel">
              <span className="text-signal">02</span> · {svc.urgent ? "Asukoht ja sõiduk" : "Marsruut ja veos"}
            </legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field id={id("pickup")} label={svc.urgent ? "Kus sõiduk asub?" : "Pealevõtmise koht"} error={errors.pickup} required>
                <input
                  id={id("pickup")}
                  name="pickup"
                  autoComplete="off"
                  placeholder={svc.urgent ? "Aadress, tee nimi või lähim kilomeetripost" : "Linn, aadress"}
                  value={values.pickup}
                  onChange={(e) => set("pickup", e.target.value)}
                  onBlur={() => blur("pickup")}
                  aria-invalid={!!errors.pickup}
                  aria-describedby={describedBy("pickup")}
                  className={cls("pickup")}
                  required
                />
              </Field>
              <Field
                id={id("destination")}
                label={svc.urgent ? "Kuhu sõiduk viia?" : "Sihtkoht"}
                error={errors.destination}
                required={svc.quote.destination === "required"}
              >
                <input
                  id={id("destination")}
                  name="destination"
                  autoComplete="off"
                  placeholder={svc.urgent ? "Nt remonditöökoda või koduaadress" : "Linn, aadress"}
                  value={values.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  onBlur={() => blur("destination")}
                  aria-invalid={!!errors.destination}
                  aria-describedby={describedBy("destination")}
                  className={cls("destination")}
                  required={svc.quote.destination === "required"}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id={id("details")} label={svc.quote.detailsLabel} error={errors.details} required>
                  <input
                    id={id("details")}
                    name="details"
                    placeholder={svc.quote.detailsPlaceholder}
                    value={values.details}
                    onChange={(e) => set("details", e.target.value)}
                    onBlur={() => blur("details")}
                    aria-invalid={!!errors.details}
                    aria-describedby={describedBy("details")}
                    className={cls("details")}
                    required
                  />
                </Field>
              </div>
              {svc.quote.timing === "urgency" ? (
                <Field id={id("urgency")} label="Millal abi vajad?" error={errors.urgency} required>
                  <select
                    id={id("urgency")}
                    name="urgency"
                    value={values.urgency}
                    onChange={(e) => set("urgency", e.target.value)}
                    onBlur={() => blur("urgency")}
                    aria-invalid={!!errors.urgency}
                    aria-describedby={describedBy("urgency")}
                    className={`${cls("urgency")} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 6%22><path d=%22M0 0l5 6 5-6z%22 fill=%22%238b9099%22/></svg>')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                    required
                  >
                    <option value="">Vali</option>
                    {urgencyOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field id={id("date")} label="Soovitud kuupäev" hint="Jäta tühjaks, kui aeg on paindlik." error={errors.date}>
                  <input
                    id={id("date")}
                    name="date"
                    type="date"
                    min={minDateIso()}
                    value={values.date}
                    onChange={(e) => set("date", e.target.value)}
                    onBlur={() => blur("date")}
                    aria-invalid={!!errors.date}
                    aria-describedby={describedBy("date", true)}
                    className={cls("date")}
                  />
                </Field>
              )}
              <div className="sm:col-span-2">
                <Field id={id("message")} label="Lisainfo" error={errors.message}>
                  <textarea
                    id={id("message")}
                    name="message"
                    rows={3}
                    placeholder={
                      svc.urgent
                        ? "Nt rattad on lukus, sõiduk on parklas, võtmed on kaasas"
                        : "Nt laadimistingimused, ligipääs, mõõtmed"
                    }
                    value={values.message}
                    onChange={(e) => set("message", e.target.value)}
                    onBlur={() => blur("message")}
                    aria-invalid={!!errors.message}
                    aria-describedby={describedBy("message")}
                    className={`${cls("message")} resize-y`}
                  />
                </Field>
              </div>
            </div>
          </fieldset>

          {/* 3 — contact */}
          <fieldset className="mt-10">
            <legend className="label text-steel">
              <span className="text-signal">03</span> · Kontaktandmed
            </legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id={id("name")} label="Nimi" error={errors.name} required>
                  <input
                    id={id("name")}
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => blur("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={describedBy("name")}
                    className={cls("name")}
                    required
                  />
                </Field>
              </div>
              <Field id={id("phone")} label="Telefon" error={errors.phone} required>
                <input
                  id={id("phone")}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+372"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  onBlur={() => blur("phone")}
                  aria-invalid={!!errors.phone}
                  aria-describedby={describedBy("phone")}
                  className={cls("phone")}
                  required
                />
              </Field>
              <Field id={id("email")} label="E-post" error={errors.email} required={svc.quote.emailRequired}>
                <input
                  id={id("email")}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => blur("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy("email")}
                  className={cls("email")}
                  required={svc.quote.emailRequired}
                />
              </Field>
            </div>
          </fieldset>

          {/* Honeypot — hidden from people and assistive tech */}
          <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor={id("website")}>Veebileht</label>
            <input ref={honeypot} id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        </div>
      )}

      {err && (
        <div ref={resultRef} tabIndex={-1} role="alert" className="mt-8 border border-error/50 bg-error/5 p-5 outline-none">
          <p className="font-semibold text-bone">{err.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-bone-dim">{err.text}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={site.phone.href} className={buttonClass("primary", "md")}>
              <PhoneIcon /> {site.phone.display}
            </a>
            {(status.kind === "error" && ["not_configured", "delivery_failed", "rate_limited", "network"].includes(status.code)) && (
              <a href={mailtoFallback(values)} className={buttonClass("secondary", "md")}>
                Saada e-postiga
              </a>
            )}
          </div>
        </div>
      )}

      {errorCount > 0 && status.kind === "idle" && (
        <p role="alert" className="mt-8 text-sm text-error">
          Palun paranda {errorCount === 1 ? "üks väli" : `${errorCount} välja`}, enne kui päringu saadad.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${uid}-req`} className="max-w-sm text-sm leading-relaxed text-steel">
          <span className="text-signal">*</span> kohustuslik väli. Kasutame andmeid ainult päringule vastamiseks, vaata{" "}
          <Link href="/privaatsus" className="text-bone-dim underline underline-offset-4 hover:text-bone">
            privaatsusteavet
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          aria-busy={status.kind === "submitting"}
          className={buttonClass("primary", "lg", "w-full sm:w-auto")}
        >
          {status.kind === "submitting" ? (
            <>
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              Saadan…
            </>
          ) : (
            "Saada päring"
          )}
        </button>
      </div>
    </form>
  );
}
