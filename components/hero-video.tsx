"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Served from /public rather than hotlinked. An earlier version loaded the clip
 * straight off a Higgsfield CDN path belonging to a different account — nothing
 * we control, and the hero would have gone blank the day that file was removed.
 *
 * The clip is generated. The centre asked for the original valley hero back with
 * two changes: the hut gone, and children playing on the grass. Both were done
 * by generating a new still and animating it rather than by editing the old clip,
 * so everything in frame is invented — the landscape, the five children, their
 * clothes. Nobody enrolled here appears in it.
 *
 * The camera is locked and only the children, the grass and the cloud move. That
 * is not a stylistic choice. Given any camera travel the model reframes the shot
 * and invents content to fill what it reveals, which is how an earlier ten-second
 * attempt ended up teleporting children around a playground; passing the same
 * frame as both start and end pins it. Verified rather than assumed: all five
 * children are present and consistent at t=0 and t=9.9, the hut is absent
 * throughout, and mean frame drift between t=0 and t=6.6 is 1.52/255.
 *
 * Generated at 2560x1440 and delivered at 1920x1080, matching the photographs
 * exactly so object-cover behaves identically on every slide. Encoding harder
 * buys little: measured against the source, crf 22/24/26 scored SSIM
 * 0.9907/0.9886/0.9861 at 2980/2177/1584KB. 24 is the pick.
 *
 * The photographs are of the actual centre, from a 172-frame professional shoot
 * at 5760x3840. Which four was decided by the crop, not by taste: the frame keeps
 * roughly the full width on a desktop but only the middle ~30% on a phone, so
 * each candidate was rendered at both. A covered-walkway shot collapsed to blank
 * wall and concrete; the languages wall lost its flags and became flat teal.
 * These four still read at 30%.
 *
 * The honest gap, and the reason generated imagery keeps being reached for: not
 * one of those 172 frames has a person in it.
 */
type HeroSlide = { kind: "video" } | { kind: "image"; src: string };

/* The clip leads — it is what the centre asked for as the hero — and the real
   building, rooms and whare follow it. */
const VIDEO_SRC_WIDE = "/video/hero-valley-1080.mp4";
/* The phone gets its own encode rather than a smaller box fetching the desktop
   file: the hero is roughly 375 CSS pixels wide there, so 1080p is about five
   times the pixels it can show, on the connection least able to afford them. */
const VIDEO_SRC_NARROW = "/video/hero-valley-720.mp4";
/* Matches the sm breakpoint the scrim already switches on. */
const NARROW = "(max-width: 639px)";

const SLIDES: readonly HeroSlide[] = [
  { kind: "video" },
  { kind: "image", src: "/video/hero-r1-playground" },
  { kind: "image", src: "/video/hero-r2-building" },
  { kind: "image", src: "/video/hero-r3-inside" },
  /* Our Whare. A tight detail rather than a scene, which normally fails the
     phone crop -- but the sign sits dead centre, so the middle 30% a phone keeps
     is the most legible band of any slide here. Measured 4.62:1 under the scrim. */
  { kind: "image", src: "/video/hero-r4-whare" },
];

/* The clip's poster, and the single frame shown under prefers-reduced-motion
   where the deck does not turn at all. A frame of the first slide rather than a
   photograph, so a reader who suppresses motion sees the same hero as everyone
   else, only still. */
const STILL_SRC = "/video/hero-valley-still";

/* A photograph has no natural length, so it is given one. The clip runs to its
   own ten seconds and advances on `ended`. */
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
      the image keeps changing.

      It used to hold above 0.9 through the copy, which worked but bleached the
      photographs almost white. The fix was the text rather than the gradient:
      the subhead was grey (#6f6f6f) and needed 0.88-0.93 white behind it to
      reach 4.5:1 over these four pictures. In ink (#3d0a58) it needs 0.00-0.25.
      Darkening the copy is what buys the picture back, so this now peaks at 0.62
      and clears by 70%.
    */
    scrim:
      "linear-gradient(to bottom, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.62) 18%, rgba(255,255,255,0.52) 34%, rgba(255,255,255,0.36) 46%, rgba(255,255,255,0.14) 58%, rgba(255,255,255,0) 70%, rgba(255,255,255,0) 90%, #fff 100%)",
    /* Same reasoning, held further still: the subhead runs to eight lines at
       375px and so occupies far more of the frame. */
    scrimNarrow:
      "linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.70) 22%, rgba(255,255,255,0.62) 42%, rgba(255,255,255,0.56) 56%, rgba(255,255,255,0.38) 68%, rgba(255,255,255,0.12) 80%, rgba(255,255,255,0) 90%, #fff 100%)",
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const active = SLIDES[index];

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    /*
      The clip's source is chosen here rather than in the markup. `<source
      media="...">` is the obvious answer and does not work: Chrome dropped
      support for media on a video's source elements, so it would quietly serve
      whichever came first. Choosing on mount means exactly one file is fetched —
      setting src in the markup and correcting it afterwards would start the
      wrong download first.
    */
    if (!video.src) {
      video.src = window.matchMedia(NARROW).matches
        ? VIDEO_SRC_NARROW
        : VIDEO_SRC_WIDE;
    }

    let stopped = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const advance = () => setIndex((i) => (i + 1) % SLIDES.length);

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

    const startSlide = () => {
      clearTimer();
      if (active.kind === "image") {
        timerRef.current = setTimeout(advance, PHOTO_HOLD);
        return;
      }
      /* Back to the top when the deck wraps round to it, so the clip is not
         picked up mid-shot from wherever it was last paused. */
      if (video.currentTime > 0.1) video.currentTime = 0;
      void video.play().catch(() => {
        /* Autoplay refused — Low Power Mode, a data saver. The poster still
           paints, so hold it like a photograph and keep the deck turning rather
           than stranding it on a frame whose `ended` will never fire. */
        timerRef.current = setTimeout(advance, PHOTO_HOLD);
      });
    };

    const stopSlide = () => {
      clearTimer();
      video.pause();
    };

    const sync = () => {
      if (stopped) return;
      if (onScreen() && !document.hidden) startSlide();
      else stopSlide();
    };

    /* The observer is only a trigger to re-check, never the source of truth, so
       a late or absent callback cannot strand the deck. */
    const io = new IntersectionObserver(() => sync(), { threshold: 0 });
    io.observe(root);
    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    /* Guarded rather than bare: `ended` should only turn the deck while the clip
       is the slide on screen, so stray playback cannot desynchronise it. */
    const onEnded = () => {
      if (active.kind === "video") advance();
    };
    video.addEventListener("ended", onEnded);

    /* Straight away rather than waiting on the observer's first callback. */
    sync();

    return () => {
      stopped = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("ended", onEnded);
      stopSlide();
    };
  }, [reduce, index, active.kind]);

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

  /* Never more than one slide ahead — four hero-sized photographs fetched
     eagerly is over a megabyte of decoration competing with the fonts and the
     copy on a phone. */
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
        SLIDES.map((slide, i) => (
          <div
            key={slide.kind === "video" ? "clip" : slide.src}
            className="absolute inset-0 transition-opacity ease-out-strong"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: `${CROSSFADE}ms`,
            }}
          >
            {slide.kind === "video" ? (
              <video
                ref={videoRef}
                muted
                playsInline
                /*
                  Deliberately no autoPlay, and no src in the markup. The
                  attribute is acted on by the browser rather than by this
                  component, so it would also start the clip on a route where the
                  hero is off screen, and — the moment the deck is reordered —
                  fire `ended` while a photograph was showing, advancing a slide
                  early. startSlide() plays it when its turn arrives.
                */
                /* metadata, not auto: decorative, and fetching two megabytes
                   eagerly would compete with the real content. */
                preload="metadata"
                /* Paints immediately, and stands in if the clip is slow or
                   refused — which is why it is a real frame, not a colour. */
                poster={`${STILL_SRC}.jpg`}
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
                    fetchPriority="low"
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
