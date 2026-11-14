import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "შესვლა" };

export default function LoginPage() {
  return (
    <AuthShell
      title="შესვლა"
      description="შედით, რომ მართოთ განცხადებები ან ნახოთ შენახული პროდუქცია."
      image="/images/photos/vineyard-rows.jpg"
      imageAlt="ვენახის რიგები ზაფხულში"
      caption="ფერმერები Agromo-ზე განცხადებებს თავად მართავენ — ფასს, რაოდენობას და ხელმისაწვდომობას."
    >
      <Suspense fallback={<div className="skeleton h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
