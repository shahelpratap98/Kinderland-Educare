import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { centre, fullAddress } from "@/lib/content";

/* Body copy and navigation. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/*
  Display face for headings and the wordmark.

  Loaded via next/font rather than an @import in a fonts.css, which is what the
  spec described for a Vite build. next/font self-hosts the files, emits a preload
  and reserves metrics, so there is no render-blocking request to Google and no
  layout shift as the serif swaps in — both of which a CSS @import would reintroduce.
*/
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${centre.legalName} — Early Childhood Education in Māngere`,
    template: `%s | ${centre.name}`,
  },
  description:
    "Kinderland Educare is a purpose-built early childhood centre in Māngere, South Auckland, caring for children from three months to six years. 20 Hours ECE funded, fresh halal meals daily.",
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
      "Consistent, high-standard care and education for children from three months to six years in South Auckland.",
    locale: "en_NZ",
    type: "website",
  },
};

/*
  Emits <meta name="color-scheme" content="light">. This lands before the
  stylesheet, so a phone in dark mode never gets a flash of dark UA-styled form
  controls or scrollbars before globals.css applies.
*/
export const viewport: Viewport = {
  colorScheme: "light",
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
    opens: "07:30",
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
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
