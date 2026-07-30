"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

/**
 * Hero feature pill. Decorative and seen once per visit, so a little movement is
 * earned here — but it stays subtle, and hover lift is gated to fine pointers.
 */
export function Pill({
  children,
  icon,
  className,
  iconClassName,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <motion.span
      variants={fadeUp}
      className={cn(
        "hairline bg-background inline-flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm font-medium text-ink shadow-card",
        "transition-[transform,box-shadow] duration-200 ease-out-strong",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lift",
        className,
      )}
    >
      {icon && (
        <span className={cn("text-ink", iconClassName)}>
          {icon}
        </span>
      )}
      {children}
    </motion.span>
  );
}
