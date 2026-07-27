"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Sparkles } from "lucide-react";
import { TabToggle } from "@/components/ui/tab-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useTourModal } from "@/components/tour-modal-provider";
import { ageGroups, feeFacts, FEES_UNCONFIRMED } from "@/lib/content";

const tabs = ageGroups.map((g) => ({ id: g.id, label: g.label }));

export function FeeExplorer() {
  const [active, setActive] = useState<string>(ageGroups[0].id);
  const group = ageGroups.find((g) => g.id === active) ?? ageGroups[0];
  const { open } = useTourModal();

  return (
    <section id="programmes" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          Programmes &amp; fees
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Three rooms, each shaped around where your child is right now. Choose an
          age group to see what a day looks like and what it costs.
        </p>
      </div>

      <TabToggle
        tabs={tabs}
        active={active}
        onChange={setActive}
        className="mb-6"
        layoutId="age-group-indicator"
      />

      {/*
        While FEES_UNCONFIRMED is true this banner is unmissable, and every rate
        below renders as a flagged placeholder. This is what stops fabricated
        pricing reaching a real parent. See lib/content.ts.
      */}
      {FEES_UNCONFIRMED && (
        <div className="mb-6 flex gap-3 rounded-xl border border-sun-400/70 bg-sun-50 p-4 text-[14px] text-sun-900 dark:border-sun-600/50 dark:bg-sun-900/20 dark:text-sun-100">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong className="font-semibold">Placeholder pricing.</strong> The
            weekly rates below are not real. Replace them in{" "}
            <code className="rounded bg-sun-200/60 px-1 py-0.5 font-mono text-[13px] dark:bg-sun-800/40">
              lib/content.ts
            </code>{" "}
            and set <code className="font-mono text-[13px]">FEES_UNCONFIRMED</code> to{" "}
            <code className="font-mono text-[13px]">false</code> before this page
            goes live. Everything else on this card is confirmed.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card className="overflow-hidden p-6 sm:p-8">
          {/*
            Keyed on the group id so React swaps the subtree outright and the CSS
            enter (.panel-enter) replays. No AnimatePresence: the panel is the
            primary content of this widget and must not wait on an exit animation
            before it appears. Crossfade smear is avoided by replacing rather than
            overlapping the two states.
          */}
          <div key={group.id} className="panel-enter">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-jakarta text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {group.label}
                </h3>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[13px] font-medium text-plum-700 dark:bg-sky-900/60 dark:text-sky-200">
                  {group.ageRange}
                </span>
                {group.subsidy && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1 text-[13px] font-medium text-sun-900 dark:bg-sun-900/40 dark:text-sun-100">
                    <Sparkles className="size-3.5" />
                    {group.subsidy}
                  </span>
                )}
              </div>

              <p className="mt-4 text-slate-600 dark:text-slate-400">{group.blurb}</p>

              <ul className="mt-6 space-y-2.5">
                {group.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[15px] text-slate-700 dark:text-slate-300">
                    <Check
                      className="mt-1 size-4 shrink-0 text-brand-600 dark:text-brand-400"
                      strokeWidth={3}
                      aria-hidden
                    />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {feeFacts.sessions.map((session, i) => {
                  const rate = i === 0 ? group.rates.shortDay : group.rates.longDay;
                  return (
                    <div
                      key={session.name}
                      className="rounded-xl border border-slate-200/80 bg-white/50 p-4 dark:border-slate-700/60 dark:bg-white/5"
                    >
                      <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                        {session.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-500">
                        {session.window}
                      </p>
                      <p className="mt-2 flex items-baseline gap-1.5">
                        <span
                          className={
                            FEES_UNCONFIRMED
                              ? "font-jakarta text-2xl font-bold tracking-tight text-slate-400 line-through decoration-sun-500/60 decoration-2 dark:text-slate-500"
                              : "font-jakarta text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                          }
                        >
                          {rate}
                        </span>
                        <span className="text-[13px] text-slate-500">/ week</span>
                      </p>
                      {FEES_UNCONFIRMED && (
                        <p className="mt-1 text-[12px] font-medium text-sun-700 dark:text-sun-300">
                          Rate not confirmed
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h4 className="font-jakarta font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Getting started
            </h4>
            <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-400">
              A one-off registration fee of{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {feeFacts.registration}
              </strong>{" "}
              secures your child&apos;s place.
            </p>
            <Button variant="secondary" className="mt-4 w-full" onClick={open}>
              Book a visit
              <ArrowRight className="size-4" />
            </Button>
          </Card>

          {feeFacts.policies.map((policy) => (
            <Card key={policy.title} interactive className="p-5">
              <div className="flex gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-brand-700 dark:bg-sky-900/60 dark:text-brand-300">
                  <Icon name={policy.icon} className="size-4.5" />
                </span>
                <div>
                  <p className="font-jakarta text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {policy.title}
                  </p>
                  <p className="mt-1 text-[14px] text-slate-600 dark:text-slate-400">
                    {policy.body}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
