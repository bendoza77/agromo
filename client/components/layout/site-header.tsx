"use client";

import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, User } from "lucide-react";
import Image from "next/image";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { WithPathname, isActivePath } from "@/components/layout/with-pathname";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { toast } from "@/components/ui/toast";
import { useDismiss } from "@/components/ui/use-dismiss";
import { cn } from "@/lib/cn";
import { categories } from "@/lib/data/taxonomy";
import { useFavoriteIds, useSession } from "@/lib/hooks";
import { logout } from "@/lib/services/auth";
import type { SessionUser } from "@/lib/types";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream-50/95 backdrop-blur supports-[backdrop-filter]:bg-cream-50/85">
      <div className="container-page flex h-[var(--header-h)] items-center gap-2 lg:gap-6">
        <button
          type="button"
          className="btn btn-ghost -ml-2 h-11 w-11 p-0 lg:hidden"
          aria-label="მენიუს გახსნა"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>

        <Logo />

        <nav aria-label="მთავარი ნავიგაცია" className="hidden items-center gap-1 lg:flex">
          <WithPathname
            render={(pathname) => (
              <>
                <NavLink href="/products" active={isActivePath(pathname, "/products")}>
                  პროდუქცია
                </NavLink>
                <CategoriesMenu active={isActivePath(pathname, "/categories")} />
                <NavLink href="/farmers" active={isActivePath(pathname, "/farmers")}>
                  ფერმერები
                </NavLink>
              </>
            )}
          />
        </nav>

        <HeaderSearch className="hidden flex-1 md:flex lg:max-w-sm xl:max-w-md" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/products" className="btn btn-ghost h-11 w-11 p-0 md:hidden" aria-label="პროდუქციის ძიება">
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <FavoritesLink />
          <AccountArea />
        </div>
      </div>

      <WithPathname render={(pathname) => <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} />} />
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-md px-3 py-2 text-[0.9375rem] font-medium text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900",
        active && "text-forest-800 after:absolute after:inset-x-3 after:-bottom-[calc((var(--header-h)-2.5rem)/2)] after:h-0.5 after:rounded-full after:bg-forest-700",
      )}
    >
      {children}
    </Link>
  );
}

function HeaderSearch({ className }: { className?: string }) {
  const id = useId();
  return (
    <Form action="/products" role="search" className={cn("relative items-center", className)}>
      <label htmlFor={id} className="sr-only">
        პროდუქციის ძიება
      </label>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" aria-hidden />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="თხილი, თაფლი, ყველი…"
        autoComplete="off"
        className="input min-h-10 rounded-full border-line bg-white py-2 pl-9 pr-4 text-[0.9375rem]"
      />
    </Form>
  );
}

function CategoriesMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, triggerRef, open, close);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-[0.9375rem] font-medium text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900",
          (open || active) && "text-forest-800",
        )}
      >
        კატეგორიები
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full mt-2 w-[34rem] rounded-xl border border-line bg-white p-3 shadow-[var(--shadow-raised)]"
      >
        <ul className="grid grid-cols-2 gap-1">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categories/${c.slug}`}
                onClick={close}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-cream-100"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-cream-200">
                  <Image src={c.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="text-[0.9375rem] font-medium text-ink-900">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-line px-2 pt-3">
          <Link href="/products" onClick={close} className="link text-sm">
            ყველა პროდუქცია
          </Link>
        </div>
      </div>
    </div>
  );
}

function FavoritesLink() {
  const favorites = useFavoriteIds();
  const { ready } = useSession();
  const count = ready ? favorites.size : 0;
  return (
    <Link
      href="/favorites"
      className="btn btn-ghost relative h-11 w-11 p-0"
      aria-label={count > 0 ? `რჩეულები (${count})` : "რჩეულები"}
    >
      <Heart className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute right-1 top-1 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-forest-700 px-1 text-[0.6875rem] font-bold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function AccountArea() {
  const { user, ready } = useSession();

  if (!ready) return <div className="h-10 w-10 rounded-full bg-cream-200 sm:w-40 sm:rounded-md" aria-hidden />;

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn btn-ghost h-11 w-11 p-0 sm:hidden" aria-label="შესვლა">
          <User className="h-5 w-5" aria-hidden />
        </Link>
        <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
          შესვლა
        </Link>
        <Link href="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">
          რეგისტრაცია
        </Link>
      </>
    );
  }

  return (
    <>
      {user.role === "farmer" && (
        <Link href="/dashboard/products/new" className="btn btn-primary btn-sm hidden xl:inline-flex">
          <Plus className="h-4 w-4" aria-hidden />
          განცხადება
        </Link>
      )}
      <AccountMenu user={user} />
    </>
  );
}

function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const router = useRouter();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, triggerRef, open, close);

  const firstName = user.name.split(" ")[0];
  const items =
    user.role === "farmer"
      ? [
          { href: "/dashboard", label: "მიმოხილვა", icon: LayoutDashboard },
          { href: "/dashboard/products", label: "ჩემი განცხადებები", icon: Package },
          { href: "/dashboard/products/new", label: "ახალი განცხადება", icon: Plus },
          { href: "/favorites", label: "რჩეულები", icon: Heart },
          { href: "/dashboard/profile", label: "პროფილის პარამეტრები", icon: Settings },
        ]
      : [
          { href: "/dashboard", label: "ჩემი ანგარიში", icon: LayoutDashboard },
          { href: "/favorites", label: "რჩეულები", icon: Heart },
          { href: "/dashboard/profile", label: "პარამეტრები", icon: Settings },
        ];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`ანგარიშის მენიუ — ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-cream-200 sm:pr-3"
      >
        <SellerAvatar id={user.id} name={user.name} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-ink-900 sm:inline">{firstName}</span>
        <ChevronDown className="hidden h-4 w-4 text-ink-500 sm:block" aria-hidden />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-[var(--shadow-raised)]"
      >
        <div className="border-b border-line px-3 pb-3 pt-2">
          <p className="truncate font-semibold text-ink-900">{user.name}</p>
          <p className="truncate text-sm text-ink-500">{user.email}</p>
          <p className="mt-1.5 inline-flex rounded bg-leaf-100 px-1.5 py-0.5 text-xs font-semibold text-forest-800">
            {user.role === "farmer" ? "ფერმერი" : "მყიდველი"}
          </p>
        </div>
        <ul className="py-1">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={close}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem] text-ink-700 hover:bg-cream-100 hover:text-ink-900"
              >
                <Icon className="h-4 w-4 text-ink-500" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-1">
          <button
            type="button"
            onClick={() => {
              close();
              logout();
              toast.info("გამოხვედით ანგარიშიდან.");
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[0.9375rem] text-ink-700 hover:bg-cream-100 hover:text-ink-900"
          >
            <LogOut className="h-4 w-4 text-ink-500" aria-hidden />
            გასვლა
          </button>
        </div>
      </div>
    </div>
  );
}
