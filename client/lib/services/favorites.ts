import { commit, getSnapshot, type DemoDB } from "@/lib/services/db";

/** Favorites belong to the signed-in user; logged-out visitors get a "guest" list that merges on login. */
export function favoritesKey(db: DemoDB): string {
  return db.sessionUserId ?? "guest";
}

export function getFavoriteIds(db: DemoDB): string[] {
  return db.favorites[favoritesKey(db)] ?? [];
}

/** Returns the new saved state. Instant — no simulated latency for a toggle. */
export function toggleFavorite(productId: string): boolean {
  const db = getSnapshot().db;
  const key = favoritesKey(db);
  const current = db.favorites[key] ?? [];
  const saved = !current.includes(productId);
  commit((d) => ({
    ...d,
    favorites: {
      ...d.favorites,
      [key]: saved ? [productId, ...current] : current.filter((id) => id !== productId),
    },
  }));
  return saved;
}

export function clearFavorites() {
  commit((d) => ({ ...d, favorites: { ...d.favorites, [favoritesKey(d)]: [] } }));
}
