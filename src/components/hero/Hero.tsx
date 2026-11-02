"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heroState, sceneConfig } from "@/config/scene";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { Arrow, LinkButton } from "../Button";
import { CallButton } from "../CallButton";
import type { SceneProfile } from "../three/Scene";

const Scene = dynamic(() => import("../three/Scene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

function detect(): { mode: Mode; profile: SceneProfile; pinned: boolean; intro: boolean } {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches || window.matchMedia("(min-width: 1180px)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const weak =
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory < 3) ||
    nav.connection?.saveData === true;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const forceStatic = new URLSearchParams(window.location.search).has("static");
  const mode: Mode = !webgl || reduced || weak || forceStatic ? "static" : "3d";
  const profile: SceneProfile = desktop ? "desktop" : "mobile";
  return { mode, profile, pinned: mode === "3d" && profile === "desktop", intro: !new URLSearchParams(window.location.search).has("nointro") };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ mode: Mode; profile: SceneProfile; pinned: boolean; intro: boolean }>({
    mode: "pending",
    profile: "desktop",
    pinned: false,
    intro: true,
  });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Capability detection must run in the browser after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(detect());
  }, []);

  // Pause rendering while the hero is offscreen
  useEffect(() => {
    if (state.mode !== "3d" || !root.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(root.current);
    const onVis = () => setActive(!document.hidden && root.current!.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [state.mode]);

  // Pointer parallax (desktop only)
  useEffect(() => {
    if (!state.pinned) return;
    const onMove = (e: PointerEvent) => {
      heroState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [state.pinned]);

  // Scroll choreography: camera progress + text transitions on one timeline
  useEffect(() => {
    if (!state.pinned || !root.current) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              heroState.progress = self.progress;
            },
          },
        });
        tl.to(copyRef.current, { autoAlpha: 0, y: -60, duration: 0.25 }, 0.12)
          .fromTo(
            servicesRef.current,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.25 },
            0.62,
          )
          .fromTo(
            servicesRef.current!.querySelectorAll("[data-stagger]"),
            { autoAlpha: 0, x: -24 },
            { autoAlpha: 1, x: 0, stagger: 0.04, duration: 0.18 },
            0.68,
          )
          .to({}, { duration: 0.1 }, 0.9);
      }, root);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
      heroState.progress = 0;
    };
  }, [state.pinned]);

  const show3d = state.mode === "3d";

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className={`relative bg-ink ${state.pinned ? "h-[260vh]" : ""}`}
      data-hero-mode={state.mode}
    >
      <div
        className={`relative w-full overflow-hidden ${
          state.pinned ? "sticky top-0 h-svh" : "h-[max(100svh,640px)] lg:h-[max(100svh,720px)]"
        }`}
      >
        {/* Static still: shown immediately, kept for no-WebGL / reduced motion */}
        <picture
          className={`absolute inset-0 transition-opacity duration-1000 ${ready && show3d ? "opacity-0" : "opacity-100"}`}
        >
          <source media="(min-width: 1024px)" srcSet={sceneConfig.stills.desktop} />
          <img
            src={sceneConfig.stills.mobile}
            alt="Mercury Transporti valge puksiirauto, mille platvormil on oranž minikopp, pimedas stuudios"
            className="size-full object-cover object-[60%_50%] lg:object-center"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {show3d && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Scene profile={state.profile} active={active} animate intro={state.intro} onReady={() => setReady(true)} />
          </div>
        )}

        {/* legibility gradients */}
        <div data-overlay aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/20 lg:to-transparent" />
        <div data-overlay aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        {/* Technical overlay labels */}
        <div data-overlay aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+1rem)] hidden lg:block">
          <div className="wrap flex justify-between">
            <span className="label text-steel">Reg. 14063837 · Tallinn / EE</span>
            <span className="label flex items-center gap-2 text-steel-2">
              <span className="beacon size-1.5 rounded-full bg-amber" /> Valves 24/7
            </span>
          </div>
        </div>

        {/* Layer A — hero copy */}
        <div
          ref={copyRef}
          data-overlay
          className="absolute inset-0 flex flex-col justify-between pb-6 pt-[calc(var(--header-h)+1.5rem)] lg:justify-end lg:pb-[clamp(3rem,9vh,7rem)]"
        >
          <div className="wrap">
            <p className="label rise flex items-center gap-3 text-steel-2 lg:hidden">
              <span className="beacon size-1.5 rounded-full bg-amber" />
              Puksiirabi 24/7 · Kogu Eesti
            </p>
            <h1
              id="hero-title"
              className="display rise mt-4 max-w-[13ch] text-[clamp(2.6rem,11.5vw,3.6rem)] [animation-delay:80ms] sm:text-[clamp(3.4rem,8vw,5rem)] lg:mt-0 lg:max-w-[11ch] lg:text-[clamp(4.25rem,6.6vw,7.4rem)]"
            >
              Kindel vedu. <span className="text-signal">Võimas</span> teostus.
            </h1>
          </div>
          <div className="wrap">
            <p className="rise max-w-[34rem] text-[1.05rem] leading-relaxed text-bone-dim [animation-delay:160ms] text-pretty lg:mt-8 lg:text-lg">
              Ööpäevaringne puksiirabi, sõidukite ja ehitustehnika vedu ning muud haagisveod üle kogu Eesti.
            </p>
            <div className="rise mt-6 grid gap-3 [animation-delay:240ms] xs:flex xs:flex-wrap lg:mt-9">
              <CallButton size="lg" className="w-full xs:w-auto" />
              <LinkButton href="/kontakt#paring" variant="secondary" size="lg" className="w-full xs:w-auto">
                Küsi pakkumist <Arrow />
              </LinkButton>
            </div>
            <p className="label mt-4 hidden text-steel lg:block">
              <a href={site.phone.href} className="hover:text-bone">
                {site.phone.display}
              </a>
            </p>
          </div>
        </div>

        {/* Layer B — service introduction at the side view (desktop pinned only) */}
        {state.pinned && (
          <div ref={servicesRef} className="invisible absolute inset-0 flex items-center opacity-0">
            <div className="wrap">
              <div className="max-w-[30rem]">
                <p className="label text-signal" data-stagger>
                  Teenused / 04
                </p>
                <h2 className="display mt-5 text-[clamp(2.6rem,4.2vw,4.4rem)]" data-stagger>
                  Üks platvorm. Neli lahendust.
                </h2>
                <ul className="mt-8 border-t border-line">
                  {services.map((s) => (
                    <li key={s.slug} data-stagger className="border-b border-line">
                      <Link
                        href={`/teenused/${s.slug}`}
                        className="group flex min-h-14 items-center gap-5 py-3 transition-colors hover:text-signal"
                      >
                        <span className="label text-steel">{s.code}</span>
                        <span className="text-lg font-semibold">{s.title}</span>
                        <Arrow className="ml-auto opacity-50 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {state.pinned && (
          <div data-overlay aria-hidden className="pointer-events-none absolute bottom-6 right-[var(--gutter)] flex items-center gap-3">
            <span className="label text-steel">Keri</span>
            <span className="relative h-10 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[rise_1.6s_ease-in-out_infinite_alternate] bg-signal" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
