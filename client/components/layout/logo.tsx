import Link from "next/link";
import { cn } from "@/lib/cn";

/** Agromo mark: a sprouting seed inside a field plot. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M6 24.5h20" stroke="#F7F5EE" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="M16 24V13.5" stroke="#F7F5EE" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 15.5c0-4.2 3-7 7.5-7 0 4.3-3 7-7.5 7Z" fill="#83A96B" />
      <path d="M16 18.5c0-3.4-2.4-5.7-6-5.7 0 3.5 2.4 5.7 6 5.7Z" fill="#D5A34A" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-display text-[1.375rem] font-semibold tracking-tight",
        tone === "dark" ? "text-forest-800" : "text-cream-50",
        className,
      )}
    >
      <LogoMark className={tone === "dark" ? "text-forest-800" : "text-forest-700"} />
      <span>agromo</span>
      <span className="sr-only"> — მთავარი გვერდი</span>
    </Link>
  );
}
