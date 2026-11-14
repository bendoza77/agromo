import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

// The layout's title template only applies to nested segments, so spell it out here.
export const metadata: Metadata = { title: { absolute: "მიმოხილვა · პანელი · Agromo" } };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

export default function DashboardPage() {
  return <DashboardOverview />;
}
