import { getCategory, getRegion, isCategorySlug, isRegionSlug } from "@/lib/data/taxonomy";
import type { Product, ProductFilters, RegionSlug, Seller, SortKey } from "@/lib/types";

export const DEFAULT_FILTERS: ProductFilters = {
  q: "",
  category: null,
  regions: [],
  minPrice: null,
  maxPrice: null,
  availableOnly: false,
  sort: "newest",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "ახალი ჯერ" },
  { value: "price-asc", label: "ფასი: ზრდადობით" },
  { value: "price-desc", label: "ფასი: კლებადობით" },
];

/**
 * Unicode-aware normalization: NFC, lower-case (also maps Georgian Mtavruli
 * capitals to Mkhedruli), collapses whitespace and strips most punctuation.
 * This is matching-friendly normalization, not linguistic stemming.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[„“"'«»().,;:!?—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(product: Product, seller: Seller | undefined): string {
  return normalizeText(
    [
      product.title,
      product.description,
      getCategory(product.category)?.name,
      getRegion(product.region)?.name,
      product.locality,
      seller?.name,
      seller?.ownerName,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Every whitespace-separated term must appear somewhere in the product's text. */
export function matchesQuery(product: Product, seller: Seller | undefined, query: string): boolean {
  const terms = normalizeText(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack(product, seller);
  return terms.every((t) => text.includes(t));
}

export function filterProducts(
  products: Product[],
  sellersById: Map<string, Seller>,
  filters: ProductFilters,
): Product[] {
  const result = products.filter((p) => {
    if (p.status !== "published") return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.regions.length > 0 && !filters.regions.includes(p.region)) return false;
    if (filters.availableOnly && p.availability !== "available") return false;
    if (filters.minPrice !== null && (p.price === null || p.price < filters.minPrice)) return false;
    if (filters.maxPrice !== null && (p.price === null || p.price > filters.maxPrice)) return false;
    return matchesQuery(p, sellersById.get(p.sellerId), filters.q);
  });
  return sortProducts(result, filters.sort);
}

/** Listings without a price always sort after priced ones. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  const byNewest = (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt);
  if (sort === "newest") return copy.sort(byNewest);
  const dir = sort === "price-asc" ? 1 : -1;
  return copy.sort((a, b) => {
    if (a.price === null && b.price === null) return byNewest(a, b);
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return (a.price - b.price) * dir || byNewest(a, b);
  });
}

// ---------- URL <-> filters ----------

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function filtersFromSearchParams(params: URLSearchParams): ProductFilters {
  const category = params.get("category");
  const sort = params.get("sort");
  const regions = (params.get("region") ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is RegionSlug => isRegionSlug(r));
  return {
    q: params.get("q") ?? "",
    category: category && isCategorySlug(category) ? category : null,
    regions: Array.from(new Set(regions)),
    minPrice: parsePrice(params.get("min")),
    maxPrice: parsePrice(params.get("max")),
    availableOnly: params.get("available") === "1",
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "newest",
  };
}

export function filtersToSearchParams(filters: ProductFilters, omitCategory = false): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q) params.set("q", q);
  if (filters.category && !omitCategory) params.set("category", filters.category);
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.availableOnly) params.set("available", "1");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  return params;
}

export function countActiveFilters(filters: ProductFilters, ignoreCategory = false): number {
  return (
    (filters.category && !ignoreCategory ? 1 : 0) +
    filters.regions.length +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  );
}
