import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "რჩეულები", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        title="რჩეულები"
        description="შენახული განცხადებები ერთ ადგილას — დაბრუნდით მათთან და დაუკავშირდით გამყიდველს, როცა მზად იქნებით."
        crumbs={[{ href: "/", label: "მთავარი" }, { label: "რჩეულები" }]}
      />
      <div className="container-page py-8 sm:py-10">
        <FavoritesView />
      </div>
    </>
  );
}
