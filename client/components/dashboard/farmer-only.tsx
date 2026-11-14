"use client";

import { Tractor } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "@/lib/hooks";
import type { SessionUser } from "@/lib/types";

export type FarmerUser = SessionUser & { role: "farmer"; sellerId: string };

/** Renders children only for farmer accounts; buyers get an explanation instead. */
export function FarmerOnly({ children }: { children: (user: FarmerUser) => React.ReactNode }) {
  const { user } = useSession();
  if (!user) return null; // DashboardShell handles the logged-out state.
  if (user.role !== "farmer" || !user.sellerId) {
    return (
      <EmptyState
        icon={Tractor}
        title="ეს გვერდი ფერმერებისთვისაა"
        actions={
          <>
            <Link href="/dashboard" className="btn btn-primary">
              ჩემს ანგარიშზე
            </Link>
            <Link href="/products" className="btn btn-secondary">
              პროდუქციის დათვალიერება
            </Link>
          </>
        }
      >
        განცხადებების დამატება და მართვა ფერმერის ანგარიშითაა შესაძლებელი. თქვენ შესული ხართ მყიდველის ანგარიშით.
      </EmptyState>
    );
  }
  return <>{children(user as FarmerUser)}</>;
}

export function DashboardTitle({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-forest-900">{title}</h1>
        {description && <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-600">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
