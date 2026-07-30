import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  /* Solid ink pill with inverted label — the spec's CTA treatment. */
  primary: "bg-brand-600 text-background",
  secondary: "hairline bg-background text-ink [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lift",
  ghost: "text-ink [@media(hover:hover)_and_(pointer:fine)]:hover:bg-wash",
};

const sizes: Record<Size, string> = {
  sm: "px-6 py-2.5 text-sm gap-1.5",
  md: "px-8 py-3 text-[15px] gap-2",
  lg: "px-14 py-5 text-base gap-2.5",
};

/**
 * Press and hover feedback are plain CSS transitions rather than springs, on
 * purpose: they must be instant, and CSS runs off the main thread so they stay
 * smooth even while the page is still loading and the hero video is streaming.
 *
 * - Hover is `scale(1.03)` per the spec, gated behind `hover:hover` /
 *   `pointer:fine` because touch devices fire hover on tap, which would leave the
 *   state stuck after a press.
 * - `active:scale-[0.98]` still gives the tactile "the interface heard me" response
 *   on press; the spec only defines the hover half.
 * - Only `transform` and colour transition — never `all`, which would sweep in
 *   layout-triggering properties.
 */
export const buttonClasses = (
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) =>
  cn(
    "relative inline-flex items-center justify-center rounded-full font-normal",
    "select-none whitespace-nowrap cursor-pointer",
    "transition-[transform,box-shadow,background-color,color] duration-200 ease-out-strong",
    "active:scale-[0.98]",
    "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

type LinkButtonProps = React.ComponentProps<"a"> & {
  variant?: Variant;
  size?: Size;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <a className={buttonClasses(variant, size, className)} {...props} />;
}
