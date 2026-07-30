"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { exitFast, springSoft } from "@/lib/motion";

/**
 * Modal dialog.
 *
 * Notes on the motion choices:
 * - Enters from `scale(0.97)`, never `scale(0)` — nothing in the real world
 *   appears from nothing.
 * - Keeps `transform-origin: center`. Popovers should scale from their trigger,
 *   but a modal isn't anchored to one; it belongs to the viewport.
 * - Exit is faster than enter (150ms vs the spring): by the time a user closes,
 *   they've already decided, and waiting on a leisurely exit feels broken.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* Escape to close, and restore focus to whatever opened the dialog. */
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      /* Minimal focus trap: cycle Tab within the panel. */
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    /* Scroll lock that compensates for the scrollbar, so the page doesn't shift. */
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    /* Move focus in once the panel exists. */
    const raf = requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("input, button, textarea, select")
        ?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      cancelAnimationFrame(raf);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "scale(0.97) translateY(8px)" }
            }
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            /* Exit carries its own faster transition — the user has already decided. */
            exit={
              reduce
                ? { opacity: 0, transition: exitFast }
                : {
                    opacity: 0,
                    transform: "scale(0.98) translateY(4px)",
                    transition: exitFast,
                  }
            }
            transition={reduce ? { duration: 0.15 } : springSoft}
            className="hairline bg-background relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 shadow-modal sm:rounded-3xl sm:p-8"
          >
            <div className="mb-6 pr-10">
              <h2 className="font-display text-2xl font-normal text-ink">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-[15px] text-muted">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-muted transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.94] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-wash [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
            >
              <X className="size-5" />
            </button>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
