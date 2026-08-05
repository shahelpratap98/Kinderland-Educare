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
import { slides as homeSlides, SLIDESHOW_AUDIO_SRC, type Slide } from "@/lib/content";
import { cn } from "@/lib/utils";

const INTERVAL = 5000;

/**
 * Slideshow, shared by the home page and /our-approach.
 *
 * Everything that differs between the two decks is a prop — the slides, the
 * heading, and which folder under /public the image names resolve against. The
 * behaviour below is identical for both, so a fix to the pause logic or the
 * announcement rules lands in both places rather than in whichever copy someone
 * remembers to update.
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
export function Slideshow({
  slides = homeSlides,
  heading = "Life at Kinderland",
  description = "A look at the centre, the garden and the days in between.",
  label = "Life at Kinderland Educare",
  /* Which folder under /public the `src` names resolve against. */
  basePath = "/slides",
}: {
  slides?: readonly Slide[];
  heading?: string;
  description?: string;
  label?: string;
  basePath?: string;
} = {}) {
  const [index, setIndex] = useState(0);
  /*
    Two kinds of pause, deliberately separate.

    `userPaused` is the button and it is sticky. `transientPaused` covers hover,
    keyboard focus and a hidden tab, and clears itself. Collapsing them into one
    flag meant onMouseLeave silently un-paused a deck the user had explicitly
    stopped — which is exactly the mechanism WCAG 2.2.2 requires to work.
  */
  const [userPaused, setUserPaused] = useState(false);
  const [transientPaused, setTransientPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  /* Its own flag rather than reusing transientPaused: releasing a drag must not
     un-pause a deck the pointer is still hovering over. */
  const [dragging, setDragging] = useState(false);
  const paused = userPaused || transientPaused || dragging;
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduce = useReducedMotion();

  const count = slides.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  /*
    Which slides get a real `src`: the current one and its two neighbours.

    Every slide stays mounted, but the deck is 13 photographs — around 1.9MB of
    WebP — and they all sit in the viewport once scrolled to, stacked at opacity
    0. That is precisely the case `loading="lazy"` does not cover: the browser
    counts them as visible and fetches the lot at once. Preloading one slide
    ahead is enough, since a slide has the full 5s interval to arrive.

    A pure function of `index` rather than a set that accumulates. Walking back
    to a slide re-adds its `src`, but that is a memory-cache hit, not a second
    download — and the alternative was either a ref read during render, which
    react-hooks/refs rejects, or an effect that costs an extra render pass on
    every advance.
  */
  const shouldLoad = (i: number) =>
    i === index || i === (index + 1) % count || i === (index - 1 + count) % count;

  /* Autoplay. Reduced motion opts out entirely rather than merely going slower. */
  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, reduce, count]);

  /*
    A hidden tab should not keep cycling.

    The initial state is read on mount, not just on change. `visibilitychange`
    only fires on a transition, so a page opened in a background tab — a link
    middle-clicked, or a session restored — never received the first event and
    cycled the whole deck unseen. Harmless when every image was already in the
    document; now that slides fetch as they come up, it also pulled ~1.9MB
    nobody was looking at.
  */
  useEffect(() => {
    const onVisibility = () => setTransientPaused(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) void audio.play().catch(() => setSoundOn(false));
    else audio.pause();
  }, [soundOn]);

  /* ---------------------------------------------------------------- */
  /*  Swipe                                                            */
  /* ---------------------------------------------------------------- */

  /*
    Pointer Events rather than touch events, so the same code covers finger, pen
    and a mouse drag, and pointer capture keeps the gesture alive if the finger
    leaves the frame mid-swipe.

    The frame sets `touch-action: pan-y`, which is what actually keeps the page
    scrollable: the browser keeps vertical panning for itself and hands us the
    horizontal axis, with no preventDefault and no passive-listener fight. The
    axis is then locked once from the first 8px of travel — without that, a
    slightly diagonal flick down the page would steal the scroll.

    The deck crossfades, it is not a filmstrip, so the drag does not track the
    finger one-to-one — that would promise a slide that never arrives. It offsets
    with the iOS rubber-band curve instead, resisting further the harder it is
    pulled and capped around 72px, then settles back as the crossfade takes over.
  */
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    id: number;
    x0: number;
    y0: number;
    lastX: number;
    lastT: number;
    locked: boolean;
    v: number;
  } | null>(null);

  /* Past ~45px, or a flick faster than 0.35px/ms however short. */
  const COMMIT_PX = 45;
  const COMMIT_V = 0.35;
  const RUBBER_MAX = 72;

  const rubber = (d: number) =>
    Math.sign(d) * (1 - 1 / (Math.abs(d) / RUBBER_MAX + 1)) * RUBBER_MAX;

  const setTrack = (x: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"
      : "none";
    el.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      lastX: e.clientX,
      lastT: e.timeStamp,
      locked: false,
      v: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;

    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;

    if (!g.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      /* Vertical, or ambiguous: drop the gesture and let the page scroll. */
      if (Math.abs(dx) <= Math.abs(dy)) {
        gesture.current = null;
        return;
      }
      g.locked = true;
      /* Throws InvalidPointerId if the pointer is already gone — a lost capture
         still leaves a usable swipe, so it must not abort the gesture. */
      try {
        e.currentTarget.setPointerCapture(g.id);
      } catch {
        /* no capture; the gesture still tracks while the pointer stays inside */
      }
      setDragging(true);
      setInteracted(true);
    }

    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.v = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;

    if (!reduce) setTrack(rubber(dx), false);
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || !g.locked) return;

    const dx = e.clientX - g.x0;
    if (Math.abs(dx) > COMMIT_PX || Math.abs(g.v) > COMMIT_V) {
      go(index + (dx < 0 ? 1 : -1));
    }
    setTrack(0, !reduce);
    setDragging(false);
  };

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
      aria-label={label}
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      onMouseEnter={() => setTransientPaused(true)}
      onMouseLeave={() => setTransientPaused(false)}
      onFocusCapture={() => setTransientPaused(true)}
      onBlurCapture={() => setTransientPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-normal text-ink sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ControlButton
            onClick={() => setUserPaused((p) => !p)}
            label={userPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
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

      {/*
        3:2, matching every derivative that scripts/build-slides.mjs emits, so the
        browser never crops. CSS object-cover can only crop from the centre, and
        at the old 2:1 that discarded 63% of each portrait frame and cut children's
        heads off. Cropping happens in that script against hand-picked regions —
        sharp's automatic `attention` strategy was tried and chose the bright play
        equipment over a child's face.
      */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        /* pan-y is what preserves vertical page scrolling — see the swipe note. */
        style={{ touchAction: "pan-y" }}
        className={cn(
          "relative aspect-[3/2] w-full select-none overflow-hidden rounded-3xl bg-wash hairline",
          "[@media(hover:hover)_and_(pointer:fine)]:cursor-grab",
          "[@media(hover:hover)_and_(pointer:fine)]:active:cursor-grabbing",
        )}
      >
        <div ref={trackRef} className="absolute inset-0">
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
                  {shouldLoad(i) && (
                    <picture>
                      <source srcSet={`${basePath}/${slide.src}.webp`} type="image/webp" />
                      <img
                        src={`${basePath}/${slide.src}.jpg`}
                        alt={slide.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        /* Otherwise a mouse drag starts a native image drag
                           instead of a swipe. */
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </picture>
                  )}

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
