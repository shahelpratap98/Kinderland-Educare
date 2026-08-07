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
  /* Second line listed on the centre's own FAQ page. */
  phoneAlt: "09 275 1984",
  phoneAltHref: "tel:+6492751984",
  /*
    Note the live site's FAQ page gives this as info@kinderlandedcare.co.nz —
    missing the "u" in educare. Assumed a typo there rather than a real alias,
    since the domain itself is kinderlandeducare.co.nz. Worth fixing on the old
    site too; anyone emailing from that page is bouncing.
  */
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
 * openings.
 *
 * No longer rendered anywhere. Both statements were removed from the home page
 * and from /our-approach at the centre's request (website changes, Aug 2026).
 * Kept here rather than deleted so the exact wording is not lost — it is the
 * only copy of it in the repo. Do not paraphrase or trim if it is reinstated.
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
    body: "A nurturing setting that weaves an Islamic perspective through everyday learning, alongside the principles of Te Whāriki.",
  },
  {
    icon: "UtensilsCrossed",
    title: "Nutrition & halal catering",
    body: "Fresh, nutritious halal meals prepared daily.",
  },
  {
    icon: "Blocks",
    title: "Room to learn",
    body: "A purpose-built centre with safe, spacious indoor rooms and outdoor play areas, designed for children from three months to six years old.",
  },
] as const;

/**
 * The fee-structure panel on the home page, directly above the slideshow.
 *
 * Note it names no figures — the same rule that removed pricing everywhere else
 * on the site. It says the structures vary and points at a conversation, which
 * is exactly what the centre asked for.
 */
export const feeStructure = {
  eyebrow: "Now open and taking new enrolments",
  title: "A flexible fee structure",
  body: [
    "At Kinderland Educare, to meet the needs of our parents, we run many programmes that include, besides full days, other options of short days and sessions.",
    "Our fees structures also vary to reflect the flexibility of our various programmes and provide our parents options based on the time a child is enrolled for.",
    "For more details and further information please do contact us.",
  ],
} as const;

/* ------------------------------------------------------------------ */
/*  Age groups                                                         */
/* ------------------------------------------------------------------ */

/**
 * A photograph on a room page.
 *
 * `src` is the base name in /public/rooms — .webp is served with .jpg as the
 * fallback, both produced by scripts/build-slides.mjs.
 */
export type RoomPhoto = {
  src: string;
  alt: string;
  caption?: string;
  /**
   * CSS aspect-ratio for the frame, when the derivative is not the usual 3:2.
   * The container has to match the file, because object-cover can only crop
   * from the centre — a mismatch here is how a subject loses its head.
   */
  aspect?: string;
};

/**
 * One entry per room, each with its own page at /age-groups/[slug].
 *
 * Each room carries three labels: `category` (Infants / Toddlers / Preschool,
 * uppercased in CSS at the point of use), `ageRange`, and `label` — the room's
 * own name, which is what the cards lead with.
 *
 * Read the ages from `ageRange`, never from the slug. The two agree today, but
 * the boundary between the toddler and preschool rooms has already moved once
 * and back within a single week; the slugs are live URLs and will not follow it.
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
 * `photos` renders the first entry as a wide lead image and any others as a grid
 * under "Inside the room", omitting both sections while the array is empty.
 * `cardPhoto` is the thumbnail on the /age-groups index.
 *
 * ⚠️  BOTH ARE PLACEHOLDERS, AND BOTH ARE STOCK. All six come from the old
 * WordPress site's home page slider: 924x420, EXIF stripped, studio-lit on
 * seamless backdrops, cut to that theme's exact slider size. The children are
 * models, not children who attend here, and the 2013 theme licence does not
 * carry over to this site. They are in place at the owner's direction to fill
 * the rooms until real photographs are taken.
 *
 * Two consequences, deliberate:
 *   - only one photo per room, used as the lead. Nothing goes into the "Inside
 *     the room" grid, because that heading asserts these are these rooms.
 *   - no captions, for the same reason. A caption is a claim; these are set
 *     dressing until they are replaced.
 *
 * Same consent rule as the slideshow once real photographs land: any photograph
 * showing an identifiable child needs signed parental media consent before it is
 * committed, since committing publishes it to the repository.
 */
export const ageGroups = [
  {
    id: "under-2",
    slug: "under-2s",
    label: "Little Wonderers",
    category: "Infants",
    ageRange: "3m – 2y",
    lead: "Unhurried days built around your baby's own rhythm.",
    blurb:
      "Our youngest room is a calm, nurturing space where your baby's day follows their individual rhythms for feeding, sleeping, playing, and care in a safe, purpose-built space.",
    body: "Settling a baby into care is a big step, and the first weeks matter more than anything that follows. We keep routines close to the ones you keep at home, so the day feels familiar. Fresh, nutritious halal meals are prepared for the centre daily and start as soon as your baby is on solids. We provide wipes; you supply nappies or pull-ups, and we handle the rest of the day.",
    subsidy: null,
    cardPhoto: {
      src: "first-instruments",
      alt: "Two small children sitting together with shakers and a xylophone.",
    } as RoomPhoto,
    photos: [
      {
        src: "wall-painting-wide",
        alt: "A child painting broad brushstrokes onto a wall-mounted sheet of paper.",
        aspect: "11 / 5",
      },
    ] as readonly RoomPhoto[],
    highlights: [
      "Fresh, nutritious halal meals once solids begin",
      "Wipes provided — parents supply nappies, pull-ups and formula",
      "Purpose-built indoor room with outdoor play alongside",
    ],
  },
  {
    id: "2-to-3",
    slug: "2-3-years",
    label: "Little Explorers",
    category: "Toddlers",
    ageRange: "2 – 3y",
    lead: "Room to move, and the freedom to follow a question.",
    blurb:
      "Our toddler room is a busy, language-rich environment where confident, capable toddlers build independence, explore through play, and enjoy plenty of space to move and learn outdoors.",
    body: "Toddlers learn by doing, loudly and on their feet. This room is set up for that: space to move indoors, direct access to the outdoor play areas, and teachers who treat curiosity as the point rather than an interruption. It is also where individualism, initiative and choice — the things our vision names — start showing up in practice.",
    subsidy: null,
    cardPhoto: {
      src: "painting-flowers",
      alt: "A child lying on a large sheet of paper covered in painted flowers and handprints.",
    } as RoomPhoto,
    photos: [
      {
        src: "building-blocks-wide",
        alt: "A toddler kneeling on the floor building a low wall out of large plastic bricks.",
        aspect: "11 / 5",
      },
    ] as readonly RoomPhoto[],
    highlights: [
      "Purpose-built outdoor play areas for active toddlers",
      "Morning tea, hot lunch, afternoon tea and a late snack",
      "An Islamic perspective woven through everyday learning",
    ],
  },
  {
    id: "3-plus",
    slug: "3-plus-years",
    label: "Discoverers",
    category: "Preschool",
    ageRange: "3 – 6y",
    lead: "Capable, competent learners, ready for what comes next.",
    blurb:
      "Our preschool room nurtures capable and confident learners who take ownership of their learning, explore their interests, and develop the skills, independence, and confidence to proudly graduate to primary school.",
    body: "Our oldest room takes school readiness in the fullest sense: not worksheets, but children with a strong sense of identity who can direct their own learning. We follow Te Whāriki, New Zealand's early childhood curriculum, with an Islamic perspective woven through the day. From age three, the 20 Hours ECE government funding is fully supported here, and we run a transition programme to help children move smoothly on to primary school.",
    subsidy: "20 Hours ECE",
    cardPhoto: {
      src: "hands-on",
      alt: "A smiling child holding both palms up to the camera, covered in bright finger paint.",
    } as RoomPhoto,
    photos: [
      {
        src: "ready-for-school-wide",
        alt: "A child's hands holding up three wooden alphabet blocks spelling E, C and E.",
        aspect: "11 / 5",
      },
    ] as readonly RoomPhoto[],
    highlights: [
      "20 Hours ECE government funding fully supported",
      "A transition programme through to primary school",
      "Te Whāriki curriculum with an Islamic perspective",
    ],
  },
] as const;

/**
 * TODO(kinderland): confirm before publishing.
 *
 * These are reasonable for an ECE centre and appeared in earlier drafts, but the
 * centre never supplied them, so they are held here rather than stated on the
 * pages as fact. Confirm any that are true and I will fold them back in.
 *
 * The transition-to-school programme and the morning/afternoon tea schedule were
 * on this list until the centre's own FAQ page confirmed both; they are now
 * stated on the relevant pages.
 */
export const COPY_TO_CONFIRM = [
  "A named primary caregiver for each infant in the Under 2s room",
  "Specific teacher-to-child ratios, if you want them published",
  "Toilet learning supported at the child's own pace",
] as const;

/**
 * Session windows only — times, not prices. Every dollar figure was removed from
 * the site along with the fee explorer, so enquiries about cost go to the centre
 * directly. `policies` are enrolment terms expressed as percentages rather than
 * amounts, and were supplied by the centre.
 */
/*
 * `sessions` was a published Short day / Long day timetable. Removed at the
 * centre's request (website changes, Aug 2026), along with the fixed session
 * times on the room pages: session options are now discussed on a visit, the
 * same way fees already were. The opening hours themselves still show.
 */
export const enrolmentFacts = {
  policies: [
    {
      icon: "CalendarClock",
      title: "Paid a week ahead",
      body: "All fees are paid one week in advance.",
    },
    {
      icon: "Users",
      /* The percentage is deliberately gone — the centre asked for "special
         discount" rather than a figure, the same reasoning that removed pricing. */
      title: "Sibling discount",
      body: "Families with two or more children enrolled full-time receive a special discount.",
    },
    {
      icon: "Palmtree",
      title: "Holiday reduction",
      body: "After six months of enrolment, families can enjoy up to two weeks of holiday each calendar year at 50% fees. Simply email us, and let us know your holiday plans.",
    },
  ],
} as const;

/**
 * Supplied by the centre (website changes, Aug 2026) and used verbatim; this set
 * replaces the one rebuilt from the old kinderlandeducare.co.nz/faq page.
 *
 * One departure from the order given: "Do we need to provide nappies and wipes?"
 * arrived after the "who do I talk to" question, which reads as an append rather
 * than an intended position. It sits next to the food question here, since both
 * answer "what do we bring", and the contact question stays last where a
 * catch-all belongs.
 *
 * Answers that run to more than one paragraph are arrays; see Accordion.
 */
export const faqs = [
  {
    q: "Is Kinderland a purpose-built centre?",
    a: "Yes. Kinderland Educare is purpose-built as a childcare centre, designed and maintained to meet the educational standards of the Ministry of Education.",
  },
  {
    q: "What ages do you care for?",
    a: "We care for children from 3 months to 6 years, with dedicated learning spaces for under 2s, 2–3 year olds, and 3+ year olds. Starting care from 3 months means families can feel confident knowing their baby is supported in a nurturing environment when they return to work.",
  },
  {
    q: "What hours are you open?",
    a: `We are open ${centre.hours.days}, ${centre.hours.open} to ${centre.hours.close}, with session options available to support your child's age, learning journey, and your family's needs. Talk to us to find the option that works best for your child.`,
  },
  {
    q: "Do you provide 20 Hours ECE?",
    a: "Yes. The 20 Hours ECE government funding is fully supported here from age three, with sessions available. Talk to us about how it applies to the days you're after.",
  },
  {
    q: "How does enrolment work?",
    a: "Enrolment starts with a visit — come and explore our rooms, meet our teachers, and ask any questions you may have. Our team will guide you through the enrolment process and provide you with the information and forms you need to get started. Where applicable, one week's fees are paid in advance to secure your child's place.",
  },
  {
    q: "Is there a sibling discount?",
    a: "Yes. Families with two or more children enrolled full-time receive a special discount.",
  },
  {
    q: "What food is provided, and what do we need to pack?",
    a: [
      "Fresh, nutritious halal meals prepared in-house are provided for children enrolled in our full-day programme, with Wednesday being our lunch box day. All children bring food from home on this day to build confidence with lunch boxes and prepare for their primary school journey.",
      "As part of our cultural values, we do not include beef or pork in the food provided at the centre, and we kindly ask families to avoid packing these meats in lunch boxes.",
    ],
  },
  {
    q: "Do we need to provide nappies and wipes?",
    a: "Yes. As every child has unique skin needs, we ask families to provide their child's nappies and wipes from home. Young children can have sensitive skin or allergies that may not always be known, so using familiar products helps us reduce the risk of irritation and support your child's comfort and wellbeing.",
  },
  {
    q: "Why is my child unsettled during the transition period, and how can I help?",
    a: [
      "Every child's transition journey is unique. Settling into a new environment is a process that takes time and is not always a linear journey — some days may feel easier than others as children build trust, relationships, and a sense of belonging.",
      "Regular attendance helps children become familiar with routines, develop connections with teachers and friends, and feel more secure in their new environment. Families can support this process by talking positively about Kinderland, keeping goodbyes calm and consistent, and sharing information about their child's interests, routines, and needs.",
      "Our teachers support children through warm, responsive relationships, predictable routines, and meaningful experiences that help each child feel safe and confident. We encourage open communication between families and teachers so we can work together and provide the best support if you have any concerns.",
    ],
  },
  {
    q: "Do you offer a school readiness programme?",
    a: "Yes. Our school readiness programme supports children to develop the confidence, independence, and skills they need as they prepare for primary school. We work alongside children and whānau to make this an exciting and positive next step in their learning journey.",
  },
  {
    q: "Do you offer an Islamic programme?",
    a: [
      "Yes. As an Islamic Special Character centre, children take part in gently guided learning experiences that support values-based learning and foundational language development, including exposure to the Arabic language. These experiences are woven naturally throughout our day through storytelling, oral traditions, songs, and peaceful group times.",
      "Our programme welcomes children from all backgrounds, and families are encouraged to learn more about our approach and the experiences their child will be part of as a valued member of our centre community.",
    ],
  },
  {
    q: "What should I do if my child is sick?",
    a: [
      "Regular attendance helps children feel settled, build strong relationships, and make the most of their learning experiences. We encourage families to support consistent attendance whenever possible.",
      "If your child is away for an extended period due to illness, we will request an EC13 form completed by a medical professional to maintain their place at Kinderland Educare.",
    ],
  },
  {
    q: "What happens if we take a family holiday?",
    a: "After six months of enrolment, families can enjoy up to two weeks of holiday each calendar year at 50% fees. Simply email us, and let us know your holiday plans.",
  },
  {
    q: "What happens in a medical emergency?",
    a: "The wellbeing and safety of every child is our priority. Our registered teachers hold current New Zealand first aid certification and are prepared to respond to medical situations. In an emergency, we will contact you as soon as possible and follow the information provided in your child's enrolment records, including emergency contacts and medical details.",
  },
  {
    q: "I have a question that isn't answered here — who do I talk to?",
    a: `Call us on ${centre.phone} or email ${centre.email}. If it's easier, book a visit and ask in person — we'd rather talk it through.`,
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

/*
 * ⚠️  ON THE OLD SITE'S PHOTOGRAPHS — read before adding more from that source.
 *
 * Seven slides here (chalkboard-rainbow, climbing-frame, puppet-play,
 * sunhats-outside, dress-ups, mosaic-board, music-corner) were recovered from
 * the previous WordPress site's /gallery/ page. They are genuine: 12-14MP camera
 * originals with intact Fujifilm and Canon EXIF, taken in these rooms.
 *
 * The six images in that site's home page slider are NOT here, and should not be
 * added. They are 924x420 with EXIF stripped, studio-lit against seamless
 * backdrops, and cropped to exactly the "happykids" theme's slider dimensions —
 * i.e. stock or theme demo content, showing children who have never attended
 * this centre. Whatever licence covered them in 2013 was for that theme on that
 * site; it does not follow the pictures here.
 *
 * These are roughly 2013 vintage against a 2025 professional set, so the order
 * below alternates between the two rather than running them in blocks.
 */
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
    src: "chalkboard-rainbow",
    alt: "A girl holding up a small chalkboard she has drawn a rainbow on, against the green wall of her room.",
    caption: "Where dreams and creativity meet",
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
    kind: "photo",
    src: "climbing-frame",
    alt: "A child in a sun hat grinning out through the red hoops of the outdoor climbing frame.",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "mosaic-board",
    alt: "A boy holding up a peg board he has filled with coloured counters, in front of the classroom shelves.",
    caption: "Look what I made",
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
    src: "puppet-play",
    alt: "A girl in a red headscarf smiling beside the zebra hand puppet she is holding up.",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "sunhats-outside",
    alt: "Children in sun hats playing with hoops in the outdoor yard on a clear summer day.",
    caption: "Hats on, outside, most of the year",
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
    src: "dress-ups",
    alt: "A toddler in oversized white sunglasses on the deck, with another child playing behind her.",
    hasChildren: true,
  },
  {
    kind: "photo",
    src: "music-corner",
    alt: "A boy in a cap and sunglasses with his arms flung wide beside the classroom stereo.",
    caption: "Music and movement",
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
 * Centre photographs for /our-approach, running directly under the page header.
 *
 * Professionally shot and, unlike the home page deck, containing no children —
 * so no parental media consent applies. Ordered to alternate outside and inside
 * rather than grouping them, which reads as two separate galleries stuck together.
 */
export const centreSlides: readonly Slide[] = [
  {
    kind: "photo",
    src: "playground",
    alt: "The centre's playground: a wooden climbing frame with a green slide, on grass beneath mature trees.",
    caption: "Room to move, every day",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "tree-structure",
    alt: "An indoor climbing and reading structure built to look like a tree, beside low tables and chairs.",
    caption: "Built for climbing, reading and hiding",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "our-whare",
    alt: "A wooden playhouse in the grounds with a thatched roof and a hand-painted sign reading 'Our Whare'.",
    caption: "Our whare",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "under-2s-room",
    alt: "The under-2s room, painted teal, with a cot, a soft rug and an arc of flags and greetings from many countries.",
    caption: "Where our youngest belong",
    hasChildren: false,
  },
  {
    kind: "text",
    heading: "An environment that teaches",
    body: "Surroundings shaped for each child's learning, independence and comfort.",
  },
  {
    kind: "photo",
    src: "world-map-wall",
    alt: "A wall map showing the countries our families come from, with greetings in each language and a carved waka below.",
    caption: "Every family on the map",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "log-stools",
    alt: "Log stools arranged on the grass under a covered outdoor area.",
    caption: "Somewhere to sit and watch",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "dream-display",
    alt: "A quiet corner with a curved table, children's artwork and a display headed 'Dream — Eid Al Adha'.",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "dining-room",
    alt: "The dining and activity room, with low tables and chairs set out beneath a birthdays display.",
    caption: "Fresh halal meals, every day",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "reading-nook",
    alt: "A reading nook tucked beneath the stairs, with framed documents, books and a small table.",
    caption: "Our philosophy, on the wall",
    hasChildren: false,
  },
  {
    kind: "photo",
    src: "entrance-pencils",
    alt: "Giant coloured pencil sculptures standing at the entrance to the centre.",
    caption: "You'll know you're in the right place",
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
/*  Our approach — page body                                           */
/* ------------------------------------------------------------------ */

/**
 * The body of /our-approach.
 *
 * Supplied by the centre (website changes, Aug 2026) and used verbatim. It
 * replaces the previous "We believe" list, which was condensed from their older
 * Children / Parents / Employees / Community / Physical Environment statement.
 *
 * `intro` runs before the first heading. One note on the source: the halal-meals
 * paragraph arrived styled as a heading, but it is a sentence, not a title, so it
 * sits as the closing paragraph of "Islamic Values & Care" where it reads.
 */
export const approach = {
  title: "About Us",
  intro: [
    "At Kinderland Educare, we provide high-quality early childhood education and care in Mangere, Auckland, offering a nurturing environment where children thrive as confident, curious, and capable learners. Our ECE center welcomes families from diverse backgrounds and provides a place where children feel a strong sense of belonging, identity, and connection.",
    "Our values of compassion, kindness, respect, and responsibility guide everything we do. These universal values are woven throughout our daily practices and align with both Te Whāriki and our Islamic Special Character. We believe every child is a taonga (treasure), bringing their own culture, strengths, interests, and experiences. Through meaningful relationships and intentional teaching, children are empowered to be active participants in their learning.",
  ],
  sections: [
    {
      title: "Children",
      body: [
        "At Kinderland Educare, children are at the heart of everything we do. We believe children are capable and confident learners who bring their own knowledge, ideas, and curiosity to their learning journey.",
        "Our daycare and preschool in Mangere provides a play-based learning environment where children are encouraged to explore, ask questions, make choices, solve problems, and develop independence. Through caring relationships and meaningful experiences, children build confidence, creativity, resilience, and a lifelong love of learning.",
        "We celebrate each child's unique identity, language, culture, and family background, supporting them to develop a strong sense of belonging.",
      ],
    },
    {
      title: "Families & Whānau",
      body: [
        "We believe parents and whānau are children's first and most important teachers. Strong partnerships with families are central to our approach, and we value the knowledge, aspirations, cultures, and experiences each family brings.",
        "As a Muslim childcare centre in Auckland, we understand the importance of supporting families who are seeking an environment where their values, traditions, and faith are respected. We also welcome families from all backgrounds and celebrate the diversity within our community.",
        "Through open communication, shared experiences, and genuine relationships, we work together with whānau to support each child's wellbeing, learning, and growth.",
      ],
    },
    {
      title: "Islamic Values & Care",
      body: [
        "Our Islamic preschool and childcare centre in Auckland reflects values of compassion, respect, gratitude, kindness, and responsibility throughout the day. Children are encouraged to develop positive relationships, care for others, and contribute to their community.",
        "We provide fresh halal meals prepared in-house daily (terms and conditions apply), supporting families who value nutritious meals that align with their cultural and dietary needs.",
      ],
    },
    {
      title: "Teachers / Kaiako",
      body: [
        "Our teachers are at the heart of our learning community. We value the knowledge, experience, and strengths each kaiako brings and support their ongoing professional growth through reflection, collaboration, and learning.",
        "Our teachers build respectful relationships with children and whānau, creating intentional learning experiences that respond to children's interests, identities, and individual ways of learning.",
      ],
    },
    {
      title: "Community",
      body: [
        "Kinderland Educare is part of a diverse and connected South Auckland community. Located near Al-Madinah School, Zayed College for Girls, and Mangere Central Primary School, Kinderland Educare is part of a connected South Auckland community.",
        "We honour Te Tiriti o Waitangi and respect Māori as tangata whenua. We celebrate the languages, cultures, and identities of all families and create an inclusive environment where every child feels valued.",
        "Our connections with local schools, community organisations, and families help support children as they grow, learn, and prepare for their next learning journey.",
      ],
    },
    {
      title: "Our Learning Environment",
      body: [
        "Our early childhood centre in Mangere provides a safe, welcoming, and engaging environment where children can explore, create, discover, and develop independence.",
        "Through purposeful spaces, meaningful resources, and respectful relationships, we support children's wellbeing, belonging, exploration, and confidence as they grow into lifelong learners.",
      ],
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

/**
 * Three of the centre's Google reviews.
 *
 * Chosen for being quotable in full: several of the others are truncated behind
 * Google's "More" link, and quoting a sentence that stops mid-thought reads as
 * either careless or selective. One strong review was left out because it is from
 * a student who did her practicum here rather than a parent — glowing, but it
 * answers a question no prospective parent is asking.
 *
 * ⚠️  Transcribed from screenshots. Worth checking each against the live listing
 * before this goes public: misquoting a real person under their own name is worse
 * than having no reviews at all.
 *
 * ⚠️  Do NOT add Review or AggregateRating structured data for these. Google's
 * own guidelines forbid marking up reviews gathered from another platform as your
 * site's own, and doing it risks a manual action against the listing. They are
 * plain text here on purpose.
 */
export const reviews = [
  {
    quote:
      "I have a very good experience with Kinderland as they have very helpful, friendly and efficient staff. A very educational and safe environment for kids to learn and grow. Great teachers and excellent parent support given.",
    author: "Arifa Ali",
    rating: 5,
  },
  {
    quote:
      "Our experience with Kinderland Educare has been absolutely phenomenal. The staff are incredibly attentive, caring, and committed to providing a nurturing environment for children.",
    author: "M Alwan",
    rating: 5,
  },
  {
    quote:
      "Thank you from the bottom of our hearts for taking such wonderful care of my child. You are truly amazing teachers, and we appreciate all the love, patience, and dedication you put into your work every single day.",
    author: "Zaira Nisha",
    rating: 5,
  },
] as const;

/**
 * TODO(kinderland): these go stale. Update when the listing moves, or drop the
 * count and keep only the rating.
 */
export const reviewSummary = {
  rating: "4.9",
  count: 18,
  source: "Google",
  /* When the figures above were read, so nobody has to guess how old they are. */
  asAt: "August 2026",
  url: "https://www.google.com/maps/search/?api=1&query=Kinderland+Educare+New+Zealand",
} as const;

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
    /* The centre's own 2026 form. Dated in the filename on purpose — when 2027's
       lands, the old link stops silently serving last year's terms. */
    href: "/documents/kinderland-enrolment-form-2026.pdf" as string | null,
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
    /* Verbatim from the centre's copy, including "organize" — flagged to them,
       since every other spelling on the site is NZ English. */
    body: "We'll agree to a start date and organize some shorter settling in visits so you and your child are comfortable with the room before the first full day.",
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
