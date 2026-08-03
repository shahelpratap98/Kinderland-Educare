import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { centre, fullAddress } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 border-t border-hairline pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Full lockup here — the footer has the room for the tagline. */}
          <Link href="/" aria-label={`${centre.legalName} — home`}>
            <Logo variant="full" className="h-16 sm:h-20" />
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
        </div>
      </div>
    </footer>
  );
}
