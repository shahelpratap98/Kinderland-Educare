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
const VIDEO_SRC = "/video/hero-centre-720.mp4";
/* A frame from the clip, shown wherever the video will not or should not play. */
const STILL_SRC = "/video/hero-centre-still";

/*
 * The hero deck.
 *
 * A slide is either the clip or a photograph. They share one frame, one mask,
 * one object-position and one scrim, so the only thing that differs is what
 * paints inside it — which is why a photograph can sit in a slot built for a
 * video without the framing shifting as the deck turns.
 *
 * The children lead. The two playground frames are generated, and are the pair
 * the centre chose from six; the clip of the real building closes the deck.
 */
type HeroSlide =
  | { kind: "video"; src: string; still: string }
  | { kind: "image"; src: string };

const SLIDES: readonly HeroSlide[] = [
  { kind: "image", src: "/video/hero-play-a" },
  { kind: "image", src: "/video/hero-play-b" },
  { kind: "video", src: VIDEO_SRC, still: STILL_SRC },
];

/* A photograph has no natural length, so it is given one. Six seconds is long
   enough to read the picture and short enough that the deck never feels stalled;
   the clip runs to its own ten instead. */
const PHOTO_HOLD = 6000;
/* Long enough to read as a dissolve rather than a cut, under copy that stays put
   the whole way through. */
const CROSSFADE = 900;

/**
 * Cinematic background video with a manual fade-in / fade-out loop.
 *
 * Why hand-rolled rather than the native `loop` attribute: `loop` restarts hard
 * on the last frame, and the cut is very visible on a slow drifting shot. This
 * drives opacity from a requestAnimationFrame loop instead — up over the first
 * 0.5s, down over the final 0.5s — then holds black for 100ms before seeking back
 * to 0. The seam lands while the element is fully transparent, so there is nothing
 * to see.
 *
 * Two things the spec omits that the video will not play without:
 * - `muted` and `playsInline`. Every mobile browser blocks autoplay with sound,
 *   and iOS Safari takes an unmuted video fullscreen instead of inlining it.
 * - A `play()` rejection path. Autoplay can still be refused (Low Power Mode,
 *   data saver), so the promise is caught rather than left to throw unhandled.
 *
 * Under `prefers-reduced-motion` the clip is not loaded or played — ambient
 * motion is exactly what that preference exists to suppress — but a still frame
 * is shown in its place.
 *
 * It used to render nothing at all, and that turned out to be a real bug rather
 * than a nicety: Windows' "Animation effects" toggle sets this preference, so a
 * PC with it switched off got a blank gradient where the hero should be, while
 * the same page on a phone looked fine. Suppressing the motion is right;
 * suppressing the picture was not.
 */
/**
 * Two placements, because the same clip has to work behind a full-height hero and
 * behind a short page header.
 *
 * `tall` is the home page: the video starts 300px down so the cumulus band sits
 * low, its top edge is masked over 140px to hide the seam, and the scrim holds
 * near-opaque white through the copy before clearing for the middle of the frame.
 *
 * `compact` is a page header a third of the height. There is no 300px offset —
 * that would push the picture out of view entirely — no top mask, since the
 * header sits above it, and the scrim runs across rather than down, darkening
 * the left where the copy sits so white type stays legible over a moving frame.
 */
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const active = SLIDES[index];

  /*
    Turning the deck, and gating it on visibility.

    The hand-rolled requestAnimationFrame fade this replaces wrote
    video.style.opacity on every frame — measured, 239 of 240 consecutive frames
    wrote a value identical to the one already there. A CSS transition between
    slides does the same job on the compositor and costs nothing per frame, so
    the loop is gone rather than reworked.

    The visibility gate stays, and matters more now than it did. This component
    renders on every route, and without it the clip kept decoding while the hero
    was nowhere near the screen — measured still playing 3384px down the page.
  */
  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;

    /*
      Visibility is measured when it is asked for, not cached from the observer.

      It used to be a `let onScreen = false` that only the IntersectionObserver
      callback ever wrote, and that stalled the deck in two ordinary situations.
      The observer delivers nothing at all while a page is hidden, so opening the
      site in a background tab and then switching to it left the flag false: the
      visibilitychange that followed read the stale value and stopped the deck
      instead of starting it. And because the flag is re-declared on every effect
      run, each slide change reset it to false and waited on a fresh observer
      callback to undo that.

      The clip hid both, because `autoPlay` starts it whatever this code does —
      so slide one always ran, and only the slides after it ever stuck.
    */
    const onScreen = () => {
      const r = root.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    };

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const advance = () => setIndex((i) => (i + 1) % SLIDES.length);

    const startSlide = () => {
      clearTimer();
      if (active.kind === "image") {
        timerRef.current = setTimeout(advance, PHOTO_HOLD);
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      /* Always from the top: a clip resumed part-way reads as a glitch when the
         slide before it has only just dissolved away. */
      if (video.currentTime > 0.1) video.currentTime = 0;
      void video.play().catch(() => {
        /* Autoplay refused — Low Power Mode, data saver. The poster still
           paints, so hold it like a photograph and keep the deck turning
           rather than stopping on a frame that will never advance. */
        timerRef.current = setTimeout(advance, PHOTO_HOLD);
      });
    };

    const stopSlide = () => {
      clearTimer();
      videoRef.current?.pause();
    };

    const sync = () => {
      if (onScreen() && !document.hidden) startSlide();
      else stopSlide();
    };

    /* The observer is now only a trigger to re-check, never the source of
       truth, so a missing or late callback cannot strand the deck. */
    const io = new IntersectionObserver(() => sync(), { threshold: 0 });
    io.observe(root);

    /* Start straight away rather than waiting on the observer's first callback:
       the common case is a hero that is on screen the moment it mounts. */
    sync();

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    /* Guarded rather than bare: `ended` should only turn the deck when the clip
       is the slide on screen. Without this, any stray playback advances it. */
    const onEnded = () => {
      if (active.kind === "video") advance();
    };
    const video = videoRef.current;
    video?.addEventListener("ended", onEnded);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video?.removeEventListener("ended", onEnded);
      stopSlide();
    };
  }, [reduce, index, active.kind]);

  /*
    Shared by every slide, so the picture never shifts as the deck turns.

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

  /* The first slide always, and never more than one ahead. Three hero-sized
     photographs fetched eagerly is roughly 600KB of decorative weight competing
     with the fonts and the copy on a phone. */
  const shouldLoad = (i: number) => i === 0 || i <= index + 1;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {reduce ? (
        /* Ambient motion is precisely what this preference exists to suppress,
           so the deck does not turn — but it still shows a picture. Rendering
           nothing here was a real bug rather than a nicety: Windows' "Animation
           effects" toggle sets this preference, so a PC with it switched off got
           a blank gradient where the hero should be while the same page on a
           phone looked fine. */
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
        SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity ease-out-strong"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: `${CROSSFADE}ms`,
            }}
          >
            {slide.kind === "video" ? (
              <video
                ref={videoRef}
                src={slide.src}
                muted
                playsInline
                /*
                  Deliberately no autoPlay. The clip is no longer the first slide,
                  and the attribute is not something this component controls: it
                  would start the clip invisibly at mount and fire `ended` about
                  ten seconds later, while a photograph was still on screen,
                  advancing the deck a slide early and desynchronising it from
                  then on. startSlide() plays the clip when its turn arrives.
                */
                /* metadata, not auto: this is decorative, and fetching the whole
                   clip eagerly would compete with the real content. */
                preload="metadata"
                /* Paints immediately, and stands in if the clip is refused. */
                poster={`${slide.still}.jpg`}
                className="absolute w-full object-cover"
                style={frame}
              />
            ) : (
              shouldLoad(i) && (
                <picture>
                  <source srcSet={`${slide.src}.webp`} type="image/webp" />
                  <img
                    src={`${slide.src}.jpg`}
                    alt=""
                    decoding="async"
                    className="absolute w-full object-cover"
                    style={frame}
                  />
                </picture>
              )
            )}
          </div>
        ))
      )}

      {/*
        Scrim. Copy over a frame that changes from slide to slide is a contrast
        gamble, so neither variant leaves text sitting on bare picture: `tall`
        holds white through its text zone before clearing, and `compact` darkens
        the left where its copy sits. It stacks above every slide, so one scrim
        covers the whole deck.
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
