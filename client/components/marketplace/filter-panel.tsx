"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { categories, regions } from "@/lib/data/taxonomy";
import type { ProductFilters, RegionSlug } from "@/lib/types";

interface FilterPanelProps {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
  /** Category fixed by the route (category pages). */
  lockedCategory?: boolean;
  /** Listing counts per region for the current non-region filters. */
  regionCounts: Map<RegionSlug, number>;
}

export function FilterPanel({ filters, onChange, lockedCategory, regionCounts }: FilterPanelProps) {
  const uid = useId();

  return (
    <div className="space-y-7">
      {!lockedCategory && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-ink-900">კატეგორია</legend>
          <div className="space-y-0.5">
            <RadioRow name={`${uid}-cat`} checked={filters.category === null} onChange={() => onChange({ category: null })}>
              ყველა კატეგორია
            </RadioRow>
            {categories.map((c) => (
              <RadioRow
                key={c.slug}
                name={`${uid}-cat`}
                checked={filters.category === c.slug}
                onChange={() => onChange({ category: c.slug })}
              >
                {c.name}
              </RadioRow>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink-900">რეგიონი</legend>
        <div className="space-y-0.5">
          {regions.map((r) => {
            const count = regionCounts.get(r.slug) ?? 0;
            const checked = filters.regions.includes(r.slug);
            return (
              <label
                key={r.slug}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-[0.9375rem] text-ink-700 hover:bg-cream-200/60",
                  count === 0 && !checked && "text-ink-400",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      regions: checked ? filters.regions.filter((x) => x !== r.slug) : [...filters.regions, r.slug],
                    })
                  }
                  className="h-4 w-4 shrink-0 accent-forest-700"
                />
                <span className="min-w-0 flex-1">{r.name}</span>
                <span className="text-xs tabular-nums text-ink-400">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <PriceRange
        key={`${filters.minPrice}-${filters.maxPrice}`}
        min={filters.minPrice}
        max={filters.maxPrice}
        onApply={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
      />

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink-900">ხელმისაწვდომობა</legend>
        <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-[0.9375rem] text-ink-700 hover:bg-cream-200/60">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => onChange({ availableOnly: e.target.checked })}
            className="h-4 w-4 shrink-0 accent-forest-700"
          />
          მხოლოდ ხელმისაწვდომი ახლა
        </label>
      </fieldset>
    </div>
  );
}

function RadioRow({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-[0.9375rem] text-ink-700 hover:bg-cream-200/60",
        checked && "font-semibold text-forest-800",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-forest-700" />
      {children}
    </label>
  );
}

function PriceRange({
  min,
  max,
  onApply,
}: {
  min: number | null;
  max: number | null;
  onApply: (min: number | null, max: number | null) => void;
}) {
  const uid = useId();
  const [draftMin, setDraftMin] = useState(min === null ? "" : String(min));
  const [draftMax, setDraftMax] = useState(max === null ? "" : String(max));

  const parse = (v: string) => {
    const n = Number(v.replace(",", "."));
    return v.trim() === "" || !Number.isFinite(n) || n < 0 ? null : n;
  };
  const pMin = parse(draftMin);
  const pMax = parse(draftMax);
  const invalid = pMin !== null && pMax !== null && pMin > pMax;
  const dirty = pMin !== min || pMax !== max;

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink-900">ფასი ერთეულზე (₾)</legend>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!invalid) onApply(pMin, pMax);
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${uid}-min`} className="mb-1 block text-xs text-ink-500">
              მინ.
            </label>
            <input
              id={`${uid}-min`}
              inputMode="decimal"
              value={draftMin}
              onChange={(e) => setDraftMin(e.target.value)}
              placeholder="0"
              className="input min-h-10 py-2"
              aria-invalid={invalid}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-max`} className="mb-1 block text-xs text-ink-500">
              მაქს.
            </label>
            <input
              id={`${uid}-max`}
              inputMode="decimal"
              value={draftMax}
              onChange={(e) => setDraftMax(e.target.value)}
              placeholder="∞"
              className="input min-h-10 py-2"
              aria-invalid={invalid}
            />
          </div>
        </div>
        {invalid ? (
          <p className="text-sm text-danger-700">მინიმალური ფასი მაქსიმალურზე მეტია.</p>
        ) : (
          <p className="text-xs leading-relaxed text-ink-500">ფასის ფილტრისას „ფასი შეთანხმებით“ განცხადებები არ ჩანს.</p>
        )}
        <button type="submit" className="btn btn-secondary btn-sm w-full" disabled={!dirty || invalid}>
          ფასის გამოყენება
        </button>
      </form>
    </fieldset>
  );
}
