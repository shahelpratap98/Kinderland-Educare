import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { centre, faqs } from "@/lib/content";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl font-normal text-ink sm:text-5xl">
            Questions parents ask
          </h2>
          <p className="mt-4 text-muted">
            If yours isn&apos;t here, call us on{" "}
            <a
              href={centre.phoneHref}
              className="font-medium text-ink underline decoration-hairline decoration-2 underline-offset-2 transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
            >
              {centre.phone}
            </a>{" "}
            — we&apos;d rather talk it through.
          </p>
        </div>

        <Card className="px-6 py-2 sm:px-8">
          <Accordion items={faqs} />
        </Card>
      </div>
    </section>
  );
}
