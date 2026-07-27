import { centre, fullAddress } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-jakarta font-semibold text-slate-700">
            {centre.legalName}
          </p>
          <p className="mt-1">{fullAddress}</p>
        </div>
        <div className="sm:text-right">
          <p>
            <a
              href={centre.phoneHref}
              className="transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700"
            >
              {centre.phone}
            </a>
            {" · "}
            <a
              href={`mailto:${centre.email}`}
              className="transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700"
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
