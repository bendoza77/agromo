"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getRegion } from "@/lib/data/taxonomy";
import { formatPrice, unitShort } from "@/lib/format";
import { useStore } from "@/lib/hooks";
import { getProductById, getSellerById } from "@/lib/services/products";

/** A real listing from the catalogue, styled as a bazaar produce tag. Hidden if the listing is gone. */
export function HeroListingTag({ productId, className }: { productId: string; className?: string }) {
  const { db } = useStore();
  const product = getProductById(db, productId);
  if (!product || product.status !== "published") return null;
  const seller = getSellerById(db, product.sellerId);
  const name = product.title.split("—")[0].trim();
  const price = product.price === null ? "ფასი შეთანხმებით" : `${formatPrice(product.price)} / ${unitShort(product.unit)}`;

  return (
    <Link href={`/products/${product.id}`} className={`produce-tag group ${className ?? ""}`}>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate">
          {name} · {price}
        </span>
        <span className="truncate text-xs font-normal text-ink-500">
          {seller?.name}, {getRegion(product.region)?.name}
        </span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-forest-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
