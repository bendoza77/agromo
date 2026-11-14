import { Sprout } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "გვერდი ვერ მოიძებნა" };

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <h1 className="sr-only">404 — გვერდი ვერ მოიძებნა</h1>
      <EmptyState
        icon={Sprout}
        title="გვერდი ვერ მოიძებნა"
        actions={
          <>
            <Link href="/products" className="btn btn-primary">
              პროდუქციის დათვალიერება
            </Link>
            <Link href="/" className="btn btn-secondary">
              მთავარი გვერდი
            </Link>
          </>
        }
      >
        ბმული შესაძლოა მოძველებულია ან გვერდი წაიშალა.
      </EmptyState>
    </div>
  );
}
