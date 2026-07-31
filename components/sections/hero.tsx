"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { useTourModal } from "@/components/tour-modal-provider";
import { centre } from "@/lib/content";

/**
 * Cinematic hero.
 *
 * The headline follows the spec's two-tone treatment — black for the statement,
 * grey italic for the words carrying the feeling. Entrance is CSS-only
 * (animate-fade-rise and its delayed variants) rather than Framer: it plays once
 * on load, is never interrupted, and CSS keyframes run off the main thread, so it
 * stays smooth while the fonts and the 30MB video are still arriving.
 */
export function Hero() {
  const { open } = useTourModal();

  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden">
      <HeroVideo />

      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 pb-40 text-center"
        style={{ paddingTop: "calc(8rem - 75px)" }}
      >
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal text-ink sm:text-7xl md:text-8xl"
          style={{ lineHeight: 0.95, letterSpacing: "-2.46px" }}
        >
          Nurturing <em className="italic text-brand-600">enquiring minds</em> and a
          lifelong love of{" "}
          <em className="italic text-brand-600">discovery.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {centre.logoTagline}. Kinderland Educare offers consistent, high-standard
          early childhood education for children from {centre.ages}, in a
          purpose-built centre in {centre.address.suburb}, South Auckland.
        </p>

        <button
          onClick={open}
          className="animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full bg-brand-600 px-14 py-5 text-base text-background transition-transform duration-200 ease-out-strong active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]"
        >
          Schedule a tour
        </button>

        {/*
          Not in the spec's hero, kept deliberately: a parent comparing centres
          needs the suburb and the hours, and this is the only place above the fold
          that carries them. One muted line, so it does not disturb the composition.
        */}
        {/*
          Ink rather than muted, unlike the description above it. This line sits low
          enough to overlap the video, where the scrim has thinned to ~0.6 white —
          grey measures roughly 3.3–3.8:1 against the composited frame, under AA.
          The scrim's 0.6 floor means black clears 7:1 against even the darkest
          possible frame, so it stays legible whatever the clip is doing.
        */}
        <p className="animate-fade-rise-delay-2 mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink">
          <span>
            {centre.address.street}, {centre.address.suburb}
          </span>
          <span aria-hidden className="text-muted/40">
            &middot;
          </span>
          <span>
            {centre.hours.days}, {centre.hours.open} – {centre.hours.close}
          </span>
          <span aria-hidden className="text-muted/40">
            &middot;
          </span>
          <Link
            href="/age-groups"
            className="inline-flex items-center gap-1 underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
          >
            Our age groups
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
