import { Hero } from "@/components/sections/hero";
import { Slideshow } from "@/components/sections/slideshow";
import { Philosophy } from "@/components/sections/philosophy";
import { Visit } from "@/components/sections/visit";

/*
  The shell — header, footer, tour dialog, skip link — lives in app/layout.tsx so
  it is shared with the age group and FAQ pages.

  The fee explorer has been removed along with all pricing, and the FAQs now live
  at /faqs. The slideshow and the age-groups section will slot in here once
  photographs are supplied.
*/
export default function Home() {
  return (
    <>
      <Hero />
      <Slideshow />
      <Philosophy />
      <Visit />
    </>
  );
}
