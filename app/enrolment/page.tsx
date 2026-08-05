import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, FileText, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HeroVideo } from "@/components/hero-video";
import { Icon } from "@/components/icon";
import { TourCta } from "@/components/tour-cta";
import { cn } from "@/lib/utils";
import {
  centre,
  enrolmentDocs,
  enrolmentFacts,
  enrolmentSteps,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Enrolment",
  description:
    "How to enrol at Kinderland Educare in Māngere — book a visit, download the parent information pack and enrolment form, and see what to bring.",
  alternates: { canonical: "/enrolment" },
};

export default function EnrolmentPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-hairline bg-plum-900">
        <HeroVideo variant="compact" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-normal text-background sm:text-5xl md:text-6xl">
            Enrolling with us
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/85">
            Three steps, and none of them are paperwork you have to do alone.
            Start with a visit — everything else is easier once you&apos;ve stood
            in the room.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <ol className="grid gap-5 lg:grid-cols-3">
          {/*
            The three step numbers run the logo's three colours in order —
            vermillion, tree green, sun. All are used at 4xl, which is large text,
            so each clears the 3:1 it needs; sun would fail as body copy.
          */}
          {enrolmentSteps.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full p-6 sm:p-7">
                <span
                  aria-hidden
                  className={cn(
                    "font-display text-4xl",
                    ["text-brand-600", "text-leaf-700", "text-sun-700"][i % 3],
                  )}
                >
                  {i + 1}
                </span>
                <h2 className="mt-3 font-display text-xl font-normal text-ink">
                  {step.title}
                </h2>
                <p className="mt-2 text-[15px] text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-hairline bg-wash">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-normal text-ink sm:text-4xl">
              Forms &amp; information
            </h2>
            <p className="mt-4 text-lg text-muted">
              Have a read before you visit, or bring your questions with you.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {enrolmentDocs.map((doc) => (
              <li key={doc.id}>
                <Card className="flex h-full flex-col p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-background text-brand-600 hairline">
                    <FileText className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal text-ink">
                    {doc.name}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] text-muted">
                    {doc.description}
                  </p>

                  {/*
                    Only a real file gets a download button. Until one exists the
                    card points at the phone instead — a download link that goes
                    nowhere reads as a broken centre, not a missing PDF.
                  */}
                  {doc.href ? (
                    <a
                      href={doc.href}
                      download
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm text-background transition-transform duration-200 ease-out-strong active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]"
                    >
                      <Download className="size-4" aria-hidden />
                      Download {doc.name.toLowerCase()}
                    </a>
                  ) : (
                    <p className="mt-5 flex items-center gap-2 text-[14px] text-muted">
                      <Phone className="size-4 shrink-0 text-brand-600" aria-hidden />
                      <span>
                        Ask us for a copy —{" "}
                        <a
                          href={centre.phoneHref}
                          className="font-medium text-brand-700 underline decoration-hairline decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
                        >
                          {centre.phone}
                        </a>
                      </span>
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-normal text-ink sm:text-4xl">
              Good to know
            </h2>
            {/* The short day / long day table, the meals line and the nappies and
                wipes line were all removed here at the centre's request (website
                changes, Aug 2026). Sessions are discussed on a visit now. */}
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              We&apos;re open {centre.hours.days}, {centre.hours.open} –{" "}
              {centre.hours.close}, with sessions designed to support children at
              every stage of their learning journey. Children aged 3 years and
              over may be eligible for free ECE hours, with fees free sessions
              also available for 2-year-olds. Come and talk to us to learn more.
            </p>
          </div>

          <ul className="space-y-4">
            {enrolmentFacts.policies.map((p) => (
              <li key={p.title}>
                <Card className="flex gap-3.5 p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wash text-brand-700">
                    <Icon name={p.icon} className="size-4" />
                  </span>
                  <div>
                    <p className="font-display text-[15px] font-normal text-ink">
                      {p.title}
                    </p>
                    <p className="mt-1 text-[14px] text-muted">{p.body}</p>
                  </div>
                </Card>
              </li>
            ))}
            <li>
              <Card className="p-5">
                <p className="text-[14px] text-muted">
                  For current fees, call us on{" "}
                  <a
                    href={centre.phoneHref}
                    className="font-medium text-brand-700 underline decoration-hairline decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-900"
                  >
                    {centre.phone}
                  </a>{" "}
                  or ask when you visit.
                </p>
              </Card>
            </li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <TourCta size="lg">
            Schedule a tour
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
