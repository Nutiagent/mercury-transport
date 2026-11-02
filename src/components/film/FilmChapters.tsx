"use client";

import { useEffect, useRef, useState } from "react";
import { process } from "@/content/general";
import { sceneById } from "@/content/media";

/**
 * The process told as four film chapters.
 * Desktop: chapter text scrolls on the left while a sticky frame on the right
 * cross-fades between scene clips. Mobile: each chapter carries its own clip.
 * Only the clip that is actually visible plays; nothing autoplays with reduced motion.
 */
export function FilmChapters() {
  const [active, setActive] = useState(0);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const stickyVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const inlineVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const motionOk = useRef(true);

  useEffect(() => {
    motionOk.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    chapterRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Desktop sticky frame: play the active clip only
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    stickyVideos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && motionOk.current) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  // Mobile inline clips: play while on screen
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && motionOk.current) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.4 },
    );
    inlineVideos.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
      <ol className="lg:col-span-5">
        {process.map((p, i) => {
          const sc = sceneById(p.scene);
          return (
            <li
              key={p.step}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
              data-index={i}
              className="flex flex-col justify-center py-10 first:pt-0 lg:min-h-[78svh] lg:py-0"
            >
              {/* mobile clip */}
              <figure className="relative mb-8 aspect-[16/10] overflow-hidden border border-line bg-carbon lg:hidden">
                <video
                  ref={(el) => {
                    inlineVideos.current[i] = el;
                  }}
                  src={sc.clip}
                  poster={sc.still}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={sc.alt}
                  className="size-full object-cover"
                />
                <figcaption className="label absolute bottom-3 left-3 bg-ink/70 px-2 py-1 text-bone/80 backdrop-blur">
                  {p.step} · {sc.label}
                </figcaption>
              </figure>

              <div className={`transition-opacity duration-500 lg:opacity-30 ${active === i ? "lg:!opacity-100" : ""}`}>
                <p className="label flex items-center gap-3 text-steel">
                  <span className="text-signal">{p.step}</span>
                  <span aria-hidden className="h-px w-8 bg-line" />
                  {p.meta}
                </p>
                <h3 className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]">{p.title}</h3>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-bone-dim text-pretty">{p.text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* desktop sticky frame */}
      <div className="hidden lg:col-span-7 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] h-[calc(100svh-var(--header-h)-4rem)]">
          <figure className="relative h-full overflow-hidden border border-line bg-carbon">
            {process.map((p, i) => {
              const sc = sceneById(p.scene);
              return (
                <video
                  key={p.step}
                  ref={(el) => {
                    stickyVideos.current[i] = el;
                  }}
                  src={sc.clip}
                  poster={sc.still}
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  aria-label={sc.alt}
                  aria-hidden={active !== i}
                  className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-out-expo)] ${
                    active === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                />
              );
            })}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
            {/* frame furniture */}
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
              <span className="label text-bone/80">
                <span className="text-signal">{process[active].step}</span> · {sceneById(process[active].scene).label}
              </span>
              <span aria-hidden className="flex gap-1.5">
                {process.map((p, i) => (
                  <span key={p.step} className={`h-0.5 w-8 transition-colors duration-500 ${i === active ? "bg-signal" : "bg-bone/25"}`} />
                ))}
              </span>
            </figcaption>
            <span aria-hidden className="label absolute left-6 top-6 text-bone/50">
              Mercury · {String(active + 1).padStart(2, "0")}/04
            </span>
          </figure>
        </div>
      </div>
    </div>
  );
}
