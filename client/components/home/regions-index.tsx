"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { categories, regions } from "@/lib/data/taxonomy";
import { useStore } from "@/lib/hooks";
import { getProducts } from "@/lib/services/products";

/** Regions with live listing counts and their most common categories (derived from data). */
export function RegionsIndex() {
  const { db } = useStore();
  const rows = useMemo(() => {
    const published = getProducts(db);
    return regions
      .map((r) => {
        const items = published.filter((p) => p.region === r.slug);
        const byCategory = new Map<string, number>();
        for (const p of items) byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
        const top = [...byCategory.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([slug]) => categories.find((c) => c.slug === slug)?.name)
          .filter(Boolean);
        return { ...r, count: items.length, top };
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [db]);

  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.map((r) => (
        <li key={r.slug}>
          <Link
            href={`/products?region=${r.slug}`}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 py-3.5 transition-colors hover:bg-cream-50 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:px-2"
          >
            <span className="font-semibold text-ink-900 group-hover:text-forest-800">{r.name}</span>
            <span className="col-start-1 row-start-2 truncate text-sm text-ink-500 sm:col-start-2 sm:row-start-1">{r.top.join(", ")}</span>
            <span className="row-span-2 flex items-center gap-2 text-sm text-ink-600 sm:row-span-1">
              <span className="tabular-nums">{r.count} განცხადება</span>
              <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-forest-700" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
