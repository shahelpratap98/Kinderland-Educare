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

/**
 * Find the gap between the violet "Educare" and the near-black tagline, and cut
 * there.
 *
 * This was a fixed 0.88 of the height, which was eyeballed and wrong — it landed
 * 14px inside "Educare" and sliced the letters in half. Measuring means the cut
 * survives the artwork being re-exported at another size or with different
 * spacing, and it fails loudly rather than quietly cropping the wordmark.
 */
function findTaglineCut() {
  const at = (x, y) => {
    const i = (y * info.width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  let lastWordmark = -1;
  let firstTagline = -1;

  for (let y = 0; y < info.height; y++) {
    let violet = 0;
    let dark = 0;
    for (let x = 0; x < info.width; x++) {
      const [r, g, b, a] = at(x, y);
      if (a === 0) continue;
      if (b > r + 30 && b > g + 40 && b > 60) violet++;
      else if (r < 110 && g < 110 && b < 110 && Math.abs(r - b) < 40) dark++;
    }
    if (violet > 3) {
      lastWordmark = y;
      firstTagline = -1; // violet after a dark run means that run was not the tagline
    } else if (dark > 10 && firstTagline === -1 && lastWordmark !== -1) {
      firstTagline = y;
    }
  }

  if (lastWordmark === -1 || firstTagline === -1 || firstTagline <= lastWordmark) {
    throw new Error(
      "Could not locate the gap between the wordmark and the tagline. " +
        "Check the artwork before trusting the header lockup.",
    );
  }
  return Math.round(lastWordmark + (firstTagline - lastWordmark) / 2);
}

const cut = findTaglineCut();
console.log(
  `tagline cut at y=${cut} of ${info.height} (${((100 * cut) / info.height).toFixed(1)}%)`,
);

const markBuf = await base
  .clone()
  .extract({ left: 0, top: 0, width: info.width, height: cut })
  .trim({ threshold: 10 })
  .png()
  .toBuffer();
await write(markBuf, "logo-mark", 520);
