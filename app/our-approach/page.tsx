import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { Slideshow } from "@/components/sections/slideshow";
import { TourCta } from "@/components/tour-cta";
import { approach, centre, centreSlides } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our approach",
  description:
    "What Kinderland Educare believes about children, families, teachers and our community — early childhood education and care in Māngere, Auckland.",
  alternates: { canonical: "/our-approach" },
};

export default function OurApproachPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-hairline bg-plum-900">
        <HeroVideo variant="compact" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          {/* Was "What we believe", which named a section that no longer exists
              on this page. The centre's new copy opens with "About Us", so that
              is the page's heading and the body starts at its first paragraph. */}
          <h1 className="max-w-3xl text-4xl font-normal text-background sm:text-5xl md:text-6xl">
            {approach.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/85">
            The thinking behind an ordinary day at {centre.name} — about
            children, the families they belong to, and the people and places
            around them.
          </p>
        </div>
      </section>

      {/*
        Leads the page, straight after the header: the photographs show what the
        words below then explain. Reuses the home page's slideshow rather than a
        second implementation — only the slides and image folder differ.
      */}
      <Slideshow
        slides={centreSlides}
        heading="Have a look around"
        description="The rooms, the grounds and the corners in between — photographed on an ordinary day, before everyone arrived."
        label="Photographs of the centre"
        basePath="/centre"
      />

      {/*
        Prose rather than the previous card-per-theme grid. This copy is
        continuous paragraphs, not bullet points, and boxing each theme would
        break the reading line for no gain — the measure is capped instead so a
        line stays comfortable on a wide screen.
      */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <div className="space-y-4">
            {approach.intro.map((p) => (
              <p key={p} className="text-[17px] leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 space-y-11">
            {approach.sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-2xl font-normal text-ink">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 border-l-2 border-brand-400 pl-5 sm:pl-6">
                  {section.body.map((p) => (
                    <p key={p} className="text-[17px] leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <TourCta size="lg">
            Come and see it in practice
            <ArrowRight className="size-4" aria-hidden />
          </TourCta>
          <Link
            href="/age-groups"
            className="inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-700 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
          >
            See the age groups
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
