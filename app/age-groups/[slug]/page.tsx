import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HeroVideo } from "@/components/hero-video";
import { Icon } from "@/components/icon";
import { TourCta } from "@/components/tour-cta";
import { ageGroups, centre, enrolmentFacts } from "@/lib/content";

type Params = { slug: string };

/* Prerenders all three rooms at build time — the set is fixed and small. */
export function generateStaticParams(): Params[] {
  return ageGroups.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = ageGroups.find((g) => g.slug === slug);
  if (!group) return {};

  return {
    title: `${group.label} (${group.ageRange})`,
    description: `${group.lead} ${group.blurb}`,
    alternates: { canonical: `/age-groups/${group.slug}` },
  };
}

export default async function AgeGroupPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const group = ageGroups.find((g) => g.slug === slug);
  if (!group) notFound();

  const others = ageGroups.filter((g) => g.slug !== slug);
  /* First photo leads the page; the rest form a grid further down. */
  const [lead, ...gallery] = group.photos;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-hairline bg-plum-900">
        <HeroVideo variant="compact" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Link
            href="/age-groups"
            className="inline-flex items-center gap-1.5 text-sm text-background/80 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-background"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            All age groups
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/*
              A translucent chip rather than the solid white one used on light
              sections — solid white here would punch a hole in the video.
            */}
            <span className="rounded-full bg-background/15 px-3 py-1 text-[13px] font-medium text-background ring-1 ring-inset ring-background/30 backdrop-blur-sm">
              {group.ageRange}
            </span>
            {/* Sun yellow already carries dark text, so it works over the video unchanged. */}
            {group.subsidy && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-3 py-1 text-[13px] font-medium text-plum-900">
                <Sparkles className="size-3.5" aria-hidden />
                {group.subsidy}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-normal text-background sm:text-5xl md:text-6xl">
            {group.label}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/85">{group.lead}</p>
        </div>
      </section>

      {/*
        Lead photograph. Absent until this room has photos, so the page reads as
        finished either way rather than leaving an empty frame. 3:2 to match the
        derivatives, so the browser does no cropping of its own.
      */}
      {lead && (
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
          <figure>
            <div className="aspect-[3/2] w-full overflow-hidden rounded-3xl bg-wash hairline">
              <picture>
                <source srcSet={`/rooms/${lead.src}.webp`} type="image/webp" />
                <img
                  src={`/rooms/${lead.src}.jpg`}
                  alt={lead.alt}
                  /* The lead image is above the fold on this page, so it is not lazy. */
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>
            </div>
            {lead.caption && (
              <figcaption className="mt-3 text-[14px] text-muted">
                {lead.caption}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-normal text-ink sm:text-4xl">
              What the day looks like
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">
              {group.blurb}
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              {group.body}
            </p>

            <ul className="mt-8 space-y-3">
              {group.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[15px] text-ink">
                  <Check
                    className="mt-1 size-4 shrink-0 text-leaf-600"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display text-xl font-normal text-ink">
                Session options
              </h3>
              <p className="mt-2 text-[15px] text-muted">
                We&apos;re open {centre.hours.days}, {centre.hours.open} –{" "}
                {centre.hours.close}.
              </p>
              <dl className="mt-4 space-y-3">
                {enrolmentFacts.sessions.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between gap-4 rounded-xl bg-wash px-4 py-3"
                  >
                    <dt className="text-[15px] font-medium text-ink">{s.name}</dt>
                    <dd className="inline-flex items-center gap-1.5 text-[14px] text-muted">
                      <Clock className="size-3.5" aria-hidden />
                      {s.window}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/*
              No figures anywhere: pricing was removed from the site, so cost
              enquiries go to the centre rather than to a number that could fall
              out of date. The terms below are policies, not amounts.
            */}
            <Card className="p-6">
              <h3 className="font-display text-xl font-normal text-ink">
                Fees &amp; enrolment
              </h3>
              <p className="mt-2 text-[15px] text-muted">
                For current fees and a registration pack, call us on{" "}
                <a
                  href={centre.phoneHref}
                  className="font-medium text-brand-700 underline decoration-hairline decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
                >
                  {centre.phone}
                </a>{" "}
                or book a visit.
              </p>
              <ul className="mt-4 space-y-3.5">
                {enrolmentFacts.policies.map((p) => (
                  <li key={p.title} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-wash text-brand-700">
                      <Icon name={p.icon} className="size-4" />
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">{p.title}</p>
                      <p className="mt-0.5 text-[14px] text-muted">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <TourCta className="w-full" size="md">
              Book a visit
              <ArrowRight className="size-4" aria-hidden />
            </TourCta>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
          <h2 className="mb-6 text-2xl font-normal text-ink sm:text-3xl">
            Inside the room
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((photo) => (
              <li key={photo.src}>
                <figure>
                  <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl bg-wash hairline">
                    <picture>
                      <source srcSet={`/rooms/${photo.src}.webp`} type="image/webp" />
                      <img
                        src={`/rooms/${photo.src}.jpg`}
                        alt={photo.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </picture>
                  </div>
                  {photo.caption && (
                    <figcaption className="mt-2 text-[13px] text-muted">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-hairline bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-normal text-ink sm:text-3xl">
            Other age groups
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((g) => (
              <Link key={g.slug} href={`/age-groups/${g.slug}`} className="group">
                <Card
                  interactive
                  className="h-full p-6 transition-colors duration-200 ease-out-strong"
                >
                  <p className="text-[13px] font-medium text-muted">{g.ageRange}</p>
                  <h3 className="mt-1 font-display text-xl font-normal text-ink">
                    {g.label}
                  </h3>
                  <p className="mt-2 text-[15px] text-muted">{g.lead}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-brand-700">
                    Read more
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
