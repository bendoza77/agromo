"use client";

import { Heart, LayoutDashboard, LogOut, Package, Plus, Search, Settings, Users, Wheat, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { Logo } from "@/components/layout/logo";
import { isActivePath } from "@/components/layout/with-pathname";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { categories } from "@/lib/data/taxonomy";
import { useSession } from "@/lib/hooks";
import { logout } from "@/lib/services/auth";

/** Left drawer built on a modal <dialog> (focus trap + Escape handled natively). */
export function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const searchId = useId();
  const { user, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Close if the route gets hidden while the drawer is open.
  useLayoutEffect(() => () => onClose(), [onClose]);

  const linkCls = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-ink-900 hover:bg-cream-100",
      isActivePath(pathname, href) && "bg-leaf-50 text-forest-800",
    );

  return (
    <dialog
      ref={ref}
      aria-label="მენიუ"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-0 h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none bg-cream-50 p-0 text-ink-900 shadow-[var(--shadow-raised)] open:[animation:fade-in_150ms_ease-out] lg:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-4">
          <Logo />
          <button type="button" className="btn btn-ghost h-11 w-11 p-0" onClick={onClose} aria-label="მენიუს დახურვა">
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Form action="/products" role="search" className="relative mb-4 px-1" onSubmit={onClose}>
            <label htmlFor={searchId} className="sr-only">
              პროდუქციის ძიება
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input id={searchId} name="q" type="search" placeholder="რას ეძებთ?" className="input pl-10" />
          </Form>

          <nav aria-label="მობილური ნავიგაცია">
            <ul className="space-y-0.5">
              <li>
                <Link href="/products" className={linkCls("/products")} onClick={onClose}>
                  <Wheat className="h-5 w-5 text-ink-500" aria-hidden />
                  ყველა პროდუქცია
                </Link>
              </li>
              <li>
                <Link href="/farmers" className={linkCls("/farmers")} onClick={onClose}>
                  <Users className="h-5 w-5 text-ink-500" aria-hidden />
                  ფერმერები
                </Link>
              </li>
              <li>
                <Link href="/favorites" className={linkCls("/favorites")} onClick={onClose}>
                  <Heart className="h-5 w-5 text-ink-500" aria-hidden />
                  რჩეულები
                </Link>
              </li>
            </ul>

            <p className="eyebrow mb-2 mt-6 px-3">კატეგორიები</p>
            <ul className="grid grid-cols-2 gap-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    onClick={onClose}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-[0.9375rem] text-ink-700 hover:bg-cream-100",
                      isActivePath(pathname, `/categories/${c.slug}`) && "bg-leaf-50 font-semibold text-forest-800",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            {ready && user && (
              <>
                <p className="eyebrow mb-2 mt-6 px-3">{user.role === "farmer" ? "ფერმერის პანელი" : "ანგარიში"}</p>
                <ul className="space-y-0.5">
                  <li>
                    <Link href="/dashboard" className={linkCls("/dashboard")} onClick={onClose}>
                      <LayoutDashboard className="h-5 w-5 text-ink-500" aria-hidden />
                      მიმოხილვა
                    </Link>
                  </li>
                  {user.role === "farmer" && (
                    <>
                      <li>
                        <Link href="/dashboard/products" className={linkCls("/dashboard/products")} onClick={onClose}>
                          <Package className="h-5 w-5 text-ink-500" aria-hidden />
                          ჩემი განცხადებები
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/products/new" className={linkCls("/dashboard/products/new")} onClick={onClose}>
                          <Plus className="h-5 w-5 text-ink-500" aria-hidden />
                          ახალი განცხადება
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link href="/dashboard/profile" className={linkCls("/dashboard/profile")} onClick={onClose}>
                      <Settings className="h-5 w-5 text-ink-500" aria-hidden />
                      პარამეტრები
                    </Link>
                  </li>
                </ul>
              </>
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-line p-4">
          {!ready ? null : user ? (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => {
                onClose();
                logout();
                toast.info("გამოხვედით ანგარიშიდან.");
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              გასვლა ({user.name.split(" ")[0]})
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className="btn btn-secondary" onClick={onClose}>
                შესვლა
              </Link>
              <Link href="/register" className="btn btn-primary" onClick={onClose}>
                რეგისტრაცია
              </Link>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
