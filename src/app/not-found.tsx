import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, LinkButton } from "@/components/Button";
import { CallButton } from "@/components/CallButton";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Lehte ei leitud", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-svh items-center overflow-hidden bg-ink pb-20 pt-[calc(var(--header-h)+3rem)]">
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px [background:repeating-linear-gradient(90deg,var(--color-signal)_0_40px,transparent_40px_80px)] opacity-40" />
      <div className="wrap relative grid gap-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label text-signal">Viga 404 · Tee suletud</p>
          <p aria-hidden className="display-condensed mt-6 text-[clamp(8rem,30vw,20rem)] leading-[0.78] text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]">
            404
          </p>
          <h1 className="display mt-8 text-[clamp(2.2rem,5vw,4rem)]">Sellele aadressile me ei sõida.</h1>
          <p className="mt-5 max-w-md text-lg text-bone-dim">Lehte ei leitud. Võib-olla on link vananenud või aadressis on viga.</p>
          <div className="mt-8 grid gap-3 xs:flex xs:flex-wrap">
            <LinkButton href="/" size="lg">
              Avalehele <Arrow />
            </LinkButton>
            <CallButton variant="secondary" />
          </div>
        </div>
        <nav aria-label="Teenused" className="lg:col-span-4 lg:col-start-9">
          <p className="label text-steel">Teenused</p>
          <ul className="mt-4 border-t border-line">
            {services.map((s) => (
              <li key={s.slug} className="border-b border-line">
                <Link href={`/teenused/${s.slug}`} className="group/btn flex min-h-14 items-center justify-between gap-4 hover:text-signal">
                  {s.title} <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
