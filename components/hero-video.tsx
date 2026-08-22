"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/*
 * Served from /public rather than hotlinked.
 *
 * The previous clip was loaded straight off a Higgsfield CDN path belonging to
 * a different account — nothing we control, and the hero would have gone blank
 * the day that file was removed. This one is generated, downloaded and
 * committed, so the page owns its own background.
 *
 * It is also 7.9MB against the old 30.4MB, at a higher resolution (2560x1440
 * vs 1928x1072), so the swap is cheaper as well as safer. The fade loop below
 * reads `duration` off the element, so the shorter 10s clip needs no change.
 */
const VIDEO_SRC = "/video/hero-valley.mp4";

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
 * Under `prefers-reduced-motion` the video is not loaded or played at all — a
 * 30MB looping clip is precisely the kind of ambient motion that preference
 * exists to suppress. The gradient ground shows through instead.
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

    const tick = () => {
      const { currentTime, duration } = video;

      /* duration is NaN until metadata arrives; hold at 0 rather than flashing. */
      if (Number.isFinite(duration) && duration > 0) {
        let opacity = 1;
        if (currentTime < FADE) {
          opacity = currentTime / FADE;
        } else if (currentTime > duration - FADE) {
          opacity = Math.max(0, (duration - currentTime) / FADE);
        }
        video.style.opacity = String(opacity);
      } else {
        video.style.opacity = "0";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      video.style.opacity = "0";
      restartRef.current = setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {
          /* Autoplay refused — leave the gradient ground visible. */
        });
      }, RESTART_DELAY);
    };

    video.addEventListener("ended", onEnded);
    rafRef.current = requestAnimationFrame(tick);
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", onEnded);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (restartRef.current !== null) clearTimeout(restartRef.current);
    };
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {!reduce && (
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
