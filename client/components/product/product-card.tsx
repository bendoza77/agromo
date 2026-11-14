import { MapPin } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductImage } from "@/components/product/product-image";
import { AvailabilityBadge, Price } from "@/components/product/product-meta";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { cn } from "@/lib/cn";
import { getRegion } from "@/lib/data/taxonomy";
import type { Product, Seller } from "@/lib/types";

export const PRODUCT_CARD_SIZES = "(min-width: 1280px) 296px, (min-width: 768px) 30vw, (min-width: 416px) 45vw, 112px";

/**
 * The whole card is clickable via a stretched link on the title; the favorite
 * button sits above it in the stacking order so it works independently.
 * Below 416px it switches to a compact row layout.
 */
export function ProductCard({ product, seller, preload = false }: { product: Product; seller?: Seller; preload?: boolean }) {
  const region = getRegion(product.region)?.name;
  const place = product.locality.split(",")[0]?.trim();

  return (
    <article className="group relative grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3.5 xs:flex xs:flex-col xs:gap-0">
      <div className="relative aspect-square overflow-hidden rounded-md bg-cream-200 xs:aspect-[4/3] xs:w-full xs:rounded-lg">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes={PRODUCT_CARD_SIZES}
          preload={preload}
          className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
        <AvailabilityBadge availability={product.availability} className="absolute bottom-2 left-2 hidden shadow-sm xs:inline-flex" />
        <FavoriteButton
          productId={product.id}
          productTitle={product.title}
          className="absolute right-1.5 top-1.5 z-10 h-9 w-9 xs:right-2 xs:top-2 xs:h-10 xs:w-10"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1 xs:pt-3">
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink-900">
          <Link
            href={`/products/${product.id}`}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:text-forest-800 group-hover:underline group-hover:decoration-leaf-400 group-hover:underline-offset-4"
          >
            {product.title}
          </Link>
        </h3>
        <Price price={product.price} unit={product.unit} />
        <AvailabilityBadge availability={product.availability} className="self-start xs:hidden" />
        <p className="flex min-w-0 items-center gap-1 text-sm text-ink-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          <span className="truncate">
            {region}
            {place ? ` · ${place}` : ""}
          </span>
        </p>
        {seller && (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-ink-600">
            <SellerAvatar id={seller.id} name={seller.ownerName} size="xs" />
            <span className="truncate">{seller.name}</span>
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3.5 xs:flex xs:flex-col xs:gap-0" aria-hidden>
      <div className="skeleton aspect-square xs:aspect-[4/3] xs:w-full xs:rounded-lg" />
      <div className="flex flex-col gap-2 xs:pt-3">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-5 w-2/5" />
        <div className="skeleton h-3.5 w-3/5" />
      </div>
    </div>
  );
}

export function ProductGrid({
  children,
  className,
  variant = "full",
}: {
  children: React.ReactNode;
  className?: string;
  /** "sidebar": the grid shares the row with a filter sidebar from lg up. */
  variant?: "full" | "sidebar";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-y-5 xs:grid-cols-2 xs:gap-x-4 xs:gap-y-8 md:grid-cols-3 lg:gap-x-6",
        variant === "full" ? "xl:grid-cols-4" : "lg:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
