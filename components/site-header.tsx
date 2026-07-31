"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useTourModal } from "@/components/tour-modal-provider";
import { centre } from "@/lib/content";
import { cn } from "@/lib/utils";

/*
  Absolute paths throughout. Bare "#philosophy" only resolves on the home page —
  from /faqs or an age group page it would silently do nothing, so the in-page
  targets are written as "/#philosophy".
*/
const links = [
  { href: "/", label: "Home" },
  { href: "/age-groups", label: "Age groups" },
  { href: "/#philosophy", label: "Our approach" },
  { href: "/faqs", label: "FAQs" },
  { href: "/#visit", label: "Visit us" },
];

/**
 * Navigation.
 *
 * Sits in normal flow rather than overlaying the hero. On `main` the hero was a
 * blue photograph, so the header had to float above it with white text; here the
 * ground is white, so dark type in flow is both spec-faithful and removes the
 * overlay's failure mode entirely.
 *
 * Sticky is kept — there are five sections below and a persistent CTA is worth it.
 * The scroll listener is passive and only flips a boolean; the visual change is a
 * CSS transition, so scrolling never runs animation work on the main thread.
 */
/*
  Same-page anchors ("/#philosophy") are only "current" while you are on the home
  page, and even then they describe a section rather than a page — so they never
  claim aria-current. Age group children like /age-groups/under-2s keep the
  Age groups link marked.
*/
function isActive(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
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
    <header
      className={cn(
        "sticky top-0 z-20 transition-[background-color,backdrop-filter,border-color] duration-300 ease-out-strong",
        scrolled
          ? "border-b border-hairline bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <a href="#top" aria-label={`${centre.legalName} — home`}>
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const active = isActive(l.href, pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors duration-150 ease-out-strong",
                  /* The spec marks the current page in the display colour, the rest in grey. */
                  active ? "text-ink" : "text-muted",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            className="hidden cursor-pointer rounded-full bg-brand-600 px-6 py-2.5 text-sm text-background transition-transform duration-200 ease-out-strong active:scale-[0.98] sm:inline-flex [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]"
          >
            Schedule a tour
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-ink transition-[transform,background-color] duration-150 ease-out-strong active:scale-90 lg:hidden [@media(hover:hover)_and_(pointer:fine)]:hover:bg-wash"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/*
        Mobile navigation. Uses the grid-rows technique rather than a JS height
        animation so the links are never gated on an animation finishing, and
        `inert` keeps them out of the tab order while collapsed.
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
          <ul className="border-t border-hairline px-6 pb-6 pt-2 sm:px-8">
            <li className="pb-2 sm:hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  open();
                }}
                className="w-full cursor-pointer rounded-full bg-brand-600 px-6 py-3 text-sm text-background transition-transform duration-200 ease-out-strong active:scale-[0.98]"
              >
                Schedule a tour
              </button>
            </li>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(l.href, pathname) ? "page" : undefined}
                  className={cn(
                    "block py-3 text-[15px] transition-colors duration-150 ease-out-strong active:text-ink",
                    isActive(l.href, pathname) ? "text-ink" : "text-muted",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-hairline pt-3">
              <a
                href={centre.phoneHref}
                className="block py-1 text-[15px] text-ink"
              >
                {centre.phone}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
