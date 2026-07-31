"use client";

import { Button } from "@/components/ui/button";
import { useTourModal } from "@/components/tour-modal-provider";

/**
 * Client boundary for the tour dialog trigger.
 *
 * The age group and FAQ pages are server components, so they cannot call
 * useTourModal directly. This keeps the pages server-rendered and pushes only the
 * button into the client bundle.
 */
export function TourCta({
  children = "Schedule a tour",
  className,
  size = "md",
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { open } = useTourModal();
  return (
    <Button size={size} className={className} onClick={open}>
      {children}
    </Button>
  );
}
