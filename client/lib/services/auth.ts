/**
 * PROTOTYPE-ONLY authentication. Accounts and the "session" are stored in the
 * browser (see db.ts). There is no server, no email verification and no real
 * security — this only demonstrates the user flows.
 */
import { commit, createId, getSnapshot, selectSessionUser, simulateLatency, toSessionUser, type DemoDB } from "@/lib/services/db";
import { demoHash } from "@/lib/services/demo-hash";
import { ServiceError } from "@/lib/services/errors";
import type { RegionSlug, Role, SessionUser } from "@/lib/types";

export interface RegisterInput {
  role: Role;
  name: string;
  email: string;
  password: string;
  farmName?: string;
  region?: RegionSlug;
  locality?: string;
  phone?: string;
  whatsapp?: boolean;
}

/** Moves favorites saved while logged out into the account. */
function mergeGuestFavorites(db: DemoDB, userId: string): DemoDB["favorites"] {
  const guest = db.favorites.guest ?? [];
  if (guest.length === 0) return db.favorites;
  const own = db.favorites[userId] ?? [];
  const merged = [...guest, ...own.filter((id) => !guest.includes(id))];
  const { guest: _drop, ...rest } = db.favorites;
  void _drop;
  return { ...rest, [userId]: merged };
}

export function getCurrentUser(): SessionUser | null {
  return selectSessionUser(getSnapshot().db);
}

export async function login(email: string, password: string): Promise<SessionUser> {
  await simulateLatency();
  const normalized = email.trim().toLowerCase();
  const user = getSnapshot().db.users.find((u) => u.email === normalized);
  if (!user) {
    throw new ServiceError("invalid_credentials", "ამ ელფოსტით ანგარიში ვერ მოიძებნა.", "email");
  }
  if (user.passwordHash !== demoHash(normalized, password)) {
    throw new ServiceError("invalid_credentials", "პაროლი არასწორია.", "password");
  }
  commit((db) => ({ ...db, sessionUserId: user.id, favorites: mergeGuestFavorites(db, user.id) }));
  return toSessionUser(user);
}

export async function register(input: RegisterInput): Promise<SessionUser> {
  await simulateLatency(600);
  const email = input.email.trim().toLowerCase();
  if (getSnapshot().db.users.some((u) => u.email === email)) {
    throw new ServiceError("conflict", "ამ ელფოსტით ანგარიში უკვე არსებობს. სცადეთ შესვლა.", "email");
  }

  const userId = createId("u");
  const sellerId = input.role === "farmer" ? createId("s") : null;
  const now = new Date().toISOString();

  commit((db) => {
    const sellers =
      input.role === "farmer" && sellerId
        ? [
            ...db.sellers,
            {
              id: sellerId,
              name: input.farmName?.trim() || input.name.trim(),
              ownerName: input.name.trim(),
              region: input.region ?? "tbilisi",
              locality: input.locality?.trim() ?? "",
              description: "",
              phone: input.phone?.trim() || null,
              whatsapp: Boolean(input.phone?.trim() && input.whatsapp),
              memberSince: new Date().getFullYear(),
              coverImage: null,
            },
          ]
        : db.sellers;
    const users = [
      ...db.users,
      {
        id: userId,
        email,
        name: input.name.trim(),
        role: input.role,
        sellerId,
        passwordHash: demoHash(email, input.password),
        createdAt: now,
      },
    ];
    return { ...db, sellers, users, sessionUserId: userId, favorites: mergeGuestFavorites(db, userId) };
  });

  const created = getCurrentUser();
  if (!created) throw new ServiceError("storage", "ანგარიშის შექმნა ვერ მოხერხდა.");
  return created;
}

export function logout() {
  commit((db) => ({ ...db, sessionUserId: null }));
}

export async function updateAccountName(name: string): Promise<void> {
  await simulateLatency(350);
  const user = getCurrentUser();
  if (!user) throw new ServiceError("unauthenticated", "გთხოვთ, შეხვიდეთ ანგარიშზე.");
  commit((db) => ({
    ...db,
    users: db.users.map((u) => (u.id === user.id ? { ...u, name: name.trim() } : u)),
  }));
}
