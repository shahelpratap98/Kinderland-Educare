import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { Reveal, RevealItem } from "@/components/reveal";
import { values, valuesClosing } from "@/lib/content";

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

        {/* Vision and Mission were removed here at the centre's request (website
            changes, Aug 2026). The four cards below now carry the section on
            their own; the wording is kept in lib/content.ts. */}
        <Reveal className="grid items-start gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <RevealItem key={value.title}>
              <Card interactive className="h-full p-6 sm:p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-wash text-ink">
                  <Icon name={value.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-normal text-ink">
                  {value.title}
                </h3>
                {/* The centre's own wording, two or three paragraphs per card
                    rather than the single line these used to carry. Spaced as
                    paragraphs so a card of this length stays readable. */}
                <div className="mt-3 space-y-3">
                  {value.body.map((para) => (
                    <p key={para} className="text-muted">
                      {para}
                    </p>
                  ))}
                </div>
              </Card>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-10">
          <RevealItem>
            <p className="max-w-3xl text-[19px] leading-relaxed text-ink sm:text-xl">
              {valuesClosing}
            </p>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
