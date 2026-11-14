import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { getRegion } from "@/lib/data/taxonomy";
import type { Seller } from "@/lib/types";

export function SellerCard({ seller, productCount, highlights }: { seller: Seller; productCount: number; highlights: string[] }) {
  const region = getRegion(seller.region)?.name;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="relative h-28 bg-forest-800">
        {seller.coverImage ? (
          <Image src={seller.coverImage} alt="" fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(170deg,transparent_0_18px,rgb(255_255_255/0.06)_18px_19px)]" />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <SellerAvatar id={seller.id} name={seller.ownerName} size="lg" className="pointer-events-none relative z-10 -mt-7 ring-4 ring-white" />
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900">
          <Link href={`/farmers/${seller.id}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-forest-800">
            {seller.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          <span className="truncate">
            {region}
            {seller.locality ? ` · ${seller.locality.split(",")[0]}` : ""}
          </span>
        </p>
        {highlights.length > 0 && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-700">{highlights.join(" · ")}</p>
        )}
        <p className="mt-auto pt-4 text-sm font-semibold text-forest-700">
          {productCount > 0 ? `${productCount} აქტიური განცხადება` : "აქტიური განცხადება არ არის"}
        </p>
      </div>
    </article>
  );
}
