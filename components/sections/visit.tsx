import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TourForm } from "@/components/tour-form";
import { centre, fullAddress, mapEmbedUrl, mapLinkUrl } from "@/lib/content";

const details = [
  {
    icon: MapPin,
    label: "Visit us",
    value: fullAddress,
    href: mapLinkUrl,
    external: true,
  },
  { icon: Phone, label: "Call us", value: centre.phone, href: centre.phoneHref },
  { icon: Mail, label: "Email us", value: centre.email, href: `mailto:${centre.email}` },
  {
    icon: Clock,
    label: "Opening hours",
    value: `${centre.hours.days}, ${centre.hours.open} – ${centre.hours.close}`,
  },
];

export function Visit() {
  return (
    <section
      id="visit"
      className="border-t border-hairline bg-wash"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-4xl font-normal text-ink sm:text-5xl">
            Come and see us
          </h2>
          <p className="mt-4 text-lg text-muted">
            The best way to choose a centre is to stand in it. Pick a weekday that
            suits and we&apos;ll show you the rooms, the playground and the kitchen.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6 sm:p-8">
            <TourForm />
          </Card>

          <div className="space-y-4">
            <Card className="overflow-hidden">
              {/*
                Keyless Google Maps embed — no API key or billing account needed.
                lazy so it never competes with the hero for initial bandwidth.
              */}
              <iframe
                src={mapEmbedUrl}
                title={`Map showing ${centre.legalName} at ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0 sm:h-72"
              />
            </Card>

            <Card className="divide-y divide-hairline">
              {details.map((d) => {
                const content = (
                  <div className="flex items-start gap-3.5 p-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wash text-ink">
                      <d.icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-muted">
                        {d.label}
                      </p>
                      <p className="text-[15px] font-medium text-ink">
                        {d.value}
                      </p>
                    </div>
                  </div>
                );

                return d.href ? (
                  <a
                    key={d.label}
                    href={d.href}
                    {...(d.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="block transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:bg-background"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={d.label}>{content}</div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
