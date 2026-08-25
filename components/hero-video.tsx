"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/*
 * Served from /public rather than hotlinked.
 *
 * The original clip was loaded straight off a Higgsfield CDN path belonging to
 * a different account — nothing we control, and the hero would have gone blank
 * the day that file was removed.
 *
 * Re-encoded for the web after the hero was reported laggy. It arrived as
 * 2560x1440 at 6.3Mbps with an AAC track, and was being decoded into a box
 * about 956px wide — three times the pixels needed, plus an audio stream on a
 * permanently muted video. Now 1280x720, no audio, faststart, 1.35MB against
 * 7.9MB.
 *
 * Quality was measured rather than eyeballed: against a lossless 720p
 * reference, crf 24/26/28 scored SSIM 0.984/0.980/0.975 at 1818/1345/1000KB.
 * 26 sits where the curve flattens, and a frame-by-frame comparison against the
 * original is indistinguishable — which is unsurprising for a soft illustrated
 * clip that sits behind a white scrim.
 *
 * The filename carries the resolution so a cached copy of the old 7.9MB file
 * cannot be served in its place.
 */
const VIDEO_SRC = "/video/hero-valley-720.mp4";
/* A frame from the clip, shown wherever the video will not or should not play. */
const STILL_SRC = "/video/hero-valley-still";

const FADE = 0.5; // seconds of fade at each end
const RESTART_DELAY = 100; // ms held at opacity 0 before looping

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
    top: "180px",
    /*
      object-cover crops to the middle of the clip by default. This container is
      wider than the 16:9 frame, so the band it keeps is horizontal — and centred
      it lands on the valley floor, cutting most of the sky. Biasing the position
      upward keeps the same amount of picture, just taken higher up the frame:
      more sky and cloud, less of the near foreground.
    */
    objectPosition: "50% 18%",
    mask: "linear-gradient(to bottom, transparent 0, #000 90px)",
    scrim:
      "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.34) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 88%, #fff 100%)",
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
  },
} as const;

export function HeroVideo({
  variant = "tall",
}: {
  variant?: keyof typeof VARIANTS;
}) {
  const config = VARIANTS[variant];
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const video = videoRef.current;
    if (!video) return;

    /*
      Two things this loop used to do that cost more than the fade is worth.

      It wrote video.style.opacity on every frame. Measured on the home page:
      239 of 240 consecutive frames wrote a value identical to the one already
      there. Opacity only moves during the first and last 0.5s of a 10s clip, so
      roughly 95% of those writes were dirtying style and compositing for
      nothing. It now writes only on a change.

      It also ran, and kept the video decoding, while the hero was nowhere near
      the screen — measured still playing 3384px down the page — and this
      component is on every route, so a 2560x1440 decode ran for as long as
      somebody stayed on the site. An IntersectionObserver now stops both the
      loop and the video when the hero leaves the viewport and restarts them
      when it returns, and a hidden tab does the same.
    */
    let lastOpacity = "";
    let running = false;

    const tick = () => {
      const { currentTime, duration } = video;

      /* duration is NaN until metadata arrives; hold at 0 rather than flashing. */
      let next = "0";
      if (Number.isFinite(duration) && duration > 0) {
        let opacity = 1;
        if (currentTime < FADE) {
          opacity = currentTime / FADE;
        } else if (currentTime > duration - FADE) {
          opacity = Math.max(0, (duration - currentTime) / FADE);
        }
        next = String(opacity);
      }
      if (next !== lastOpacity) {
        video.style.opacity = next;
        lastOpacity = next;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      void video.play().catch(() => {
        /* Autoplay refused — leave the gradient ground visible. */
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      video.pause();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onEnded = () => {
      video.style.opacity = "0";
      lastOpacity = "0";
      restartRef.current = setTimeout(() => {
        video.currentTime = 0;
        if (running) {
          void video.play().catch(() => {});
        }
      }, RESTART_DELAY);
    };

    let onScreen = false;
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(video);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);
    video.addEventListener("ended", onEnded);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("ended", onEnded);
      stop();
      if (restartRef.current !== null) clearTimeout(restartRef.current);
    };
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {reduce ? (
        /* Same framing as the video: the mask, the object-position and the
           300px/0 offset all have to match, or the still sits somewhere the
           clip never does. */
        <picture>
          <source srcSet={`${STILL_SRC}.webp`} type="image/webp" />
          <img
            src={`${STILL_SRC}.jpg`}
            alt=""
            className="absolute h-full w-full object-cover"
            style={{
              inset: "auto 0 0 0",
              top: config.top,
              maskImage: config.mask,
              WebkitMaskImage: config.mask,
              objectPosition: config.objectPosition,
            }}
          />
        </picture>
      ) : (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          autoPlay
          /*
            metadata, not auto: the clip is ~30MB and this is decorative. Fetching
            the whole thing eagerly would compete with the fonts and the real
            content for bandwidth on a phone.
          */
          preload="metadata"
          /* Paints immediately, and stands in if the clip is slow or refused. */
          poster={`${STILL_SRC}.jpg`}
          className="absolute h-full w-full object-cover opacity-0"
          style={{
            /* inset first, then top — inset writes top:auto, so the order matters. */
            inset: "auto 0 0 0",
            top: config.top,
            /*
              In the tall placement the clip begins abruptly at 300px, which reads
              as a hard horizontal seam across the page, so its own top edge is
              feathered — independently of the scrim, which is anchored to the
              container rather than the video. The compact placement starts at 0
              beneath the header and needs no mask.
            */
            maskImage: config.mask,
            WebkitMaskImage: config.mask,
            objectPosition: config.objectPosition,
          }}
        />
      )}

      {/*
        Scrim. Text over an unknown, moving frame is a contrast gamble that changes
        shot to shot, so neither variant leaves copy sitting on bare video: `tall`
        holds white through its text zone before clearing for the middle of the
        clip, and `compact` darkens the left where its copy sits.
      */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: config.scrim }}
      />
    </div>
  );
}
