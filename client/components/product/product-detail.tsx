"use client";

import { CalendarDays, EyeOff, MapPin, PackageSearch, Pencil, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { AvailabilityBadge, Price } from "@/components/product/product-meta";
import { ContactActions } from "@/components/seller/contact-actions";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getContactState } from "@/lib/contact";
import { getCategory, getRegion, units } from "@/lib/data/taxonomy";
import { formatDate, formatPrice, formatQuantity, unitShort } from "@/lib/format";
import { useSellersById, useSession, useStore } from "@/lib/hooks";
import { canManageProduct, getProductById, getProducts } from "@/lib/services/products";

export function ProductDetail({ id }: { id: string }) {
  const { db, ready } = useStore();
  const { user } = useSession();
  const sellers = useSellersById();
  const product = getProductById(db, id);
  const seller = product ? sellers.get(product.sellerId) : undefined;
  const isOwner = product ? canManageProduct(user, product) : false;

  // Cheap on a few dozen listings; recomputed only when the store changes.
  const related = useMemo(() => {
    const current = getProductById(db, id);
    if (!current) return [];
    const others = getProducts(db).filter((p) => p.id !== current.id);
    const sameCategory = others.filter((p) => p.category === current.category);
    const sameSeller = others.filter((p) => p.sellerId === current.sellerId && p.category !== current.category);
    return [...sameCategory, ...sameSeller].slice(0, 4);
  }, [db, id]);

  // Listings created in this browser aren't known to the server render.
  if (!product && !ready) return <ProductDetailSkeleton />;

  if (!product || !seller || (product.status === "hidden" && !isOwner)) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageSearch}
          title={product?.status === "hidden" ? "განცხადება დროებით დამალულია" : "განცხადება ვერ მოიძებნა"}
          actions={
            <>
              <Link href="/products" className="btn btn-primary">
                პროდუქციის დათვალიერება
              </Link>
              <Link href="/" className="btn btn-secondary">
                მთავარი გვერდი
              </Link>
            </>
          }
        >
          {product?.status === "hidden"
            ? "გამყიდველმა ეს განცხადება დამალა. შესაძლოა, მალე ისევ გამოჩნდეს."
            : "შესაძლოა, გამყიდველმა წაშალა განცხადება ან ბმული არასწორია."}
        </EmptyState>
      </div>
    );
  }

  const category = getCategory(product.category);
  const region = getRegion(product.region);
  const sellerRegion = getRegion(seller.region);
  const contact = getContactState(seller);
  const showBar = !isOwner && contact.kind !== "none";

  return (
    <div className={showBar ? "pb-24 lg:pb-0" : undefined}>
      <div className="container-page py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "მთავარი" },
            { href: `/categories/${product.category}`, label: category?.name ?? "პროდუქცია" },
            { label: product.title },
          ]}
        />

        {isOwner && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-harvest-500/40 bg-harvest-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-[0.9375rem] text-ink-900">
              {product.status === "hidden" ? (
                <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-harvest-700" aria-hidden />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-harvest-700" aria-hidden />
              )}
              {product.status === "hidden"
                ? "ეს თქვენი განცხადებაა და ამჟამად დამალულია — მყიდველები მას ვერ ხედავენ."
                : "ეს თქვენი განცხადებაა. ასე ხედავენ მას მყიდველები."}
            </p>
            <Link href={`/dashboard/products/${product.id}/edit`} className="btn btn-secondary btn-sm shrink-0">
              <Pencil className="h-4 w-4" aria-hidden />
              რედაქტირება
            </Link>
          </div>
        )}

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 [grid-template-areas:'media'_'summary'_'details'] lg:[grid-template-areas:'media_summary'_'details_summary']">
          <div className="[grid-area:media]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-200">
              <ProductImage src={product.image} alt={product.title} preload sizes="(min-width: 1024px) 680px, 100vw" />
            </div>
          </div>

          <div className="[grid-area:summary]">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <Link href={`/categories/${product.category}`} className="eyebrow hover:underline">
                {category?.name}
              </Link>
              <h1 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-forest-900 sm:text-[2rem]">
                {product.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-[0.9375rem] text-ink-600">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                {product.locality ? `${product.locality}, ` : ""}
                {region?.name}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-line py-5">
                <Price price={product.price} unit={product.unit} size="lg" className="mr-auto" />
                <AvailabilityBadge availability={product.availability} showAvailable />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 text-[0.9375rem]">
                <div>
                  <dt className="text-sm text-ink-500">ხელმისაწვდომი რაოდენობა</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">
                    {product.quantity === null ? "არ არის მითითებული" : formatQuantity(product.quantity, product.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-ink-500">მინიმალური შეკვეთა</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">
                    {product.minOrder === null ? "არ არის" : formatQuantity(product.minOrder, product.unit)}
                  </dd>
                </div>
              </dl>

              {!isOwner && (
                <>
                  <h2 className="mb-3 text-sm font-semibold text-ink-900">დაუკავშირდით გამყიდველს</h2>
                  <ContactActions seller={seller} productTitle={product.title} />
                </>
              )}

              <div className="mt-4">
                <FavoriteButton productId={product.id} productTitle={product.title} variant="button" className="w-full" />
              </div>

              <Link
                href={`/farmers/${seller.id}`}
                className="group mt-6 flex items-center gap-4 rounded-xl border border-line bg-white p-4 transition-colors hover:border-line-strong"
              >
                <SellerAvatar id={seller.id} name={seller.ownerName} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink-500">გამყიდველი</span>
                  <span className="block truncate font-display text-lg font-semibold text-ink-900 group-hover:text-forest-800">
                    {seller.name}
                  </span>
                  <span className="block truncate text-sm text-ink-600">
                    {seller.ownerName} · {sellerRegion?.name} · Agromo-ზე {seller.memberSince} წლიდან
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="[grid-area:details]">
            <h2 className="font-display text-xl font-semibold text-ink-900">აღწერა</h2>
            <p className="mt-3 whitespace-pre-line text-[1rem] leading-relaxed text-ink-700">{product.description}</p>

            <h2 className="mt-8 font-display text-xl font-semibold text-ink-900">დეტალები</h2>
            <dl className="mt-3 divide-y divide-line border-y border-line text-[0.9375rem]">
              <DetailRow label="კატეგორია" value={category?.name} />
              <DetailRow label="ფასი" value={product.price === null ? "შეთანხმებით" : `${formatPrice(product.price)} / ${unitShort(product.unit)}`} />
              <DetailRow label="საზომი ერთეული" value={units[product.unit].long} />
              <DetailRow label="რეგიონი" value={region?.name} />
              <DetailRow label="მდებარეობა" value={product.locality || "—"} />
              <DetailRow
                label="გამოქვეყნდა"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
                    {formatDate(product.createdAt)}
                  </span>
                }
              />
              {product.updatedAt !== product.createdAt && <DetailRow label="განახლდა" value={formatDate(product.updatedAt)} />}
            </dl>

            <p className="mt-6 rounded-lg bg-cream-50 p-4 text-sm leading-relaxed text-ink-600">
              Agromo არ ამოწმებს პროდუქციის ხარისხს და არ არის გარიგების მხარე. ფასი, ხარისხი და ჩამოტანა შეუთანხმეთ
              გამყიდველს უშუალოდ — სასურველია, ნახოთ პროდუქტი ყიდვამდე.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-line pt-10">
            <h2 id="related-heading" className="mb-6 font-display text-2xl font-semibold text-ink-900">
              მსგავსი განცხადებები
            </h2>
            <ProductGrid>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} seller={sellers.get(p.sellerId)} />
              ))}
            </ProductGrid>
          </section>
        )}
      </div>

      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="hidden min-w-0 flex-1 xs:block">
              <p className="truncate text-sm font-semibold text-ink-900">{product.title}</p>
              <Price price={product.price} unit={product.unit} className="text-sm" />
            </div>
            <ContactActions seller={seller} productTitle={product.title} layout="bar" className="flex-1 xs:flex-none" />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-4 py-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="იტვირთება">
      <div className="skeleton h-4 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="skeleton aspect-[4/3] rounded-xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-9 w-4/5" />
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
