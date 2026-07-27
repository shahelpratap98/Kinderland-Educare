"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Serialise as a LOCAL calendar date.
 *
 * `toISOString()` would be wrong here: day cells are constructed at local
 * midnight, and in NZ (UTC+12/+13) converting that to UTC rolls back to the
 * previous day — so selecting Monday the 27th would submit "2026-07-26" and the
 * centre would be told the wrong day.
 */
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

/** Tours can only run while the centre is open: Monday to Friday. */
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const formatLong = (d: Date) =>
  d.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Monday-first offset, matching NZ calendar convention. */
const leadingBlanks = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  return (firstDay + 6) % 7;
};

/**
 * Date picker constrained to weekdays and future dates.
 *
 * The popover scales in from `scale(0.97)` with `transform-origin: top`, so it
 * reads as growing out of its trigger rather than materialising at the centre of
 * its own box. Day cells get CSS-only press feedback — they can be clicked
 * repeatedly while comparing dates, so a JS spring per cell would be wasteful.
 */
export function DatePicker({
  value,
  onChange,
  label = "Preferred tour date",
  error,
  name,
  footnote,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  label?: string;
  /* Passed in rather than hardcoded so opening hours live only in lib/content.ts —
     a hardcoded copy here is exactly how the stale 7:00 AM value survived. */
  footnote?: string;
  error?: string | null;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* Close on outside click and on Escape. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const blanks = leadingBlanks(view.getFullYear(), view.getMonth());
  const canGoBack =
    view.getFullYear() > today.getFullYear() ||
    (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth());

  const shiftMonth = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={value ? toISODate(value) : ""} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white/60 px-4 py-3.5 text-left",
          "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out-strong",
          "active:scale-[0.995]",
          "focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_3px_var(--color-sky-100)]",
          error
            ? "border-red-400"
            : "border-slate-200/90",
        )}
      >
        <span className="min-w-0">
          <span className="block text-[13px] text-slate-600">{label}</span>
          <span
            className={cn(
              "block truncate text-[15px]",
              value ? "text-slate-900" : "text-slate-500",
            )}
          >
            {value ? formatLong(value) : "Choose a weekday"}
          </span>
        </span>
        <CalendarDays className="size-5 shrink-0 text-brand-600" />
      </button>

      {error && (
        <p role="alert" className="pt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose a tour date"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.97) translateY(-4px)" }}
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98) translateY(-2px)" }}
            transition={reduce ? { duration: 0.12 } : { ...springSnappy, opacity: { duration: 0.14 } }}
            style={{ transformOrigin: "top center" }}
            className="glass absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl p-4 shadow-lift"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={!canGoBack}
                aria-label="Previous month"
                className="grid size-8 cursor-pointer place-items-center rounded-full text-slate-600 transition-[transform,background-color] duration-150 ease-out-strong active:scale-90 disabled:pointer-events-none disabled:opacity-30 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-jakarta text-sm font-semibold text-slate-900">
                {view.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="grid size-8 cursor-pointer place-items-center rounded-full text-slate-600 transition-[transform,background-color] duration-150 ease-out-strong active:scale-90 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="grid h-7 place-items-center text-[11px] font-medium uppercase tracking-wide text-slate-600"
                >
                  {d.slice(0, 1)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: blanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(view.getFullYear(), view.getMonth(), i + 1);
                const disabled = isWeekend(date) || date < today;
                const selected = value?.getTime() === date.getTime();

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabled}
                    aria-label={formatLong(date)}
                    aria-pressed={selected}
                    onClick={() => {
                      onChange(date);
                      setOpen(false);
                    }}
                    className={cn(
                      "grid h-9 cursor-pointer place-items-center rounded-lg text-[13px] font-medium",
                      "transition-[transform,background-color,color] duration-150 ease-out-strong",
                      "active:scale-90",
                      "disabled:pointer-events-none disabled:text-slate-300",
                      selected
                        ? "bg-brand-600 text-white"
                        : "text-slate-700 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sky-100",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {footnote && (
              <p className="mt-3 border-t border-slate-200/70 pt-3 text-[12px] text-slate-600">
                {footnote}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
