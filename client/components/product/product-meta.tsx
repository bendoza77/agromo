import { Clock, PackageX } from "lucide-react";
import { availabilityLabels } from "@/lib/data/taxonomy";
import { cn } from "@/lib/cn";
import { formatPrice, unitShort } from "@/lib/format";
import type { Availability, Unit } from "@/lib/types";

export function Price({
  price,
  unit,
  size = "md",
  className,
}: {
  price: number | null;
  unit: Unit;
  size?: "md" | "lg";
  className?: string;
}) {
  if (price === null) {
    return (
      <p className={cn("font-semibold text-ink-600", size === "lg" ? "text-lg" : "text-[0.9375rem]", className)}>
        ფასი შეთანხმებით
      </p>
    );
  }
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-1 text-ink-900", className)}>
      <span className={cn("font-bold tabular-nums", size === "lg" ? "text-3xl" : "text-lg")}>{formatPrice(price)}</span>
      <span className={cn("text-ink-500", size === "lg" ? "text-base" : "text-sm")}>/ {unitShort(unit)}</span>
    </p>
  );
}

/** Shows non-default availability. Text + icon, never color alone. */
export function AvailabilityBadge({
  availability,
  showAvailable = false,
  className,
}: {
  availability: Availability;
  showAvailable?: boolean;
  className?: string;
}) {
  if (availability === "available" && !showAvailable) return null;
  const styles: Record<Availability, string> = {
    available: "bg-success-50 text-success-700 ring-success-600/20",
    preorder: "bg-harvest-100 text-harvest-700 ring-harvest-500/30",
    sold_out: "bg-cream-200 text-ink-700 ring-ink-400/30",
  };
  const Icon = availability === "sold_out" ? PackageX : availability === "preorder" ? Clock : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[availability],
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {availabilityLabels[availability]}
    </span>
  );
}
