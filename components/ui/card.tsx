import { cn } from "@/lib/utils";

/**
 * Flat white surface with a hairline border.
 *
 * Deliberately no glassmorphism on this branch: the ground is already white, so a
 * translucent blurred panel over white reads as a slightly grey rectangle rather
 * than glass. The hairline does the separating work instead.
 *
 * `interactive` adds hover lift and press feedback in CSS, gated behind a
 * fine-pointer media query so tapping on mobile doesn't leave the card stuck in
 * its hovered state.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "hairline rounded-2xl bg-background",
        interactive && [
          "transition-[transform,box-shadow] duration-200 ease-out-strong",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lift",
          "active:scale-[0.99] active:duration-100",
        ],
        className,
      )}
      {...props}
    />
  );
}
