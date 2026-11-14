import { units } from "@/lib/data/taxonomy";
import type { Unit } from "@/lib/types";

const MONTHS = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

/** Groups thousands with a narrow no-break space and uses a decimal comma (Georgian convention). */
export function formatNumber(value: number, maxFractionDigits = 2): string {
  const fixed = Number.isInteger(value) ? String(value) : value.toFixed(maxFractionDigits).replace(/0+$/, "").replace(/\.$/, "");
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return frac ? `${grouped},${frac.padEnd(2, "0")}` : grouped;
}

export function formatPrice(value: number): string {
  return `${formatNumber(value)} ₾`;
}

export function unitShort(unit: Unit): string {
  return units[unit].short;
}

export function formatQuantity(value: number, unit: Unit): string {
  return `${formatNumber(value)} ${units[unit].short}`;
}

/**
 * Formats an ISO date deterministically (no locale/timezone dependence),
 * so server and client render identical text.
 */
export function formatDate(iso: string, withYear = true): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const day = Number(d);
  const month = MONTHS[Number(mo) - 1];
  return withYear ? `${day} ${month}, ${y}` : `${day} ${month}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}
