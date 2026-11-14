"use client";

import { CircleAlert, ShoppingBasket, Tractor } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/hooks";
import { login, logout } from "@/lib/services/auth";
import { DEMO_BUYER_EMAIL, DEMO_FARMER_EMAIL, DEMO_PASSWORD } from "@/lib/services/db";
import { ServiceError, errorMessage } from "@/lib/services/errors";
import { focusFirstError, safeNext, validateEmail, type Errors } from "@/lib/validation";

type Field = "email" | "password";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(emailValue: string, passwordValue: string) {
    if (pending) return;
    const nextErrors: Errors<Field> = {
      email: validateEmail(emailValue),
      password: passwordValue ? undefined : "შეიყვანეთ პაროლი.",
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.email || nextErrors.password) {
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setPending(true);
    try {
      const u = await login(emailValue, passwordValue);
      toast.success(`მოგესალმებით, ${u.name.split(" ")[0]}!`);
      setPassword("");
      router.push(next ?? (u.role === "farmer" ? "/dashboard" : "/products"));
    } catch (error) {
      if (error instanceof ServiceError && (error.field === "email" || error.field === "password")) {
        setErrors({ [error.field]: error.message });
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
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={next ?? "/dashboard"} className="btn btn-primary">
            გაგრძელება
          </Link>
          <button type="button" className="btn btn-secondary" onClick={() => logout()}>
            სხვა ანგარიშით შესვლა
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {next && (
        <p className="mb-6 rounded-lg bg-leaf-50 px-4 py-3 text-[0.9375rem] text-forest-800">
          ამ გვერდის სანახავად გთხოვთ, შეხვიდეთ ანგარიშზე.
        </p>
      )}
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit(email, password);
        }}
        className="space-y-5"
      >
        {formError && (
          <div role="alert" className="flex gap-2 rounded-lg border border-danger-600/30 bg-danger-50 p-3 text-[0.9375rem] text-danger-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            {formError}
          </div>
        )}
        <FormField id="login-email" label="ელფოსტა" error={errors.email}>
          {(aria) => (
            <input
              {...aria}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          )}
        </FormField>
        <FormField id="login-password" label="პაროლი" error={errors.password}>
          {(aria) => (
            <PasswordInput {...aria} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </FormField>
        <button type="submit" className="btn btn-primary h-12 w-full text-base" disabled={pending} aria-busy={pending}>
          {pending && <Spinner />}
          {pending ? "მიმდინარეობს შესვლა…" : "შესვლა"}
        </button>
        <p className="text-center text-[0.9375rem] text-ink-600">
          ანგარიში არ გაქვთ?{" "}
          <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="link">
            დარეგისტრირდით
          </Link>
        </p>
      </form>

      <div className="mt-8 rounded-xl border border-line bg-cream-50 p-4">
        <h2 className="text-sm font-semibold text-ink-900">სადემონსტრაციო ანგარიშები</h2>
        <p className="mt-1 text-sm text-ink-600">
          პაროლი ორივესთვის: <code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-ink-900">{DEMO_PASSWORD}</code>
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="btn btn-secondary justify-start"
            disabled={pending}
            onClick={() => {
              setEmail(DEMO_FARMER_EMAIL);
              setPassword(DEMO_PASSWORD);
              void submit(DEMO_FARMER_EMAIL, DEMO_PASSWORD);
            }}
          >
            <Tractor className="h-4 w-4 text-forest-700" aria-hidden />
            ფერმერად შესვლა
          </button>
          <button
            type="button"
            className="btn btn-secondary justify-start"
            disabled={pending}
            onClick={() => {
              setEmail(DEMO_BUYER_EMAIL);
              setPassword(DEMO_PASSWORD);
              void submit(DEMO_BUYER_EMAIL, DEMO_PASSWORD);
            }}
          >
            <ShoppingBasket className="h-4 w-4 text-forest-700" aria-hidden />
            მყიდველად შესვლა
          </button>
        </div>
      </div>
    </>
  );
}
