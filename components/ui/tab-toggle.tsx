"use client";

import { motion, useReducedMotion } from "framer-motion";
import { springLayout } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

/**
 * Segmented control with a shared-layout indicator.
 *
 * The moving pill is a single element with a `layoutId`, so Framer animates it
 * between tabs instead of cross-fading two states. The indicator spring has no
 * overshoot — it should track the user's intent, not bounce past it.
 *
 * Arrow-key navigation is wired up because this is a real tablist; note that the
 * keyboard path is intentionally not given any extra animation flourish.
 */
export function TabToggle({
  tabs,
  active,
  onChange,
  layoutId = "tab-indicator",
  className,
}: {
  tabs: readonly Tab[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const activeIndex = tabs.findIndex((t) => t.id === active);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + dir + tabs.length) % tabs.length;
    onChange(tabs[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label="Age group"
      onKeyDown={onKeyDown}
      className={cn(
        "hairline bg-background inline-flex w-full gap-1 rounded-full p-1 shadow-card sm:w-auto",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium sm:flex-none sm:px-5",
              "transition-[color,transform] duration-150 ease-out-strong active:scale-[0.98]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
              isActive
                ? "text-white"
                : "text-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={reduce ? { duration: 0 } : springLayout}
                className="absolute inset-0 z-0 rounded-full bg-brand-600 shadow-card"
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
