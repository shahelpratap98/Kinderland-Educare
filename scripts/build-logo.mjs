/**
 * Generates the logo lockups in /public/brand from the centre's master artwork.
 *
 *   node scripts/build-logo.mjs
 *
 * Two outputs:
 *   logo       full mark including the tagline — footer, and anywhere with room
 *   logo-mark  tagline cropped — header, where the tagline would be illegible
 *
 * On the white keying: the source is a JPEG on paper white, so transparency has
 * to be derived. The threshold is deliberately high (248). The sun carries a soft
 * white-to-yellow halo, and a looser threshold eats into it and leaves a hard
 * ring where the glow used to fade out.
 *
 * The consequence is that the glow keeps near-white pixels which do NOT become
 * transparent. Over white that is invisible; over a dark ground it reads as a
 * pale blob with a ragged edge. These lockups are light-background only — see the
 * warning in components/ui/logo.tsx.
 *
 * A vector original (AI/EPS/SVG) would solve both problems: clean transparency
 * and no resolution ceiling. Worth asking whoever made the logo.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, statSync } from "node:fs";

const SRC = "C:/Users/Shahel Pratap/Documents/kinder educare/Logo Final Colour (Big).jpg";
const OUT = "public/brand";
const WHITE = 248;
/** Fraction of the trimmed height to keep for the header lockup. */
const MARK_HEIGHT = 0.88;

if (!existsSync(SRC)) {
  console.error(`Source missing: ${SRC}`);
  process.exit(1);
}
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
const { data, info } = await sharp(trimmed)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  if (data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE) {
    data[i + 3] = 0;
  }
}

const base = sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
});

const write = async (buf, name, width) => {
  await sharp(buf).resize({ width }).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
  await sharp(buf)
    .resize({ width })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/${name}.webp`);
  const m = await sharp(`${OUT}/${name}.png`).metadata();
  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  console.log(
    `${name.padEnd(10)} ${m.width}x${m.height}  ` +
      `${kb(`${OUT}/${name}.png`)}KB png  ${kb(`${OUT}/${name}.webp`)}KB webp`,
  );
};

await write(await base.clone().png().toBuffer(), "logo", 640);

const markBuf = await base
  .clone()
  .extract({
    left: 0,
    top: 0,
    width: info.width,
    height: Math.round(info.height * MARK_HEIGHT),
  })
  .trim({ threshold: 10 })
  .png()
  .toBuffer();
await write(markBuf, "logo-mark", 520);
