"use client";

import { useMemo } from "react";
import { SellerCard } from "@/components/seller/seller-card";
import { useStore } from "@/lib/hooks";
import { getProducts } from "@/lib/services/products";

/** Sellers ordered by number of active listings. */
export function SellerList({ limit, className }: { limit?: number; className?: string }) {
  const { db } = useStore();
  const rows = useMemo(() => {
    const published = getProducts(db);
    return db.sellers
      .map((seller) => {
        const own = published.filter((p) => p.sellerId === seller.id);
        const highlights = own.slice(0, 3).map((p) => p.title.split("—")[0].split("(")[0].trim());
        return { seller, count: own.length, highlights };
      })
      .sort((a, b) => b.count - a.count || a.seller.name.localeCompare(b.seller.name, "ka"))
      .slice(0, limit);
  }, [db, limit]);

  return (
    <ul className={className ?? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"}>
      {rows.map(({ seller, count, highlights }) => (
        <li key={seller.id}>
          <SellerCard seller={seller} productCount={count} highlights={highlights} />
        </li>
      ))}
    </ul>
  );
}
