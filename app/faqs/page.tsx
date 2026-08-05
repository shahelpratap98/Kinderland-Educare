import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HeroVideo } from "@/components/hero-video";
import { TourCta } from "@/components/tour-cta";
import { centre, faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Questions parents ask",
  description:
    "Common questions about enrolling at Kinderland Educare in Māngere — ages, the 20 Hours ECE subsidy, halal meals, opening hours and how enrolment works.",
  alternates: { canonical: "/faqs" },
};

/*
  FAQPage structured data. Mirrors exactly what is rendered below — search engines
  penalise markup that does not match visible content, and it would drift the
  moment the two are maintained separately, so both read from lib/content.ts.
*/
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    /* Multi-paragraph answers are joined, so the markup still carries the whole
       answer the page shows rather than only its first paragraph. */
    acceptedAnswer: {
      "@type": "Answer",
      text: typeof f.a === "string" ? f.a : f.a.join(" "),
    },
  })),
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative isolate overflow-hidden border-b border-hairline bg-plum-900">
        <HeroVideo variant="compact" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-normal text-background sm:text-5xl md:text-6xl">
            Questions parents ask
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/85">
            If yours isn&apos;t here, call us on{" "}
            {/*
              White rather than brand orange: vermillion on the darkened video
              measures well under AA, and the underline is what marks it as a link
              here, not the colour.
            */}
            <a
              href={centre.phoneHref}
              className="font-medium text-background underline decoration-background/50 decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:decoration-background"
            >
              {centre.phone}
            </a>{" "}
            — we&apos;d rather talk it through.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <Card className="px-6 py-2 sm:px-8">
            <Accordion items={faqs} />
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <Card className="p-6">
              <h2 className="font-display text-xl font-normal text-ink">
                Still deciding?
              </h2>
              <p className="mt-2 text-[15px] text-muted">
                The best way to choose a centre is to stand in it. Visits run{" "}
                {centre.hours.days}.
              </p>
              <TourCta className="mt-4 w-full" size="md">
                Schedule a tour
                <ArrowRight className="size-4" aria-hidden />
              </TourCta>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl font-normal text-ink">
                Looking for a room?
              </h2>
              <p className="mt-2 text-[15px] text-muted">
                See what each age group does day to day.
              </p>
              <Link
                href="/age-groups"
                className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-brand-700 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
              >
                All age groups
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
