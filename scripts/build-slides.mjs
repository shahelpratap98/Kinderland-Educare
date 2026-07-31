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
import { existsSync, mkdirSync, statSync } from "node:fs";

const SOURCE = "C:/Users/Shahel Pratap/Documents/kinder educare/kids/";
const OUT = "public/slides";
const ASPECT = 3 / 2;
const WIDTH = 1800;

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
