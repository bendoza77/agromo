import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = { title: "მიმოხილვა" };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

export default function DashboardPage() {
  return <DashboardOverview />;
}
