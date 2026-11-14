/**
 * PROTOTYPE-ONLY persistence.
 *
 * The whole demo "database" lives in one localStorage document, so every
 * change (new listing, favorite, demo account) stays in this browser only.
 * Nothing is sent to a server. Replace this module with real API calls when a
 * backend exists — components only talk to the service functions and hooks.
 */
import { seedProducts } from "@/lib/data/products";
import { seedSellers } from "@/lib/data/sellers";
import { DEMO_PASSWORD, demoHash } from "@/lib/services/demo-hash";
import type { Product, Seller, SessionUser, StoredUser } from "@/lib/types";

const STORAGE_KEY = "agromo-demo-db";
const VERSION = 1;

export interface DemoDB {
  version: number;
  products: Product[];
  sellers: Seller[];
  users: StoredUser[];
  /** userId (or "guest") -> product ids, newest first */
  favorites: Record<string, string[]>;
  sessionUserId: string | null;
}

export interface Snapshot {
  db: DemoDB;
  /** false while rendering on the server / before the browser store is read. */
  ready: boolean;
}

export const DEMO_FARMER_EMAIL = "farmer@agromo.demo";
export const DEMO_BUYER_EMAIL = "buyer@agromo.demo";
export { DEMO_PASSWORD };

function createSeedDB(): DemoDB {
  return {
    version: VERSION,
    products: seedProducts,
    sellers: seedSellers,
    users: [
      {
        id: "u-demo-farmer",
        email: DEMO_FARMER_EMAIL,
        name: "ნიკოლოზ მამულაშვილი",
        role: "farmer",
        sellerId: "s-mamulashvili",
        passwordHash: demoHash(DEMO_FARMER_EMAIL, DEMO_PASSWORD),
        createdAt: "2023-04-02T10:00:00+04:00",
      },
      {
        id: "u-demo-buyer",
        email: DEMO_BUYER_EMAIL,
        name: "მარიამ კაპანაძე",
        role: "buyer",
        sellerId: null,
        passwordHash: demoHash(DEMO_BUYER_EMAIL, DEMO_PASSWORD),
        createdAt: "2025-02-11T10:00:00+04:00",
      },
    ],
    favorites: {},
    sessionUserId: null,
  };
}

const SERVER_SNAPSHOT: Snapshot = { db: createSeedDB(), ready: false };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function isValidDB(value: unknown): value is DemoDB {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DemoDB>;
  return (
    v.version === VERSION &&
    Array.isArray(v.products) &&
    Array.isArray(v.sellers) &&
    Array.isArray(v.users) &&
    typeof v.favorites === "object" &&
    v.favorites !== null
  );
}

function readFromStorage(): DemoDB {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidDB(parsed)) return parsed;
    }
  } catch {
    // Storage blocked or corrupted: fall back to seed data for this session.
  }
  return createSeedDB();
}

function load(): Snapshot {
  if (!snapshot) snapshot = { db: readFromStorage(), ready: true };
  return snapshot;
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = { db: readFromStorage(), ready: true };
  emit();
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): Snapshot {
  return load();
}

export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export class StorageFullError extends Error {
  constructor() {
    super("ბრაუზერის მეხსიერება სავსეა. სცადეთ უფრო მცირე ზომის ფოტო ან წაშალეთ ძველი განცხადებები.");
    this.name = "StorageFullError";
  }
}

/** Applies an immutable update, persists it and notifies subscribers. */
export function commit(update: (db: DemoDB) => DemoDB): DemoDB {
  const next = update(load().db);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    if (error instanceof DOMException && /quota/i.test(error.name + error.message)) {
      throw new StorageFullError();
    }
    // Private mode etc.: keep the change in memory for this tab.
  }
  snapshot = { db: next, ready: true };
  emit();
  return next;
}

export function resetDemoData() {
  commit(() => createSeedDB());
}

// ---------- Shared selectors ----------

export function toSessionUser(user: StoredUser): SessionUser {
  const { passwordHash: _omit, ...rest } = user;
  void _omit;
  return rest;
}

export function selectSessionUser(db: DemoDB): SessionUser | null {
  const user = db.users.find((u) => u.id === db.sessionUserId);
  return user ? toSessionUser(user) : null;
}

/** Simulated network latency for mutations, so pending states are observable. */
export function simulateLatency(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}
