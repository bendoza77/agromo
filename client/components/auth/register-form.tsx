"use client";

import { CircleAlert, ShoppingBasket, Tractor } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useRef, useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { regions } from "@/lib/data/taxonomy";
import { useSession } from "@/lib/hooks";
import { register } from "@/lib/services/auth";
import { ServiceError, errorMessage } from "@/lib/services/errors";
import type { RegionSlug, Role } from "@/lib/types";
import {
  focusFirstError,
  safeNext,
  validateEmail,
  validateOptionalPhone,
  validatePassword,
  validateRequired,
  type Errors,
} from "@/lib/validation";

type Field = "name" | "email" | "password" | "farmName" | "region" | "phone";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const roleName = useId();

  const [role, setRole] = useState<Role>(params.get("role") === "farmer" ? "farmer" : "buyer");
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    farmName: "",
    region: "" as RegionSlug | "",
    locality: "",
    phone: "",
    whatsapp: true,
  });
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): Errors<Field> {
    const e: Errors<Field> = {
      name: validateRequired(values.name, "შეიყვანეთ სახელი და გვარი."),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    if (role === "farmer") {
      e.farmName = validateRequired(values.farmName, "შეიყვანეთ მეურნეობის ან ბიზნესის სახელი.");
      e.region = values.region ? undefined : "აირჩიეთ რეგიონი.";
      e.phone = validateOptionalPhone(values.phone);
    }
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const v = validate();
    setErrors(v);
    setFormError(null);
    if (Object.values(v).some(Boolean)) {
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setPending(true);
    try {
      const u = await register({
        role,
        name: values.name,
        email: values.email,
        password: values.password,
        ...(role === "farmer"
          ? {
              farmName: values.farmName,
              region: values.region || undefined,
              locality: values.locality,
              phone: values.phone,
              whatsapp: values.whatsapp,
            }
          : {}),
      });
      toast.success(u.role === "farmer" ? "ფერმერის ანგარიში შეიქმნა. დაამატეთ პირველი განცხადება!" : "ანგარიში შეიქმნა.");
      setValues((v) => ({ ...v, password: "" }));
      router.push(next ?? (u.role === "farmer" ? "/dashboard" : "/products"));
    } catch (error) {
      if (error instanceof ServiceError && error.field === "email") {
        setErrors({ email: error.message });
        requestAnimationFrame(() => focusFirstError(formRef.current));
      } else {
        setFormError(errorMessage(error));
      }
    } finally {
      setPending(false);
    }
  }

  if (ready && user) {
    return (
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="text-[1rem] text-ink-900">
          თქვენ უკვე შესული ხართ როგორც <span className="font-semibold">{user.name}</span>.
        </p>
        <Link href="/dashboard" className="btn btn-primary mt-4">
          ჩემს ანგარიშზე გადასვლა
        </Link>
      </div>
    );
  }

  const roles = [
    { value: "buyer" as const, icon: ShoppingBasket, title: "მყიდველი", text: "ვეძებ პროდუქციას და ვინახავ რჩეულებს" },
    { value: "farmer" as const, icon: Tractor, title: "ფერმერი", text: "ვყიდი საკუთარ პროდუქციას" },
  ];

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink-900">ანგარიშის ტიპი</legend>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, icon: Icon, title, text }) => (
            <label
              key={value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-xl border bg-white p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-600",
                role === value ? "border-forest-700 bg-leaf-50 shadow-[inset_0_0_0_1px_var(--color-forest-700)]" : "border-line-strong hover:border-ink-400",
              )}
            >
              <input
                type="radio"
                name={roleName}
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              <Icon className={cn("h-5 w-5", role === value ? "text-forest-700" : "text-ink-500")} aria-hidden />
              <span className="font-semibold text-ink-900">{title}</span>
              <span className="text-sm leading-snug text-ink-600">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {formError && (
        <div role="alert" className="flex gap-2 rounded-lg border border-danger-600/30 bg-danger-50 p-3 text-[0.9375rem] text-danger-700">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {formError}
        </div>
      )}

      <FormField id="reg-name" label="სახელი და გვარი" error={errors.name}>
        {(aria) => (
          <input {...aria} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} className="input" />
        )}
      </FormField>
      <FormField id="reg-email" label="ელფოსტა" error={errors.email}>
        {(aria) => (
          <input
            {...aria}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className="input"
          />
        )}
      </FormField>
      <FormField id="reg-password" label="პაროლი" error={errors.password} hint="მინიმუმ 8 სიმბოლო.">
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)} />
        )}
      </FormField>

      {role === "farmer" && (
        <div className="space-y-6 rounded-xl border border-line bg-cream-50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-forest-800">მეურნეობის ინფორმაცია — ჩანს თქვენს საჯარო პროფილზე</p>
          <FormField id="reg-farm" label="მეურნეობის ან ბიზნესის სახელი" error={errors.farmName}>
            {(aria) => (
              <input
                {...aria}
                autoComplete="organization"
                placeholder="მაგ.: ბერიძეების ბაღი"
                value={values.farmName}
                onChange={(e) => set("farmName", e.target.value)}
                className="input"
              />
            )}
          </FormField>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="reg-region" label="რეგიონი" error={errors.region}>
              {(aria) => (
                <select {...aria} value={values.region} onChange={(e) => set("region", e.target.value as RegionSlug)} className="input">
                  <option value="">აირჩიეთ…</option>
                  {regions.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField id="reg-locality" label="სოფელი / ქალაქი" optional>
              {(aria) => (
                <input {...aria} value={values.locality} onChange={(e) => set("locality", e.target.value)} className="input" />
              )}
            </FormField>
          </div>
          <FormField
            id="reg-phone"
            label="საკონტაქტო ტელეფონი"
            optional
            error={errors.phone}
            hint="მყიდველები დაგირეკავენ ამ ნომერზე. ნომრის გარეშე დაკავშირების ღილაკები არ გამოჩნდება."
          >
            {(aria) => (
              <input
                {...aria}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="555 12 34 56"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input"
              />
            )}
          </FormField>
          <label className="flex items-start gap-3 text-[0.9375rem] text-ink-700">
            <input
              type="checkbox"
              checked={values.whatsapp}
              disabled={!values.phone.trim()}
              onChange={(e) => set("whatsapp", e.target.checked)}
              className="mt-1 h-4 w-4 accent-forest-700"
            />
            <span>ამ ნომერზე WhatsApp-იც მაქვს</span>
          </label>
        </div>
      )}

      <button type="submit" className="btn btn-primary h-12 w-full text-base" disabled={pending} aria-busy={pending}>
        {pending && <Spinner />}
        {pending ? "ანგარიში იქმნება…" : role === "farmer" ? "ფერმერის ანგარიშის შექმნა" : "ანგარიშის შექმნა"}
      </button>
      <p className="text-center text-[0.9375rem] text-ink-600">
        უკვე გაქვთ ანგარიში?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="link">
          შესვლა
        </Link>
      </p>
    </form>
  );
}
