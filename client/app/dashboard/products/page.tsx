import type { Metadata } from "next";
import { ListingsManager } from "@/components/dashboard/listings-manager";

export const metadata: Metadata = { title: "ჩემი განცხადებები" };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

export default function DashboardProductsPage() {
  return <ListingsManager />;
}
