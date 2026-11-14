import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SellerList } from "@/components/seller/seller-list";

export const metadata: Metadata = {
  title: "ფერმერები",
  description: "ფერმერები და მცირე მეურნეობები, რომლებიც Agromo-ზე ყიდიან პროდუქციას.",
};

export default function FarmersPage() {
  return (
    <>
      <PageHeader
        title="ფერმერები"
        description="მეურნეობები, რომლებიც Agromo-ზე პროდუქციას თავად ათავსებენ. გახსენით პროფილი, ნახეთ მათი განცხადებები და დაუკავშირდით პირდაპირ."
        crumbs={[{ href: "/", label: "მთავარი" }, { label: "ფერმერები" }]}
        actions={
          <Link href="/register?role=farmer" className="btn btn-secondary">
            ფერმერად რეგისტრაცია
          </Link>
        }
      />
      <div className="container-page py-10">
        <SellerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      </div>
    </>
  );
}
