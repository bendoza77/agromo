import type { Seller } from "@/lib/types";

export interface NormalizedPhone {
  /** Digits only, including country code, e.g. "995555102134". */
  digits: string;
  /** E.164, e.g. "+995555102134". */
  e164: string;
  /** Human-readable, e.g. "+995 555 10 21 34". */
  display: string;
  /** Georgian mobile numbers have 9 national digits starting with 5. */
  isMobile: boolean;
}

/**
 * Normalizes Georgian phone numbers written as "+995 5XX XX XX XX",
 * "5XX XXX XXX", "0 32 2XX XX XX" etc. Returns null for anything that does
 * not look like a valid Georgian number.
 */
export function normalizeGeorgianPhone(raw: string | null | undefined): NormalizedPhone | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("995")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);

  if (!/^\d{9}$/.test(digits)) return null;
  const isMobile = digits.startsWith("5");
  if (!isMobile && !/^[34]/.test(digits)) return null;

  const display = `+995 ${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;

  return { digits: `995${digits}`, e164: `+995${digits}`, display, isMobile };
}

export function telHref(phone: NormalizedPhone): string {
  return `tel:${phone.e164}`;
}

/** Builds a wa.me link with an optional, correctly encoded prefilled message. */
export function whatsappHref(phone: NormalizedPhone, message?: string): string {
  const base = `https://wa.me/${phone.digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type ContactState =
  | { kind: "none" }
  | { kind: "phone-only"; phone: NormalizedPhone; reason: "not-on-whatsapp" | "landline" }
  | { kind: "full"; phone: NormalizedPhone };

/** Decides which contact actions are honest to offer for a seller. */
export function getContactState(seller: Pick<Seller, "phone" | "whatsapp">): ContactState {
  const phone = normalizeGeorgianPhone(seller.phone);
  if (!phone) return { kind: "none" };
  if (!phone.isMobile) return { kind: "phone-only", phone, reason: "landline" };
  if (!seller.whatsapp) return { kind: "phone-only", phone, reason: "not-on-whatsapp" };
  return { kind: "full", phone };
}

export function sellerInquiryMessage(): string {
  return "გამარჯობა! Agromo-ზე ვნახე თქვენი პროფილი და მაინტერესებს თქვენი პროდუქცია.";
}

export function productInquiryMessage(productTitle: string): string {
  return `გამარჯობა! Agromo-ზე ვნახე თქვენი განცხადება „${productTitle}“. კიდევ ხელმისაწვდომია?`;
}
