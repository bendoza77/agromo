import type { Metadata } from "next";
import { ProfileSettings } from "@/components/dashboard/profile-settings";

export const metadata: Metadata = { title: "პროფილი" };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

export default function DashboardProfilePage() {
  return <ProfileSettings />;
}
