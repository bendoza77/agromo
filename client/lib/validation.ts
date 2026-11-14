import { normalizeGeorgianPhone } from "@/lib/contact";

export type Errors<K extends string> = Partial<Record<K, string>>;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "შეიყვანეთ ელფოსტა.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "ელფოსტის ფორმატი არასწორია (მაგ.: name@example.ge).";
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "შეიყვანეთ პაროლი.";
  if (value.length < 8) return "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს.";
}

export function validateRequired(value: string, message: string, min = 2): string | undefined {
  const v = value.trim();
  if (!v) return message;
  if (v.length < min) return `მინიმუმ ${min} სიმბოლო.`;
}

export function validateOptionalPhone(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (!normalizeGeorgianPhone(value)) return "შეიყვანეთ ქართული ნომერი, მაგ.: 555 12 34 56 ან +995 555 12 34 56.";
}

/** Only allow same-origin relative redirects. */
export function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/** Focuses the first invalid control in a form after a failed submit. */
export function focusFirstError(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}
