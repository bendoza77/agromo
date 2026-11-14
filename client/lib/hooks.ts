"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, selectSessionUser, subscribe, type Snapshot } from "@/lib/services/db";
import { getFavoriteIds } from "@/lib/services/favorites";
import type { Seller } from "@/lib/types";

/**
 * Reads the demo store. On the server (and during hydration) this returns the
 * seed data with `ready: false`; React then re-renders with browser data.
 */
export function useStore(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSession() {
  const { db, ready } = useStore();
  const user = useMemo(() => selectSessionUser(db), [db]);
  return { user, ready };
}

export function useSellersById(): Map<string, Seller> {
  const { db } = useStore();
  return useMemo(() => new Map(db.sellers.map((s) => [s.id, s])), [db.sellers]);
}

/**
 * Sets the tab title for content that only exists in the browser's demo store
 * (e.g. listings created in this browser), which server metadata can't name.
 * Pass null while data is still loading to keep the server-rendered title.
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

export function useFavoriteIds(): Set<string> {
  const { db } = useStore();
  return useMemo(() => new Set(getFavoriteIds(db)), [db]);
}
