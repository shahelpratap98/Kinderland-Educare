import { TourModalProvider } from "@/components/tour-modal-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { FeeExplorer } from "@/components/sections/fee-explorer";
import { Philosophy } from "@/components/sections/philosophy";
import { Faq } from "@/components/sections/faq";
import { Visit } from "@/components/sections/visit";

export default function Home() {
  return (
    <TourModalProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero />
        <FeeExplorer />
        <Philosophy />
        <Faq />
        <Visit />
      </main>

      <SiteFooter />
    </TourModalProvider>
  );
}
