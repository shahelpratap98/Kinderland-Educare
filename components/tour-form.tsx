"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Loader2, Send } from "lucide-react";
import { requestTour, type TourRequestState } from "@/app/actions";
import { Field, TextareaField } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { centre } from "@/lib/content";
import { springSnappy } from "@/lib/motion";

const initialState: TourRequestState = { status: "idle" };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type Touched = Record<string, boolean>;

/**
 * Tour booking form.
 *
 * Validation timing is deliberate: fields validate on blur, not on every
 * keystroke. Yelling at someone mid-word is hostile — but once a field has been
 * touched, feedback becomes live so corrections clear immediately.
 */
export function TourForm() {
  const [state, formAction, pending] = useActionState(requestTour, initialState);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    childAge: "",
    message: "",
  });
  const [date, setDate] = useState<Date | null>(null);
  const [touched, setTouched] = useState<Touched>({});
  /*
    Tracks which fields have been edited since the last server response. Without
    this, a server-side field error outlives the correction that fixed it: the
    client rule goes null, `??` falls through to the stale server message, and the
    field stays red no matter what the user types.
  */
  const [editedSinceSubmit, setEditedSinceSubmit] = useState<Touched>({});
  const [seenState, setSeenState] = useState(state);
  const reduce = useReducedMotion();

  /*
    A new action response supersedes the previous one, so edit tracking restarts.
    Adjusted during render rather than in an effect — React re-renders immediately
    without painting the stale value, and no extra commit is scheduled.
  */
  if (seenState !== state) {
    setSeenState(state);
    setEditedSinceSubmit({});
  }

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setEditedSinceSubmit((d) => ({ ...d, [key]: true }));
  };

  const blur = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }));

  /* Client-side rules; app/actions.ts re-checks all of these server-side. */
  const clientErrors: Record<string, string | null> = {
    name: values.name.trim().length >= 2 ? null : "Please tell us your name.",
    email: isEmail(values.email.trim()) ? null : "Please enter a valid email address.",
    phone:
      values.phone.replace(/\D/g, "").length >= 8
        ? null
        : "Please enter a contact phone number.",
    date: date ? null : "Please choose a date for your visit.",
  };

  /*
    Precedence: a live client rule wins; otherwise fall back to a server error
    only while the field is untouched since that response. Once the user edits,
    the server's verdict is stale and must not keep the field red.
  */
  const errorFor = (key: string) => {
    const revealed = touched[key] || state.status === "error";
    const clientError = clientErrors[key] ?? null;
    if (revealed && clientError) return clientError;
    if (!editedSinceSubmit[key]) return state.fieldErrors?.[key] ?? null;
    return null;
  };

  const validFor = (key: keyof typeof values) =>
    !!touched[key] && !clientErrors[key] && values[key].trim().length > 0;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          onBlur={blur("name")}
          error={errorFor("name")}
          valid={validFor("name")}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={set("phone")}
          onBlur={blur("phone")}
          error={errorFor("phone")}
          valid={validFor("phone")}
        />
      </div>

      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={set("email")}
        onBlur={blur("email")}
        error={errorFor("email")}
        valid={validFor("email")}
      />

      <Field
        label="Your child's age"
        name="childAge"
        value={values.childAge}
        onChange={set("childAge")}
        onBlur={blur("childAge")}
        hint="For example: 8 months, or turning 3 in June."
      />

      <DatePicker
        name="date"
        value={date}
        onChange={(d) => {
          setDate(d);
          setTouched((t) => ({ ...t, date: true }));
          setEditedSinceSubmit((e) => ({ ...e, date: true }));
        }}
        error={errorFor("date")}
        footnote={`Tours run weekdays only, between ${centre.hours.open} and ${centre.hours.close}.`}
      />

      <TextareaField
        label="Anything you'd like us to know? (optional)"
        name="message"
        value={values.message}
        onChange={set("message")}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Request a tour
          </>
        )}
      </Button>

      <AnimatePresence>
        {state.status !== "idle" && state.message && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : springSnappy}
            className="overflow-hidden"
          >
            <div
              className={
                state.status === "success"
                  ? "flex gap-2.5 rounded-xl border-2 border-ink bg-wash p-3.5 text-[14px] text-ink"
                  : "flex gap-2.5 rounded-xl border border-red-300/70 bg-red-50 p-3.5 text-[14px] text-red-800"
              }
            >
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{state.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
