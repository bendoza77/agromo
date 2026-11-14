import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { Marketplace, MarketplaceSkeleton } from "@/components/marketplace/marketplace";
import { cn } from "@/lib/cn";
import { categories, getCategory } from "@/lib/data/taxonomy";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return category ? { title: category.name, description: category.description } : { title: "კატეგორია ვერ მოიძებნა" };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <div className="border-b border-line bg-cream-50">
        <div className="container-page grid items-center gap-6 py-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:py-10">
          <div className="min-w-0">
            <Breadcrumbs
              items={[{ href: "/", label: "მთავარი" }, { href: "/products", label: "პროდუქცია" }, { label: category.name }]}
              className="mb-4"
            />
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-forest-900 sm:text-[2.125rem]">{category.name}</h1>
            <p className="mt-2 max-w-2xl text-[1rem] leading-relaxed text-ink-600">{category.description}</p>
          </div>
          <div className="relative hidden aspect-[4/3] w-48 overflow-hidden rounded-lg bg-cream-200 sm:block lg:w-60">
            <Image src={category.image} alt="" fill preload sizes="240px" className="object-cover" />
          </div>
        </div>
        <nav aria-label="სხვა კატეგორიები" className="container-page -mb-px overflow-x-auto [scrollbar-width:none]">
          <ul className="flex gap-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  aria-current={c.slug === category.slug ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                    c.slug === category.slug
                      ? "border-forest-700 text-forest-800"
                      : "border-transparent text-ink-600 hover:border-line-strong hover:text-ink-900",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-page py-8 sm:py-10">
        <Suspense fallback={<MarketplaceSkeleton />}>
          <Marketplace basePath={`/categories/${category.slug}`} lockedCategory={category.slug} />
        </Suspense>
      </div>
    </>
  );
}
