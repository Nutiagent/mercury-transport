import Link from "next/link";
import Image from "next/image";
import { HomeHero } from "@/components/HomeHero";
import { FilmChapters } from "@/components/film/FilmChapters";
import { ServiceSelector } from "@/components/ServiceSelector";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";
import { SectionLabel } from "@/components/SectionLabel";
import { CallButton } from "@/components/CallButton";
import { Arrow } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { generalFaqs } from "@/content/general";
import { site } from "@/config/site";
import { sceneById } from "@/content/media";
import { faqJsonLd } from "@/lib/structured-data";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* Statement */}
      <section aria-label="Mercury lühidalt" className="relative border-b border-line bg-ink py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <p className="display text-[clamp(2rem,5.2vw,4.6rem)] leading-[0.98] text-pretty lg:col-span-10">
            Kui tee saab otsa, <span className="text-steel-2">algab meie töö.</span> Öösel, vihmas ja lumes, üle kogu Eesti.
          </p>
          <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4 lg:col-span-12">
            {[
              ["Valves", "24/7"],
              ["Piirkond", "Kogu Eesti"],
              ["Teel alates", String(site.foundedYear)],
              ["Vedu", "Kindlustatud"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-5 sm:p-6">
                <dt className="label text-steel">{k}</dt>
                <dd className="display mt-3 text-[clamp(1.2rem,5.2vw,1.4rem)] sm:text-[1.75rem] lg:text-[clamp(1.5rem,2.2vw,2.1rem)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Service overview + selector */}
      <section id="teenused" aria-labelledby="services-title" className="relative bg-ink py-24 md:py-32">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionLabel index="01">Teenused</SectionLabel>
              <h2 id="services-title" className="display mt-6 text-[clamp(2.4rem,6vw,4.8rem)]">
                Mis vajab vedamist?
              </h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-bone-dim text-pretty lg:col-span-5 lg:justify-self-end">
              Rikkis auto, ostetud sõiduk, minikopp või muu mahukas veos. Vali teenus ja vaata, kuidas saame aidata.
            </p>
          </div>
          <div className="mt-14 md:mt-20">
            <ServiceSelector />
          </div>
        </div>
      </section>

      {/* Urgent band: high-contrast, compact */}
      <section aria-labelledby="urgent-title" className="relative overflow-hidden bg-signal text-ink">
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/3 opacity-15 [background:repeating-linear-gradient(-45deg,#000_0_18px,transparent_18px_36px)] md:block" />
        <div className="wrap relative grid gap-8 py-14 md:grid-cols-12 md:items-center md:py-16">
          <div className="md:col-span-7 lg:col-span-8">
            <p className="label text-ink/70">Kiirabi teel · 24/7</p>
            <h2 id="urgent-title" className="display mt-3 text-[clamp(2.1rem,5.4vw,4rem)]">
              Jäid teele seisma?
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium leading-snug text-ink/80 text-pretty">
              Helista otse. Kõne on kiirem kui vorm: ütle asukoht ja mis juhtus, ülejäänu lahendame meie.
            </p>
          </div>
          <div className="md:col-span-5 md:justify-self-end lg:col-span-4">
            <a
              href={site.phone.href}
              className="group/btn inline-flex min-h-16 w-full items-center justify-center gap-3 whitespace-nowrap bg-ink px-7 text-lg font-semibold text-bone transition-colors hover:bg-carbon md:w-auto"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
              </svg>
              {site.phone.display}
            </a>
          </div>
        </div>
      </section>

      {/* Process told as film chapters */}
      <section aria-labelledby="process-title" className="relative border-y border-line bg-carbon py-24 md:py-32">
        <div className="wrap">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <SectionLabel index="02">Kuidas vedu käib</SectionLabel>
              <h2 id="process-title" className="display mt-6 text-[clamp(2.4rem,5.4vw,4.4rem)]">
                Neli sammu kõnest sihtkohani.
              </h2>
            </div>
            <p className="max-w-md self-end text-lg leading-relaxed text-bone-dim text-pretty md:col-span-5 md:col-start-8">
              Selge kokkulepe enne väljasõitu, hoolikas laadimine ja kindlustatud vedu. Ilma üllatusteta.
            </p>
          </div>
          <div className="mt-16 md:mt-24">
            <FilmChapters />
          </div>
        </div>
      </section>

      {/* Company introduction — full-bleed editorial image */}
      <section aria-labelledby="about-title" className="relative isolate overflow-hidden bg-ink">
        <div className="relative h-[70svh] min-h-[480px] w-full md:h-[88svh]">
          <Image
            src={sceneById("road").still}
            alt={sceneById("road").alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="wrap pb-12 md:pb-20">
              <SectionLabel index="03" className="text-bone/80">
                Ettevõttest
              </SectionLabel>
              <h2 id="about-title" className="display mt-6 max-w-[14ch] text-[clamp(2.6rem,7vw,6.4rem)]">
                Teel alates {site.foundedYear}. aastast.
              </h2>
            </div>
          </div>
        </div>
        <div className="wrap grid gap-12 pb-24 pt-4 md:pb-32 lg:grid-cols-12">
          <div className="space-y-5 text-lg leading-relaxed text-bone-dim text-pretty lg:col-span-6">
            <p>
              Mercury Transport on Tallinnas tegutsev puksiirabi- ja veoettevõte. Aitame inimesi ja ettevõtteid, kelle sõiduk
              on jäänud teele seisma, ning veame autosid, ehitustehnikat ja muid veoseid üle kogu Eesti.
            </p>
            <p>Kõik veetavad sõidukid ja ehitustehnika on kaetud veoseveo vastutuskindlustusega.</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["Ärinimi", site.legalName],
                ["Registrikood", site.registryCode],
                ["Asukoht", "Tallinn, Eesti"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-4">
                  <dt className="label pt-1 text-steel">{k}</dt>
                  <dd className="text-right font-mono text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/ettevottest"
              className="group/btn mt-8 inline-flex min-h-12 items-center gap-2 font-semibold underline decoration-line underline-offset-8 hover:decoration-signal"
            >
              Loe ettevõttest <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="border-t border-line bg-carbon py-24 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="04">KKK</SectionLabel>
            <h2 id="faq-title" className="display mt-6 text-[clamp(2.4rem,5vw,4rem)]">
              Korduma kippuvad küsimused
            </h2>
            <div className="mt-8">
              <CallButton size="md" variant="secondary" label="Küsi telefonis" />
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Faq items={generalFaqs} />
          </div>
        </div>
      </section>

      <CtaBand image={sceneById("arrival").still} />
      <JsonLd data={faqJsonLd(generalFaqs)} />
    </>
  );
}
