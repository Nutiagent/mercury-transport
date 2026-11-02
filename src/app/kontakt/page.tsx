import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { PhoneIcon } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { formatAddress, site } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { sceneById } from "@/content/media";

export const metadata: Metadata = {
  title: "Kontakt ja hinnapäring",
  description:
    "Küsi pakkumist puksiirabile, sõidukite või ehitustehnika veole. Kiire abi korral helista ööpäevaringselt +372 5685 5138.",
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Kontakt / Küsi pakkumist"
        title={
          <>
            Kuhu ja <span className="text-signal">mida</span> vedada?
          </>
        }
        lead="Kirjelda vedu ja anname hinna enne, kui midagi kinnitad. Kui oled teel hätta jäänud, helista otse."
        crumbs={[{ href: "/kontakt", label: "Kontakt" }]}
        image={sceneById("arrival").still}
        imageAlt={sceneById("arrival").alt}
        imageTall={false}
      />

      <section className="bg-ink py-16 md:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          {/* Direct contact */}
          <aside aria-labelledby="direct-title" className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <h2 id="direct-title" className="label text-steel">
                Otsekontakt
              </h2>
              <a
                href={site.phone.href}
                className="group mt-5 flex items-center justify-between gap-4 bg-signal p-6 text-ink transition-colors hover:bg-signal-hi"
              >
                <span>
                  <span className="label block text-ink/70">Helista 24/7</span>
                  <span className="display mt-2 block text-[clamp(1.6rem,3vw,2.1rem)]">{site.phone.display}</span>
                </span>
                <PhoneIcon className="size-7" />
              </a>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 flex items-center justify-between gap-4 border border-line p-6 transition-colors hover:border-steel/60"
              >
                <span className="min-w-0">
                  <span className="label block text-steel">E-post</span>
                  <span className="mt-2 block truncate text-lg font-semibold">{site.email}</span>
                </span>
                <span aria-hidden>↗</span>
              </a>

              <dl className="mt-10 space-y-5 border-t border-line pt-8 text-sm">
                <div>
                  <dt className="label text-steel">Teeninduspiirkond</dt>
                  <dd className="mt-2 text-bone-dim">Tallinn, Harjumaa ja kogu Eesti</dd>
                </div>
                <div>
                  <dt className="label text-steel">Ettevõte</dt>
                  <dd className="mt-2 text-bone-dim">
                    {site.legalName}
                    <br />
                    Registrikood {site.registryCode}
                    <br />
                    KMKR {site.vatNumber}
                  </dd>
                </div>
                <div>
                  <dt className="label text-steel">Registrijärgne aadress</dt>
                  <dd className="mt-2 text-bone-dim">{formatAddress()}</dd>
                </div>
              </dl>
            </div>
          </aside>

          {/* Enquiry */}
          <div id="paring" className="scroll-mt-28 lg:col-span-8">
            <div className="brushed border border-line p-5 sm:p-8 lg:p-12">
              <h2 className="display text-[clamp(1.9rem,3.6vw,2.8rem)]">Hinnapäring</h2>
              <p className="mt-3 max-w-lg text-bone-dim">Vastame esimesel võimalusel. Kiire abi korral helista.</p>
              <div className="mt-10">
                <Suspense fallback={<div className="h-96" aria-hidden />}>
                  <QuoteForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Avaleht", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
