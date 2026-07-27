import Image from "next/image";
import { centre, LOGO_SIZE, LOGO_SRC } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Brand mark.
 *
 * Renders the real logo artwork when LOGO_SRC is set. Until then it falls back to
 * a CSS wordmark using the logo's own colours — vermillion "Kinder", purple
 * "land Educare" — so nothing renders broken and the header stays sharp at small
 * sizes. See the TODO on LOGO_SRC in lib/content.ts.
 *
 * `onLight` inverts the wordmark for placement over the blue hero, where the
 * purple half would otherwise sit at poor contrast.
 */
export function Logo({
  className,
  onLight = true,
}: {
  className?: string;
  onLight?: boolean;
}) {
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
        "font-jakarta whitespace-nowrap text-[17px] font-extrabold tracking-tight",
        className,
      )}
    >
      <span className={onLight ? "text-brand-600" : "text-white"}>Kinder</span>
      <span className={onLight ? "text-plum-600" : "text-sun-300"}>land</span>
      <span
        className={cn(
          "font-semibold",
          onLight ? "text-plum-600" : "text-white/90",
        )}
      >
        {" "}
        Educare
      </span>
    </span>
  );
}
