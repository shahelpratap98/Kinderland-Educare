/**
 * Facebook's mark, inlined.
 *
 * lucide-react dropped its brand icons at v1, so there is no <Facebook /> to
 * import any more. Same props shape as a lucide icon — className, aria-hidden —
 * so it drops into the same places they do.
 *
 * fill="currentColor" rather than a stroke: brand marks are solid shapes, and
 * stroking this path renders it as an outline that reads as a different logo.
 */
export function FacebookIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}
