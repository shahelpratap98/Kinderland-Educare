import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

/*
 * Everything is public and crawlable — there is no members area, no checkout
 * and nothing behind a login — so this allows all of it rather than inventing
 * disallow rules that would only risk hiding a page by accident.
 *
 * Its real job is the sitemap pointer: a crawler that reaches the site without
 * going through Search Console still gets told where the page list is.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
