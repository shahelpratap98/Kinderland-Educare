"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Served from /public rather than hotlinked. An earlier version loaded the clip
 * straight off a Higgsfield CDN path belonging to a different account — nothing
 * we control, and the hero would have gone blank the day that file was removed.
 *
 * One clip, looping, and nothing else. The hero has been a deck twice — four
 * photographs of the real centre, and then those photographs behind a clip —
 * and both are gone at the centre's request. The photographs are still in
 * /public/video (hero-r1..r4), as are the two clips this one replaces
 * (hero-valley-*, hero-meadow-*), and nothing references any of them.
 *
 * Everything in frame is generated: the valley, the five children, the skipping
 * rope, the seesaw, the swing and the kite. Nobody enrolled here appears in it,
 * and the hero does not show the actual centre at all. That is a deliberate
 * choice by the centre, but it is worth not forgetting.
 *
 * Two rerolls got it here, and both were for reasons worth recording.
 *
 * First the scene: the centre asked for the original tree cluster on the left to
 * be replaced by open hills and mountains, and for the children to be properly
 * playing rather than running about.
 *
 * Then the faces. The first pass produced distorted, uncanny faces — worst on
 * the girl on the swing — so the still was regenerated with the prompt leaning
 * hard on well-formed symmetrical features, and with an instruction to render a
 * face simpler rather than more detailed when in doubt. Four candidates were
 * compared by cropping each child's face and upscaling it, rather than judging
 * them at thumbnail size, which is how the bad faces got through the first time.
 *
 * The camera is locked because the model reframes and invents content to fill
 * whatever a moving camera reveals; passing the same frame as both start and end
 * pins it. The previous attempt also has to be remembered in the prompt: listing
 * each child's action as a bullet read as a shot list, and the model cut to a
 * close-up at 2.458s and stayed there, leaving only 2.46 usable seconds. Writing
 * the motion as one continuous tableau sentence, under an explicit single-shot
 * instruction, fixed it.
 *
 * Verified rather than assumed, scanning every frame at 8fps: no shot change
 * anywhere, with the largest frame-to-frame jump 4.01/255 against the 74.29 the
 * bad cut measured. The camera holds — the mountain band drifts 2.57/255 between
 * t=0 and t=5, so nothing reframed — while the clip as a whole moves 9.38/255
 * over the same span, which is the children, grass and cloud. The wrap is the
 * best of any hero here: the last frame differs from the first by 2.13/255,
 * roughly a fifth of the clip's own motion, so the loop point passes unnoticed.
 *
 * Generated at 2560x1440, delivered at 1920x1080. This clip is genuinely harder
 * to encode than its predecessors because far more of the frame actually moves:
 * measured against a crf 14 reference, crf 22/23/24/26 scored SSIM
 * 0.9878/0.9863/0.9846/0.9804 at 4649/4006/3441/2531KB. crf 24 is the knee —
 * dropping to 22 costs 1.2MB for 0.003 SSIM. At 3.4MB it is the heaviest hero
 * yet, which is the price of the motion; preload is metadata and the clip is
 * only fetched once the hero is actually on screen.
 */
const VIDEO_SRC_WIDE = "/video/hero-play-1080.mp4";
/* The phone gets its own encode rather than a smaller box fetching the desktop
   file: the hero is roughly 375 CSS pixels wide there, so 1080p is about five
   times the pixels it can show, on the connection least able to afford them. */
const VIDEO_SRC_NARROW = "/video/hero-play-720.mp4";
/* The poster, and the frame shown under prefers-reduced-motion. */
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
    /*
      "0px", not "0". The shared frame below builds height from this with
      calc(100% - ${top}), and calc() cannot subtract a unitless number from a
      percentage — calc(100% - 0) is invalid, so the browser dropped the whole
      height declaration and the clip fell back to its intrinsic 16:9 height.
      That rendered it 802px tall inside a 456px box anchored at the top, and
      overflow-hidden discarded the bottom 346px — precisely the band the
      children are in, which is why the inner pages showed only sky and peaks.
    */
    top: "0px",
    /*
      62%, matching the tall variant rather than centring the frame. Dead centre
      left the children at 57-78% down this shallow band -- in frame, but sitting
      on its bottom edge. Biasing the crop down the source lifts them to 48-69%,
      which is where the eye lands, at the cost of the mountain peaks.
    */
    objectPosition: "50% 62%",
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
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    /*
      The source is chosen here rather than in the markup. `<source media="...">`
      is the obvious answer and does not work: Chrome dropped support for media on
      a video's source elements, so it would quietly serve whichever came first.
      Choosing on mount means exactly one file is fetched — setting src in the
      markup and correcting it afterwards would start the wrong download first.
    */
    if (!video.src) {
      video.src = window.matchMedia(NARROW).matches
        ? VIDEO_SRC_NARROW
        : VIDEO_SRC_WIDE;
    }

    /*
      Visibility is measured when asked for, not cached from the observer.

      A cached flag stalled this twice. The observer delivers nothing at all while
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
          /* Autoplay refused — Low Power Mode, a data saver. The poster stays up,
             which is why it is a real frame of the clip rather than a colour. */
        });
      } else {
        video.pause();
      }
    };

    /* The observer is only a trigger to re-check, never the source of truth, so a
       late or absent callback cannot leave the hero frozen. */
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
    /* Guarded rather than trusting the token to carry a unit: calc() rejects a
       unitless subtrahend outright, and a rejected height silently falls back to
       the intrinsic aspect, which is a crop bug rather than a visible error. */
    height: config.top === "0px" ? "100%" : `calc(100% - ${config.top})`,
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
        /* Ambient motion is precisely what this preference exists to suppress, so
           the clip is neither loaded nor played — but a picture still shows.
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
          /* Native loop rather than a hand-rolled restart: the clip was generated
             with a matched start and end frame, and the wrap measures softer than
             the clip's own motion, so there is nothing for a crossfade to hide. */
          loop
          /* No src here on purpose — see the effect. */
          /* metadata, not auto: decorative, and fetching two megabytes eagerly
             would compete with the fonts and the copy. */
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
