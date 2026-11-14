"use client";

import { CalendarDays, MapPin, Settings, Sprout, UserRoundX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ContactActions } from "@/components/seller/contact-actions";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategory, getRegion } from "@/lib/data/taxonomy";
import { useDocumentTitle, useSession, useStore } from "@/lib/hooks";
import { getProductsBySeller, getSellerById } from "@/lib/services/products";

export function SellerProfile({ id }: { id: string }) {
  const { db, ready } = useStore();
  const { user } = useSession();
  const seller = getSellerById(db, id);
  const products = useMemo(() => (seller ? getProductsBySeller(db, seller.id) : []), [db, seller]);
  const categoryNames = useMemo(
    () => [...new Set(products.map((p) => p.category))].map((c) => getCategory(c)?.name).filter(Boolean) as string[],
    [products],
  );

  useDocumentTitle(!ready ? null : seller ? `${seller.name} · Agromo` : "ფერმერი ვერ მოიძებნა · Agromo");

  if (!seller && !ready) {
    return (
      <div aria-busy="true" aria-label="იტვირთება">
        <div className="skeleton h-44 rounded-none sm:h-60" />
        <div className="container-page py-8">
          <div className="skeleton h-8 w-72" />
          <div className="skeleton mt-3 h-5 w-48" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={UserRoundX}
          title="გამყიდველი ვერ მოიძებნა"
          actions={
            <Link href="/farmers" className="btn btn-primary">
              ყველა ფერმერი
            </Link>
          }
        >
          შესაძლოა, პროფილი წაიშალა ან ბმული არასწორია.
        </EmptyState>
      </div>
    );
  }

  const region = getRegion(seller.region);
  const isOwn = user?.sellerId === seller.id;

  return (
    <>
      <div className="relative h-44 bg-forest-900 sm:h-60">
        {seller.coverImage ? (
          <Image src={seller.coverImage} alt="" fill preload sizes="100vw" className="object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(170deg,transparent_0_22px,rgb(255_255_255/0.05)_22px_23px)]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-950/40 to-transparent" />
      </div>

      <div className="container-page pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <SellerAvatar id={seller.id} name={seller.ownerName} size="xl" className="relative z-10 -mt-12 ring-4 ring-cream-100" />
            <Breadcrumbs
              items={[{ href: "/", label: "მთავარი" }, { href: "/farmers", label: "ფერმერები" }, { label: seller.name }]}
              className="mt-5"
            />
            <h1 className="mt-3 font-display text-[1.875rem] font-semibold leading-tight text-forest-900 sm:text-[2.25rem]">
              {seller.name}
            </h1>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] text-ink-600">
              <li>{seller.ownerName}</li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
                {seller.locality ? `${seller.locality}, ` : ""}
                {region?.name}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
                Agromo-ზე {seller.memberSince} წლიდან
              </li>
            </ul>

            {isOwn && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-harvest-500/40 bg-harvest-100 p-3 text-[0.9375rem]">
                <span className="flex-1">ეს თქვენი საჯარო პროფილია.</span>
                <Link href="/dashboard/profile" className="btn btn-secondary btn-sm">
                  <Settings className="h-4 w-4" aria-hidden />
                  პროფილის რედაქტირება
                </Link>
              </div>
            )}

            <section aria-labelledby="about-heading" className="mt-8 max-w-2xl">
              <h2 id="about-heading" className="sr-only">
                მეურნეობის შესახებ
              </h2>
              {seller.description ? (
                <p className="text-[1.0625rem] leading-relaxed text-ink-700">{seller.description}</p>
              ) : (
                <p className="text-[1rem] italic text-ink-500">გამყიდველს მეურნეობის აღწერა ჯერ არ დაუმატებია.</p>
              )}
              {categoryNames.length > 0 && (
                <p className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <Sprout className="h-4 w-4 text-forest-700" aria-hidden />
                  {categoryNames.map((c) => (
                    <span key={c} className="rounded-md bg-leaf-100 px-2 py-1 font-medium text-forest-800">
                      {c}
                    </span>
                  ))}
                </p>
              )}
            </section>
          </div>

          <aside aria-label="კონტაქტი" className="lg:pt-8">
            <div className="rounded-xl border border-line bg-white p-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <h2 className="font-display text-lg font-semibold text-ink-900">დაუკავშირდით პირდაპირ</h2>
              <p className="mb-4 mt-1 text-sm text-ink-600">ფასს, რაოდენობასა და ჩამოტანას გამყიდველთან შეათანხმებთ.</p>
              <ContactActions seller={seller} />
            </div>
          </aside>
        </div>

        <section aria-labelledby="listings-heading" className="mt-14 border-t border-line pt-10">
          <h2 id="listings-heading" className="mb-6 font-display text-2xl font-semibold text-ink-900">
            განცხადებები <span className="font-sans text-lg font-normal text-ink-500">({products.length})</span>
          </h2>
          {products.length === 0 ? (
            <EmptyState icon={Sprout} title="აქტიური განცხადება არ არის">
              ამ გამყიდველს ამჟამად გამოქვეყნებული პროდუქცია არ აქვს. შეგიძლიათ დაუკავშირდეთ და ჰკითხოთ მომავალ მოსავალზე.
            </EmptyState>
          ) : (
            <ProductGrid>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          )}
        </section>
      </div>
    </>
  );
}
