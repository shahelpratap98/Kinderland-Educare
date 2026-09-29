"use server";

import { Resend } from "resend";
import { centre } from "@/lib/content";

export type TourRequestState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Tour requests. Validated here, then emailed to the centre.
 *
 * Delivery is keyed off the presence of RESEND_API_KEY rather than a hand-set
 * boolean. The boolean this replaces could disagree with reality in both
 * directions — a key present but the flag still false, or worse, the flag
 * flipped to true before a key existed, which would have told parents their
 * request was received while it silently went nowhere. Deriving it means the
 * form switches on the moment the key is added to Vercel, and can never claim
 * success without one.
 *
 * Replies go to the parent, not to us: `replyTo` is their address, so the
 * centre can answer straight from its inbox.
 */
const resendKey = process.env.RESEND_API_KEY;
const DELIVERY_WIRED_UP = Boolean(resendKey);

/*
 * Resend will only send from a domain the account has verified. Until the DNS
 * for kinderlandeducare.co.nz is set up, TOUR_FROM_EMAIL can point at a Resend
 * test sender; once it is verified, set it to something at the centre's own
 * domain and nothing else changes.
 */
const FROM = process.env.TOUR_FROM_EMAIL ?? "Kinderland Educare <onboarding@resend.dev>";

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
    /* Visible in the server log so a submission is not lost outright. */
    console.warn(
      "[kinderland] Tour request received but RESEND_API_KEY is not set. Submission:",
      submission,
    );
    return {
      status: "success",
      message: `Your details passed validation, but online tour requests aren't switched on yet — please call us on ${centre.phone} to confirm your visit.`,
    };
  }

  const lines = [
    `Name:       ${name}`,
    `Email:      ${email}`,
    `Phone:      ${phone}`,
    `Child age:  ${childAge || "—"}`,
    `Preferred:  ${date}`,
    "",
    message || "(no message)",
  ];

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: centre.email,
      replyTo: email,
      subject: `Tour request — ${name} (${date})`,
      text: lines.join("\n"),
    });

    /*
      The SDK reports a refused send in `error` rather than by throwing, so a
      bare try/catch would let a rejected email fall through to the success
      message below. Treated as a failure explicitly.
    */
    if (error) throw new Error(error.message);
  } catch (cause) {
    console.error("[kinderland] Tour request delivery failed:", cause);
    /*
      Never claim success on a failed send. The parent gets the phone number
      instead, which is the one channel known to work.
    */
    return {
      status: "error",
      message: `Sorry — we couldn't send that just now. Please call us on ${centre.phone} and we'll book your visit.`,
    };
  }

  return {
    status: "success",
    message: "Thank you — we've received your request and will be in touch shortly.",
  };
}
