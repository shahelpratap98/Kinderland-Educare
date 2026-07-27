import { cn } from "@/lib/utils";

/**
 * Glass surface with a 1px hairline border and a soft layered shadow.
 *
 * `interactive` adds hover lift and press feedback in CSS. The hover state is
 * gated behind a fine-pointer media query so tapping on mobile doesn't leave the
 * card stuck in its hovered state.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl shadow-card",
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
