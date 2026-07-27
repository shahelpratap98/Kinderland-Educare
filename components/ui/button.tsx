import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-card hover:bg-brand-700 hover:shadow-lift dark:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-brand-950",
  secondary:
    "glass text-slate-800 hover:shadow-lift dark:text-slate-100",
  ghost:
    "text-slate-700 hover:bg-sky-100/70 dark:text-slate-300 dark:hover:bg-sky-900/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

/**
 * Press and hover feedback are plain CSS transitions rather than springs, on
 * purpose: they must be instant, and CSS runs off the main thread so they stay
 * smooth even while the page is still loading and hydrating.
 *
 * - `active:scale-[0.98]` gives the tactile "the interface heard me" response.
 * - Hover elevation is gated behind `hover:hover` / `pointer:fine` because touch
 *   devices fire hover on tap, which would leave the state stuck after a press.
 * - Only `transform`, `box-shadow`, `background-color` and `color` transition —
 *   never `all`, which would sweep in layout-triggering properties.
 */
export const buttonClasses = (
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) =>
  cn(
    "relative inline-flex items-center justify-center rounded-full font-medium",
    "select-none whitespace-nowrap cursor-pointer",
    "transition-[transform,box-shadow,background-color,color] duration-150 ease-out-strong",
    "active:scale-[0.98]",
    "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
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
