import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  link,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="font-display text-2xl font-semibold text-ink-900 sm:text-[1.75rem]">
          {title}
        </h2>
        {description && <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{description}</p>}
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-forest-700 hover:text-forest-900">
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
