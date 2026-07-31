import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TourCta } from "@/components/tour-cta";
import { ageGroups, centre } from "@/lib/content";

export const metadata: Metadata = {
  title: "Age groups",
  description: `Three rooms at Kinderland Educare, for children from ${centre.ages} — under 2s, 2 to 3 years, and 3 years and over with 20 Hours ECE.`,
  alternates: { canonical: "/age-groups" },
};

export default function AgeGroupsIndex() {
  return (
    <>
      <section className="border-b border-hairline bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-normal text-ink sm:text-5xl md:text-6xl">
            Growing up at Kinderland
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Each room is shaped around where your child is right now — from
            unhurried days with our youngest, through to children who direct their
            own learning and are ready for school.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {ageGroups.map((g) => (
            <Link key={g.slug} href={`/age-groups/${g.slug}`} className="group">
              <Card interactive className="flex h-full flex-col p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium text-muted">
                    {g.ageRange}
                  </span>
                  {g.subsidy && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-0.5 text-[12px] font-medium text-plum-900">
                      <Sparkles className="size-3" aria-hidden />
                      {g.subsidy}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 font-display text-2xl font-normal text-ink">
                  {g.label}
                </h2>
                <p className="mt-3 text-[15px] text-muted">{g.blurb}</p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-brand-700">
                  Read more
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <TourCta size="lg">
            Schedule a tour
            <ArrowRight className="size-4" aria-hidden />
          </TourCta>
          <p className="text-[15px] text-muted">
            Or call us on{" "}
            <a
              href={centre.phoneHref}
              className="font-medium text-brand-700 underline decoration-hairline decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
            >
              {centre.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
