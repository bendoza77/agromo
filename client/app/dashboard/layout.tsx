import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: { default: "პანელი", template: "%s · პანელი · Agromo" },
  robots: { index: false },
};

/**
 * Dashboard content depends on the browser-only demo session, so the shell
 * renders a skeleton on the server and Next.js can't validate the segments
 * below it. Opt out of instant-navigation validation for this subtree.
 */
export const instant = false;

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
