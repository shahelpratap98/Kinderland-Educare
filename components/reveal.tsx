"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, springSnappy, staggerParent } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance. Fires once — re-animating on every scroll-past is
 * the kind of motion users see dozens of times per session, which is exactly when
 * animation stops being delightful and starts being friction.
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const Cmp = as === "section" ? motion.section : motion.div;
  return (
    <Cmp
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      variants={staggerParent}
      className={className}
    >
      {children}
    </Cmp>
  );
}

/** A single staggered child. Must sit inside <Reveal>. */
export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} transition={springSnappy} className={cn(className)}>
      {children}
    </motion.div>
  );
}
