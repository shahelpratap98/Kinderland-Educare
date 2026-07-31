"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { slides, SLIDESHOW_AUDIO_SRC } from "@/lib/content";
import { cn } from "@/lib/utils";

const INTERVAL = 5000;

/**
 * Home page slideshow.
 *
 * Advancing is a plain interval over an index rather than an animation timeline,
 * so the deck can never get stuck mid-transition: each slide is always either
 * fully present or fully absent, and the crossfade is CSS opacity on top of that.
 *
 * Accessibility shapes most of the decisions here:
 * - It auto-advances, which WCAG 2.2.2 only permits with a way to stop it, so
 *   there is an explicit pause button — not just pause-on-hover, which keyboard
 *   and touch users cannot reach.
 * - It also pauses on hover and on keyboard focus, and while the tab is hidden,
 *   so it isn't burning frames in a background tab.
 * - Under prefers-reduced-motion it does not auto-advance at all; the controls
 *   still work, and the crossfade is dropped.
 * - The live region announces slide changes only while paused. Announcing every
 *   5s during autoplay would talk over a screen reader continuously.
 *
 * Sound is off until asked for. Browsers block audio autoplay outright, and WCAG
 * 1.4.2 requires a stop control for anything past three seconds. See
 * SLIDESHOW_AUDIO_SRC in lib/content.ts.
 */
export function Slideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduce = useReducedMotion();

  const count = slides.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  /* Autoplay. Reduced motion opts out entirely rather than merely going slower. */
  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, reduce, count]);

  /* A hidden tab should not keep cycling. */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) void audio.play().catch(() => setSoundOn(false));
    else audio.pause();
  }, [soundOn]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setInteracted(true);
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setInteracted(true);
      go(index - 1);
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Life at Kinderland Educare"
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-normal text-ink sm:text-5xl">
            Life at Kinderland
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            A look at the centre, the garden and the days in between.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ControlButton
            onClick={() => setPaused((p) => !p)}
            label={paused ? "Play slideshow" : "Pause slideshow"}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </ControlButton>

          {SLIDESHOW_AUDIO_SRC && (
            <ControlButton
              onClick={() => setSoundOn((s) => !s)}
              label={soundOn ? "Turn sound off" : "Turn sound on"}
            >
              {soundOn ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </ControlButton>
          )}

          <ControlButton
            onClick={() => {
              setInteracted(true);
              go(index - 1);
            }}
            label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </ControlButton>
          <ControlButton
            onClick={() => {
              setInteracted(true);
              go(index + 1);
            }}
            label="Next slide"
          >
            <ChevronRight className="size-4" />
          </ControlButton>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-wash hairline sm:aspect-[2/1]">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              /* Kept mounted so images are decoded before their turn; inert and
                 hidden from assistive tech while off-screen. */
              inert={!active}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0",
                !reduce && "transition-opacity duration-700 ease-out-strong",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              {slide.kind === "photo" ? (
                <figure className="relative h-full w-full">
                  <picture>
                    <source srcSet={`/slides/${slide.src}.webp`} type="image/webp" />
                    <img
                      src={`/slides/${slide.src}.jpg`}
                      alt={slide.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </picture>

                  {slide.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-5 sm:p-7">
                      {/* White on a dark gradient rather than on the photo itself:
                          a caption over an unknown frame is a contrast gamble. */}
                      <span className="font-display text-xl text-white drop-shadow sm:text-2xl">
                        {slide.caption}
                      </span>
                    </figcaption>
                  )}
                </figure>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-plum-800 px-8 text-center">
                  <p className="font-display text-3xl text-background sm:text-5xl">
                    {slide.heading}
                  </p>
                  {slide.body && (
                    <p className="mt-4 max-w-xl text-[15px] text-background/80 sm:text-lg">
                      {slide.body}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots double as the slide picker. */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setInteracted(true);
              go(i);
            }}
            aria-label={`Go to slide ${i + 1} of ${count}`}
            aria-current={i === index ? "true" : undefined}
            className={cn(
              "h-1.5 cursor-pointer rounded-full transition-[width,background-color] duration-300 ease-out-strong",
              i === index ? "w-8 bg-brand-600" : "w-3 bg-ink/15",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-400",
            )}
          />
        ))}
      </div>

      {/*
        Announced only when the deck is not advancing on its own — during autoplay
        this would interrupt a screen reader every five seconds.
      */}
      <p aria-live="polite" className="sr-only">
        {paused || reduce || interacted
          ? `Slide ${index + 1} of ${count}`
          : ""}
      </p>

      {SLIDESHOW_AUDIO_SRC && (
        <audio ref={audioRef} src={SLIDESHOW_AUDIO_SRC} loop preload="none" />
      )}
    </section>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-10 cursor-pointer place-items-center rounded-full text-ink hairline transition-[transform,background-color] duration-150 ease-out-strong active:scale-90 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-wash"
    >
      {children}
    </button>
  );
}
