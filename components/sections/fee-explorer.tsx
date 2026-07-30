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
        <h2 className="text-4xl font-normal text-ink sm:text-5xl">
          Programmes &amp; fees
        </h2>
        <p className="mt-4 text-lg text-muted">
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
        <div className="mb-6 flex gap-3 rounded-xl border-2 border-ink bg-wash p-4 text-[14px] text-ink">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong className="font-semibold">Placeholder pricing.</strong> The
            weekly rates below are not real. Replace them in{" "}
            <code className="rounded bg-ink/10 px-1 py-0.5 font-mono text-[13px]">
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
                <h3 className="font-display text-2xl font-normal text-ink">
                  {group.label}
                </h3>
                <span className="rounded-full bg-wash px-3 py-1 text-[13px] font-medium text-muted">
                  {group.ageRange}
                </span>
                {group.subsidy && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-background">
                    <Sparkles className="size-3.5" />
                    {group.subsidy}
                  </span>
                )}
              </div>

              <p className="mt-4 text-muted">{group.blurb}</p>

              <ul className="mt-6 space-y-2.5">
                {group.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[15px] text-ink">
                    <Check
                      className="mt-1 size-4 shrink-0 text-ink"
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
                      className="rounded-xl border border-hairline bg-background p-4"
                    >
                      <p className="text-[13px] font-medium text-muted">
                        {session.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {session.window}
                      </p>
                      <p className="mt-2 flex items-baseline gap-1.5">
                        <span
                          className={
                            FEES_UNCONFIRMED
                              ? "font-display text-2xl font-normal text-muted line-through decoration-ink/50 decoration-2"
                              : "font-display text-2xl font-normal text-ink"
                          }
                        >
                          {rate}
                        </span>
                        <span className="text-[13px] text-muted">/ week</span>
                      </p>
                      {FEES_UNCONFIRMED && (
                        <p className="mt-1 text-[12px] font-semibold text-ink">
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
            <h4 className="font-display font-normal text-ink">
              Getting started
            </h4>
            <p className="mt-2 text-[15px] text-muted">
              A one-off registration fee of{" "}
              <strong className="font-semibold text-ink">
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
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wash text-ink">
                  <Icon name={policy.icon} className="size-4.5" />
                </span>
                <div>
                  <p className="font-display text-[15px] font-normal text-ink">
                    {policy.title}
                  </p>
                  <p className="mt-1 text-[14px] text-muted">
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
