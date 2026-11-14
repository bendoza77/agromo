import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data/taxonomy";

/** Compact, scrollable on phones; one row of eight on desktop. */
export function CategoryStrip() {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-8 lg:gap-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => (
        <li key={c.slug} className="w-[7.5rem] shrink-0 snap-start lg:w-auto">
          <Link href={`/categories/${c.slug}`} className="group block rounded-lg">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-cream-200">
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 140px, 120px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </span>
            <span className="mt-2 block text-[0.9375rem] font-semibold leading-snug text-ink-900 group-hover:text-forest-800">
              {c.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
