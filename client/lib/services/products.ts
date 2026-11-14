/**
 * PROTOTYPE-ONLY product service backed by the local demo DB.
 * Ownership is enforced here (not only in the UI), but because it runs in the
 * browser it is a demonstration of the rule, not real authorization.
 */
import { commit, createId, getSnapshot, selectSessionUser, simulateLatency, type DemoDB } from "@/lib/services/db";
import { ServiceError } from "@/lib/services/errors";
import type { Product, ProductInput, Seller, SessionUser } from "@/lib/types";

// ---------- Reads (pure, work on any snapshot) ----------

export function getProducts(db: DemoDB, { includeHidden = false } = {}): Product[] {
  return includeHidden ? db.products : db.products.filter((p) => p.status === "published");
}

export function getProductById(db: DemoDB, id: string): Product | undefined {
  return db.products.find((p) => p.id === id);
}

export function getProductsBySeller(db: DemoDB, sellerId: string, { includeHidden = false } = {}): Product[] {
  return db.products
    .filter((p) => p.sellerId === sellerId && (includeHidden || p.status === "published"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSellerById(db: DemoDB, id: string): Seller | undefined {
  return db.sellers.find((s) => s.id === id);
}

export function canManageProduct(user: SessionUser | null, product: Product): boolean {
  return Boolean(user && user.role === "farmer" && user.sellerId === product.sellerId);
}

// ---------- Mutations ----------

function requireFarmer(): SessionUser & { sellerId: string } {
  const user = selectSessionUser(getSnapshot().db);
  if (!user) throw new ServiceError("unauthenticated", "გთხოვთ, შეხვიდეთ ანგარიშზე.");
  if (user.role !== "farmer" || !user.sellerId) {
    throw new ServiceError("forbidden", "განცხადებების მართვა მხოლოდ ფერმერის ანგარიშითაა შესაძლებელი.");
  }
  return user as SessionUser & { sellerId: string };
}

function requireOwnedProduct(id: string): Product {
  const user = requireFarmer();
  const product = getProductById(getSnapshot().db, id);
  if (!product) throw new ServiceError("not_found", "განცხადება ვერ მოიძებნა.");
  if (product.sellerId !== user.sellerId) {
    throw new ServiceError("forbidden", "ამ განცხადების შეცვლა მხოლოდ მის ავტორს შეუძლია.");
  }
  return product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await simulateLatency(600);
  const user = requireFarmer();
  const now = new Date().toISOString();
  const product: Product = { ...input, id: createId("p"), sellerId: user.sellerId, createdAt: now, updatedAt: now };
  commit((db) => ({ ...db, products: [product, ...db.products] }));
  return product;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>, latency = 500): Promise<Product> {
  await simulateLatency(latency);
  const current = requireOwnedProduct(id);
  const updated: Product = { ...current, ...patch, id: current.id, sellerId: current.sellerId, updatedAt: new Date().toISOString() };
  commit((db) => ({ ...db, products: db.products.map((p) => (p.id === id ? updated : p)) }));
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await simulateLatency(400);
  requireOwnedProduct(id);
  commit((db) => {
    const favorites = Object.fromEntries(
      Object.entries(db.favorites).map(([key, ids]) => [key, ids.filter((pid) => pid !== id)]),
    );
    return { ...db, products: db.products.filter((p) => p.id !== id), favorites };
  });
}

export async function updateSellerProfile(
  patch: Partial<Pick<Seller, "name" | "region" | "locality" | "description" | "phone" | "whatsapp">>,
): Promise<void> {
  await simulateLatency(450);
  const user = requireFarmer();
  commit((db) => ({
    ...db,
    sellers: db.sellers.map((s) => (s.id === user.sellerId ? { ...s, ...patch } : s)),
  }));
}
