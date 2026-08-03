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

for (const slide of slides) {
  const src = SOURCE + slide.file;
  if (!existsSync(src)) {
    console.warn(`skip ${slide.name} — source missing`);
    continue;
  }

  const meta = await sharp(src).rotate().metadata();
  let pipe = sharp(src).rotate();

  let upscale = 1;
  if (slide.band) {
    const keepW = Math.round(meta.width * (slide.band.width ?? 1));
    const bandH = Math.round(keepW / ASPECT);
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
    upscale = WIDTH / keepW;
  }

  const sized = pipe.resize({
    width: WIDTH,
    height: Math.round(WIDTH / ASPECT),
    fit: "cover",
    position: "centre",
  });

  await sized.clone().webp({ quality: 78 }).toFile(`${OUT}/${slide.name}.webp`);
  await sized
    .clone()
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${OUT}/${slide.name}.jpg`);

  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  const warn = upscale > 1.8 ? `  ⚠ upscaled ${upscale.toFixed(2)}x` : "";
  console.log(
    `${slide.name.padEnd(22)} ${WIDTH}x${Math.round(WIDTH / ASPECT)}  ` +
      `${kb(`${OUT}/${slide.name}.webp`)}KB webp  ${kb(`${OUT}/${slide.name}.jpg`)}KB jpg` +
      warn,
  );
}

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
