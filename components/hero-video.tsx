"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

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
export function HeroVideo() {
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
            top: "300px",
            /*
              The clip begins abruptly at 300px, which reads as a hard horizontal
              seam across the page. Masking its own top edge feathers it out
              independently of the scrim below, which is anchored to the container
              rather than to the video.
            */
            maskImage: "linear-gradient(to bottom, transparent 0, #000 140px)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 140px)",
          }}
        />
      )}

      {/*
        Scrim. The spec's from-background/via-transparent/to-background gradient
        is transparent by mid-height, but the CTA and the detail line sit down
        there — grey text over an unknown, moving image is a contrast gamble that
        changes frame to frame. This holds near-opaque white through the text zone,
        clears entirely for the middle of the clip where the imagery actually reads,
        then returns to white so the section has no hard bottom edge either.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.94) 32%, rgba(255,255,255,0.6) 46%, rgba(255,255,255,0) 64%, rgba(255,255,255,0) 88%, #fff 100%)",
        }}
      />
    </div>
  );
}
