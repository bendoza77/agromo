"use client";

import { Heart, LayoutDashboard, LogIn, Package, Plus, Settings, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { useSession } from "@/lib/hooks";
import type { SessionUser } from "@/lib/types";

function navFor(user: SessionUser) {
  const common = [
    { href: "/dashboard", label: "მიმოხილვა", icon: LayoutDashboard, exact: true },
    ...(user.role === "farmer"
      ? [
          { href: "/dashboard/products", label: "ჩემი განცხადებები", icon: Package, exact: false },
          { href: "/dashboard/products/new", label: "ახალი განცხადება", icon: Plus, exact: true },
        ]
      : []),
    { href: "/favorites", label: "რჩეულები", icon: Heart, exact: true },
    { href: "/dashboard/profile", label: user.role === "farmer" ? "პროფილი" : "პარამეტრები", icon: Settings, exact: true },
  ];
  if (user.role === "farmer" && user.sellerId) {
    common.push({ href: `/farmers/${user.sellerId}`, label: "საჯარო პროფილი", icon: Store, exact: true });
  }
  return common;
}

function isActive(pathname: string | null, href: string, exact: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  // "/dashboard/products" stays active on edit pages but not on "new" (it has its own item).
  return pathname === href || (pathname.startsWith(`${href}/`) && !pathname.endsWith("/new"));
}

function DashboardNav({ user, pathname }: { user: SessionUser; pathname: string | null }) {
  const items = navFor(user);
  return (
    <nav aria-label="პანელის ნავიგაცია">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium transition-colors",
                  active ? "bg-forest-800 text-cream-50" : "text-ink-700 hover:bg-cream-200 hover:text-ink-900",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-leaf-200" : "text-ink-500")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PathAwareNav({ user }: { user: SessionUser }) {
  return <DashboardNav user={user} pathname={usePathname()} />;
}

/**
 * Logged-out state. Deliberately not an automatic redirect: logging out from a
 * dashboard page navigates elsewhere, and an effect-driven redirect would race it.
 */
function LoginPrompt() {
  const pathname = usePathname();
  const target = `/login?next=${encodeURIComponent(pathname)}`;
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={LogIn}
        title="საჭიროა ანგარიშზე შესვლა"
        actions={
          <>
            <Link href={target} className="btn btn-primary">
              შესვლა
            </Link>
            <Link href="/register" className="btn btn-secondary">
              რეგისტრაცია
            </Link>
          </>
        }
      >
        პანელის სანახავად შედით ანგარიშზე ან შექმენით ახალი.
      </EmptyState>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();

  if (!ready) {
    return (
      <div className="container-page py-10" aria-busy="true" aria-label="იტვირთება">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="skeleton h-48" />
          <div className="skeleton h-80" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={null}>
        <LoginPrompt />
      </Suspense>
    );
  }

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
          <div className="mb-4 hidden items-center gap-3 lg:flex">
            <SellerAvatar id={user.id} name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">{user.name}</p>
              <p className="text-sm text-ink-500">{user.role === "farmer" ? "ფერმერი" : "მყიდველი"}</p>
            </div>
          </div>
          <Suspense fallback={<DashboardNav user={user} pathname={null} />}>
            <PathAwareNav user={user} />
          </Suspense>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
