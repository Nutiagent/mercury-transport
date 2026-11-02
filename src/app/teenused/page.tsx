import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import Image from "next/image";
import { ServiceGlyph } from "@/components/ServiceGlyph";
import { sceneById, serviceScene } from "@/content/media";
import { CtaBand } from "@/components/CtaBand";
import { CallButton } from "@/components/CallButton";
import { Arrow } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { services } from "@/content/services";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Teenused",
  description:
    "Puksiirabi 24/7, sõidukite transport, ehitustehnika vedu ja muud haagisveod üle Eesti. Vaata teenuseid ja küsi pakkumist.",
  alternates: { canonical: "/teenused" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        label="Teenused / 04"
        title={
          <>
            Iga veos. <br className="hidden sm:block" />
            Õige lahendus.
          </>
        }
        lead="Ööpäevaringsest puksiirabist planeeritud ehitustehnika veoni. Kõik veetavad sõidukid ja tehnika on kaetud veoseveo vastutuskindlustusega."
        crumbs={[{ href: "/teenused", label: "Teenused" }]}
        aside={<CallButton size="lg" label="Kiire abi" showNumber />}
        image={sceneById("loading").still}
        imageAlt={sceneById("loading").alt}
      />

      <section aria-label="Teenuste nimekiri" className="bg-ink">
        <ul className="wrap divide-y divide-line">
          {services.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/teenused/${s.slug}`}
                className="group grid gap-8 py-14 md:grid-cols-12 md:items-center md:gap-10 md:py-20"
              >
                <div className={`md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : ""}`}>
                  <div className="relative aspect-[16/10] overflow-hidden border border-line">
                    <Image
                      src={sceneById(serviceScene[s.slug]).still}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                    <ServiceGlyph kind={s.glyph} className="absolute inset-x-4 bottom-2 w-[calc(100%-2rem)] text-bone/80 opacity-80 sm:inset-x-6" />
                  </div>
                </div>
                <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                  <p className="label flex items-center gap-3 text-steel">
                    <span className="text-signal">{s.code}</span>
                    {s.urgent && (
                      <span className="flex items-center gap-1.5 text-amber">
                        <span aria-hidden className="beacon size-1.5 rounded-full bg-amber" /> 24/7
                      </span>
                    )}
                  </p>
                  <h2 className="display mt-4 text-[clamp(2rem,4.4vw,3.4rem)] transition-colors group-hover:text-signal">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-bone-dim text-pretty">{s.summary}</p>
                  <span className="group/btn mt-8 inline-flex min-h-12 items-center gap-2 font-semibold underline decoration-line underline-offset-8 group-hover:decoration-signal">
                    Vaata teenust <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
      <JsonLd data={breadcrumbJsonLd([{ name: "Avaleht", path: "/" }, { name: "Teenused", path: "/teenused" }])} />
    </>
  );
}
