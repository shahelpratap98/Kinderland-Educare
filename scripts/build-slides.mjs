/**
 * Generates the home page slideshow derivatives in /public/slides.
 *
 *   node scripts/build-slides.mjs
 *
 * Every slide is emitted at exactly 3:2, matching the carousel's container, so
 * the browser never crops. That matters: CSS object-cover can only crop from the
 * centre, and at the container's original 2:1 that threw away 63% of each
 * portrait frame and cut children's heads off.
 *
 * Crops are explicit rather than automatic. sharp's `attention` strategy was
 * tried first and put the bright play equipment ahead of a child's face —
 * it weights saturation and edges, and a red ball beats a person. So each
 * portrait names the band to keep, measured by eye against the original.
 *
 * SOURCE is outside the repo on purpose: the originals are large and, for the
 * photographs of children, subject to parental media consent. Only the
 * derivatives are committed.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";

const SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/kids/";
const OUT = "public/slides";
const ASPECT = 3 / 2;
const WIDTH = 1800;

/*
 * Room photographs are picked up by convention rather than listed one by one:
 * drop files into a folder named after the room's slug and they are processed on
 * the next run. Centre-cropped, since there is no way to know where the subject
 * sits — if one crops badly, give it an entry in `slides` above with an explicit
 * band, the same as the carousel photographs.
 *
 *   Documents/kinder educare/rooms/under-2s/*.jpg      -> /public/rooms/under-2s-1
 *   Documents/kinder educare/rooms/2-3-years/*.jpg     -> /public/rooms/2-3-years-1
 *   Documents/kinder educare/rooms/3-plus-years/*.jpg  -> /public/rooms/3-plus-years-1
 *
 * The generated names then go into each room's `photos` array in lib/content.ts,
 * with alt text written per image.
 */
const ROOM_SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/rooms/";
const ROOM_OUT = "public/rooms";
const ROOM_SLUGS = ["under-2s", "2-3-years", "3-plus-years"];
const ROOM_WIDTH = 1400;

/**
 * `band` is the region to keep, as fractions of the original.
 *   top    where the kept band starts, as a fraction of image height
 *   left   where it starts horizontally, as a fraction of image width
 *   width  fraction of image width to keep (trims dead space, tightens framing)
 * Height follows from width and the target aspect, so a band is always 3:2.
 * Omit `band` to centre-crop, which suits the already-landscape sources.
 *
 * Narrow bands upscale on the way to WIDTH — the script warns past 1.8x, where
 * softness starts to show on a high-density display.
 *
 * `maxWidth` caps the output below WIDTH for sources that cannot fill it. Sharp
 * upscaling past ~1.5x invents detail that is not in the file: the result is a
 * larger download that looks no sharper than letting the browser scale a smaller
 * image, and often slightly worse for the ringing along edges. Where a source is
 * too small, emit it small and honest.
 */
const slides = [
  { file: "Kinderland-2.jpg", name: "centre-exterior" },
  { file: "Kinderland-28.jpg", name: "centre-entrance" },
  {
    file: "487298229_1191140626139528_3576501818591827360_n.jpg",
    name: "farm-visit",
    // Framed on the child rather than the whole pen. She sits right of centre
    // with her face 44-59% down, so this keeps the right 70% of the frame from
    // 34% down: her face and shoulders fill the slide, with the goat reduced to
    // context at the lower left rather than dominating it.
    band: { top: 0.34, left: 0.3, width: 0.7 },
  },
  {
    file: "489455250_1198712028715721_5382563851518139845_n.jpg",
    name: "outdoor-play",
    // Face 18-48%. Centre-cropping put the play frame in shot and his head out.
    band: { top: 0.12 },
  },
  {
    file: "486957102_1194404245813166_1112327438968029408_n.jpg",
    name: "leaders-of-tomorrow",
    // Both faces sit 52-80% down. This drops the neon sign above them; the text
    // slide before it carries that line instead.
    band: { top: 0.42 },
  },
  {
    file: "601368712_1416072843646304_8453034084773767498_n.jpg",
    name: "end-of-year-concert",
    band: { top: 0.05 },
  },
];

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

async function renderSlide(slide, sourceDir, outDir = OUT) {
  const src = sourceDir + slide.file;
  if (!existsSync(src)) {
    console.warn(`skip ${slide.name} — source missing`);
    return;
  }

  const raw = await sharp(src).metadata();
  /*
    metadata() describes the file, not the pipeline, so it reports the stored
    dimensions even though .rotate() will auto-apply the EXIF orientation. For
    orientations 5-8 the image turns a quarter turn, and width/height swap —
    without this the band maths below is computed against the wrong axis and
    crops the wrong part of the frame.
  */
  const quarterTurned = raw.orientation >= 5 && raw.orientation <= 8;
  const meta = {
    width: quarterTurned ? raw.height : raw.width,
    height: quarterTurned ? raw.width : raw.height,
  };
  let pipe = sharp(src).rotate();

  /* `aspect` overrides the 3:2 default for sources whose own shape should be
     kept — see the age group leads, where cropping to 3:2 zoomed the frame. */
  const aspect = slide.aspect ?? ASPECT;
  const target = Math.min(WIDTH, slide.maxWidth ?? WIDTH);
  let upscale = target / meta.width;
  if (slide.band) {
    const keepW = Math.round(meta.width * (slide.band.width ?? 1));
    const bandH = Math.round(keepW / aspect);
    const left = Math.max(
      0,
      Math.min(
        Math.round((slide.band.left ?? 0) * meta.width),
        meta.width - keepW,
      ),
    );
    const top = Math.max(
      0,
      Math.min(Math.round(slide.band.top * meta.height), meta.height - bandH),
    );
    pipe = pipe.extract({ left, top, width: keepW, height: bandH });
    upscale = target / keepW;
  }

  const sized = pipe.resize({
    width: target,
    height: Math.round(target / aspect),
    fit: "cover",
    position: "centre",
  });

  /* `quality` is per-slide so a busy frame can be pushed harder than a calm
     one. Busy photographs — a playground of children, an overhead of a craft
     mat — cost two to three times a simple portrait at the same setting, and
     they are also the ones where the loss is hardest to see. */
  const q = slide.quality ?? 78;
  await sized.clone().webp({ quality: q }).toFile(`${outDir}/${slide.name}.webp`);
  await sized
    .clone()
    .jpeg({ quality: Math.min(100, q + 2), mozjpeg: true })
    .toFile(`${outDir}/${slide.name}.jpg`);

  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  const warn = upscale > 1.8 ? `  ⚠ upscaled ${upscale.toFixed(2)}x` : "";
  console.log(
    `${slide.name.padEnd(22)} ${target}x${Math.round(target / aspect)}  ` +
      `${kb(`${outDir}/${slide.name}.webp`)}KB webp  ${kb(`${outDir}/${slide.name}.jpg`)}KB jpg` +
      warn,
  );
}

for (const slide of slides) await renderSlide(slide, SOURCE);

/* ------------------------------------------------------------------ */
/*  Photographs recovered from the previous website                    */
/* ------------------------------------------------------------------ */

/*
 * Pulled from the old WordPress site's /gallery/ page, which was still serving
 * the untouched camera originals alongside the resized copies — 12-14MP off a
 * Fujifilm compact and a Canon, all carrying intact EXIF. They are the only
 * photographs of children *at this centre* that survive from that site.
 *
 * Kept separate from the old home page slider, which is a different kind of
 * picture entirely and is built further down under "Age group photographs".
 *
 * These are roughly 2013 vintage, so they sit against the 2025 professional set
 * with visibly older cameras and an older-looking room. Ordered in `slides` to
 * alternate rather than clump, so the deck does not read as two eras bolted
 * together.
 */
const ARCHIVE_SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/oldsite/";
const archiveSlides = [
  {
    file: "g-DSCF8832.jpg",
    name: "chalkboard-rainbow",
    // 4:3. Her head starts at ~6% down, and a centre crop to 3:2 begins at 5.5%
    // — close enough to shave the top of her hair. Anchored at 0 instead, which
    // trims the bottom of the frame where there is only wall and jeans.
    band: { top: 0 },
  },
  {
    file: "g-IMG_0295.jpg",
    name: "climbing-frame",
    // 3:4 portrait, so the 3:2 band keeps only half the height. His face sits at
    // 40-52%; this centres the band on 46% and drops the empty matting below.
    band: { top: 0.21 },
  },
  {
    file: "g-IMG_0260.jpg",
    name: "puppet-play",
    // She stands right of centre with the puppet held up beside her, and the
    // right third of the frame is doorway and floor. Starting at 35% clipped the
    // puppet down to a stripe at the edge, which is the one thing in the frame
    // she is actually doing — so this starts further left and narrows instead,
    // trading the doorway for the puppet.
    band: { top: 0.1, left: 0.28, width: 0.55 },
  },
  {
    file: "g-IMG_0490.jpg",
    name: "sunhats-outside",
    // 3:4 portrait. Half the frame is sky and power lines. Face at ~40%, so the
    // band starts at 15% and keeps the children and the hoops.
    band: { top: 0.15 },
  },
  {
    file: "g-chr.jpg",
    name: "dress-ups",
    // 1230x1100, the smallest of the set that still holds up. 1.46x to full
    // width, under the warn threshold, so no cap needed. Anchored at the top
    // rather than 8% down: the extra 8% was enough to cut the head off the
    // child standing behind her, which reads worse than the empty deck below.
    band: { top: 0 },
  },
  {
    file: "g-DSCF8839.jpg",
    name: "mosaic-board",
    // Only 980px wide. Capped rather than upscaled 1.84x to 1800.
    band: { top: 0.03 },
    maxWidth: 1400,
  },
  {
    file: "g-IMG_0297.jpg",
    name: "music-corner",
    // 922px wide, 1.95x to full width. Capped for the same reason.
    band: { top: 0.02 },
    maxWidth: 1300,
  },
];

for (const slide of archiveSlides) await renderSlide(slide, ARCHIVE_SOURCE);

/* ------------------------------------------------------------------ */
/*  Age group photographs                                              */
/* ------------------------------------------------------------------ */

/*
 * The six images from the old site's home page slider, two per room.
 *
 * ⚠️  These are stock, not Kinderland. 924x420, EXIF stripped to a 22-byte stub,
 * studio-lit against seamless backdrops, and cropped to exactly the "happykids"
 * WordPress theme's slider dimensions — i.e. theme demo content. The children in
 * them have never attended this centre, and whatever licence covered them in
 * 2013 was for that theme on that site. Used here at the owner's direction as
 * placeholders until real room photographs are supplied; replace them, and drop
 * this block when you do.
 *
 * They are the poorest source on the old site: 0.39MP, so how much of each frame
 * survives matters. The two roles are cut differently.
 *
 * CARDS are small — 341px in the three-up grid — so 3:2 costs nothing visible
 * there, and matching the grid keeps the row tidy. Each `left` is measured off
 * the frame rather than centred: a centre crop cut a hand off slide2 and the
 * outer block off slide4.
 *
 * LEADS run nearly full width, and there a 3:2 crop was a real mistake. It threw
 * away a third of the width and pushed what was left up to ~1100px, so
 * wall-painting became a close-up of the back of a child's head with the
 * painting they were making cropped out. These keep the source's own 11:5 and
 * are not cropped horizontally at all — the whole scene, less magnified, and
 * 924px of real pixels instead of 630.
 *
 * Named by content, deliberately not `<slug>-<n>`: that pattern belongs to the
 * folder-convention builder below, and colliding with it would mean real room
 * photographs dropped into rooms/<slug>/ get silently overwritten by these.
 */
const AGE_GROUP_CARD_WIDTH = 1000;
const AGE_GROUP_LEAD_WIDTH = 1400;
/* 924x420 -> exactly 11:5. */
const LETTERBOX = 924 / 420;

/* The infant rooms's photograph is the studio baby that used to open the
   enrolment deck — a real photograph replacing a stock one. Its source lives in
   enrolment/_unused now that the enrolment page has its own set. */
/* The preschool room takes the farm visit — a real photograph of a child at
   this centre, replacing stock. Same band as the home deck used: she sits right
   of centre with her face 44-59% down, so this keeps the right 70% from 34%
   down and leaves the goat as context rather than the subject. */
const discovererPhotos = [
  {
    file: "487298229_1191140626139528_3576501818591827360_n.jpg",
    name: "discoverers-card",
    band: { top: 0.34, left: 0.3, width: 0.7 },
    maxWidth: 1000,
  },
  {
    file: "487298229_1191140626139528_3576501818591827360_n.jpg",
    name: "discoverers-lead",
    band: { top: 0.34, left: 0.3, width: 0.7 },
    maxWidth: 1800,
  },
];

/* The toddler room takes the photograph by the rocks, at the centre's request.
   900x600 and already exactly 3:2, so nothing is cropped and nothing upscaled.
   The climbing frame that was here has moved to the enrolment deck. */
const explorerPhotos = [
  { file: "03_water-rocks.jpg", name: "explorers-card", maxWidth: 900 },
  { file: "03_water-rocks.jpg", name: "explorers-lead", maxWidth: 900 },
];

const infantPhotos = [
  { file: "00_cover-bunny.jpg", name: "infant-card", maxWidth: 1000 },
  { file: "00_cover-bunny.jpg", name: "infant-lead", maxWidth: 1800 },
];

const ageGroupCards = [
  { file: "orig-slide5.jpg", name: "first-instruments", band: { top: 0, left: 0.16, width: 0.682 } },
  { file: "orig-slide1.jpg", name: "painting-flowers", band: { top: 0, left: 0.11, width: 0.682 } },
  { file: "orig-slide2.jpg", name: "hands-on", band: { top: 0, left: 0.26, width: 0.682 } },
].map((p) => ({ ...p, maxWidth: AGE_GROUP_CARD_WIDTH }));

const ageGroupLeads = [
  { file: "orig-slide3.jpg", name: "building-blocks-wide" },
  { file: "orig-slide6.jpg", name: "wall-painting-wide" },
  { file: "orig-slide4.jpg", name: "ready-for-school-wide" },
].map((p) => ({ ...p, aspect: LETTERBOX, maxWidth: AGE_GROUP_LEAD_WIDTH }));

if (!existsSync(ROOM_OUT)) mkdirSync(ROOM_OUT, { recursive: true });
for (const photo of [...ageGroupCards, ...ageGroupLeads])
  await renderSlide(photo, ARCHIVE_SOURCE, ROOM_OUT);

for (const photo of infantPhotos)
  await renderSlide(photo, "C:/Users/Shahel Pratap/Documents/kinder educare/enrolment/_unused/", ROOM_OUT);

for (const photo of discovererPhotos) await renderSlide(photo, SOURCE, ROOM_OUT);

for (const photo of explorerPhotos)
  await renderSlide(photo, "C:/Users/Shahel Pratap/Documents/kinder educare/enrolment/_unused/", ROOM_OUT);

/* ------------------------------------------------------------------ */
/*  Old home page slider, on the home deck                             */
/* ------------------------------------------------------------------ */

/*
 * The same six images the old site ran in its home slider, now wanted on this
 * one. They are 924x420, so a 3:2 crop leaves 630x420 — capped at 900 rather
 * than pushed to 1800, which would have been a 2.9x upscale. They are the
 * softest things in the deck and there is no version of them that is not.
 *
 * Each `left` is measured, not centred: a centre crop cut a hand off slide2
 * and the outer block off slide4.
 */
const homeArchiveSlides = [
  { file: "orig-slide1.jpg", name: "old-painting-flowers", band: { top: 0, left: 0.11, width: 0.682 } },
  { file: "orig-slide2.jpg", name: "old-hands-on", band: { top: 0, left: 0.26, width: 0.682 } },
  { file: "orig-slide3.jpg", name: "old-building-blocks", band: { top: 0, left: 0.18, width: 0.682 } },
  { file: "orig-slide4.jpg", name: "old-ece-blocks", band: { top: 0, left: 0.25, width: 0.682 } },
  { file: "orig-slide5.jpg", name: "old-first-instruments", band: { top: 0, left: 0.16, width: 0.682 } },
  /*
     Anchored at 0, showing the painting rather than the painter.

     Measured, after two wrong guesses: the child's head spans 55-95% of the
     width — 40% of the frame — which is why every crop that kept the whole head
     was a close-up of the back of it. The 3:2 window is only 68.2% wide, so
     there is no offset that holds both the head and the painting. Starting at 0
     gives the brushwork, the loaded brush and the hand, with the child present
     at the right edge as context. The head is cut there, but it is the back of
     the head, and a subject running off the edge of a frame is ordinary; a
     portrait of someone's hair is not.
  */
  { file: "orig-slide6.jpg", name: "old-wall-painting", band: { top: 0, left: 0, width: 0.682 } },
].map((e) => ({ ...e, maxWidth: 900 }));

for (const slide of homeArchiveSlides) await renderSlide(slide, ARCHIVE_SOURCE);

/*
 * One photograph from the family set that used to fill the enrolment page,
 * asked back onto the home deck after the rest of that set was replaced. It is
 * 900x600 — already exactly 3:2, so nothing is cropped and nothing upscaled.
 */
await renderSlide(
  { file: "01_park-flower.jpg", name: "park-flower", maxWidth: 900 },
  "C:/Users/Shahel Pratap/Documents/kinder educare/enrolment/_unused/",
);

/* ------------------------------------------------------------------ */
/*  Enrolment page slideshow                                           */
/* ------------------------------------------------------------------ */

/*
 * Picked up by convention, like the room photographs: drop files into
 *
 *   Documents/kinder educare/enrolment/
 *
 * and they are processed in filename order on the next run, emitting
 * enrolment-1, enrolment-2 … into /public/enrolment. Prefix the filenames 01_,
 * 02_ … to control the order of the deck.
 *
 * Centre-cropped to 3:2. That is safe for landscape sources but will cut a tall
 * portrait — this set is mixed, so check the contact sheet after a run and give
 * anything that crops badly an explicit band in `slides` above, the same as the
 * carousel photographs.
 *
 * ⚠️  Every one of these shows an identifiable child, so the consent rule in
 * lib/content.ts applies before any of them is committed: committing publishes
 * to a public GitHub repository as well as to the site.
 */
const ENROLMENT_SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/enrolment/";
const ENROLMENT_OUT = "public/enrolment";

/*
 * Listed rather than picked up by convention so the order is explicit and each
 * file can carry its own framing.
 *
 * Every entry here is already exactly 3:2, so none is cropped — the two studio
 * photographs are 7120px and 6336px wide and are only downscaled. The airport
 * and yellow-dress files were dropped: at 720px and 306px they sat well under
 * the ~1100px frame and were visibly soft beside these. They are kept in
 * enrolment/_unused rather than deleted.
 */
const enrolmentSlideFiles = [
  // Teacher and toddler under the fairy lights. Faces 20-40% down.
  { file: "01_centre.jpg", name: "enrolment-1", band: { top: 0.12 } },
  // Boy on the climbing frame, arm up against blue sky. Face 25-45%.
  { file: "02_centre.jpg", name: "enrolment-2", band: { top: 0.18 } },
  // Girl in the korowai. Face 15-35%.
  { file: "03_centre.jpg", name: "enrolment-3", band: { top: 0.08 } },
  // Overhead of the water tray on the grass. Already 1.36, barely cropped.
  { file: "04_centre.jpg", name: "enrolment-4" },
  // Threading at the table. Face 15-35%.
  { file: "05_centre.jpg", name: "enrolment-5", band: { top: 0.08 } },
  // The group in the playground. Children sit 30-70%, so this starts lower.
  { file: "06_centre.jpg", name: "enrolment-6", band: { top: 0.28 } },
  // Girl in the garden. Face high in the frame at 8-25%.
  { file: "07_centre.jpg", name: "enrolment-7", band: { top: 0.03 } },
  // Overhead of the craft mat — no single subject, so a middle band.
  { file: "08_centre.jpg", name: "enrolment-8", band: { top: 0.15 } },
  // Laying the table. Face 10-30%.
  { file: "09_centre.jpg", name: "enrolment-9", band: { top: 0.05 } },
  /*
     The "leaders of tomorrow" photograph, moved here after it came off the home
     deck. Its source lives with the 2025 set rather than the WhatsApp folder,
     so it is rendered separately below.
  */
].map((e) => ({ ...e, maxWidth: 1200, quality: 68 }));

if (!existsSync(ENROLMENT_OUT)) mkdirSync(ENROLMENT_OUT, { recursive: true });
for (const slide of enrolmentSlideFiles)
  await renderSlide(slide, ENROLMENT_SOURCE, ENROLMENT_OUT);

/* Same source and band as the home deck's copy: both faces sit 52-80% down, so
   this starts at 42%. That drops the neon sign above them, which is why the alt
   text describes the children rather than the sign. */
/* The climbing frame, moved off the toddler room card onto this deck. The
   number is just a filename — position on the page is set by the order of
   enrolmentSlides in lib/content.ts, where this sits second. */
await renderSlide(
  {
    file: "g-IMG_0295.jpg",
    name: "enrolment-11",
    band: { top: 0.21 },
    maxWidth: 1200,
    quality: 68,
  },
  ARCHIVE_SOURCE,
  ENROLMENT_OUT,
);

await renderSlide(
  {
    file: "486957102_1194404245813166_1112327438968029408_n.jpg",
    name: "enrolment-10",
    band: { top: 0.42 },
    maxWidth: 1200,
    quality: 68,
  },
  SOURCE,
  ENROLMENT_OUT,
);

/* ------------------------------------------------------------------ */
/*  Room photographs                                                   */
/* ------------------------------------------------------------------ */

if (!existsSync(ROOM_OUT)) mkdirSync(ROOM_OUT, { recursive: true });

let roomTotal = 0;
for (const slug of ROOM_SLUGS) {
  const dir = `${ROOM_SOURCE}${slug}`;
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  for (const [i, file] of files.entries()) {
    const name = `${slug}-${i + 1}`;
    const pipe = sharp(`${dir}/${file}`)
      .rotate()
      .resize({
        width: ROOM_WIDTH,
        height: Math.round(ROOM_WIDTH / ASPECT),
        fit: "cover",
        position: "centre",
      });

    await pipe.clone().webp({ quality: 78 }).toFile(`${ROOM_OUT}/${name}.webp`);
    await pipe
      .clone()
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${ROOM_OUT}/${name}.jpg`);

    const kb = (statSync(`${ROOM_OUT}/${name}.webp`).size / 1024).toFixed(0);
    console.log(`${name.padEnd(22)} ${ROOM_WIDTH}x${Math.round(ROOM_WIDTH / ASPECT)}  ${kb}KB webp   <- ${file}`);
    roomTotal += 1;
  }
}

if (roomTotal === 0) {
  console.log(
    `\nNo room photographs yet. Drop files into ${ROOM_SOURCE}<slug>/ ` +
      `for ${ROOM_SLUGS.join(", ")} and re-run.`,
  );
}

/* ------------------------------------------------------------------ */
/*  Centre photographs (Our approach)                                  */
/* ------------------------------------------------------------------ */

/*
 * Professionally shot facility photographs — rooms, grounds, displays. None
 * contain children, so unlike the home page slides these carry no parental
 * consent requirement.
 *
 * All sources are >=3000px and already landscape, so a centre crop to 3:2 is
 * safe; there is no subject that a centre crop can decapitate.
 */
const CENTRE_SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/Kinderland Pics/";
const CENTRE_OUT = "public/centre";
const centreSlides = [
  ["Kinderland-43.jpg", "playground"],
  ["Kinderland-54.jpg", "our-whare"],
  ["Kinderland-46.jpg", "log-stools"],
  ["Kinderland-137.jpg", "entrance-pencils"],
  ["Kinderland-6.jpg", "tree-structure"],
  ["Kinderland-41.jpg", "under-2s-room"],
  ["Kinderland-3.jpg", "world-map-wall"],
  ["Kinderland-30.jpg", "dining-room"],
  ["Kinderland-39.jpg", "dream-display"],
  ["Kinderland-66.jpg", "reading-nook"],
];

if (!existsSync(CENTRE_OUT)) mkdirSync(CENTRE_OUT, { recursive: true });

for (const [file, name] of centreSlides) {
  const src = CENTRE_SOURCE + file;
  if (!existsSync(src)) {
    console.warn(`skip ${name} — source missing`);
    continue;
  }
  const pipe = sharp(src).rotate().resize({
    width: WIDTH,
    height: Math.round(WIDTH / ASPECT),
    fit: "cover",
    position: "centre",
  });
  await pipe.clone().webp({ quality: 78 }).toFile(`${CENTRE_OUT}/${name}.webp`);
  await pipe.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${CENTRE_OUT}/${name}.jpg`);
  const kb = (statSync(`${CENTRE_OUT}/${name}.webp`).size / 1024).toFixed(0);
  console.log(`${name.padEnd(22)} ${WIDTH}x${Math.round(WIDTH / ASPECT)}  ${kb}KB webp   <- ${file}`);
}
