"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { services } from "@/content/services";
import { Arrow, LinkButton } from "./Button";
import { ServiceGlyph } from "./ServiceGlyph";

export function ServiceSelector() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const s = services[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = services.length;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div role="tablist" aria-label="Vali teenus" aria-orientation="vertical" className="flex flex-col border-t border-line lg:col-span-5">
        {services.map((sv, i) => {
          const selected = i === active;
          return (
            <button
              key={sv.slug}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`group relative flex min-h-[4.5rem] items-center gap-5 border-b border-line py-4 pl-1 pr-3 text-left transition-colors duration-300 sm:min-h-20 ${
                selected ? "text-bone" : "text-steel-2 hover:text-bone"
              }`}
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-0.5 origin-top bg-signal transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                  selected ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <span className={`label w-7 pl-3 ${selected ? "text-signal" : "text-steel"}`}>{sv.code}</span>
              <span className="display-condensed text-[clamp(1.9rem,6vw,2.6rem)] uppercase">{sv.shortTitle}</span>
              {sv.urgent && (
                <span className="label ml-auto flex items-center gap-1.5 text-amber">
                  <span aria-hidden className="beacon size-1.5 rounded-full bg-amber" />
                  24/7
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
        className="brushed relative overflow-hidden border border-line lg:col-span-7"
      >
        <div key={s.slug} className="rise p-5 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-6">
            <p className="label text-steel">
              Teenus {s.code} / {String(services.length).padStart(2, "0")}
            </p>
            <p className="label hidden text-steel sm:block">Mercury · platvormvedu</p>
          </div>
          <ServiceGlyph kind={s.glyph} className="mt-6 w-full text-bone" />
          <h3 className="display mt-6 text-[clamp(1.7rem,3.2vw,2.5rem)]">{s.title}</h3>
          <p className="mt-4 max-w-xl text-bone-dim text-pretty">{s.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {s.examples.map((ex) => (
              <li key={ex} className="label border border-line bg-ink/40 px-3 py-2 text-[0.65rem] text-bone-dim">
                {ex}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={`/kontakt?teenus=${s.slug}#paring`}>
              Küsi pakkumist <Arrow />
            </LinkButton>
            <Link
              href={`/teenused/${s.slug}`}
              className="group/btn inline-flex min-h-12 items-center gap-2 px-2 font-semibold text-bone underline decoration-line underline-offset-8 hover:decoration-signal"
            >
              Loe lähemalt <span className="sr-only">: {s.title}</span>
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
