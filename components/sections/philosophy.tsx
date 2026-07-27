import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { Reveal, RevealItem } from "@/components/reveal";
import { values, visionMission } from "@/lib/content";

export function Philosophy() {
  return (
    <section
      id="philosophy"
      className="border-y border-slate-200/70 bg-white/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <RevealItem>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What we believe
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {visionMission.vision}
            </p>
          </RevealItem>
          <RevealItem>
            {/* Pulled out as a quote — it's the centre's own language, and it earns the emphasis. */}
            <figure className="border-l-2 border-brand-400 pl-5">
              <blockquote className="text-[17px] leading-relaxed text-slate-700">
                {visionMission.mission}
              </blockquote>
              <figcaption className="mt-3 text-sm font-medium text-brand-700">
                Our mission
              </figcaption>
            </figure>
          </RevealItem>
        </Reveal>

        <Reveal className="grid gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <RevealItem key={value.title}>
              <Card interactive className="h-full p-6 sm:p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-sky-100 text-brand-700">
                  <Icon name={value.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-jakarta text-lg font-semibold tracking-tight text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-slate-600">{value.body}</p>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
