"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/*
 * Sends one GA4 page_view per route, including the first.
 *
 * Analytics configures gtag with send_page_view: false, so nothing is counted
 * until this runs — see the note there for why the automatic one is not enough
 * on an App Router site.
 *
 * Guarded on window.gtag rather than assumed: the gtag script is loaded
 * afterInteractive, so on a slow connection this effect can run before it
 * exists. A missed view is better than a thrown error in a layout that wraps
 * every page, and the next navigation reports normally.
 */
export function PageViews({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}
