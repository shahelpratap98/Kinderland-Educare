"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Served from /public rather than hotlinked.
 *
 * The original clip was loaded straight off a Higgsfield CDN path belonging to
 * a different account — nothing we control, and the hero would have gone blank
 * the day that file was removed.
 *
 * The centre itself, on Kohinoor Ave: the real building, the real mural, the
 * real street. Two AI heroes preceded it — an illustrated valley and an
 * illustrated playground — and a photoreal AI playground was generated and
 * rejected. A photograph of the actual centre asks no one to believe that
 * invented children are enrolled here, which neither AI option could claim.
 *
 * Animated from a still: the camera is locked and only the sky and the tree
 * canopy move. That was not a stylistic choice. Given any camera travel the
 * model reframes the shot and invents content to fill what it reveals, which
 * is how an earlier ten-second attempt ended up teleporting children around a
 * playground. Passing the same frame as both start and end pins it.
 *
 * Delivered at exactly 1280x720, so nothing is scaled or cropped here — only
 * re-encoded, audio-free, faststart.
 *
 * Quality measured against a lossless reference: crf 20/22/24/26 scored SSIM
 * 0.9933/0.9912/0.9884/0.9848 at 1126/751/480/308KB. 22 is the pick, and it is
 * both smaller and sharper than either hero before it — a locked frame where
 * only leaves and cloud move costs a fraction of the bits that a playground of
 * running children did. For comparison the playground clip needed 1018KB to
 * reach 0.978; this reaches 0.991 in 751KB.
 *
 * The filename carries the resolution so a cached copy of an older file cannot
 * be served in its place.
 */
/*
  Two encodes of one clip, not two clips.

  The source was a 896x512 generation, upscaled to 1920x1080 with Topaz. Encoding
  harder past this point buys almost nothing: measured against the upscale, crf
  16/18/20/22/24/26 scored SSIM 0.9927/0.9913/0.9895/0.9874/0.9847/0.9814 at
  14.7/11.3/8.8/6.8/5.3/4.1MB. Going from crf 22 to crf 16 costs 8MB for 0.005
  SSIM. 20 sits just before that wall.

  Worth being clear about what the number means: it is fidelity to the upscale,
  which is itself invented detail over a 512p original. The perceptual ceiling
  was fixed when the clip was generated, not by this encode, so more bitrate
  cannot reach past it.

  The phone gets its own 720p encode rather than a lower-quality one. The hero
  box is about 375 CSS pixels wide there, so 1080p is roughly five times the
  pixels it can show — 8.8MB of them, on the connection least able to afford it.
  3.1MB for a frame that still exceeds the display is the honest trade.
*/
const VIDEO_SRC_WIDE = "/video/hero-play-1080.mp4";
const VIDEO_SRC_NARROW = "/video/hero-play-720.mp4";
/* A frame from the clip, shown wherever the video will not or should not play. */
const STILL_SRC = "/video/hero-play-still";
/* Matches the sm breakpoint the scrim already switches on. */
const NARROW = "(max-width: 639px)";

const VARIANTS = {
  /*
    The clip is 16:9 but this container is far wider than it is tall, so
    object-cover was scaling to width and throwing away the top and bottom of
    the frame — the sky and the flowered foreground, i.e. most of what makes the
    shot. Starting it higher makes the container taller, its aspect closer to
    the clip's own, and correspondingly less is cropped away.

    The scrim thins with it. It used to hold 0.94 white across the whole sky
    band, which bleached it; it now clears through that zone and holds white
    only where the copy actually sits. See the contrast note in hero.tsx — the
    line over the video is ink, not muted, precisely so it survives a thinner
    scrim.
  */
  tall: {
    top: "120px",
    /*
      Biased downward, not up. The old valley clip was sky over an empty
      hillside, so 18% — pulling the kept band toward the top of the frame — was
      right. This clip carries the playground and the children along its lower
      edge, and the same setting cropped them off. 62% keeps the sky the
      headline sits over while holding the children inside the frame.
    */
    objectPosition: "50% 62%",
    mask: "linear-gradient(to bottom, transparent 0, #000 90px)",
    /*
      Two scrims, because the copy block is a very different height on a phone.

      At 1440 the subhead runs to four lines and has cleared the scrim before it
      thins. At 375 it runs to eight, and the last of them lands on the dark tree
      canopy behind the centre. Measured by compositing the real gradient over
      the real frame: lines 6-8 came in at 4.47, 4.42 and 2.76 against the 4.5
      that 16px text needs.

      This never showed on the two illustrated heroes because both had bright sky
      all the way down the frame. A photograph of an actual street does not.

      `scrim` keeps the desktop curve exactly as it was — extending the white
      further down there would bleach the building, which is the subject. It is
      only the narrow viewport that needs the longer hold.
    */
    scrim:
      "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.34) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 88%, #fff 100%)",
    scrimNarrow:
      "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.97) 26%, rgba(255,255,255,0.93) 40%, rgba(255,255,255,0.88) 52%, rgba(255,255,255,0.70) 62%, rgba(255,255,255,0.34) 72%, rgba(255,255,255,0) 82%, rgba(255,255,255,0) 92%, #fff 100%)",
  },
  compact: {
    top: "0",
    objectPosition: "50% 50%",
    mask: undefined,
    /*
      Stays dense to ~70%, because the headline runs to about 65% of the width at
      desktop. An earlier version thinned to 0.38 by that point and measured
      2.23:1 against a bright frame — a fail even at 60px. These stops hold it
      above 5:1 across the copy while still clearing on the right, where nothing
      is written, so the picture is not lost.
    */
    scrim:
      "linear-gradient(100deg, rgba(61,27,80,0.90) 0%, rgba(61,27,80,0.82) 45%, rgba(61,27,80,0.66) 70%, rgba(61,27,80,0.28) 100%)",
    /* Runs across rather than down, so viewport height does not change what sits
       under the copy. No narrow variant needed. */
    scrimNarrow: undefined,
  },
} as const;

export function HeroVideo({
  variant = "tall",
}: {
  variant?: keyof typeof VARIANTS;
}) {
  const config = VARIANTS[variant];
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    /*
      The source is chosen here rather than in the markup.

      `<source media="...">` is the obvious answer and does not work: Chrome
      dropped support for media on a video's source elements, so it would quietly
      serve whichever came first. Picking it on mount means exactly one file is
      ever fetched — setting src in the markup and correcting it afterwards would
      start the wrong download first.
    */
    if (!video.src) {
      video.src = window.matchMedia(NARROW).matches
        ? VIDEO_SRC_NARROW
        : VIDEO_SRC_WIDE;
    }

    /*
      Visibility is measured when asked for, not cached from the observer.

      A cached flag stalled this twice: the observer delivers nothing at all while
      a page is hidden, so opening the site in a background tab and then switching
      to it left the flag false, and the visibilitychange that followed read the
      stale value and paused instead of playing.

      The gate itself matters because this component renders on every route, and
      without it the clip kept decoding while the hero was nowhere near the screen
      — measured still playing 3384px down the page.
    */
    const onScreen = () => {
      const r = root.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    };

    const sync = () => {
      if (onScreen() && !document.hidden) {
        void video.play().catch(() => {
          /* Autoplay refused — Low Power Mode, data saver. The poster stays up,
             which is why it is a real frame of the clip rather than a colour. */
        });
      } else {
        video.pause();
      }
    };

    /* The observer is only a trigger to re-check, never the source of truth, so
       a late or absent callback cannot leave the hero frozen. */
    const io = new IntersectionObserver(() => sync(), { threshold: 0 });
    io.observe(root);
    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    /* Straight away rather than waiting on the observer's first callback: the
       common case is a hero already on screen when it mounts. */
    sync();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
    };
  }, [reduce]);

  /*
    Shared by the clip and the still, so the picture does not shift between them.

    The height is derived from the offset rather than set to 100%: a replaced
    element with h-full and a top offset overflows its container by exactly that
    offset, and overflow-hidden throws the excess away.
  */
  const frame = {
    inset: "auto 0 0 0",
    top: config.top,
    height: `calc(100% - ${config.top})`,
    maskImage: config.mask,
    WebkitMaskImage: config.mask,
    objectPosition: config.objectPosition,
  } as const;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {reduce ? (
        /* Ambient motion is precisely what this preference exists to suppress,
           so the clip is neither loaded nor played — but a picture still shows.
           Rendering nothing here was a real bug rather than a nicety: Windows'
           "Animation effects" toggle sets this preference, so a PC with it
           switched off got a blank gradient where the hero should be while the
           same page on a phone looked fine. */
        <picture>
          <source srcSet={`${STILL_SRC}.webp`} type="image/webp" />
          <img
            src={`${STILL_SRC}.jpg`}
            alt=""
            className="absolute w-full object-cover"
            style={frame}
          />
        </picture>
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          /* Native loop, not a hand-rolled restart. The clip cuts between four
             shots anyway, so the wrap reads as one more cut rather than a seam,
             and there is nothing for a crossfade to soften. */
          loop
          /* No src here on purpose — see the effect. */
          /* metadata, not auto: this is decorative, and fetching the whole clip
             eagerly would compete with the fonts and the copy. */
          preload="metadata"
          /* Paints immediately, and stands in if the clip is slow or refused. */
          poster={`${STILL_SRC}.jpg`}
          className="absolute w-full object-cover"
          style={frame}
        />
      )}

      {/*
        Scrim. Copy over a moving frame is a contrast gamble, so neither variant
        leaves text sitting on bare picture: `tall` holds white through its text
        zone before clearing, and `compact` darkens the left where its copy sits.
      */}
      <div
        className={cn("absolute inset-0", config.scrimNarrow && "hidden sm:block")}
        style={{ backgroundImage: config.scrim }}
      />
      {config.scrimNarrow && (
        <div
          className="absolute inset-0 sm:hidden"
          style={{ backgroundImage: config.scrimNarrow }}
        />
      )}
    </div>
  );
}
