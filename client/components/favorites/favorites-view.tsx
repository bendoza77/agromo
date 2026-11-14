"use client";

import { Heart, LogIn } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "@/components/product/product-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { clearFavorites, getFavoriteIds } from "@/lib/services/favorites";
import { useSellersById, useSession, useStore } from "@/lib/hooks";

export function FavoritesView() {
  const { db, ready } = useStore();
  const { user } = useSession();
  const sellers = useSellersById();
  const [confirmClear, setConfirmClear] = useState(false);

  // Saved ids are kept newest-first; listings that were deleted are skipped,
  // hidden ones are shown separately so the buyer understands why they vanished.
  const { visible, unavailable } = useMemo(() => {
    const byId = new Map(db.products.map((p) => [p.id, p]));
    const saved = getFavoriteIds(db)
      .map((id) => byId.get(id))
      .filter((p) => p !== undefined);
    return {
      visible: saved.filter((p) => p.status === "published"),
      unavailable: saved.filter((p) => p.status !== "published").length,
    };
  }, [db]);

  if (!ready) {
    return (
      <div aria-busy="true" aria-label="იტვირთება">
        <ProductGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ProductGrid>
      </div>
    );
  }

  function clearAll() {
    clearFavorites();
    setConfirmClear(false);
    toast.success("რჩეულები გასუფთავდა.");
  }

  return (
    <>
      {!user && (
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-[0.9375rem] text-ink-700">
            <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" aria-hidden />
            <span>
              თქვენ არ ხართ შესული. რჩეულები ინახება ამ ბრაუზერში და ანგარიშზე შესვლისას ავტომატურად გადავა თქვენს
              ანგარიშზე.
            </span>
          </p>
          <Link href="/login?next=%2Ffavorites" className="btn btn-secondary btn-sm shrink-0">
            შესვლა
          </Link>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="რჩეულები ცარიელია"
          actions={
            <Link href="/products" className="btn btn-primary">
              პროდუქციის დათვალიერება
            </Link>
          }
        >
          განცხადებაზე გულის ნიშანს დააჭირეთ — შენახული პროდუქცია აქ გამოჩნდება, რომ მოგვიანებით მარტივად იპოვოთ და
          დაუკავშირდეთ გამყიდველს.
        </EmptyState>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.9375rem] text-ink-600" aria-live="polite">
              <span className="font-semibold text-ink-900">{visible.length}</span> შენახული განცხადება
            </p>
            <button type="button" onClick={() => setConfirmClear(true)} className="btn btn-ghost btn-sm">
              ყველას ამოშლა
            </button>
          </div>
          <ProductGrid>
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} seller={sellers.get(p.sellerId)} />
            ))}
          </ProductGrid>
        </>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="ამოვშალოთ ყველა რჩეული?"
        description={`რჩეულებიდან ამოიშლება ${visible.length} განცხადება. თავად განცხადებები მარკეტპლეისზე დარჩება.`}
        confirmLabel="ყველას ამოშლა"
        tone="danger"
        onConfirm={clearAll}
        onCancel={() => setConfirmClear(false)}
      />

      {unavailable > 0 && (
        <p className="mt-8 text-sm text-ink-500">
          {unavailable} შენახული განცხადება გამყიდველმა დროებით დამალა და ამიტომ არ ჩანს.
        </p>
      )}
    </>
  );
}
