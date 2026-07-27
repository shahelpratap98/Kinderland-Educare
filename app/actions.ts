"use server";

import { centre } from "@/lib/content";

export type TourRequestState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * ⚠️  TODO(kinderland): THIS ACTION DOES NOT DELIVER ANYTHING YET.
 *
 * It validates the submission server-side and logs it, but there is no mail
 * transport wired up, so nothing reaches the centre. Until that is done, the UI
 * must not tell a parent their request has been received — see the response
 * message below, which deliberately directs them to phone instead.
 *
 * To finish this:
 *   1. npm i resend
 *   2. Add RESEND_API_KEY to .env.local (never commit it)
 *   3. Send to centre.email, then change DELIVERY_WIRED_UP to true
 *
 * A tour form that silently discards enrolment enquiries is worse than no form
 * at all, which is why this flag gates the success copy rather than defaulting to
 * an optimistic "thanks, we'll be in touch".
 */
const DELIVERY_WIRED_UP = false;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function requestTour(
  _prev: TourRequestState,
  formData: FormData,
): Promise<TourRequestState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const childAge = String(formData.get("childAge") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  /* Server-side validation mirrors the client rules — never trust the client. */
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please tell us your name.";
  if (!isEmail(email)) fieldErrors.email = "Please enter a valid email address.";
  if (phone.replace(/\D/g, "").length < 8)
    fieldErrors.phone = "Please enter a contact phone number.";
  if (!date) fieldErrors.date = "Please choose a date for your visit.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const submission = { name, email, phone, childAge, date, message };

  if (!DELIVERY_WIRED_UP) {
    /* Visible in the server console so submissions aren't lost during development. */
    console.warn(
      "[kinderland] Tour request received but NO DELIVERY IS CONFIGURED. Submission:",
      submission,
    );
    return {
      status: "success",
      message: `Your details passed validation, but online tour requests aren't switched on yet — please call us on ${centre.phone} to confirm your visit.`,
    };
  }

  /* TODO(kinderland): send `submission` to centre.email here. */
  return {
    status: "success",
    message: "Thank you — we've received your request and will be in touch shortly.",
  };
}
