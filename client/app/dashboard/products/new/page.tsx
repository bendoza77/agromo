import type { Metadata } from "next";
import { NewProductEditor } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "ახალი განცხადება" };

// Session-gated client content; see app/dashboard/layout.tsx.
export const instant = false;

export default function NewProductPage() {
  return <NewProductEditor />;
}
