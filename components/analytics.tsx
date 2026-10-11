import { Suspense } from "react";
import Script from "next/script";
import { PageViews } from "@/components/page-views";

/*
 * Google Analytics 4.
 *
 * Keyed off NEXT_PUBLIC_GA_ID rather than a hardcoded measurement ID, for the
 * same reason the tour form derives its delivery flag from the API key: the
 * site stays inert until the thing it depends on actually exists. With no ID
 * set — local development, a preview build, anyone who clones this — nothing
 * renders, so no script loads and no cookie is written.
 *
 * It has to be NEXT_PUBLIC_ because the measurement ID is read in the browser.
 * That is not a leak: a GA4 measurement ID is public by design and visible in
 * the page source of every site that uses one.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      {/*
        send_page_view is false above on purpose. gtag fires a page_view when it
        configures, but that only ever covers the first page of a visit: this is
        an App Router site, so moving between routes is a client-side navigation
        and gtag never reconfigures. Left at the default, every internal page
        view would have been invisible and the landing page would have taken
        credit for whole sessions.

        So every page_view — the first included — is sent from PageViews, which
        gives one source of truth rather than two that have to agree.

        The Suspense boundary is not decoration. PageViews reads useSearchParams,
        and in the App Router that hook opts its whole subtree into dynamic
        rendering unless it sits behind Suspense. Without this, adding analytics
        would have quietly destroyed the static prerendering of all eleven
        routes, which is most of why the site is fast.
      */}
      <Suspense fallback={null}>
        <PageViews gaId={GA_ID} />
      </Suspense>
    </>
  );
}
