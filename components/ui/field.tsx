"use client";

import { useId } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase = cn(
  "peer w-full rounded-xl border bg-white/60 px-4 pb-2.5 pt-6 text-[15px] text-slate-900",
  "placeholder-transparent outline-none",
  "transition-[border-color,box-shadow,background-color] duration-150 ease-out-strong",
  "focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_var(--color-sky-100)]",
);

const labelBase = cn(
  "pointer-events-none absolute left-4 top-4 origin-left text-[15px] text-slate-600",
  "transition-[transform,color] duration-150 ease-out-strong",
  "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
  "-translate-y-2.5 scale-[0.82]",
  "peer-focus:-translate-y-2.5 peer-focus:scale-[0.82] peer-focus:text-brand-700",
);

type Common = {
  label: string;
  error?: string | null;
  valid?: boolean;
  hint?: string;
  className?: string;
};

/**
 * Floating-label field with live validation feedback.
 *
 * The label is driven by the CSS `:placeholder-shown` state rather than React
 * state — it stays in sync with autofill and native form restoration for free,
 * which a JS-tracked "has value" boolean tends to miss.
 *
 * Errors animate in with a spring on height so a message appearing doesn't snap
 * the layout, and the success tick only shows once a field is both touched and
 * valid — confirming without nagging mid-typing.
 */
export function Field({
  label,
  error,
  valid,
  hint,
  className,
  ...props
}: Common & React.ComponentProps<"input">) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            inputBase,
            error
              ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_var(--color-red-100)]"
              : "border-slate-200/90",
          )}
          {...props}
        />
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
        {valid && !error && (
          <Check
            aria-hidden
            className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-brand-600"
            strokeWidth={3}
          />
        )}
      </div>
      <FieldMessage error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  className,
  ...props
}: Common & React.ComponentProps<"textarea">) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <div className="relative">
        <textarea
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            inputBase,
            "min-h-28 resize-y",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200/90",
          )}
          {...props}
        />
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
      </div>
      <FieldMessage error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
}

/**
 * Validation message.
 *
 * Deliberately NOT animated with AnimatePresence. An earlier version sprang the
 * height open, which broke outright: the entering message stayed pinned at its
 * `initial` values, so errors rendered at height 0 / opacity 0 and were invisible
 * to sighted users while still being announced to screen readers.
 *
 * It also failed the frequency test — a form error is seen constantly, and the
 * height spring added nothing to comprehension. The enter is now a CSS-only fade
 * via @starting-style (see `.field-msg` in globals.css), which needs no JS, cannot
 * strand the element mid-animation, and degrades to simply appearing on browsers
 * without support.
 */
function FieldMessage({
  error,
  hint,
  errorId,
  hintId,
}: {
  error?: string | null;
  hint?: string;
  errorId: string;
  hintId: string;
}) {
  if (error) {
    return (
      <p
        id={errorId}
        role="alert"
        className="field-msg flex items-center gap-1.5 pt-1.5 text-[13px] text-red-600"
      >
        <AlertCircle className="size-3.5 shrink-0" aria-hidden />
        {error}
      </p>
    );
  }

  if (hint) {
    return (
      <p id={hintId} className="pt-1.5 text-[13px] text-slate-600">
        {hint}
      </p>
    );
  }

  return null;
}
