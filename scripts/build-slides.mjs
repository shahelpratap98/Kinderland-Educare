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

  const meta = await sharp(src).rotate().metadata();
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

  await sized.clone().webp({ quality: 78 }).toFile(`${outDir}/${slide.name}.webp`);
  await sized
    .clone()
    .jpeg({ quality: 80, mozjpeg: true })
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
