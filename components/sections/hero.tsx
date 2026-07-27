"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Icon } from "@/components/icon";
import { useTourModal } from "@/components/tour-modal-provider";
import { centre, heroPills, PARENT_PACK_HREF } from "@/lib/content";
import { fadeUp, springSnappy, staggerParent } from "@/lib/motion";

/**
 * Hero.
 *
 * The cloud photograph is applied via the `.hero-sky` utility rather than
 * <Image>, so a matching blue gradient can sit underneath it: if the asset is
 * slow or missing the section still reads as sky instead of flashing white. The
 * photo's cumulus band sits low in the frame, so all copy lives in the upper
 * third against clear blue, and a soft top scrim guarantees text contrast even
 * where a cloud drifts high on narrow viewports.
 */
export function Hero() {
  const { open } = useTourModal();

  return (
    <section id="top" className="hero-sky relative isolate overflow-hidden">
      {/*
        Text-side scrim. White copy over white cumulus is the one place this hero
        can fail contrast, and where a cloud lands depends on viewport size — so
        rather than patching individual lines, this darkens the left column the copy
        occupies and fades out by ~68% width, leaving the big cumulus on the right
        untouched. Angled to follow the text block's diagonal.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgb(21_95_144_/_0.74)_0%,rgb(21_95_144_/_0.5)_38%,rgb(21_95_144_/_0)_68%)]"
      />

      {/* Fades the section into the page background so the photo has no hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-sky-50"
      />

      {/* Top padding clears the overlaying sticky header (see site-header.tsx). */}
      <div className="relative mx-auto max-w-6xl px-4 pb-40 pt-24 sm:px-6 sm:pb-56 sm:pt-28 lg:pb-64">
        <motion.div initial="hidden" animate="visible" variants={staggerParent}>
          <motion.p
            variants={fadeUp}
            transition={springSnappy}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 py-1.5 pl-2.5 pr-3.5 text-sm font-medium text-white backdrop-blur-sm"
          >
            <MapPin className="size-4" />
            {centre.address.suburb}, South Auckland
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={springSnappy}
            className="max-w-3xl text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl"
          >
            A place where your child is{" "}
            <span className="text-sun-300">known</span>, not just minded.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={springSnappy}
            className="mt-6 max-w-xl text-lg text-white/90"
          >
            {centre.logoTagline}. Kinderland Educare offers consistent,
            high-standard early childhood education for children from{" "}
            {centre.ages}, in a purpose-built centre in {centre.address.suburb}.
          </motion.p>

          <motion.div variants={staggerParent} className="mt-8 flex flex-wrap gap-2.5">
            {heroPills.map((pill) => (
              <Pill
                key={pill.label}
                icon={<Icon name={pill.icon} className="size-4" />}
                /* Solid-ish white on the photo: glass alone doesn't separate from cloud. */
                className="border-white/40 bg-white/85 text-slate-800"
                iconClassName="text-brand-600"
              >
                {pill.label}
              </Pill>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={springSnappy}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" onClick={open}>
              Schedule a tour
              <ArrowRight className="size-4" />
            </Button>

            {/*
              No parent-pack PDF exists in /public yet, so rather than ship a dead
              download link this falls back to the enrolment section. See
              PARENT_PACK_HREF in lib/content.ts.
            */}
            <a
              href={PARENT_PACK_HREF ?? "#programmes"}
              {...(PARENT_PACK_HREF ? { download: true } : {})}
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-white/15 px-7 text-base font-medium text-white ring-1 ring-inset ring-white/40 backdrop-blur-sm transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/25"
            >
              <FileText className="size-4" />
              {PARENT_PACK_HREF ? "Download parent pack" : "See programmes & fees"}
            </a>
          </motion.div>

          {/*
            This line sits low enough that the directional scrim has faded to ~0.25,
            and a bright cumulus edge often lands directly behind it — measured at
            1.58:1 against white, a clear AA failure. It carries its own scrim chip
            so it stays legible wherever the clouds fall.
          */}
          <motion.p
            variants={fadeUp}
            transition={springSnappy}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-900/70 py-1.5 pl-3 pr-4 text-sm text-white backdrop-blur-sm"
          >
            <Clock className="size-4" />
            Open {centre.hours.days}, {centre.hours.open} – {centre.hours.close}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
