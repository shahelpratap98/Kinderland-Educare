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
 * photographs of the real centre, and then those photographs behind this clip —
 * and both are gone at the centre's request. The photographs are still in
 * /public/video (hero-r1..r4) and nothing references them.
 *
 * The clip is generated. The centre asked for the original valley hero back with
 * two changes: the hut gone, and children playing on the grass. Both were done
 * by generating a new still and animating it rather than by editing the old clip,
 * so everything in frame is invented — the landscape, the five children, their
 * clothes. Nobody enrolled here appears in it, and with the photographs gone the
 * hero no longer shows the actual centre at all.
 *
 * The camera is locked and only the children, the grass and the cloud move. That
 * is not a stylistic choice. Given any camera travel the model reframes the shot
 * and invents content to fill what it reveals, which is how an earlier ten-second
 * attempt ended up teleporting children around a playground; passing the same
 * frame as both start and end pins it. Verified rather than assumed: all five
 * children are present and consistent at t=0 and t=9.9, the hut is absent
 * throughout, and mean frame drift between t=0 and t=6.6 is 1.52/255.
 *
 * That matched start and end frame is also what makes a plain `loop` viable here.
 * A locked continuous shot normally shows its wrap as a jump, but measured at
 * 480x270 the last frame differs from the first by a mean of 1.70/255, against
 * 2.81 for five seconds of the clip's own motion — a softer step than the clip
 * itself takes, so the seam does not need a crossfade.
 *
 * Generated at 2560x1440, delivered at 1920x1080. Encoding harder buys little:
 * measured against the source, crf 22/24/26 scored SSIM 0.9907/0.9886/0.9861 at
 * 2980/2177/1584KB. 24 is the pick.
 */
const VIDEO_SRC_WIDE = "/video/hero-valley-1080.mp4";
/* The phone gets its own encode rather than a smaller box fetching the desktop
   file: the hero is roughly 375 CSS pixels wide there, so 1080p is about five
   times the pixels it can show, on the connection least able to afford them. */
const VIDEO_SRC_NARROW = "/video/hero-valley-720.mp4";
/* The poster, and the frame shown under prefers-reduced-motion. */
const STILL_SRC = "/video/hero-valley-still";
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
