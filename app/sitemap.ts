import type { MetadataRoute } from "next";
import { ageGroups, siteUrl } from "@/lib/content";

/*
 * The sitemap.
 *
 * The room pages are derived from `ageGroups` rather than listed by hand, for
 * the same reason the route itself derives its params from it: a room renamed
 * or added in content.ts would otherwise leave this file quietly wrong, and a
 * sitemap that 404s is worse than no sitemap at all.
 *
 * `lastModified` is the build time. That is honest for this site — every page
 * is prerendered at build, so nothing changes between deploys — and it means a
 * content change republishes a fresh date without anyone maintaining one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/enrolment", priority: 0.9 },
    { path: "/age-groups", priority: 0.8 },
    { path: "/our-approach", priority: 0.7 },
    { path: "/faqs", priority: 0.6 },
    ...ageGroups.map((group) => ({
      path: `/age-groups/${group.slug}`,
      priority: 0.7,
    })),
  ];

  return pages.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
