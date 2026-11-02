"use client";

import { useEffect, useRef, useState } from "react";
import { film, scenes } from "@/content/media";
import { site } from "@/config/site";
import { Arrow, LinkButton } from "../Button";
import { CallButton } from "../CallButton";

function pickSource() {
  const w = window.innerWidth;
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  if (w < 768 && portrait) return film.mobile;
  return w * (window.devicePixelRatio || 1) > 1700 ? film.desktop : film.tablet;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" />
      <rect x="7" y="1" width="3" height="10" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="currentColor">
      <path d="M3 1l8 5-8 5z" />
    </svg>
  );
}

const tc = (s: number) => `00:${String(Math.floor(s)).padStart(2, "0")}`;

export function FilmHero() {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    v.src = pickSource();
    if (reduced || nav.connection?.saveData) {
      // Respect the visitor: show the still, let them start the film themselves.
      userPaused.current = true;
      v.preload = "metadata";
      return;
    }
    v.play().catch(() => {});

    // Pause while scrolled away, resume when back (unless the visitor paused it)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) v.pause();
      else if (!userPaused.current) v.play().catch(() => {});
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  let scene = 0;
  scenes.forEach((s, k) => {
    if (time >= s.at) scene = k;
  });
  const sceneEnd = scenes[scene + 1]?.at ?? film.duration;
  const sceneProgress = Math.min(100, ((time - scenes[scene].at) / (sceneEnd - scenes[scene].at)) * 100);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate h-[max(100svh,640px)] overflow-hidden bg-ink lg:h-[max(100svh,760px)]"
    >
      {/* The poster is a real image, so text and buttons never wait for the video */}
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 767px) and (orientation: portrait)" srcSet={film.posterMobile} />
        <img src={film.poster} alt="" className="size-full object-cover" fetchPriority="high" />
      </picture>
      <video
        ref={video}
        className={`absolute inset-0 -z-10 size-full object-cover transition-opacity duration-1000 ${started ? "opacity-100" : "opacity-0"}`}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={film.alt}
        onPlaying={() => {
          setStarted(true);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      />
      {/* grade + legibility */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/10 to-ink/35" />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-ink/70 via-ink/10 to-transparent lg:block" />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+1rem)] hidden lg:block">
        <div className="wrap flex justify-between">
          <span className="label text-bone/60">Reg. {site.registryCode} · Tallinn / EE</span>
          <span className="label flex items-center gap-2 text-bone/70">
            <span className="beacon size-1.5 rounded-full bg-amber" /> Valves 24/7
          </span>
        </div>
      </div>

      <div className="flex h-full flex-col justify-end pb-8 pt-[calc(var(--header-h)+2rem)] lg:pb-[clamp(2.5rem,7vh,5.5rem)]">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label rise flex items-center gap-3 text-bone/80">
              <span className="beacon size-1.5 rounded-full bg-amber" />
              Puksiirabi 24/7 · Kogu Eesti
            </p>
            <h1
              id="hero-title"
              className="display rise mt-5 max-w-[12ch] text-[clamp(2.9rem,12vw,3.8rem)] [animation-delay:80ms] [text-shadow:0_2px_40px_rgb(0_0_0/0.35)] sm:text-[clamp(3.6rem,9vw,5.4rem)] lg:max-w-[11ch] lg:text-[clamp(4.5rem,7vw,8rem)]"
            >
              Kindel vedu. <span className="text-signal">Võimas</span> teostus.
            </h1>
            <p className="rise mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-bone/85 [animation-delay:160ms] text-pretty lg:text-lg">
              Ööpäevaringne puksiirabi, sõidukite ja ehitustehnika vedu ning muud haagisveod üle kogu Eesti.
            </p>
            <div className="rise mt-7 grid gap-3 [animation-delay:240ms] xs:flex xs:flex-wrap">
              <CallButton size="lg" className="w-full xs:w-auto" />
              <LinkButton href="/kontakt#paring" variant="secondary" size="lg" className="w-full xs:w-auto">
                Küsi pakkumist <Arrow />
              </LinkButton>
            </div>
          </div>

          {/* Film index: timecode + scene names, synced with playback */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="ml-auto max-w-xs border-t border-bone/20 pt-4">
              <div className="flex items-center justify-between">
                <span className="label text-bone/60" aria-hidden>
                  {tc(time)} / {tc(film.duration)}
                </span>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Peata video" : "Mängi video"}
                  className="inline-flex size-11 items-center justify-center border border-bone/25 text-bone transition-colors hover:border-bone/70"
                >
                  <PlayIcon playing={playing} />
                </button>
              </div>
              <ol className="mt-4 space-y-1.5" aria-label="Filmi stseenid">
                {scenes.map((s, i) => {
                  const on = i === scene && started;
                  return (
                    <li key={s.id} className={`label flex items-center gap-3 transition-colors duration-500 ${on ? "text-bone" : "text-bone/40"}`}>
                      <span className={on ? "text-signal" : ""}>{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                      <span aria-hidden className="relative ml-auto h-px w-16 overflow-hidden bg-bone/15">
                        {on && <span className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${sceneProgress}%` }} />}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* mobile/tablet pause control */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Peata video" : "Mängi video"}
        className="absolute right-[var(--gutter)] top-[calc(var(--header-h)+0.75rem)] inline-flex size-11 items-center justify-center border border-bone/25 bg-ink/30 text-bone backdrop-blur lg:hidden"
      >
        <PlayIcon playing={playing} />
      </button>
    </section>
  );
}
