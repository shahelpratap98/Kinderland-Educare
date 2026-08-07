import { Hero } from "@/components/sections/hero";
import { FeeStructure } from "@/components/sections/fee-structure";
import { Slideshow } from "@/components/sections/slideshow";
import { Philosophy } from "@/components/sections/philosophy";
import { Reviews } from "@/components/sections/reviews";
import { Visit } from "@/components/sections/visit";

/*
  The shell — header, footer, tour dialog, skip link — lives in app/layout.tsx so
  it is shared with the age group and FAQ pages.

  The fee explorer has been removed along with all pricing, and the FAQs now live
  at /faqs. The age-groups section will slot in here once photographs are
  supplied.
*/
export default function Home() {
  return (
    <>
      <Hero />
      {/* Above the slideshow: "now open and taking enrolments" is the first
          thing a parent needs, before any of the atmosphere. */}
      <FeeStructure />
      <Slideshow />
      <Philosophy />
      {/* Directly before the visit form: the last thing read before deciding. */}
      <Reviews />
      <Visit />
    </>
  );
}
