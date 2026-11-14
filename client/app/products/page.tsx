import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Marketplace, MarketplaceSkeleton } from "@/components/marketplace/marketplace";

export const metadata: Metadata = {
  title: "პროდუქცია",
  description: "ქართული აგროპროდუქცია ფერმერებისგან — ძიება კატეგორიის, რეგიონისა და ფასის მიხედვით.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="პროდუქცია"
        description="ყველა განცხადება ერთ სივრცეში. გაფილტრეთ კატეგორიით, რეგიონით და ფასით, შემდეგ დაუკავშირდით გამყიდველს პირდაპირ."
        crumbs={[{ href: "/", label: "მთავარი" }, { label: "პროდუქცია" }]}
      />
      <div className="container-page py-8 sm:py-10">
        {/* useSearchParams lives below this boundary, so the page shell stays prerendered. */}
        <Suspense fallback={<MarketplaceSkeleton />}>
          <Marketplace basePath="/products" />
        </Suspense>
      </div>
    </>
  );
}
