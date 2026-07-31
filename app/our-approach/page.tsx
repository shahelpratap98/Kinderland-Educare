import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TourCta } from "@/components/tour-cta";
import { beliefs, centre, visionMission } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our approach",
  description:
    "What Kinderland Educare believes about children, parents, teachers, our community and our environment — the vision and mission behind a day at the centre in Māngere.",
  alternates: { canonical: "/our-approach" },
};

export default function OurApproachPage() {
  return (
    <>
      <section className="border-b border-hairline bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-normal text-ink sm:text-5xl md:text-6xl">
            What we believe
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            The thinking behind an ordinary day at {centre.name} — about
            children, the families they belong to, and the people and places
            around them.
          </p>
        </div>
      </section>

      {/* Vision and Mission verbatim; see the note in lib/content.ts. */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {(
            [
              ["Vision", visionMission.vision],
              ["Mission", visionMission.mission],
            ] as const
          ).map(([label, body]) => (
            <div key={label} className="border-l-2 border-brand-400 pl-5 sm:pl-6">
              <h2 className="font-display text-2xl font-normal text-ink">
                {label}
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-normal text-ink sm:text-4xl">
            We believe
          </h2>

          <div className="mt-10 space-y-5">
            {beliefs.map((group) => (
              <Card key={group.title} className="p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.8fr_2.2fr] lg:gap-10">
                  {/*
                    The heading completes the sentence for every point beneath it
                    ("We believe: children belong first to a family…"), so the two
                    are kept visually paired rather than run together as one list.
                  */}
                  <h3 className="font-display text-2xl font-normal text-ink lg:sticky lg:top-28 lg:self-start">
                    {group.title}
                  </h3>

                  <ul className="space-y-4">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check
                          className="mt-1.5 size-4 shrink-0 text-brand-600"
                          strokeWidth={3}
                          aria-hidden
                        />
                        <span className="text-[16px] leading-relaxed text-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
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
