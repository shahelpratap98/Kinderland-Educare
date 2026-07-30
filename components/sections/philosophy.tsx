import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { Reveal, RevealItem } from "@/components/reveal";
import { values, visionMission } from "@/lib/content";

export function Philosophy() {
  return (
    <section
      id="philosophy"
      className="border-y border-hairline bg-wash"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="mb-12">
          <RevealItem>
            <h2 className="max-w-2xl text-4xl font-normal text-ink sm:text-5xl">
              What we believe
            </h2>
          </RevealItem>
        </Reveal>

        {/*
          Vision and Mission are presented as two labelled statements rather than
          one paragraph and one pull-quote. The centre's wording opens with "Our
          vision is to…" / "Our mission is to…", so it needs its own heading to sit
          under — a generic quote attribution read as a duplicate of the sentence.
          Both are verbatim; see the note in lib/content.ts.
        */}
        <Reveal className="mb-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {(
            [
              ["Vision", visionMission.vision],
              ["Mission", visionMission.mission],
            ] as const
          ).map(([label, body]) => (
            <RevealItem key={label}>
              <div className="border-l-2 border-brand-400 pl-5 sm:pl-6">
                <h3 className="font-display text-2xl font-normal text-ink">
                  {label}
                </h3>
                <p className="mt-3 text-[17px] leading-relaxed text-muted">
                  {body}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="grid gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <RevealItem key={value.title}>
              <Card interactive className="h-full p-6 sm:p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-wash text-ink">
                  <Icon name={value.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-normal text-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-muted">{value.body}</p>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
