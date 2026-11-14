import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface Crumb {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="ნავიგაციის ბილიკი" className={cn("text-sm text-ink-500", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />}
            {c.href ? (
              <Link href={c.href} className="hover:text-forest-800 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-ink-700">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line bg-cream-50", className)}>
      <div className="container-page py-8 sm:py-10">
        {crumbs && <Breadcrumbs items={crumbs} className="mb-4" />}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-forest-900 sm:text-[2.125rem]">{title}</h1>
            {description && <p className="mt-2 text-[1rem] leading-relaxed text-ink-600">{description}</p>}
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
