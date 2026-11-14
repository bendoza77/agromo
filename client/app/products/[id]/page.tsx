import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetail, ProductDetailSkeleton } from "@/components/product/product-detail";
import { seedProducts } from "@/lib/data/products";

/**
 * Seed listings are prerendered. Listings created in the browser (demo) render
 * on request and are resolved client-side from the local demo store.
 */
export function generateStaticParams() {
  return seedProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = seedProducts.find((p) => p.id === id);
  return product
    ? { title: product.title, description: product.description.slice(0, 155) }
    : { title: "განცხადება" };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  // Ids created in the browser aren't known at build time; resolve them inside Suspense.
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      {params.then(({ id }) => (
        <ProductDetail id={id} />
      ))}
    </Suspense>
  );
}
