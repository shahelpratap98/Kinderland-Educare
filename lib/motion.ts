import type { Transition, Variants } from "framer-motion";

/**
 * Motion tokens.
 *
 * Springs are used for layout, shared-element transitions and anything the user
 * can interrupt mid-flight — springs retain velocity when retargeted, whereas
 * keyframes restart from zero. Press and hover feedback deliberately do NOT live
 * here: those are plain CSS transitions on the components themselves so they run
 * off the main thread and stay smooth while the page is still loading.
 */

/** Primary interactive spring. Damping ratio ~0.67 — snappy with a hint of settle. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 25,
};

/** For larger travel (modals, drawers) where 350 would feel twitchy. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

/** Shared-layout indicator movement — no overshoot, it tracks the cursor's intent. */
export const springLayout: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 32,
};

/** Exit should be faster than enter: the user has already decided. */
export const exitFast: Transition = { duration: 0.15, ease: [0.23, 1, 0.32, 1] };

/**
 * Section entry. Never starts from scale(0) or a large offset — nothing in the
 * real world appears from nothing, and big offsets read as sluggish.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, transform: "translateY(12px)" },
  visible: { opacity: 1, transform: "translateY(0px)" },
};

/** Stagger container. 45ms between children: enough to read as cascade, not as queue. */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

/** Shared viewport config so every section triggers at the same point. */
export const inViewOnce = { once: true, margin: "-80px" } as const;
