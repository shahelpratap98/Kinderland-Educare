import { ArrowRight } from "lucide-react";
import { Reveal, RevealItem } from "@/components/reveal";
import { TourCta } from "@/components/tour-cta";
import { feeStructure } from "@/lib/content";

/**
 * Fee structure, between the hero and the slideshow.
 *
 * "Now open and taking new enrolments" leads as an eyebrow rather than a
 * heading: it is the piece of news a parent scanning the page needs first, but
 * it is a status, not the subject of the section.
 *
 * Deliberately no figures, and no fee table. Pricing was removed from the site
 * entirely, and this copy exists precisely because the structures vary by
 * programme — so it ends at the tour dialog, the same action every other
 * section on the page ends at.
 */
export function FeeStructure() {
  return (
    <section
      id="fees"
      className="border-b border-hairline"
      aria-labelledby="fees-heading"
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
              {feeStructure.eyebrow}
            </p>

            <h2
              id="fees-heading"
              className="mt-4 text-4xl font-normal text-ink sm:text-5xl"
            >
              {feeStructure.title}
            </h2>
          </RevealItem>

          <RevealItem>
            <div className="space-y-4">
              {feeStructure.body.map((p) => (
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
