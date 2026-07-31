/**
 * Single source of truth for every business fact on the site.
 *
 * Nothing in this file should be invented. If a value is not confirmed by the
 * centre, it belongs in the PLACEHOLDER section below and must render with a
 * visible "unconfirmed" treatment in the UI.
 */

export const centre = {
  name: "Kinderland Educare",
  legalName: "Kinderland Educare New Zealand",
  tagline: "Early childhood education in the heart of South Auckland",
  /* The strapline set beneath the wordmark in the centre's own logo. */
  logoTagline: "Where dreams and creativity meet",
  address: {
    street: "1 Kohinoor Ave",
    suburb: "Māngere",
    city: "Auckland",
    postcode: "2022",
    country: "New Zealand",
  },
  phone: "09 275 0111",
  phoneHref: "tel:+6492750111",
  email: "info@kinderlandeducare.co.nz",
  hours: {
    days: "Monday – Friday",
    open: "7:30 AM",
    close: "6:00 PM",
  },
  ages: "3 months to 6 years",
} as const;

export const fullAddress = `${centre.address.street}, ${centre.address.suburb}, ${centre.address.city} ${centre.address.postcode}`;

/** Keyless Google Maps embed — no API key or billing account required. */
export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  `${centre.address.street}, ${centre.address.suburb}, ${centre.address.city} ${centre.address.postcode}`,
)}&output=embed`;

export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${centre.legalName}, ${fullAddress}`,
)}`;

/*
 * Verbatim from the centre's own wording, including the "Our vision/mission is to"
 * openings. Rendered as-is under Vision and Mission labels in the philosophy
 * section — do not paraphrase or trim these.
 */
export const visionMission = {
  vision:
    "Our vision is to provide a consistent, high standard care and education to children in South Auckland. We believe that to nurture enquiring minds, we need to educate and encourage individualism, critical thinking skills, initiative, choice and appreciation of differences.",
  mission:
    "Our mission is to provide excellence in the education and care of young children so that the children gain a strong sense of identity and a lifelong passion for learning and discovery. Furthermore, they see themselves as capable and competent learners; being able to direct and control their own learning as they grow.",
} as const;

export const heroPills = [
  { label: "20 Hours ECE funded", icon: "BadgeCheck" },
  { label: "Fresh halal meals daily", icon: "UtensilsCrossed" },
  { label: "Purpose-built in Māngere", icon: "Building2" },
] as const;

export const values = [
  {
    icon: "Compass",
    /* Was "Vision & Mission", which paraphrased text now shown in full directly
       above this grid. Retargeted to the mission's learner-agency idea, which no
       other card covers. */
    title: "Capable, competent learners",
    body: "Children who see themselves as capable and competent — able to direct and control their own learning as they grow, with the initiative and critical thinking to follow their own questions.",
  },
  {
    icon: "Moon",
    title: "An Islamic environment",
    body: "A nurturing setting that weaves an Islamic perspective through everyday learning, alongside the principles of Te Whāriki, Aotearoa's early childhood curriculum.",
  },
  {
    icon: "UtensilsCrossed",
    title: "Nutrition & halal catering",
    body: "Fresh, nutritious halal meals prepared daily, plus wipes provided. Parents supply nappies or pull-ups; we handle the rest of the day.",
  },
  {
    icon: "Blocks",
    title: "Room to learn",
    body: "A purpose-built centre with safe, spacious indoor rooms and outdoor play areas, designed for children from three months to six years old.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Age groups                                                         */
/* ------------------------------------------------------------------ */

/**
 * A photograph on a room page.
 *
 * `src` is the base name in /public/rooms — .webp is served with .jpg as the
 * fallback, both produced by scripts/build-slides.mjs.
 */
export type RoomPhoto = { src: string; alt: string; caption?: string };

/**
 * One entry per room, each with its own page at /age-groups/[slug].
 *
 * No rates here by design. Fees were removed from the site entirely, which also
 * retired the `$XXX` placeholders and their warning banner — there is no longer
 * anywhere on the site that can display a fabricated price.
 *
 * `highlights` are restricted to facts the centre supplied: halal meals, the
 * wipes/nappies split, the purpose-built indoor and outdoor spaces, 20 Hours ECE
 * for over-threes, and Te Whāriki alongside an Islamic perspective. Anything
 * needing the centre's sign-off is listed in COPY_TO_CONFIRM below rather than
 * asserted here.
 *
 * `photos` starts empty. The page renders the first as a wide lead image and any
 * others as a grid, and omits both sections while the array is empty — so the
 * pages stand up now and gain photographs without a layout change.
 *
 * Same consent rule as the slideshow: any photograph showing an identifiable
 * child needs signed parental media consent before it is committed, since
 * committing publishes it to the repository.
 */
export const ageGroups = [
  {
    id: "under-2",
    slug: "under-2s",
    label: "Under 2s",
    shortLabel: "Babies",
    ageRange: "3 months – 2 years",
    lead: "Unhurried days built around your baby's own rhythm.",
    blurb:
      "Our youngest room. Days here follow your baby rather than a timetable — feeding, sleeping and playing as they need to, in a purpose-built space designed to feel calm and safe.",
    body: "Settling a baby into care is a big step, and the first weeks matter more than anything that follows. We keep routines close to the ones you keep at home, so the day feels familiar. Fresh, nutritious halal meals are prepared for the centre daily and start as soon as your baby is on solids. We provide wipes; you supply nappies or pull-ups, and we handle the rest of the day.",
    subsidy: null,
    photos: [] as readonly RoomPhoto[],
    highlights: [
      "Fresh, nutritious halal meals once solids begin",
      "Wipes provided — parents supply nappies or pull-ups",
      "Purpose-built indoor room with outdoor play alongside",
    ],
  },
  {
    id: "2-to-3",
    slug: "2-3-years",
    label: "2 – 3 Years",
    shortLabel: "Toddlers",
    ageRange: "2 – 3 years",
    lead: "Room to move, and the freedom to follow a question.",
    blurb:
      "A busy, language-rich room for toddlers finding their independence, with the space to move and plenty of time outdoors.",
    body: "Toddlers learn by doing, loudly and on their feet. This room is set up for that: space to move indoors, direct access to the outdoor play areas, and teachers who treat curiosity as the point rather than an interruption. It is also where individualism, initiative and choice — the things our vision names — start showing up in practice.",
    subsidy: null,
    photos: [] as readonly RoomPhoto[],
    highlights: [
      "Purpose-built outdoor play areas for active toddlers",
      "Fresh, nutritious halal meals provided daily",
      "An Islamic perspective woven through everyday learning",
    ],
  },
  {
    id: "3-plus",
    slug: "3-plus-years",
    label: "3+ Years",
    shortLabel: "Preschool",
    ageRange: "3 – 6 years",
    lead: "Capable, competent learners, ready for what comes next.",
    blurb:
      "Children who see themselves as capable, competent learners — able to direct and control their own learning as they grow.",
    body: "Our oldest room takes school readiness in the fullest sense: not worksheets, but children with a strong sense of identity who can direct their own learning. We follow Te Whāriki, New Zealand's early childhood curriculum, with an Islamic perspective woven through the day. From age three, the 20 Hours ECE government funding is fully supported here.",
    subsidy: "20 Hours ECE",
    photos: [] as readonly RoomPhoto[],
    highlights: [
      "20 Hours ECE government funding fully supported",
      "Te Whāriki curriculum with an Islamic perspective",
      "Fresh, nutritious halal meals provided daily",
    ],
  },
] as const;

/**
 * TODO(kinderland): confirm before publishing.
 *
 * These are reasonable for an ECE centre and appeared in earlier drafts, but the
 * centre never supplied them, so they are held here rather than stated on the
 * pages as fact. Confirm any that are true and I will fold them back in.
 */
export const COPY_TO_CONFIRM = [
  "A named primary caregiver for each infant in the Under 2s room",
  "Specific teacher-to-child ratios, if you want them published",
  "Toilet learning supported at the child's own pace",
  "A formal transition-to-school programme in the final preschool year",
  "Morning and afternoon tea in addition to main meals",
] as const;

/**
 * Session windows only — times, not prices. Every dollar figure was removed from
 * the site along with the fee explorer, so enquiries about cost go to the centre
 * directly. `policies` are enrolment terms expressed as percentages rather than
 * amounts, and were supplied by the centre.
 */
export const enrolmentFacts = {
  sessions: [
    { name: "Short day", window: "9:00 AM – 3:00 PM" },
    { name: "Long day", window: "7:30 AM – 6:00 PM" },
  ],
  policies: [
    {
      icon: "CalendarClock",
      title: "Paid a week ahead",
      body: "All fees are paid one week in advance.",
    },
    {
      icon: "Users",
      title: "5% sibling discount",
      body: "For families with two or more children enrolled full-time.",
    },
    {
      icon: "Palmtree",
      title: "Holiday reduction",
      body: "50% fee reduction for up to two weeks of annual holiday, available after six months of enrolment.",
    },
  ],
} as const;

export const faqs = [
  {
    q: "What ages do you take?",
    a: "We care for children from three months old right through to six years, across three rooms: under 2s, 2–3 years, and 3+ years. Because we take babies from three months, we're a practical option for parents returning to work early.",
  },
  {
    q: "Am I eligible for the 20 Hours ECE subsidy?",
    a: "The 20 Hours ECE government funding is available for children aged three and over, and we support it fully. It covers up to 20 hours of early childhood education per week. Talk to us about how it applies to the days and sessions you're after.",
  },
  {
    q: "What food is provided?",
    a: "Fresh, nutritious halal meals are prepared and provided daily, along with morning and afternoon tea. There's no need to pack lunches. We also provide wipes — parents supply nappies or pull-ups.",
  },
  {
    q: "What are your opening hours and session options?",
    a: `We're open ${centre.hours.days}, ${centre.hours.open} to ${centre.hours.close}. You can choose a short day (9:00 AM – 3:00 PM) or a long day (7:30 AM – 6:00 PM), depending on what suits your family and work.`,
  },
  {
    q: "How does enrolment work, and what does it cost to start?",
    a: "Enrolment starts with a visit — come and see the rooms, meet the teachers and ask everything you need to. Fees are paid one week in advance, and families with two or more children enrolled full-time receive a 5% discount. Get in touch for current fees and a registration pack.",
  },
  {
    q: "What happens if we take a family holiday?",
    a: "After six months of enrolment, you're entitled to a 50% fee reduction for up to two weeks of annual holiday, so a break doesn't come at full cost.",
  },
  {
    q: "How does the Islamic environment work alongside the NZ curriculum?",
    a: "We follow Te Whāriki, New Zealand's national early childhood curriculum, and weave an Islamic perspective through daily life at the centre. Children of all backgrounds are welcome, and the emphasis is on kindness, respect and an appreciation of difference.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Home page slideshow                                                */
/* ------------------------------------------------------------------ */

/**
 * ⚠️  CONSENT — read before adding photographs of children.
 *
 * Every slide with an identifiable child needs signed parental media consent on
 * file, and that applies to the repository as well as the site: committing an
 * image publishes it to GitHub whether or not the site itself is live. Slides
 * flagged `hasChildren` are the ones that need it.
 *
 * The two centre photographs have no children in them and carry no such
 * requirement.
 */
export type Slide =
  | {
      kind: "photo";
      /** Base name in /public/slides — .webp is served, .jpg is the fallback. */
      src: string;
      alt: string;
      caption?: string;
      hasChildren: boolean;
    }
  | { kind: "text"; heading: string; body?: string };

export const slides: readonly Slide[] = [
  {
    kind: "photo",
    src: "centre-exterior",
    alt: "The Kinderland Educare centre seen from Kohinoor Ave, with a painted mural along the fence.",
    caption: "Our purpose-built centre in Māngere",
    hasChildren: false,
  },
  {
    kind: "text",
    heading: centre.logoTagline,
    body: `Early childhood education for children from ${centre.ages}.`,
  },
  {
    kind: "photo",
    src: "farm-visit",
    alt: "A child leaning over a wooden rail to watch a goat resting in the straw, with other children and teachers behind.",
    caption: "Enquiring minds, following their own questions",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "outdoor-play",
    alt: "A child climbing on colourful outdoor play equipment in the centre's garden.",
    caption: "Room to move, every day",
    hasChildren: true,
  },
  {
    kind: "text",
    heading: "Leaders of tomorrow",
    body: "A strong sense of identity, and a lifelong love of discovery.",
  },
  {
    kind: "photo",
    src: "leaders-of-tomorrow",
    alt: "Two children pulling happy faces beneath a neon star reading 'Kinderland — Leaders of Tomorrow'.",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "end-of-year-concert",
    alt: "Children on stage in front of a hand-painted backdrop for the End of Year Concert 2025.",
    caption: "End of year concert",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "centre-entrance",
    alt: "The entrance to Kinderland Educare, with the centre's logo above the door.",
    caption: "Come and see us",
    hasChildren: false,
  },
] as const;

/**
 * TODO(kinderland): supply a music bed and set this to its path in /public.
 *
 * It stays null deliberately. Audio cannot autoplay — every modern browser blocks
 * sound until the user has interacted with the page — so the slideshow ships with
 * a sound button that is off by default and the track only starts when a visitor
 * asks for it. WCAG 1.4.2 also requires a way to stop any audio running past three
 * seconds, which that button provides.
 *
 * Whatever track is used must be licensed for commercial web use; a recognisable
 * song would need a synchronisation licence.
 */
export const SLIDESHOW_AUDIO_SRC: string | null = null;

/* ------------------------------------------------------------------ */
/*  Enrolment                                                          */
/* ------------------------------------------------------------------ */

/**
 * Documents offered on /enrolment.
 *
 * `href` is null until the file is added to /public/documents. A null entry
 * renders as "ask us for a copy" with the centre's phone number rather than a
 * download button — a dead download is worse than an honest absence, and a parent
 * who clicks one assumes the centre's admin is equally unreliable.
 *
 * TODO(kinderland): `Kinderland-Info-Pack_7th-April-2013.pdf` exists in the
 * owner's Downloads folder. It is dated 2013, so it should not be published until
 * someone confirms the fees, policies and staff details in it are still current.
 */
export const enrolmentDocs = [
  {
    id: "info-pack",
    name: "Parent information pack",
    description:
      "What a day looks like, what we provide, what to pack, and the policies you'll want to read before your child starts.",
    href: null as string | null,
  },
  {
    id: "enrolment-form",
    name: "Enrolment form",
    description:
      "Your child's details, emergency contacts and the sessions you'd like. Bring it to your visit or email it back to us.",
    href: null as string | null,
  },
] as const;

/** The steps as the centre described them: visit first, then paperwork. */
export const enrolmentSteps = [
  {
    title: "Come and see us",
    body: "Book a visit and look around while the centre is running. Meet the teachers in the room your child would join, and ask everything you want to.",
  },
  {
    title: "Fill in the forms",
    body: "Complete the enrolment form and return it with your child's birth certificate or passport and immunisation record. We'll confirm which sessions are available.",
  },
  {
    title: "Settle in",
    body: "We'll agree a start date and, if it helps, some shorter settling-in visits first so the room is familiar before the first full day.",
  },
] as const;

/**
 * TODO(kinderland): no parent-information PDF exists in the repo yet. Until one
 * is added to /public, the hero's secondary action scrolls to the enrolment
 * section rather than serving a dead download link.
 *
 * Note: `Kinderland-Info-Pack_7th-April-2013.pdf` exists in the owner's Downloads
 * folder. It is from 2013, so its fees and policies must be confirmed as current
 * before any of it is published here.
 */
export const PARENT_PACK_HREF: string | null = null;

/**
 * TODO(kinderland): drop the logo artwork into /public and set this to its path
 * (e.g. "/logo.png") to render the real mark.
 *
 * While null, <Logo> renders a CSS wordmark coloured to match the logo —
 * vermillion "Kinder", purple "land Educare". That avoids a broken image and
 * stays crisp at small sizes, but it is NOT the real logo: the tree, sun and
 * custom lettering are missing, so replace it before launch.
 */
export const LOGO_SRC: string | null = null;

/** Dimensions of the artwork above, used to reserve layout space when it is set. */
export const LOGO_SIZE = { width: 467, height: 244 } as const;
