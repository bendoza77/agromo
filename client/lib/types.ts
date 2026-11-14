export type CategorySlug =
  | "fruits"
  | "vegetables"
  | "nuts"
  | "honey"
  | "dairy-eggs"
  | "grains"
  | "herbs"
  | "other";

export type RegionSlug =
  | "kakheti"
  | "imereti"
  | "guria"
  | "samegrelo"
  | "adjara"
  | "shida-kartli"
  | "kvemo-kartli"
  | "samtskhe-javakheti"
  | "racha"
  | "mtskheta-mtianeti"
  | "tbilisi";

export type Unit = "kg" | "ton" | "liter" | "piece" | "bundle" | "jar" | "dozen";

/** Whether buyers can currently get the product. */
export type Availability = "available" | "preorder" | "sold_out";

/** Whether the listing is visible in the public marketplace. */
export type ListingStatus = "published" | "hidden";

export type Role = "buyer" | "farmer";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short line used on category landing pages. */
  description: string;
  image: string;
}

export interface Region {
  slug: RegionSlug;
  name: string;
}

export interface Seller {
  id: string;
  /** Farm or business name shown publicly. */
  name: string;
  ownerName: string;
  region: RegionSlug;
  /** Village or town. */
  locality: string;
  description: string;
  /** Contact phone in any common Georgian format; may be missing. */
  phone: string | null;
  /** Seller states the number is reachable on WhatsApp. */
  whatsapp: boolean;
  /** Year the seller joined Agromo (from mock data). */
  memberSince: number;
  coverImage: string | null;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  category: CategorySlug;
  description: string;
  /** Price per unit in GEL; null means "price on request". */
  price: number | null;
  unit: Unit;
  /** Available quantity in `unit`; null when the seller did not specify. */
  quantity: number | null;
  /** Minimum order in `unit`, if the seller set one. */
  minOrder: number | null;
  region: RegionSlug;
  locality: string;
  image: string | null;
  availability: Availability;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

/** Account record kept by the mock auth service. */
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Farmers own exactly one seller profile. */
  sellerId: string | null;
  /** Non-cryptographic demo hash — never a real password. */
  passwordHash: string;
  createdAt: string;
}

/** The public view of the signed-in user (no hash). */
export type SessionUser = Omit<StoredUser, "passwordHash">;

export type ProductInput = Pick<
  Product,
  | "title"
  | "category"
  | "description"
  | "price"
  | "unit"
  | "quantity"
  | "minOrder"
  | "region"
  | "locality"
  | "image"
  | "availability"
  | "status"
>;

export type SortKey = "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  q: string;
  category: CategorySlug | null;
  regions: RegionSlug[];
  minPrice: number | null;
  maxPrice: number | null;
  availableOnly: boolean;
  sort: SortKey;
}
