import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  label,
  title,
  lead,
  crumbs = [],
  aside,
}: {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { href: string; label: string }[];
  aside?: ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden border-b border-line bg-ink pb-14 pt-[calc(var(--header-h)+3rem)] md:pb-20 md:pt-[calc(var(--header-h)+5rem)]">
      {/* road-marking accent */}
      <div aria-hidden className="absolute bottom-0 left-0 h-px w-full [background:repeating-linear-gradient(90deg,var(--color-signal)_0_28px,transparent_28px_56px)] opacity-60" />
      <div className="wrap">
        <nav aria-label="Asukoht" className="label text-steel">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-bone">
                Avaleht
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link href={c.href} className="hover:text-bone">
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-signal">{label}</p>
            <h1 className="display mt-5 text-[clamp(2.6rem,8vw,6.4rem)]">{title}</h1>
            {lead && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-dim text-pretty md:text-xl">{lead}</p>}
          </div>
          {aside && <div className="lg:col-span-4 lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
