"use client";

import { CircleAlert, ExternalLink, LogOut, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DashboardTitle } from "@/components/dashboard/farmer-only";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { normalizeGeorgianPhone } from "@/lib/contact";
import { regions } from "@/lib/data/taxonomy";
import { useSession, useStore } from "@/lib/hooks";
import { logout, updateAccountName } from "@/lib/services/auth";
import { resetDemoData } from "@/lib/services/db";
import { errorMessage } from "@/lib/services/errors";
import { getSellerById, updateSellerProfile } from "@/lib/services/products";
import type { RegionSlug, Seller, SessionUser } from "@/lib/types";
import { focusFirstError, validateOptionalPhone, validateRequired, type Errors } from "@/lib/validation";

export function ProfileSettings() {
  const { user } = useSession();
  const { db } = useStore();
  if (!user) return null;
  const seller = user.sellerId ? getSellerById(db, user.sellerId) : undefined;

  return (
    <>
      <DashboardTitle
        title={user.role === "farmer" ? "პროფილი" : "პარამეტრები"}
        description={
          user.role === "farmer"
            ? "მეურნეობის ინფორმაცია ჩანს თქვენს საჯარო პროფილზე და ყველა განცხადებაზე."
            : "თქვენი ანგარიშის მონაცემები."
        }
        actions={
          seller && (
            <Link href={`/farmers/${seller.id}`} className="btn btn-secondary">
              <ExternalLink className="h-4 w-4" aria-hidden />
              საჯარო პროფილის ნახვა
            </Link>
          )
        }
      />
      <div className="space-y-8">
        {/* key: reset the form when switching accounts */}
        {seller ? <SellerForm key={seller.id} user={user} seller={seller} /> : <AccountForm key={user.id} user={user} />}
        <AccountActions user={user} />
      </div>
    </>
  );
}

function AccountForm({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const err = validateRequired(name, "შეიყვანეთ სახელი და გვარი.");
    setError(err);
    if (err) return;
    setPending(true);
    try {
      await updateAccountName(name);
      toast.success("ცვლილებები შენახულია.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-4 sm:p-6">
      <h2 className="mb-5 font-display text-lg font-semibold text-ink-900">ანგარიში</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="acc-name" label="სახელი და გვარი" error={error}>
          {(aria) => <input {...aria} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input" />}
        </FormField>
        <FormField id="acc-email" label="ელფოსტა" hint="ელფოსტის შეცვლა პროტოტიპში არ არის ხელმისაწვდომი.">
          {(aria) => <input {...aria} value={user.email} readOnly className="input bg-cream-100 text-ink-600" />}
        </FormField>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}>
          {pending && <Spinner />}
          {pending ? "ინახება…" : "შენახვა"}
        </button>
      </div>
    </form>
  );
}

type SellerField = "ownerName" | "name" | "region" | "phone" | "description";

function SellerForm({ user, seller }: { user: SessionUser; seller: Seller }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState({
    ownerName: user.name,
    name: seller.name,
    region: seller.region as RegionSlug | "",
    locality: seller.locality,
    description: seller.description,
    phone: seller.phone ?? "",
    whatsapp: seller.whatsapp,
  });
  const [errors, setErrors] = useState<Errors<SellerField>>({});
  const [pending, setPending] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const v: Errors<SellerField> = {
      ownerName: validateRequired(values.ownerName, "შეიყვანეთ სახელი და გვარი."),
      name: validateRequired(values.name, "შეიყვანეთ მეურნეობის სახელი."),
      region: values.region ? undefined : "აირჩიეთ რეგიონი.",
      phone: validateOptionalPhone(values.phone),
      description: values.description.length > 800 ? "აღწერა არ უნდა აღემატებოდეს 800 სიმბოლოს." : undefined,
    };
    setErrors(v);
    if (Object.values(v).some(Boolean)) {
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setPending(true);
    try {
      const phone = values.phone.trim() ? (normalizeGeorgianPhone(values.phone)?.display ?? values.phone.trim()) : null;
      await updateSellerProfile({
        name: values.name.trim(),
        region: values.region as RegionSlug,
        locality: values.locality.trim(),
        description: values.description.trim(),
        phone,
        whatsapp: Boolean(phone && values.whatsapp),
      });
      if (values.ownerName.trim() !== user.name) await updateAccountName(values.ownerName);
      if (phone) setValues((s) => ({ ...s, phone }));
      toast.success("პროფილი განახლდა.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  const phoneFilled = Boolean(values.phone.trim());

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-xl border border-line bg-white p-4 sm:p-6" aria-labelledby="farm-h">
        <h2 id="farm-h" className="mb-5 font-display text-lg font-semibold text-ink-900">
          მეურნეობა
        </h2>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="sp-name" label="მეურნეობის სახელი" error={errors.name}>
              {(aria) => <input {...aria} autoComplete="organization" value={values.name} onChange={(e) => set("name", e.target.value)} className="input" />}
            </FormField>
            <FormField id="sp-owner" label="თქვენი სახელი და გვარი" error={errors.ownerName}>
              {(aria) => <input {...aria} autoComplete="name" value={values.ownerName} onChange={(e) => set("ownerName", e.target.value)} className="input" />}
            </FormField>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="sp-region" label="რეგიონი" error={errors.region}>
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
            <FormField id="sp-locality" label="სოფელი / ქალაქი" optional>
              {(aria) => <input {...aria} value={values.locality} onChange={(e) => set("locality", e.target.value)} className="input" />}
            </FormField>
          </div>
          <FormField
            id="sp-description"
            label="მეურნეობის აღწერა"
            optional
            error={errors.description}
            hint={`რას აწარმოებთ, რამდენი ხანია საქმიანობთ, როდის შეიძლება დაგირეკონ. ${values.description.length}/800`}
          >
            {(aria) => <textarea {...aria} rows={5} value={values.description} onChange={(e) => set("description", e.target.value)} className="input" />}
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-4 sm:p-6" aria-labelledby="contact-h">
        <h2 id="contact-h" className="mb-1 font-display text-lg font-semibold text-ink-900">
          საკონტაქტო ინფორმაცია
        </h2>
        <p className="mb-5 text-[0.9375rem] text-ink-600">ნომერი ჩანს ყველა განცხადებაზე, რომ მყიდველებმა პირდაპირ დაგირეკონ.</p>
        <div className="space-y-4">
          <FormField id="sp-phone" label="ტელეფონი" optional error={errors.phone} hint="მაგ.: 555 12 34 56 ან +995 555 12 34 56">
            {(aria) => (
              <input
                {...aria}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input sm:max-w-sm"
              />
            )}
          </FormField>
          <label className="flex items-start gap-3 text-[0.9375rem] text-ink-700">
            <input
              type="checkbox"
              checked={phoneFilled && values.whatsapp}
              disabled={!phoneFilled}
              onChange={(e) => set("whatsapp", e.target.checked)}
              className="mt-1 h-4 w-4 accent-forest-700"
            />
            <span>
              ამ ნომერზე WhatsApp-იც მაქვს
              <span className="block text-sm text-ink-500">WhatsApp მხოლოდ მობილურ ნომრებზე მუშაობს.</span>
            </span>
          </label>
          {!phoneFilled && (
            <p className="flex gap-2 rounded-lg bg-harvest-100 p-3 text-sm text-ink-900">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-harvest-700" aria-hidden />
              ნომრის გარეშე განცხადებებზე დაკავშირების ღილაკები არ გამოჩნდება.
            </p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary min-w-40" disabled={pending} aria-busy={pending}>
          {pending && <Spinner />}
          {pending ? "ინახება…" : "პროფილის შენახვა"}
        </button>
      </div>
    </form>
  );
}

function AccountActions({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <section aria-labelledby="session-h" className="rounded-xl border border-line bg-cream-50 p-4 sm:p-6">
      <h2 id="session-h" className="font-display text-lg font-semibold text-ink-900">
        სესია და სადემო მონაცემები
      </h2>
      <p className="mt-1 text-[0.9375rem] text-ink-600">
        შესული ხართ როგორც <span className="font-semibold text-ink-900">{user.email}</span>. ყველა ცვლილება ინახება მხოლოდ ამ ბრაუზერში.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            logout();
            toast.info("თქვენ გამოხვედით ანგარიშიდან.");
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          გასვლა
        </button>
        <button type="button" className="btn btn-ghost text-danger-700 hover:!bg-danger-50" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          სადემო მონაცემების აღდგენა
        </button>
      </div>
      <ConfirmDialog
        open={confirmReset}
        title="აღვადგინოთ სადემო მონაცემები?"
        description="წაიშლება ამ ბრაუზერში შექმნილი ანგარიშები, განცხადებები და რჩეულები, და დაბრუნდება საწყისი სადემო მონაცემები. თქვენ გამოხვალთ ანგარიშიდან."
        confirmLabel="აღდგენა"
        tone="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
          toast.success("სადემო მონაცემები აღდგენილია.");
          router.push("/");
        }}
      />
    </section>
  );
}
