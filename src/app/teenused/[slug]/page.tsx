import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ServiceGlyph } from "@/components/ServiceGlyph";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";
import { CallButton } from "@/components/CallButton";
import { Arrow, LinkButton } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { JsonLd } from "@/components/JsonLd";
import { serviceBySlug, services } from "@/content/services";
import { sceneById, serviceScene } from "@/content/media";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.metaDescription,
    alternates: { canonical: `/teenused/${s.slug}` },
    openGraph: { title: `${s.title} | Mercury Transport`, description: s.metaDescription },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  const others = services.filter((o) => o.slug !== s.slug);
  const quoteHref = `/kontakt?teenus=${s.slug}#paring`;

  return (
    <>
      <PageHeader
        label={`Teenus ${s.code}${s.urgent ? " · 24/7" : ""}`}
        title={s.title}
        lead={s.lead}
        image={sceneById(serviceScene[s.slug]).still}
        imageAlt={sceneById(serviceScene[s.slug]).alt}
        crumbs={[
          { href: "/teenused", label: "Teenused" },
          { href: `/teenused/${s.slug}`, label: s.shortTitle },
        ]}
        aside={
          <div className="grid gap-3 xs:flex xs:flex-wrap lg:flex-col lg:items-stretch">
            {s.urgent ? (
              <>
                <CallButton size="lg" showNumber className="w-full" />
                <LinkButton href={quoteHref} variant="secondary" size="lg" className="w-full">
                  Küsi pakkumist <Arrow />
                </LinkButton>
              </>
            ) : (
              <>
                <LinkButton href={quoteHref} size="lg" className="w-full">
                  Küsi pakkumist <Arrow />
                </LinkButton>
                <CallButton size="lg" variant="secondary" label="Helista" showNumber className="w-full" />
              </>
            )}
          </div>
        }
      />

      {/* Visual + description */}
      <section className="bg-ink py-20 md:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <figure className="lg:col-span-7">
            <div className="brushed border border-line p-4 sm:p-8">
              <ServiceGlyph kind={s.glyph} className="w-full text-bone" title={`Tehniline joonis: ${s.title}`} />
            </div>
            <figcaption className="label mt-4 flex justify-between text-steel">
              <span>Fig. {s.code} · Platvormvedu</span>
              <span>Mercury Transport</span>
            </figcaption>
          </figure>
          <div className="lg:col-span-5">
            <SectionLabel index="A">Teenusest</SectionLabel>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-bone-dim text-pretty">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <h2 className="label mt-12 text-steel">Sobib näiteks</h2>
            <ul className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
              {s.examples.map((ex) => (
                <li key={ex} className="flex min-h-14 items-center gap-3 bg-ink px-4 py-3">
                  <span aria-hidden className="size-1.5 shrink-0 bg-signal" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Practical spec sheet */}
      <section aria-labelledby="practical-title" className="brushed border-y border-line py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="B">Praktiline info</SectionLabel>
            <h2 id="practical-title" className="display mt-6 text-[clamp(2rem,4vw,3.2rem)]">
              Tehnilised andmed
            </h2>
          </div>
          <dl className="grid border-t border-line lg:col-span-8">
            {s.practical.map((p) => (
              <div key={p.label} className="grid gap-2 border-b border-line py-6 sm:grid-cols-3 sm:gap-6">
                <dt className="label pt-1 text-steel">{p.label}</dt>
                <dd className="text-lg leading-relaxed sm:col-span-2">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="wrap mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">Mida meile öelda</h2>
            <p className="mt-4 text-bone-dim text-pretty">Nende andmetega saame kõige kiiremini hinna ja aja paika.</p>
          </div>
          <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-8">
            {s.checklist.map((c, i) => (
              <li key={c} className="flex min-h-24 gap-4 bg-carbon p-5">
                <span className="label text-signal">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-snug">{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="bg-ink py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="C">KKK</SectionLabel>
            <h2 id="faq-title" className="display mt-6 text-[clamp(2rem,4vw,3.2rem)]">
              Seotud küsimused
            </h2>
            <LinkButton href={quoteHref} className="mt-8">
              Küsi pakkumist <Arrow />
            </LinkButton>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Faq items={s.faqs} />
          </div>
        </div>
      </section>

      {/* Other services */}
      <section aria-labelledby="other-title" className="border-t border-line bg-carbon py-16 md:py-20">
        <div className="wrap">
          <h2 id="other-title" className="label text-steel">
            Teised teenused
          </h2>
          <ul className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/teenused/${o.slug}`} className="group/btn flex h-full min-h-28 flex-col justify-between gap-6 bg-carbon p-6 transition-colors hover:bg-graphite">
                  <span className="label text-signal">{o.code}</span>
                  <span className="flex items-center justify-between gap-4 text-xl font-semibold">
                    {o.title} <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand service={s.slug} />
      <JsonLd data={serviceJsonLd(s)} />
      <JsonLd data={faqJsonLd(s.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Avaleht", path: "/" },
          { name: "Teenused", path: "/teenused" },
          { name: s.title, path: `/teenused/${s.slug}` },
        ])}
      />
    </>
  );
}
