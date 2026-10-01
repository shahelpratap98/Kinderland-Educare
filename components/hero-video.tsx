"use client";

import { useEffect, useRef, useState } from "react";
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
  Three photographs of the centre, from a 172-frame professional shoot at
  5760x3840. Emitted at 1920x1080 so every slide shares one frame and nothing
  shifts as the deck turns.

  Which three was decided by the crop. The hero keeps roughly the full width on a
  desktop but only the middle ~30% on a phone, so each candidate was rendered at
  both: a covered-walkway shot collapsed to blank wall and concrete, and the
  languages wall lost its flags and became flat teal. These three still read at
  30% — the climbing frame, the entrance, the table.

  There is no clip any more. The hero ran generated video through several
  iterations — an illustrated valley, an illustrated playground, then a
  photoreal playground — and all of it is gone. What remains is the centre's own
  photography.

  The honest consequence: none of these has a person in it. Not one frame of the
  172 does. That gap is the reason generated imagery kept being reached for, and
  it is now visible rather than papered over.
*/
const SLIDES = [
  "/video/hero-r1-playground",
  "/video/hero-r2-building",
  "/video/hero-r3-inside",
  /* Our Whare. A tight detail rather than a scene, which normally fails the
     phone crop -- but the sign sits dead centre, so the middle 30% a phone keeps
     is the most legible band of any slide here. Measured 4.62:1 under the scrim. */
  "/video/hero-r4-whare",
] as const;

/* Shown under prefers-reduced-motion, where the deck does not turn at all. */
const STILL_SRC = SLIDES[0];

/* A photograph has no natural length, so it is given one. */
const PHOTO_HOLD = 6000;
/* Long enough to read as a dissolve rather than a cut, under copy that stays put
   the whole way through. */
const CROSSFADE = 900;

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
    /*
      Holds dense through the whole copy block, then clears quickly.

      The earlier curve was tuned when the hero was one clip with a pale sky, and
      it thinned to 0.34 by 40% — fine over cloud, useless over a photograph. With
      real pictures behind the deck the subhead measured 1.5:1 against the 4.5 it
      needs, which is unreadable, because the scrim cannot be tuned per image when
      the image keeps changing. It now stays above 0.9 until the copy has ended
      and falls away over a short distance so the picture below is untouched.
    */
    scrim:
      "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.97) 22%, rgba(255,255,255,0.94) 34%, rgba(255,255,255,0.90) 44%, rgba(255,255,255,0.62) 54%, rgba(255,255,255,0.22) 64%, rgba(255,255,255,0) 74%, rgba(255,255,255,0) 90%, #fff 100%)",
    /* Same reasoning, held further still: the subhead runs to eight lines at
       375px and so occupies far more of the frame. */
    scrimNarrow:
      "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.98) 30%, rgba(255,255,255,0.96) 46%, rgba(255,255,255,0.93) 58%, rgba(255,255,255,0.78) 68%, rgba(255,255,255,0.34) 78%, rgba(255,255,255,0) 88%, #fff 100%)",
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
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;

    let stopped = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    /*
      Visibility is measured when asked for, not cached from the observer.

      A cached flag stalled this deck twice. The observer delivers nothing at all
      while a page is hidden, so opening the site in a background tab and then
      switching to it left the flag false, and the visibilitychange that followed
      read the stale value and stopped the deck instead of starting it.
    */
    const onScreen = () => {
      const r = root.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    };

    const sync = () => {
      if (stopped) return;
      clearTimer();
      if (onScreen() && !document.hidden) {
        timerRef.current = setTimeout(
          () => setIndex((i) => (i + 1) % SLIDES.length),
          PHOTO_HOLD,
        );
      }
    };

    /* The observer is only a trigger to re-check, never the source of truth, so
       a late or absent callback cannot strand the deck. */
    const io = new IntersectionObserver(() => sync(), { threshold: 0 });
    io.observe(root);
    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    /* Straight away rather than waiting on the observer's first callback. */
    sync();

    return () => {
      stopped = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimer();
    };
  }, [reduce, index]);

  /*
    Shared by every slide, so the picture does not shift as the deck turns. The
    height is derived from the offset rather than set to 100%: a replaced element
    with h-full and a top offset overflows its container by exactly that offset,
    and overflow-hidden throws the excess away.
  */
  const frame = {
    inset: "auto 0 0 0",
    top: config.top,
    height: `calc(100% - ${config.top})`,
    maskImage: config.mask,
    WebkitMaskImage: config.mask,
    objectPosition: config.objectPosition,
  } as const;

  /* The first slide always, and never more than one ahead — three hero-sized
     photographs fetched eagerly is roughly a megabyte of decoration competing
     with the fonts and the copy on a phone. */
  const shouldLoad = (i: number) => i <= index + 1;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {reduce ? (
        /* Ambient motion is precisely what this preference exists to suppress, so
           the deck does not turn — but a picture still shows. Rendering nothing
           here was a real bug rather than a nicety: Windows' "Animation effects"
           toggle sets this preference, so a PC with it switched off got a blank
           gradient where the hero should be while the same page on a phone looked
           fine. */
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
        SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity ease-out-strong"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: `${CROSSFADE}ms`,
            }}
          >
            {shouldLoad(i) && (
              <picture>
                <source srcSet={`${src}.webp`} type="image/webp" />
                <img
                  src={`${src}.jpg`}
                  alt=""
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                  className="absolute w-full object-cover"
                  style={frame}
                />
              </picture>
            )}
          </div>
        ))
      )}

      {/*
        Scrim. Copy over a frame that changes slide to slide is a contrast gamble,
        so neither variant leaves text sitting on bare picture: `tall` holds white
        through its text zone before clearing, and `compact` darkens the left
        where its copy sits. It stacks above every slide, so one scrim covers the
        whole deck.
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
