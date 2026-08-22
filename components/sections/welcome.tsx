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
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
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
            <div className="space-y-4">
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
