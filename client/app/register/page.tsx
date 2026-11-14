import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "რეგისტრაცია" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="ანგარიშის შექმნა"
      description="მყიდველებს ანგარიში რჩეულების შესანახად სჭირდებათ, ფერმერებს — პროდუქციის გამოსაქვეყნებლად."
      image="/images/photos/potato-harvest.jpg"
      imageAlt="კარტოფილის მოსავლის აღება მინდორში"
      caption="დარეგისტრირდით ფერმერად და მყიდველები დაგიკავშირდებიან პირდაპირ — შუამავლის გარეშე."
    >
      <Suspense fallback={<div className="skeleton h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
