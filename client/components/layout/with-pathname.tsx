"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

function PathnameReader({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return render(usePathname());
}

/**
 * With Cache Components, usePathname suspends on routes whose params are only
 * known at request time. This renders the same UI without an active state as
 * the prerendered fallback.
 */
export function WithPathname({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return (
    <Suspense fallback={render(null)}>
      <PathnameReader render={render} />
    </Suspense>
  );
}

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
