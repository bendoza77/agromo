"use client";

import { useMemo } from "react";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { useSellersById, useStore } from "@/lib/hooks";
import { getProducts } from "@/lib/services/products";
import { sortProducts } from "@/lib/search";

/** Newest published listings — includes listings created in this browser. */
export function RecentProducts({ limit = 8 }: { limit?: number }) {
  const { db } = useStore();
  const sellers = useSellersById();
  const products = useMemo(() => sortProducts(getProducts(db), "newest").slice(0, limit), [db, limit]);

  return (
    <ProductGrid>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} seller={sellers.get(p.sellerId)} />
      ))}
    </ProductGrid>
  );
}
