import type { Metadata } from "next";
import { Suspense } from "react";
import { EditProductEditor } from "@/components/dashboard/product-form";
import { seedProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "რედაქტირება" };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

/** Seed listings prerender; listings created in the browser render on request and resolve client-side. */
export function generateStaticParams() {
  return seedProducts.map((p) => ({ id: p.id }));
}

export default function EditProductPage({ params }: PageProps<"/dashboard/products/[id]/edit">) {
  return (
    <Suspense fallback={<div className="skeleton h-[32rem]" aria-busy="true" aria-label="იტვირთება" />}>
      {params.then(({ id }) => (
        <EditProductEditor id={id} />
      ))}
    </Suspense>
  );
}
