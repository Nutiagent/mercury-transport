import Link from "next/link";
import { formatAddress, nav, site } from "@/config/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-carbon">
      <div aria-hidden className="hazard h-1.5 w-full opacity-80" />
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo className="text-bone" />
          <p className="mt-6 max-w-sm text-bone-dim text-pretty">
            Puksiirabi, sõidukite ja ehitustehnika vedu ning muud haagisveod üle kogu Eesti.
          </p>
          <a
            href={site.phone.href}
            className="display mt-8 inline-block whitespace-nowrap text-[clamp(1.6rem,3vw,2.4rem)] tracking-[-0.03em] text-bone transition-colors hover:text-signal"
          >
            {site.phone.display}
          </a>
          <p className="label mt-3 flex items-center gap-2 text-steel-2">
            <span aria-hidden className="beacon size-1.5 rounded-full bg-amber" /> Puksiirabi 24/7
          </p>
        </div>

        <nav aria-label="Jaluse menüü" className="grid grid-cols-2 gap-8 lg:col-span-4">
          <div>
            <p className="label text-steel">Lehed</p>
            <ul className="mt-4 space-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex min-h-10 items-center text-bone-dim hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privaatsus" className="inline-flex min-h-10 items-center text-bone-dim hover:text-bone">
                  Privaatsus
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label text-steel">Teenused</p>
            <ul className="mt-4 space-y-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/teenused/${s.slug}`} className="inline-flex min-h-10 items-center text-bone-dim hover:text-bone">
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-3">
          <p className="label text-steel">Rekvisiidid</p>
          <dl className="mt-4 space-y-3 text-sm text-bone-dim">
            <div>
              <dt className="sr-only">Ärinimi</dt>
              <dd className="text-bone">{site.legalName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-steel">Registrikood</dt>
              <dd className="font-mono">{site.registryCode}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-steel">KMKR</dt>
              <dd className="font-mono">{site.vatNumber}</dd>
            </div>
            <div>
              <dt className="text-steel">E-post</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="hover:text-bone">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-steel">Registrijärgne aadress</dt>
              <dd>{formatAddress()}</dd>
            </div>
          </dl>
          <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm text-bone-dim hover:text-bone">
            Facebook <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-xs text-steel sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.legalName}</p>
        <p className="label text-[0.6rem]">EE · {site.serviceArea}</p>
      </div>

      <p
        aria-hidden
        className="display pointer-events-none -mb-[0.18em] select-none whitespace-nowrap text-center text-[15vw] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.07)]"
      >
        MERCURY
      </p>
    </footer>
  );
}
