import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { centre, fullAddress } from "@/lib/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Geometric and friendly without tipping into cartoonish — a childcare site
   still has to read as trustworthy to a parent comparing centres. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${centre.legalName} — Early Childhood Education in Māngere`,
    template: `%s | ${centre.name}`,
  },
  description:
    "Kinderland Educare is a purpose-built early childhood centre in Māngere, South Auckland, caring for children from six weeks to five years. 20 Hours ECE funded, fresh halal meals daily.",
  keywords: [
    "early childhood education Māngere",
    "childcare South Auckland",
    "halal daycare Auckland",
    "20 Hours ECE",
    "Islamic early childhood centre",
  ],
  openGraph: {
    title: `${centre.legalName} — Early Childhood Education in Māngere`,
    description:
      "Consistent, high-standard care and education for children from six weeks to five years in South Auckland.",
    locale: "en_NZ",
    type: "website",
  },
};

/* Helps the centre surface correctly in local search results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ChildCare",
  name: centre.legalName,
  telephone: centre.phone,
  email: centre.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: centre.address.street,
    addressLocality: centre.address.suburb,
    addressRegion: centre.address.city,
    postalCode: centre.address.postcode,
    addressCountry: "NZ",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "07:00",
    closes: "18:00",
  },
  description: `Early childhood education and care for children from ${centre.ages} at ${fullAddress}.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-NZ"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sky-50 text-slate-900 dark:bg-[#08131f] dark:text-slate-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
