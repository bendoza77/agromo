"use client";

import { SearchX, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FilterPanel } from "@/components/marketplace/filter-panel";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategory, getRegion } from "@/lib/data/taxonomy";
import { useSellersById, useStore } from "@/lib/hooks";
import { getProducts } from "@/lib/services/products";
import {
  SORT_OPTIONS,
  countActiveFilters,
  filterProducts,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/search";
import type { CategorySlug, ProductFilters, RegionSlug, SortKey } from "@/lib/types";

const PAGE_SIZE = 12;

interface MarketplaceProps {
  basePath: string;
  lockedCategory?: CategorySlug;
}

export function Marketplace({ basePath, lockedCategory }: MarketplaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { db } = useStore();
  const sellers = useSellersById();

  const filters: ProductFilters = useMemo(() => {
    const parsed = filtersFromSearchParams(new URLSearchParams(searchParams.toString()));
    return lockedCategory ? { ...parsed, category: lockedCategory } : parsed;
  }, [searchParams, lockedCategory]);

  function update(patch: Partial<ProductFilters>) {
    const next = { ...filters, ...patch };
    const qs = filtersToSearchParams(next, Boolean(lockedCategory)).toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  function clearAll() {
    router.replace(basePath, { scroll: false });
  }

  const published = useMemo(() => getProducts(db), [db]);
  const results = useMemo(() => filterProducts(published, sellers, filters), [published, sellers, filters]);

  // Region counts ignore the region filter itself, so options stay meaningful.
  const regionCounts = useMemo(() => {
    const base = filterProducts(published, sellers, { ...filters, regions: [] });
    const map = new Map<RegionSlug, number>();
    for (const p of base) map.set(p.region, (map.get(p.region) ?? 0) + 1);
    return map;
  }, [published, sellers, filters]);

  // Reset "load more" whenever the filter set changes.
  const filterKey = filtersToSearchParams(filters).toString();
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = page.key === filterKey ? page.count : PAGE_SIZE;
  const visible = results.slice(0, visibleCount);
  const remaining = results.length - visible.length;

  const activeCount = countActiveFilters(filters, Boolean(lockedCategory));
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultsHeadingId = useId();

  return (
    <div className="grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10">
      <aside aria-label="ფილტრები" className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto pb-6 pr-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">ფილტრები</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-forest-700 hover:underline">
                გასუფთავება
              </button>
            )}
          </div>
          <FilterPanel filters={filters} onChange={update} lockedCategory={Boolean(lockedCategory)} regionCounts={regionCounts} />
        </div>
      </aside>

      <section aria-labelledby={resultsHeadingId} className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBox value={filters.q} onSearch={(q) => update({ q })} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="btn btn-secondary flex-1 lg:hidden"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              ფილტრები
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-forest-700 px-1.5 text-xs text-white">{activeCount}</span>
              )}
            </button>
            <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 id={resultsHeadingId} className="text-[0.9375rem] text-ink-600" aria-live="polite">
            <span className="font-semibold text-ink-900">{results.length}</span> განცხადება
            {filters.q.trim() && (
              <>
                {" "}
                მოთხოვნით „<span className="font-semibold text-ink-900">{filters.q.trim()}</span>“
              </>
            )}
          </h2>
          <ActiveChips filters={filters} lockedCategory={Boolean(lockedCategory)} onChange={update} onClear={clearAll} />
        </div>

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="ასეთი განცხადება ვერ მოიძებნა"
              actions={
                <>
                  {(activeCount > 0 || filters.q) && (
                    <button type="button" className="btn btn-primary" onClick={clearAll}>
                      ფილტრების გასუფთავება
                    </button>
                  )}
                  <Link href="/products" className="btn btn-secondary">
                    ყველა პროდუქცია
                  </Link>
                </>
              }
            >
              სცადეთ სხვა სიტყვა (მაგ. „თხილი“ ნაცვლად „თხილის გული“), მოხსენით რეგიონის ან ფასის ფილტრი, ან დაათვალიერეთ სხვა
              კატეგორია.
            </EmptyState>
          ) : (
            <>
              <ProductGrid variant="sidebar">
                {visible.map((p, i) => (
                  <ProductCard key={p.id} product={p} seller={sellers.get(p.sellerId)} preload={i < 3} />
                ))}
              </ProductGrid>
              {remaining > 0 && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary min-w-56"
                    onClick={() => setPage({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                  >
                    მეტის ჩვენება
                  </button>
                  <p className="text-sm text-ink-500">
                    ნაჩვენებია {visible.length} / {results.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} resultCount={results.length} onClear={clearAll} activeCount={activeCount}>
        <FilterPanel filters={filters} onChange={update} lockedCategory={Boolean(lockedCategory)} regionCounts={regionCounts} />
      </FilterSheet>
    </div>
  );
}

function SearchBox({ value, onSearch }: { value: string; onSearch: (q: string) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const onSearchRef = useRef(onSearch);
  useLayoutEffect(() => {
    onSearchRef.current = onSearch;
  });
  // Follow external URL changes (e.g. the header search) without fighting typing.
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft.trim() === value.trim()) return;
    const t = setTimeout(() => {
      setSynced(draft);
      onSearchRef.current(draft);
    }, 350);
    return () => clearTimeout(t);
  }, [draft, value]);

  return (
    <form
      role="search"
      className="relative flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        setSynced(draft);
        onSearch(draft);
      }}
    >
      <label htmlFor={id} className="sr-only">
        ძიება განცხადებებში
      </label>
      <SearchIcon />
      <input
        id={id}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="მოძებნეთ პროდუქტი, ფერმერი ან სოფელი"
        autoComplete="off"
        className="input pl-10"
      />
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const id = useId();
  return (
    <div className="flex-1 sm:flex-none">
      <label htmlFor={id} className="sr-only">
        დალაგება
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as SortKey)} className="input w-full sm:w-52">
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActiveChips({
  filters,
  lockedCategory,
  onChange,
  onClear,
}: {
  filters: ProductFilters;
  lockedCategory: boolean;
  onChange: (patch: Partial<ProductFilters>) => void;
  onClear: () => void;
}) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.category && !lockedCategory) {
    chips.push({ key: "cat", label: getCategory(filters.category)?.name ?? "", remove: () => onChange({ category: null }) });
  }
  for (const r of filters.regions) {
    chips.push({
      key: `r-${r}`,
      label: getRegion(r)?.name ?? r,
      remove: () => onChange({ regions: filters.regions.filter((x) => x !== r) }),
    });
  }
  if (filters.minPrice !== null) chips.push({ key: "min", label: `${filters.minPrice} ₾-დან`, remove: () => onChange({ minPrice: null }) });
  if (filters.maxPrice !== null) chips.push({ key: "max", label: `${filters.maxPrice} ₾-მდე`, remove: () => onChange({ maxPrice: null }) });
  if (filters.availableOnly) chips.push({ key: "av", label: "ხელმისაწვდომი", remove: () => onChange({ availableOnly: false }) });

  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="აქტიური ფილტრები">
      {chips.map((c) => (
        <li key={c.key}>
          <button
            type="button"
            onClick={c.remove}
            className="inline-flex min-h-8 items-center gap-1 rounded-md border border-line-strong bg-white py-1 pl-2.5 pr-1.5 text-sm text-ink-700 hover:border-ink-400"
            aria-label={`ფილტრის მოხსნა: ${c.label}`}
          >
            {c.label}
            <X className="h-3.5 w-3.5 text-ink-500" aria-hidden />
          </button>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <button type="button" onClick={onClear} className="text-sm font-semibold text-forest-700 hover:underline">
            ყველას მოხსნა
          </button>
        </li>
      )}
    </ul>
  );
}

/** Mobile/tablet bottom sheet on a modal <dialog>. Filters apply live. */
function FilterSheet({
  open,
  onClose,
  resultCount,
  onClear,
  activeCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  onClear: () => void;
  activeCount: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });
  useLayoutEffect(() => () => onCloseRef.current(), []);

  // The sheet is hidden at desktop widths; never leave an invisible modal open.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && onCloseRef.current();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="mb-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-2xl bg-cream-50 p-0 text-ink-900 open:[animation:sheet-in_220ms_var(--ease-out-soft)] sm:mx-auto sm:max-w-lg lg:hidden"
    >
      <div className="flex max-h-[88dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            ფილტრები
          </h2>
          <button type="button" onClick={onClose} className="btn btn-ghost h-11 w-11 p-0" aria-label="ფილტრების დახურვა">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">{children}</div>
        <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" className="btn btn-ghost" onClick={onClear} disabled={activeCount === 0}>
            გასუფთავება
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {resultCount} შედეგის ნახვა
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10" aria-busy="true" aria-label="იტვირთება">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="skeleton h-6" />
        ))}
      </div>
      <div>
        <div className="skeleton h-11 w-full" />
        <div className="skeleton mt-5 h-5 w-40" />
        <ProductGrid variant="sidebar" className="mt-6">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ProductGrid>
      </div>
    </div>
  );
}

