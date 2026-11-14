import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  children,
  actions,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-cream-50 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-leaf-100 text-forest-700">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
      {children && <div className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
