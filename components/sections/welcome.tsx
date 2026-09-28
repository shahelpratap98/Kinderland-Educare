import { ArrowRight } from "lucide-react";
import { Reveal, RevealItem } from "@/components/reveal";
import { TourCta } from "@/components/tour-cta";
import { welcome } from "@/lib/content";

/**
 * Welcome panel, between the hero and the slideshow.
 *
 * "Now open and taking new enrolments" leads as an eyebrow rather than a
 * heading: it is the piece of news a parent scanning the page needs first, but
 * it is a status, not the subject of the section.
 *
 * The heading is a full sentence rather than a label, so it is set at the same
 * size as the other section headings and allowed to wrap across the narrow
 * column — it reads as a statement, which is what it is.
 */
export function Welcome() {
  return (
    <section
      id="welcome"
      className="border-b border-hairline"
      aria-labelledby="welcome-heading"
    >
      {/* Asymmetric padding: the hero video now runs to the very bottom of its
          section, so a full py-20 above this left an obvious dead band between
          the picture and the first line of copy. The gap the centre marked was
          mostly the clipped video, fixed separately; this trims what remained.
          The bottom padding is unchanged — it separates this from the deck. */}
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-9 sm:px-6 sm:pb-20 sm:pt-12">
        <Reveal className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <RevealItem>
            {/*
              leaf-300 at 18%, not a leaf-50 — the scale starts at 300.

              The tint is measured, not chosen by eye. Tailwind composites the
              opacity modifier in oklab, so the resulting pixel is not what an
              sRGB calculation predicts: /25 looked fine and measured 4.35:1,
              under the 4.5 this 13px text needs. /18 measures 5.23:1.
            */}
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-300/18 px-3.5 py-1.5 text-[13px] font-medium text-leaf-800">
              {/* Decorative dot; the words carry the meaning on their own. */}
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-leaf-600"
              />
              {welcome.eyebrow}
            </p>

            <h2
              id="welcome-heading"
              className="mt-4 text-4xl font-normal text-ink sm:text-5xl"
            >
              {welcome.title}
            </h2>
          </RevealItem>

          <RevealItem>
            {/*
              The greetings sit above the body copy, where the centre circled
              them. Set in the display face between body and heading size: this
              is a welcome in nine languages, not a subheading, and it should
              read as warmth rather than as a label.

              The bullets are separate aria-hidden spans rather than characters
              in the text, so assistive tech announces nine greetings instead of
              "Assalamu Aaikum bullet Kia ora bullet ...". flex-wrap breaks
              between greetings rather than mid-phrase, which matters for
              "Mālō e lelei" and "Sat Sri Akal".
            */}
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-display text-xl leading-relaxed text-brand-700 sm:text-2xl">
              {welcome.greetings.map((g, i) => (
                <span key={g} className="inline-flex items-center gap-x-2.5">
                  {i > 0 && (
                    <span aria-hidden className="text-brand-700/40">
                      •
                    </span>
                  )}
                  {g}
                </span>
              ))}
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-ink">
              {welcome.greetingLead}
            </p>

            <div className="mt-6 space-y-4">
              {welcome.body.map((p) => (
                <p key={p} className="text-[17px] leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>

            <TourCta className="mt-8" size="lg">
              Book a visit
              <ArrowRight className="size-4" aria-hidden />
            </TourCta>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
