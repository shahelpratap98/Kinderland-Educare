"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useTourModal } from "@/components/tour-modal-provider";
import { centre } from "@/lib/content";
import { cn } from "@/lib/utils";

const links = [
  { href: "#programmes", label: "Programmes & fees" },
  { href: "#philosophy", label: "Our approach" },
  { href: "#faq", label: "FAQs" },
  { href: "#visit", label: "Visit us" },
];

/**
 * Header that condenses once the page scrolls.
 *
 * The scroll listener is passive and only flips a boolean — the visual change is
 * a CSS transition, so scrolling never runs animation work on the main thread.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useTourModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Escape closes the mobile menu, matching the dialog convention elsewhere. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    /*
      Zero-height sticky wrapper. The header's own content overflows it visibly, so
      the header overlays the hero photograph instead of sitting in the flow above
      it on the page background — where its white-on-blue treatment would be white
      on near-white. Height-agnostic on purpose: no magic offset to keep in sync
      with the header's padding.
    */
    <div className="sticky top-0 z-40 h-0">
      <header
        className={cn(
          "transition-[padding] duration-300 ease-out-strong",
          scrolled ? "py-2" : "py-3 sm:py-4",
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5",
            "transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out-strong",
            scrolled ? "glass shadow-card" : "bg-transparent",
          )}
        >
          <a href="#top" aria-label={`${centre.legalName} — home`}>
            <Logo onLight={scrolled} />
          </a>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-[color,background-color] duration-150 ease-out-strong",
                  scrolled
                    ? "text-slate-600 dark:text-slate-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100/70 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-900 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-900/40 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white"
                    : "text-white/90 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/20 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={centre.phoneHref}
              className={cn(
                "hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-[color,background-color] duration-150 ease-out-strong sm:inline-flex",
                scrolled
                  ? "text-slate-700 dark:text-slate-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-900/40"
                  : "text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/20",
              )}
            >
              <Phone className="size-4" />
              {centre.phone}
            </a>
            {/*
              Below sm the wordmark + CTA + menu button overflow a 375px viewport,
              so the CTA moves into the mobile menu (and the hero's own button is
              still on screen at that scroll position anyway).
            */}
            <Button size="sm" onClick={open} className="hidden sm:inline-flex">
              Schedule a tour
            </Button>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-full transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-90 lg:hidden",
                scrolled
                  ? "text-slate-700 dark:text-slate-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-900/40"
                  : "text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/20",
              )}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/*
          Mobile navigation. Uses the same grid-rows technique as the accordion so
          the links are never gated on a JS animation, and `inert` keeps them out
          of the tab order while collapsed.
        */}
        <div
          id="mobile-nav"
          inert={!menuOpen}
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out-strong lg:hidden",
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <nav aria-label="Mobile" className="overflow-hidden">
            <ul className="glass mt-2 space-y-0.5 rounded-2xl p-2 shadow-card">
              {/* Carries the CTA that the header drops below sm. */}
              <li className="mb-1 sm:hidden">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setMenuOpen(false);
                    open();
                  }}
                >
                  Schedule a tour
                </Button>
              </li>
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition-[background-color,color] duration-150 ease-out-strong active:bg-sky-100 dark:text-slate-200 dark:active:bg-sky-900/50"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="border-t border-slate-200/70 pt-1 dark:border-slate-700/60">
                <a
                  href={centre.phoneHref}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-[15px] font-medium text-brand-700 transition-[background-color] duration-150 ease-out-strong active:bg-sky-100 dark:text-brand-300 dark:active:bg-sky-900/50"
                >
                  <Phone className="size-4" />
                  {centre.phone}
                </a>
              </li>
            </ul>
          </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
