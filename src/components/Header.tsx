"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";
import { Logo } from "./Logo";
import { PhoneIcon, buttonClass } from "./Button";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"));
        const all = [toggleRef.current!, ...items];
        const idx = all.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          all[all.length - 1].focus();
        } else if (!e.shiftKey && idx === all.length - 1) {
          e.preventDefault();
          all[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        open
          ? "border-b border-line bg-ink"
          : scrolled
            ? "border-b border-line/80 bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#sisu"
        className="label sr-only z-[60] bg-signal px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Liigu sisu juurde
      </a>
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="relative z-[51] -m-2 p-2 text-bone" aria-label="Mercury Transport, avaleht">
          <Logo />
        </Link>

        <nav aria-label="Peamenüü" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center px-3 text-[0.95rem] font-medium transition-colors hover:text-bone ${
                    isActive(item.href) ? "text-bone" : "text-bone-dim"
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && <span aria-hidden className="absolute inset-x-3 bottom-2 h-px bg-signal" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={site.phone.href}
            className="hidden min-h-11 items-center gap-2 px-2 font-mono text-sm text-bone-dim transition-colors hover:text-bone lg:inline-flex"
          >
            <span aria-hidden className="beacon size-1.5 rounded-full bg-amber" />
            {site.phone.display}
          </a>
          <Link href="/kontakt#paring" className={buttonClass("primary", "md", "min-h-11 px-4 text-sm")}>
            Küsi pakkumist
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={site.phone.href}
            aria-label={`Helista ${site.phone.display}`}
            className="relative z-[51] inline-flex size-12 items-center justify-center bg-signal text-ink"
          >
            <PhoneIcon />
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="relative z-[51] inline-flex size-12 items-center justify-center border border-bone/20 text-bone"
            aria-expanded={open}
            aria-controls="mobiilimenyy"
            aria-label={open ? "Sulge menüü" : "Ava menüü"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span
                className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobiilimenyy"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 top-0 z-50 flex flex-col bg-ink pt-[var(--header-h)] md:hidden"
      >
        <nav aria-label="Mobiilimenüü" className="wrap flex flex-1 flex-col overflow-y-auto pb-8 pt-6">
          <ul className="border-t border-line">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between py-3"
                >
                  <span className="display text-[2rem] leading-none">{item.label}</span>
                  <span className={`label ${isActive(item.href) ? "text-signal" : "text-steel"}`}>0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-10">
            <p className="label text-steel">Puksiirabi 24/7</p>
            <a href={site.phone.href} className={buttonClass("primary", "lg", "w-full")}>
              <PhoneIcon /> Helista {site.phone.display}
            </a>
            <Link href="/kontakt#paring" onClick={() => setOpen(false)} className={buttonClass("secondary", "lg", "w-full")}>
              Küsi pakkumist
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
