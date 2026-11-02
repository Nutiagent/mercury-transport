import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionLabel } from "@/components/SectionLabel";
import { CtaBand } from "@/components/CtaBand";
import { Arrow } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { formatAddress, site } from "@/config/site";
import { services } from "@/content/services";
import { sceneById } from "@/content/media";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Ettevõttest",
  description:
    "Mercury Transport (MERCURY TRANSPORTATIONS OÜ) on 2016. aastal Tallinnas asutatud puksiirabi- ja veoettevõte, mis teeb vedusid üle kogu Eesti.",
  alternates: { canonical: "/ettevottest" },
};

const principles = [
  {
    k: "24/7",
    title: "Kättesaadav siis, kui vaja",
    text: "Teele jäämine ei vali kellaaega. Puksiirabi on saadaval ööpäevaringselt, ka nädalavahetustel.",
  },
  {
    k: "€",
    title: "Hind enne väljasõitu",
    text: "Selgitame enne kokkulepet, millest hind koosneb. Nii tead täpselt, mille eest maksad.",
  },
  {
    k: "EE",
    title: "Kogu Eesti",
    text: "Asume Tallinnas ja teeme vedusid üle kogu Eesti, nii linnas kui ka maanteel.",
  },
  {
    k: "✓",
    title: "Kindlustatud vedu",
    text: "Kõik veetavad sõidukid ja ehitustehnika on kaetud veoseveo vastutuskindlustusega.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="Ettevõttest"
        title={
          <>
            Teel alates <span className="text-signal">{site.foundedYear}</span>.
          </>
        }
        lead="Mercury Transport on Tallinnas tegutsev puksiirabi- ja veoettevõte. Toome teele jäänud sõidukid ära ning veame autosid, ehitustehnikat ja muid veoseid üle kogu Eesti."
        crumbs={[{ href: "/ettevottest", label: "Ettevõttest" }]}
        image={sceneById("road").still}
        imageAlt={sceneById("road").alt}
      />

      {/* Editorial statement */}
      <section className="relative overflow-hidden bg-ink py-24 md:py-36">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel index="01">Lähenemine</SectionLabel>
          </div>
          <blockquote className="lg:col-span-9">
            <p className="display text-[clamp(2rem,5.2vw,4.6rem)] leading-[0.98]">
              „Küsige julgelt. <span className="text-steel-2">Alati leiame teile sobiva lahenduse.“</span>
            </p>
          </blockquote>
          <div className="grid gap-8 text-lg leading-relaxed text-bone-dim text-pretty md:grid-cols-2 lg:col-span-9 lg:col-start-4">
            <p>
              Meie töö on lihtne kirjeldada ja nõuab täpsust: sõiduk või masin tuleb ohutult platvormile saada, korralikult
              kinnitada ja õigel ajal sihtkohta toimetada.
            </p>
            <p>
              Teeme seda nii eraisikutele, kelle auto on jäänud teele seisma, kui ka ettevõtetele, kes vajavad sõidukite või
              ehitustehnika vedu objektide vahel.
            </p>
          </div>
        </div>
      </section>

      {/* Principles grid */}
      <section aria-labelledby="principles-title" className="brushed border-y border-line py-24 md:py-32">
        <div className="wrap">
          <SectionLabel index="02">Põhimõtted</SectionLabel>
          <h2 id="principles-title" className="display mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">
            Mida võid meilt oodata
          </h2>
          <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.title} className="flex min-h-72 flex-col bg-carbon p-6 md:p-8">
                <span aria-hidden className="display text-5xl text-signal">
                  {p.k}
                </span>
                <h3 className="mt-auto pt-10 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-bone-dim text-pretty">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What we do + company record */}
      <section className="bg-ink py-24 md:py-32">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionLabel index="03">Teenused</SectionLabel>
            <ul className="mt-8 border-t border-line">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-line">
                  <Link href={`/teenused/${s.slug}`} className="group/btn flex min-h-20 items-center gap-5 py-4 hover:text-signal">
                    <span className="label text-steel">{s.code}</span>
                    <span className="display-condensed text-[clamp(1.8rem,4vw,2.6rem)] uppercase">{s.shortTitle}</span>
                    <Arrow className="ml-auto" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <aside aria-labelledby="record-title" className="lg:col-span-5 lg:col-start-8">
            <div className="border border-line">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 id="record-title" className="label text-steel">
                  Ettevõtte andmed
                </h2>
                <span aria-hidden className="hazard h-2 w-16" />
              </div>
              <dl className="divide-y divide-line">
                {[
                  ["Kaubamärk", site.brand],
                  ["Ärinimi", site.legalName],
                  ["Registrikood", site.registryCode],
                  ["KMKR number", site.vatNumber],
                  ["Registreeritud", "9. juuni 2016"],
                  ["Aadress", formatAddress()],
                  ["Telefon", site.phone.display],
                  ["E-post", site.email],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-5 gap-4 px-6 py-4">
                    <dt className="label col-span-2 pt-1 text-steel">{k}</dt>
                    <dd className="col-span-3 break-words font-mono text-sm leading-relaxed">
                      {k === "Telefon" ? (
                        <a href={site.phone.href} className="hover:text-signal">
                          {v}
                        </a>
                      ) : k === "E-post" ? (
                        <a href={`mailto:${v}`} className="hover:text-signal">
                          {v}
                        </a>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand title="Vajad vedu või abi teel?" image={sceneById("arrival").still} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Avaleht", path: "/" }, { name: "Ettevõttest", path: "/ettevottest" }])} />
    </>
  );
}
