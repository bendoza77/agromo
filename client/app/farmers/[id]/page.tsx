import type { Metadata } from "next";
import { Suspense } from "react";
import { SellerProfile } from "@/components/seller/seller-profile";
import { seedSellers } from "@/lib/data/sellers";

export function generateStaticParams() {
  return seedSellers.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/farmers/[id]">): Promise<Metadata> {
  const { id } = await params;
  const seller = seedSellers.find((s) => s.id === id);
  return seller ? { title: seller.name, description: seller.description.slice(0, 155) } : { title: "ფერმერი" };
}

export default function FarmerPage({ params }: PageProps<"/farmers/[id]">) {
  // Farmer accounts registered in the browser aren't known at build time.
  return (
    <Suspense fallback={<div className="container-page py-10"><div className="skeleton h-72" aria-busy="true" aria-label="იტვირთება" /></div>}>
      {params.then(({ id }) => (
        <SellerProfile id={id} />
      ))}
    </Suspense>
  );
}
