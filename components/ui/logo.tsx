import Image from "next/image";
import { centre, LOGO_SIZE, LOGO_SRC } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Brand mark.
 *
 * Renders the real logo artwork when LOGO_SRC is set. Until then it falls back to
 * a wordmark set in the display serif — matching the spec's `text-3xl
 * tracking-tight` treatment. See the TODO on LOGO_SRC in lib/content.ts.
 *
 * Note this is NOT the centre's actual logo: the tree, sun and custom lettering
 * are missing. The two-tone split mirrors the real mark's — vermillion "Kinder",
 * purple "Educare" — but it is a stand-in until the artwork lands.
 */
export function Logo({ className }: { className?: string }) {
  if (LOGO_SRC) {
    return (
      <Image
        src={LOGO_SRC}
        alt={`${centre.legalName} logo`}
        width={LOGO_SIZE.width}
        height={LOGO_SIZE.height}
        priority
        className={cn("h-auto w-auto", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        /* nowrap: at 375px the wordmark otherwise breaks onto two lines and
           doubles the header's height. */
        "font-display whitespace-nowrap text-2xl tracking-tight sm:text-3xl",
        className,
      )}
    >
      <span className="text-brand-600">Kinder</span>
      <span className="text-plum-600">land Educare</span>
    </span>
  );
}
