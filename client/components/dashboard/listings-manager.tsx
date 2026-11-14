"use client";

import { ExternalLink, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardTitle, FarmerOnly, type FarmerUser } from "@/components/dashboard/farmer-only";
import { ProductImage } from "@/components/product/product-image";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { availabilityLabels, getCategory } from "@/lib/data/taxonomy";
import { formatDate, formatPrice, formatQuantity, unitShort } from "@/lib/format";
import { useStore } from "@/lib/hooks";
import { normalizeText } from "@/lib/search";
import { errorMessage } from "@/lib/services/errors";
import { deleteProduct, getProductsBySeller, updateProduct } from "@/lib/services/products";
import type { Availability, ListingStatus, Product } from "@/lib/types";

type Tab = "all" | ListingStatus;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "ყველა" },
  { value: "published", label: "გამოქვეყნებული" },
  { value: "hidden", label: "დამალული" },
];

export function ListingsManager() {
  return <FarmerOnly>{(user) => <Listings user={user} />}</FarmerOnly>;
}

function Listings({ user }: { user: FarmerUser }) {
  const { db } = useStore();
  const all = useMemo(() => getProductsBySeller(db, user.sellerId, { includeHidden: true }), [db, user.sellerId]);

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts: Record<Tab, number> = {
    all: all.length,
    published: all.filter((p) => p.status === "published").length,
    hidden: all.filter((p) => p.status === "hidden").length,
  };

  const q = normalizeText(query);
  const rows = all.filter((p) => (tab === "all" || p.status === tab) && (!q || normalizeText(p.title).includes(q)));

  async function run(id: string, action: () => Promise<unknown>, success: string) {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  const toggleStatus = (p: Product) => {
    const next: ListingStatus = p.status === "published" ? "hidden" : "published";
    void run(
      p.id,
      () => updateProduct(p.id, { status: next }, 250),
      next === "published" ? `„${p.title}“ გამოქვეყნდა.` : `„${p.title}“ დაიმალა — მყიდველები მას ვეღარ ნახავენ.`,
    );
  };

  const changeAvailability = (p: Product, availability: Availability) => {
    void run(
      p.id,
      () => updateProduct(p.id, { availability }, 250),
      `„${p.title}“ — ${availabilityLabels[availability].toLowerCase()}.`,
    );
  };

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      toast.success(`„${toDelete.title}“ წაიშალა.`);
      setToDelete(null);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const rowProps = { busy, onToggleStatus: toggleStatus, onAvailability: changeAvailability, onDelete: setToDelete };

  return (
    <>
      <DashboardTitle
        title="ჩემი განცხადებები"
        description="შეცვალეთ ხელმისაწვდომობა, დამალეთ ან განაახლეთ განცხადებები. ცვლილებები მარკეტპლეისზე მაშინვე აისახება."
        actions={
          <Link href="/dashboard/products/new" className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden />
            ახალი განცხადება
          </Link>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          icon={Package}
          title="ჯერ განცხადება არ გაქვთ"
          actions={
            <Link href="/dashboard/products/new" className="btn btn-primary">
              პირველი განცხადების დამატება
            </Link>
          }
        >
          დაამატეთ პროდუქტი ფოტოთი, ფასით და რაოდენობით — გამოქვეყნებისთანავე გამოჩნდება მარკეტპლეისზე.
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="სტატუსის ფილტრი" className="flex gap-1 overflow-x-auto rounded-lg bg-cream-200 p-1 [scrollbar-width:none]">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                    tab === t.value ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900",
                  )}
                >
                  {t.label}
                  <span className="tabular-nums text-ink-500">{counts[t.value]}</span>
                </button>
              ))}
            </div>
            <label className="relative block md:w-64">
              <span className="sr-only">განცხადებებში ძიება</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ძიება სათაურით"
                className="input min-h-10 py-2 pl-9"
              />
            </label>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong bg-cream-50 p-6 text-center text-[0.9375rem] text-ink-600">
              ამ ფილტრით განცხადება ვერ მოიძებნა.
            </p>
          ) : (
            <>
              {/* Wide screens: a real table. */}
              <div className="hidden overflow-hidden rounded-xl border border-line bg-white xl:block">
                <table className="w-full table-fixed text-left text-[0.9375rem]">
                  <caption className="sr-only">ჩემი განცხადებები</caption>
                  <colgroup>
                    <col />
                    <col className="w-28" />
                    <col className="w-56" />
                    <col className="w-40" />
                    <col className="w-32" />
                  </colgroup>
                  <thead className="border-b border-line bg-cream-50 text-sm text-ink-600">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        პროდუქტი
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        ფასი
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        ხელმისაწვდომობა
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        სტატუსი
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold">
                        <span className="sr-only">მოქმედებები</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((p) => (
                      <TableRow key={p.id} product={p} {...rowProps} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones, tablets and narrow laptops: stacked list. */}
              <ul className="space-y-3 xl:hidden">
                {rows.map((p) => (
                  <ListRow key={p.id} product={p} {...rowProps} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="წავშალოთ განცხადება?"
        description={
          <>
            „<span className="font-semibold text-ink-900">{toDelete?.title}</span>“ სამუდამოდ წაიშლება და მყიდველების რჩეულებიდანაც
            გაქრება. თუ მხოლოდ დროებით გსურთ მოხსნა, უმჯობესია განცხადება დამალოთ.
          </>
        }
        confirmLabel={deleting ? "იშლება…" : "წაშლა"}
        tone="danger"
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

interface RowProps {
  product: Product;
  busy: Record<string, boolean>;
  onToggleStatus: (p: Product) => void;
  onAvailability: (p: Product, a: Availability) => void;
  onDelete: (p: Product) => void;
}

function PriceCell({ product: p }: { product: Product }) {
  return p.price === null ? (
    <span className="text-ink-500">შეთანხმებით</span>
  ) : (
    <span className="font-semibold tabular-nums text-ink-900">
      {formatPrice(p.price)} <span className="font-normal text-ink-500">/ {unitShort(p.unit)}</span>
    </span>
  );
}

function AvailabilitySelect({ product: p, busy, onAvailability }: Pick<RowProps, "product" | "busy" | "onAvailability">) {
  return (
    <select
      aria-label={`„${p.title}“ — ხელმისაწვდომობა`}
      value={p.availability}
      disabled={busy[p.id]}
      onChange={(e) => onAvailability(p, e.target.value as Availability)}
      className="input min-h-9 w-full py-1.5 text-sm"
    >
      {(Object.keys(availabilityLabels) as Availability[]).map((a) => (
        <option key={a} value={a}>
          {availabilityLabels[a]}
        </option>
      ))}
    </select>
  );
}

function StatusSwitch({ product: p, busy, onToggleStatus }: Pick<RowProps, "product" | "busy" | "onToggleStatus">) {
  const on = p.status === "published";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`„${p.title}“ — გამოქვეყნება`}
      disabled={busy[p.id]}
      onClick={() => onToggleStatus(p)}
      className="group inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-ink-700 disabled:opacity-60"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-forest-700" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-[1.125rem]" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {busy[p.id] && <Spinner className="h-3.5 w-3.5" />}
        {on ? "ჩანს" : "დამალულია"}
      </span>
    </button>
  );
}

function RowActions({ product: p, onDelete, compact }: Pick<RowProps, "product" | "onDelete"> & { compact?: boolean }) {
  const iconBtn = "grid h-9 w-9 place-items-center rounded-md text-ink-600 transition-colors hover:bg-cream-200 hover:text-ink-900";
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={`/dashboard/products/${p.id}/edit`} className="btn btn-secondary btn-sm flex-1">
          <Pencil className="h-4 w-4" aria-hidden />
          რედაქტირება
        </Link>
        <Link href={`/products/${p.id}`} className="btn btn-ghost btn-sm" aria-label={`„${p.title}“ — ნახვა მარკეტპლეისზე`}>
          <ExternalLink className="h-4 w-4" aria-hidden />
          ნახვა
        </Link>
        <button
          type="button"
          onClick={() => onDelete(p)}
          className="btn btn-ghost btn-sm text-danger-700 hover:!bg-danger-50 hover:!text-danger-700"
          aria-label={`„${p.title}“ — წაშლა`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          წაშლა
        </button>
      </div>
    );
  }
  return (
    <div className="flex justify-end gap-1">
      <Link href={`/products/${p.id}`} className={iconBtn} aria-label={`„${p.title}“ — ნახვა მარკეტპლეისზე`} title="ნახვა">
        <ExternalLink className="h-4 w-4" aria-hidden />
      </Link>
      <Link href={`/dashboard/products/${p.id}/edit`} className={iconBtn} aria-label={`„${p.title}“ — რედაქტირება`} title="რედაქტირება">
        <Pencil className="h-4 w-4" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(p)}
        className={cn(iconBtn, "hover:bg-danger-50 hover:text-danger-700")}
        aria-label={`„${p.title}“ — წაშლა`}
        title="წაშლა"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function ProductCellHead({ product: p }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
        <ProductImage src={p.image} alt="" sizes="48px" />
      </span>
      <div className="min-w-0">
        <Link href={`/dashboard/products/${p.id}/edit`} className="line-clamp-2 font-semibold leading-snug text-ink-900 hover:text-forest-800 hover:underline">
          {p.title}
        </Link>
        <p className="mt-0.5 text-sm text-ink-500">
          {getCategory(p.category)?.name}
          {p.quantity !== null && ` · ${formatQuantity(p.quantity, p.unit)}`}
          {` · ${formatDate(p.updatedAt, false)}`}
        </p>
      </div>
    </div>
  );
}

function TableRow(props: RowProps) {
  const p = props.product;
  return (
    <tr className={cn("align-middle", p.status === "hidden" && "bg-cream-50/60")}>
      <td className="px-3 py-3">
        <ProductCellHead product={p} />
      </td>
      <td className="px-3 py-3">
        <PriceCell product={p} />
      </td>
      <td className="px-3 py-3">
        <AvailabilitySelect {...props} />
      </td>
      <td className="px-3 py-3">
        <StatusSwitch {...props} />
      </td>
      <td className="px-3 py-3">
        <RowActions {...props} />
      </td>
    </tr>
  );
}

function ListRow(props: RowProps) {
  const p = props.product;
  return (
    <li className={cn("rounded-xl border border-line bg-white p-4", p.status === "hidden" && "bg-cream-50")}>
      <ProductCellHead product={p} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
        <PriceCell product={p} />
        <StatusSwitch {...props} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-center">
        <AvailabilitySelect {...props} />
        <RowActions {...props} compact />
      </div>
    </li>
  );
}
