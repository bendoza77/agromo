import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const TONES = [
  "bg-forest-700 text-cream-50",
  "bg-harvest-500 text-forest-950",
  "bg-leaf-400 text-forest-950",
  "bg-forest-900 text-leaf-200",
  "bg-harvest-200 text-harvest-700",
];

function toneFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

/** Initials avatar — we never show stock portraits as if they were real sellers. */
export function SellerAvatar({
  id,
  name,
  size = "md",
  className,
}: {
  id: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "h-5 w-5 text-[0.625rem]",
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-display font-semibold",
        sizes[size],
        toneFor(id),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
