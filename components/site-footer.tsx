import Link from "next/link";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { Logo } from "@/components/ui/logo";
import { centre, fullAddress, socials } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 border-t border-hairline pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/*
            A horizontal lockup: the real mark, with the tagline set as live text
            beside it rather than baked into the artwork.

            The full lockup was here, and its tagline could not be read. Measured
            in the asset, those glyphs are 5.9% of the logo's height — 4.7px at
            the 80px this renders at. Reaching even a 7px cap would have meant a
            118px logo, and roughly 152px to be comfortable, which is a very
            large mark to put in a footer for one line of type. As live text it
            is crisp at any size, and it can be selected, translated and read
            aloud, which a picture of words cannot.
          */}
          <Link
            href="/"
            aria-label={`${centre.legalName} — home`}
            className="inline-flex items-center gap-4"
          >
            <Logo
              variant="mark"
              className="h-16 shrink-0 sm:h-20"
              alt={centre.legalName}
            />
            <span className="max-w-[11rem] border-l border-hairline pl-4 text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.14em] text-ink sm:text-[12px]">
              {centre.logoTagline}
            </span>
          </Link>
          <p className="mt-3">{fullAddress}</p>
        </div>
        <div className="sm:text-right">
          <p>
            <a
              href={centre.phoneHref}
              className="transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
            >
              {centre.phone}
            </a>
            {" · "}
            <a
              href={`mailto:${centre.email}`}
              className="transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
            >
              {centre.email}
            </a>
          </p>
          <p className="mt-1">
            {centre.hours.days}, {centre.hours.open} – {centre.hours.close}
          </p>

          {/* aria-label rather than a visible caption: the mark is the whole
              control, so it needs a name of its own to be announced at all. */}
          <a
            href={socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${centre.name} on Facebook`}
            className="mt-3 inline-grid size-9 place-items-center rounded-full text-muted hairline transition-[color,transform] duration-150 ease-out-strong active:scale-95 sm:ml-auto [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
          >
            <FacebookIcon className="size-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
