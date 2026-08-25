"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { useTourModal } from "@/components/tour-modal-provider";
import { centre, fullAddress } from "@/lib/content";

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
          {/*
            The centre's own strapline, the same words as centre.logoTagline. It
            is written out here rather than interpolated because the two-tone
            treatment emphasises individual words, which a single string cannot
            express — so if that value ever changes, change this with it.
          */}
          Where <em className="italic text-brand-600">dreams</em> and{" "}
          <em className="italic text-brand-600">creativity</em> meet.
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
          {/* The age range and the city stay interpolated rather than typed out,
              so they cannot drift from the values the rest of the site uses. */}
          A place for children to belong, explore, learn and grow. Through play,
          relationships and meaningful everyday experiences, children build
          confidence, independence, communication and a love of learning in our
          purpose-built early learning centre in {centre.address.city},
          welcoming children from {centre.ages}.
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
          This line overlaps the video, and the scrim was thinned so the sky reads
          — which left almost nothing behind it: measured 3.87–3.98:1 against the
          composited frame across the clip, under the 4.5 its 14px needs.

          So it carries its own chip rather than the scrim being thickened back
          up, which would bleach the sky again. A local backing fixes the one
          element that needs it and leaves the picture alone. Measured 11:1 at
          the darkest frame behind it.
        */}
      </div>

      {/*
        Pinned to the foot of the hero rather than sitting under the button.
        In the flow it landed across the middle of the clip, which is the part
        worth seeing; down here it reads as a caption to the whole frame and
        leaves the valley clear.

        Absolute, so the copy above keeps its own vertical rhythm and nothing
        shifts as the line wraps. The column's pb-40 reserves the room it sits
        in, so it never rides up over the button on a short screen.

        A full-width wrapper centres it, rather than left-1/2 with a translate.
        An absolutely positioned box given only `left` can shrink-to-fit no wider
        than the space remaining to its right — half the section — so the chip
        wrapped to two lines on a 1440px screen with room to spare either side.
      */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center px-4 sm:bottom-10">
        <p className="animate-fade-rise-delay-2 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-background/75 px-5 py-2.5 text-sm text-ink backdrop-blur-sm">
          <span>
            {centre.hours.days}, {centre.hours.open} – {centre.hours.close}
          </span>
          <span aria-hidden className="text-muted/40">
            &middot;
          </span>
          <span>{fullAddress}</span>
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
