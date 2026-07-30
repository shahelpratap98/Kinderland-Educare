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
/*  ⚠️  PLACEHOLDER DATA — NOT CONFIRMED BY THE CENTRE                */
/* ------------------------------------------------------------------ */

/**
 * TODO(kinderland): replace the `$XXX` placeholders in `ageGroups` with the
 * centre's real published rates, then set this to `false`.
 *
 * While `true`, the fee explorer renders an "unconfirmed" banner and every
 * placeholder rate is visually flagged, so the site cannot be shipped to
 * production with fabricated pricing by accident.
 *
 * Only the rate strings are unverified. The registration fee, session windows,
 * payment terms, sibling discount and holiday reduction below are all taken
 * from information supplied by the centre.
 */
export const FEES_UNCONFIRMED = true;

/** Deliberately not a plausible number — a fake figure could be mistaken for real. */
const TBC = "$XXX";

export const ageGroups = [
  {
    id: "under-2",
    label: "Under 2s",
    ageRange: "3 months – 2 years",
    blurb:
      "Our youngest room, with the higher teacher-to-child ratios required for infants and unhurried routines built around each child's own sleeping and feeding rhythm.",
    subsidy: null,
    rates: { shortDay: TBC, longDay: TBC },
    highlights: [
      "Primary caregiver for every infant",
      "Nappies and pull-ups supplied by parents; wipes provided",
      "Fresh halal meals from the time solids begin",
    ],
  },
  {
    id: "2-to-3",
    label: "2 – 3 Years",
    ageRange: "2 – 3 years",
    blurb:
      "A busy, language-rich room for toddlers finding their independence, with plenty of outdoor time and the first steps toward group learning.",
    subsidy: null,
    rates: { shortDay: TBC, longDay: TBC },
    highlights: [
      "Toilet-learning supported at the child's pace",
      "Daily outdoor play in the purpose-built play areas",
      "Fresh halal meals and morning and afternoon tea",
    ],
  },
  {
    id: "3-plus",
    label: "3+ Years",
    ageRange: "3 – 6 years",
    blurb:
      "School-readiness in the fullest sense: children who see themselves as capable, competent learners able to direct their own learning as they grow.",
    subsidy: "20 Hours ECE",
    rates: { shortDay: TBC, longDay: TBC },
    highlights: [
      "20 Hours ECE government funding fully supported",
      "Te Whāriki curriculum with an Islamic perspective",
      "Transition-to-school programme in the final year",
    ],
  },
] as const;

/** Confirmed by the centre — safe to display without qualification. */
export const feeFacts = {
  registration: "$40",
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
    a: "Enrolment starts with a visit — come and see the rooms, meet the teachers and ask everything you need to. There's a standard $40 registration fee. Fees are paid one week in advance, and families with two or more children enrolled full-time receive a 5% discount.",
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
