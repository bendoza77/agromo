"use client";

import { ArrowRight, Check, CircleDashed, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DashboardTitle } from "@/components/dashboard/farmer-only";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { AvailabilityBadge } from "@/components/product/product-meta";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { getContactState } from "@/lib/contact";
import { statusLabels } from "@/lib/data/taxonomy";
import { formatDate } from "@/lib/format";
import { useFavoriteIds, useSellersById, useSession, useStore } from "@/lib/hooks";
import { logout } from "@/lib/services/auth";
import { getProductsBySeller, getSellerById } from "@/lib/services/products";
import type { SessionUser } from "@/lib/types";

export function DashboardOverview() {
  const { user } = useSession();
  if (!user) return null;
  return user.role === "farmer" && user.sellerId ? <FarmerOverview user={user} sellerId={user.sellerId} /> : <BuyerOverview user={user} />;
}

function FarmerOverview({ user, sellerId }: { user: SessionUser; sellerId: string }) {
  const { db } = useStore();
  const seller = getSellerById(db, sellerId);
  const listings = useMemo(() => getProductsBySeller(db, sellerId, { includeHidden: true }), [db, sellerId]);

  const counts = {
    total: listings.length,
    published: listings.filter((p) => p.status === "published").length,
    hidden: listings.filter((p) => p.status === "hidden").length,
    soldOut: listings.filter((p) => p.availability === "sold_out" && p.status === "published").length,
  };
  const recent = [...listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const checklist = seller
    ? [
        {
          done: getContactState(seller).kind !== "none",
          label: "საკონტაქტო ტელეფონი",
          hint: "ნომრის გარეშე მყიდველები ვერ დაგიკავშირდებიან.",
        },
        { done: Boolean(seller.description.trim()), label: "მეურნეობის აღწერა", hint: "მოკლედ მოყევით, რას აწარმოებთ და სად." },
        { done: Boolean(seller.locality.trim()), label: "სოფელი ან ქალაქი", hint: "მყიდველს ეხმარება ჩამოტანის დაგეგმვაში." },
      ]
    : [];
  const missing = checklist.filter((c) => !c.done);

  return (
    <>
      <DashboardTitle
        title={`გამარჯობა, ${user.name.split(" ")[0]}`}
        description={seller ? `${seller.name} — აქ მართავთ თქვენს განცხადებებს.` : undefined}
        actions={
          <Link href="/dashboard/products/new" className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden />
            ახალი განცხადება
          </Link>
        }
      />

      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white sm:grid-cols-4">
        {[
          { label: "სულ განცხადება", value: counts.total },
          { label: "გამოქვეყნებული", value: counts.published },
          { label: "დამალული", value: counts.hidden },
          { label: "ამოწურული", value: counts.soldOut },
        ].map((s, i) => (
          <div key={s.label} className={cn("p-4 sm:p-5", i % 2 === 1 && "border-l border-line", i >= 2 && "border-t border-line sm:border-t-0", i === 2 && "sm:border-l")}>
            <dt className="text-sm text-ink-500">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      {missing.length > 0 && (
        <section aria-labelledby="profile-check" className="mt-6 rounded-xl border border-harvest-500/40 bg-harvest-100 p-5">
          <h2 id="profile-check" className="font-semibold text-ink-900">
            შეავსეთ პროფილი, რომ მყიდველებმა გენდონ და დაგიკავშირდნენ
          </h2>
          <ul className="mt-3 space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex gap-2.5 text-[0.9375rem]">
                {c.done ? (
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success-600" aria-hidden />
                ) : (
                  <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-harvest-700" aria-hidden />
                )}
                <span>
                  <span className={cn("font-medium", c.done ? "text-ink-500 line-through" : "text-ink-900")}>{c.label}</span>
                  <span className="sr-only">{c.done ? " — შევსებულია" : " — არ არის შევსებული"}</span>
                  {!c.done && <span className="block text-sm text-ink-600">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/profile" className="btn btn-secondary btn-sm mt-4">
            პროფილის შევსება
          </Link>
        </section>
      )}

      <section aria-labelledby="recent-listings" className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-listings" className="font-display text-xl font-semibold text-ink-900">
            ბოლოს განახლებული
          </h2>
          {listings.length > 0 && (
            <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-forest-700 hover:underline">
              ყველა განცხადება <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="ჯერ განცხადება არ გაქვთ"
            actions={
              <Link href="/dashboard/products/new" className="btn btn-primary">
                პირველი განცხადების დამატება
              </Link>
            }
          >
            დაამატეთ პროდუქტი ფოტოთი, ფასით და რაოდენობით — გამოქვეყნებისთანავე გამოჩნდება მარკეტპლეისზე.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}/edit`} className="flex items-center gap-4 p-3 transition-colors hover:bg-cream-50 sm:p-4">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-cream-200">
                    <ProductImage src={p.image} alt="" sizes="56px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-900">{p.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">
                      {statusLabels[p.status]} · განახლდა {formatDate(p.updatedAt, false)}
                    </span>
                  </span>
                  <AvailabilityBadge availability={p.availability} className="hidden sm:inline-flex" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function BuyerOverview({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { db } = useStore();
  const favorites = useFavoriteIds();
  const sellers = useSellersById();
  const saved = useMemo(
    () => db.products.filter((p) => favorites.has(p.id) && p.status === "published").slice(0, 3),
    [db.products, favorites],
  );

  return (
    <>
      <DashboardTitle
        title={`გამარჯობა, ${user.name.split(" ")[0]}`}
        description="მყიდველის ანგარიში — შეინახეთ საინტერესო განცხადებები და დაუკავშირდით ფერმერებს პირდაპირ."
        actions={
          <Link href="/products" className="btn btn-primary">
            პროდუქციის დათვალიერება
          </Link>
        }
      />
      <section aria-labelledby="saved-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="saved-heading" className="font-display text-xl font-semibold text-ink-900">
            ბოლოს შენახული
          </h2>
          {favorites.size > 0 && (
            <Link href="/favorites" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-forest-700 hover:underline">
              ყველა რჩეული ({favorites.size}) <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        {saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="რჩეულები ცარიელია"
            actions={
              <Link href="/products" className="btn btn-secondary">
                პროდუქციის ნახვა
              </Link>
            }
          >
            განცხადებაზე გულის ნიშანს დააჭირეთ და ის აქ გამოჩნდება.
          </EmptyState>
        ) : (
          <ProductGrid variant="sidebar">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} seller={sellers.get(p.sellerId)} />
            ))}
          </ProductGrid>
        )}
      </section>
      <section className="mt-10 rounded-xl border border-line bg-cream-50 p-5">
        <h2 className="font-semibold text-ink-900">გსურთ საკუთარი პროდუქციის გაყიდვა?</h2>
        <p className="mt-1 text-[0.9375rem] text-ink-600">
          გაყიდვისთვის საჭიროა ცალკე ფერმერის ანგარიში. პროტოტიპში მყიდველის ანგარიშის ფერმერად გადაკეთება არ ხდება.
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-4"
          onClick={() => {
            logout();
            router.push("/register?role=farmer");
          }}
        >
          გასვლა და ფერმერის ანგარიშის შექმნა
        </button>
      </section>
    </>
  );
}
