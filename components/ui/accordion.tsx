"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** `a` takes an array when the answer runs to more than one paragraph. */
type Item = { q: string; a: string | readonly string[] };

/**
 * Single-open accordion.
 *
 * Open/close is a CSS `grid-template-rows: 0fr → 1fr` transition rather than a
 * JS height animation. Three reasons:
 *
 * 1. It runs off the main thread, so it stays smooth while the page is still
 *    hydrating or fetching.
 * 2. CSS transitions retarget from their current position when interrupted, which
 *    is what you want for a control users toggle rapidly — keyframes would restart
 *    from zero.
 * 3. Panel height is never gated on an animation completing, so content cannot end
 *    up stranded at height 0 if frames stop arriving.
 *
 * The icon rotation and content fade are transform/opacity only.
 */
export function Accordion({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-hairline">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left",
                  "transition-colors duration-150 ease-out-strong",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-ink",
                )}
              >
                <span className="font-display text-[17px] font-normal text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    "bg-wash text-ink",
                    "transition-[transform,background-color] duration-200 ease-out-strong",
                    isOpen && "rotate-45 bg-brand-600 text-white",
                  )}
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              /* inert keeps collapsed copy out of the tab order and off screen readers. */
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out-strong",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "max-w-prose space-y-3 pb-6 pr-12 text-muted",
                    "transition-opacity duration-200 ease-out-strong",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                >
                  {(typeof item.a === "string" ? [item.a] : item.a).map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
