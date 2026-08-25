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
            The original lockup, tagline baked in, at the size it needs to be
            read rather than the size that composes best — the centre asked for
            this explicitly.

            Those glyphs are 5.9% of the image height, so the cap height is
            about 9px at 160 and 12px at 208. Below roughly 118px they stop
            being legible at all, which is why the earlier 80px version could
            not be read. It is a large mark for a footer; that is the trade the
            centre chose.
          */}
          <Link href="/" aria-label={`${centre.legalName} — home`}>
            <Logo variant="full" className="h-40 sm:h-52" />
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
