import {
  BadgeCheck,
  Blocks,
  Building2,
  CalendarClock,
  Compass,
  Moon,
  Palmtree,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the icon names used in lib/content.ts to components. Keeping content as
 * plain strings means the content file stays serialisable and free of imports.
 */
const icons: Record<string, LucideIcon> = {
  BadgeCheck,
  Blocks,
  Building2,
  CalendarClock,
  Compass,
  Moon,
  Palmtree,
  UtensilsCrossed,
  Users,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = icons[name] ?? Compass;
  return <Cmp className={className} aria-hidden />;
}
