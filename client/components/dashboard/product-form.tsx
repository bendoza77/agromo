"use client";

import { ArrowLeft, CircleAlert, ImagePlus, Info, Link2, Lock, PackageSearch, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { DashboardTitle, FarmerOnly, type FarmerUser } from "@/components/dashboard/farmer-only";
import { ProductImage } from "@/components/product/product-image";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { photoCredits } from "@/lib/data/photo-credits";
import { availabilityLabels, categories, regions, statusLabels, units } from "@/lib/data/taxonomy";
import { useDocumentTitle, useSession, useStore } from "@/lib/hooks";
import { errorMessage } from "@/lib/services/errors";
import { canManageProduct, createProduct, getProductById, getSellerById, updateProduct } from "@/lib/services/products";
import type { Availability, CategorySlug, ListingStatus, Product, ProductInput, RegionSlug, Unit } from "@/lib/types";
import { focusFirstError, type Errors } from "@/lib/validation";

// ---------- Form model ----------

type ImageMode = "library" | "url" | "file";

interface FormValues {
  title: string;
  category: CategorySlug | "";
  description: string;
  priceOnRequest: boolean;
  price: string;
  unit: Unit;
  quantity: string;
  minOrder: string;
  region: RegionSlug | "";
  locality: string;
  imageMode: ImageMode;
  libraryImage: string | null;
  imageUrl: string;
  fileImage: string | null;
  availability: Availability;
  status: ListingStatus;
}

type Field = "title" | "category" | "description" | "price" | "quantity" | "minOrder" | "region" | "image";

const LIBRARY = photoCredits.map((c) => c.file);

/** Which inline error a change to each form value clears. */
const ERROR_FIELD: Partial<Record<keyof FormValues, Field>> = {
  title: "title",
  category: "category",
  description: "description",
  price: "price",
  priceOnRequest: "price",
  quantity: "quantity",
  minOrder: "minOrder",
  region: "region",
  imageMode: "image",
  imageUrl: "image",
  libraryImage: "image",
  fileImage: "image",
};

function toNumber(value: string): number | null {
  const v = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function numberToField(value: number | null): string {
  return value === null ? "" : String(value).replace(".", ",");
}

function valuesFromProduct(p: Product): FormValues {
  const isLibrary = p.image !== null && LIBRARY.includes(p.image);
  const isFile = p.image?.startsWith("data:") ?? false;
  return {
    title: p.title,
    category: p.category,
    description: p.description,
    priceOnRequest: p.price === null,
    price: numberToField(p.price),
    unit: p.unit,
    quantity: numberToField(p.quantity),
    minOrder: numberToField(p.minOrder),
    region: p.region,
    locality: p.locality,
    imageMode: isFile ? "file" : p.image && !isLibrary ? "url" : "library",
    libraryImage: isLibrary ? p.image : null,
    imageUrl: p.image && !isLibrary && !isFile ? p.image : "",
    fileImage: isFile ? p.image : null,
    availability: p.availability,
    status: p.status,
  };
}

function emptyValues(defaults: { region: RegionSlug | ""; locality: string }): FormValues {
  return {
    title: "",
    category: "",
    description: "",
    priceOnRequest: false,
    price: "",
    unit: "kg",
    quantity: "",
    minOrder: "",
    region: defaults.region,
    locality: defaults.locality,
    imageMode: "library",
    libraryImage: null,
    imageUrl: "",
    fileImage: null,
    availability: "available",
    status: "published",
  };
}

function selectedImage(v: FormValues): string | null {
  if (v.imageMode === "library") return v.libraryImage;
  if (v.imageMode === "file") return v.fileImage;
  return v.imageUrl.trim() || null;
}

function validate(v: FormValues): Errors<Field> {
  const e: Errors<Field> = {};
  const title = v.title.trim();
  if (!title) e.title = "შეიყვანეთ პროდუქტის დასახელება.";
  else if (title.length < 3) e.title = "დასახელება ძალიან მოკლეა (მინიმუმ 3 სიმბოლო).";
  else if (title.length > 80) e.title = "დასახელება არ უნდა აღემატებოდეს 80 სიმბოლოს.";

  if (!v.category) e.category = "აირჩიეთ კატეგორია.";

  const description = v.description.trim();
  if (!description) e.description = "დაწერეთ მოკლე აღწერა.";
  else if (description.length < 20) e.description = "აღწერა ძალიან მოკლეა — მიუთითეთ ჯიში, ხარისხი ან შეფუთვა (მინიმუმ 20 სიმბოლო).";
  else if (description.length > 1500) e.description = "აღწერა არ უნდა აღემატებოდეს 1500 სიმბოლოს.";

  if (!v.priceOnRequest) {
    const price = toNumber(v.price);
    if (price === null) e.price = "მიუთითეთ ფასი ან მონიშნეთ „ფასი შეთანხმებით“.";
    else if (Number.isNaN(price)) e.price = "ფასი უნდა იყოს რიცხვი, მაგ.: 4,50.";
    else if (price <= 0) e.price = "ფასი უნდა იყოს 0-ზე მეტი.";
    else if (price > 1_000_000) e.price = "ფასი ძალიან დიდია.";
    else if (!/^\d+([.,]\d{1,2})?$/.test(v.price.trim().replace(/\s/g, ""))) e.price = "მაქსიმუმ 2 ათწილადი ნიშანი (თეთრი).";
  }

  const quantity = toNumber(v.quantity);
  if (quantity !== null && (Number.isNaN(quantity) || quantity < 0)) e.quantity = "რაოდენობა უნდა იყოს დადებითი რიცხვი.";

  const minOrder = toNumber(v.minOrder);
  if (minOrder !== null) {
    if (Number.isNaN(minOrder) || minOrder <= 0) e.minOrder = "მინიმალური შეკვეთა უნდა იყოს დადებითი რიცხვი.";
    else if (quantity !== null && !Number.isNaN(quantity) && minOrder > quantity)
      e.minOrder = "მინიმალური შეკვეთა ვერ იქნება ხელმისაწვდომ რაოდენობაზე მეტი.";
  }

  if (!v.region) e.region = "აირჩიეთ რეგიონი.";

  if (v.imageMode === "url" && v.imageUrl.trim()) {
    try {
      const url = new URL(v.imageUrl.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      e.image = "ბმული უნდა იწყებოდეს https://-ით.";
    }
  }
  return e;
}

function toInput(v: FormValues): ProductInput {
  return {
    title: v.title.trim(),
    category: v.category as CategorySlug,
    description: v.description.trim(),
    price: v.priceOnRequest ? null : toNumber(v.price),
    unit: v.unit,
    quantity: toNumber(v.quantity),
    minOrder: toNumber(v.minOrder),
    region: v.region as RegionSlug,
    locality: v.locality.trim(),
    image: selectedImage(v),
    availability: v.availability,
    status: v.status,
  };
}

/**
 * Downscales a picked photo in the browser to keep the demo store small.
 * The result stays in localStorage — it is NOT uploaded anywhere.
 */
function readAndResize(file: File, maxSide = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ფოტოს წაკითხვა ვერ მოხერხდა. სცადეთ JPG ან PNG ფაილი."));
    };
    img.src = url;
  });
}

// ---------- Entry points ----------

export function NewProductEditor() {
  return (
    <FarmerOnly>
      {(user) => (
        <>
          <BackLink />
          <DashboardTitle
            title="ახალი განცხადება"
            description="შეავსეთ ძირითადი ინფორმაცია. რაც უფრო ზუსტია აღწერა და ფოტო, მით ნაკლები კითხვა ექნებათ მყიდველებს."
          />
          <NewProductForm user={user} />
        </>
      )}
    </FarmerOnly>
  );
}

function NewProductForm({ user }: { user: FarmerUser }) {
  const { db } = useStore();
  const seller = getSellerById(db, user.sellerId);
  return <ProductForm initial={emptyValues({ region: seller?.region ?? "", locality: seller?.locality ?? "" })} />;
}

export function EditProductEditor({ id }: { id: string }) {
  const { db, ready } = useStore();
  const { user } = useSession();
  const product = getProductById(db, id);
  useDocumentTitle(ready && product ? `რედაქტირება: ${product.title} · პანელი · Agromo` : null);

  return (
    <FarmerOnly>
      {() => {
        if (!product && !ready) return <div className="skeleton h-[32rem]" aria-busy="true" aria-label="იტვირთება" />;
        if (!product) {
          return (
            <EmptyState
              icon={PackageSearch}
              title="განცხადება ვერ მოიძებნა"
              actions={
                <Link href="/dashboard/products" className="btn btn-primary">
                  ჩემს განცხადებებზე დაბრუნება
                </Link>
              }
            >
              შესაძლოა, ის უკვე წაშლილია.
            </EmptyState>
          );
        }
        if (!canManageProduct(user, product)) {
          return (
            <EmptyState
              icon={Lock}
              title="ამ განცხადების რედაქტირება არ შეგიძლიათ"
              actions={
                <>
                  <Link href="/dashboard/products" className="btn btn-primary">
                    ჩემი განცხადებები
                  </Link>
                  <Link href={`/products/${product.id}`} className="btn btn-secondary">
                    განცხადების ნახვა
                  </Link>
                </>
              }
            >
              განცხადებას მხოლოდ მისი ავტორი ფერმერი მართავს.
            </EmptyState>
          );
        }
        return (
          <>
            <BackLink />
            <DashboardTitle
              title="განცხადების რედაქტირება"
              description={
                <>
                  ცვლილებები შენახვისთანავე აისახება{" "}
                  <Link href={`/products/${product.id}`} className="link">
                    განცხადების გვერდზე
                  </Link>
                  .
                </>
              }
            />
            {/* key: re-initialise the form if another tab saves a newer version before editing starts */}
            <ProductForm key={product.id} productId={product.id} initial={valuesFromProduct(product)} />
          </>
        );
      }}
    </FarmerOnly>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-forest-800">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      ჩემი განცხადებები
    </Link>
  );
}

// ---------- The form ----------

function ProductForm({ initial, productId }: { initial: FormValues; productId?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const isEdit = Boolean(productId);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    const field = ERROR_FIELD[key];
    if (field && errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const v = validate(values);
    setErrors(v);
    setFormError(null);
    if (Object.values(v).some(Boolean)) {
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setPending(true);
    try {
      const input = toInput(values);
      if (productId) {
        await updateProduct(productId, input);
        toast.success("ცვლილებები შენახულია.");
      } else {
        const created = await createProduct(input);
        toast.success(
          created.status === "published"
            ? `„${created.title}“ გამოქვეყნდა მარკეტპლეისზე.`
            : `„${created.title}“ შენახულია დამალულად — მყიდველები მას ჯერ ვერ ნახავენ.`,
        );
      }
      router.push("/dashboard/products");
    } catch (error) {
      setFormError(errorMessage(error));
      setPending(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "აირჩიეთ ფოტო (JPG, PNG ან WebP)." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "ფაილი 10 მბ-ზე დიდია." }));
      return;
    }
    setFileBusy(true);
    try {
      set("fileImage", await readAndResize(file));
    } catch (error) {
      setErrors((e) => ({ ...e, image: errorMessage(error) }));
    } finally {
      setFileBusy(false);
    }
  }

  const preview = selectedImage(values);

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-8">
      {formError && (
        <div role="alert" className="flex gap-2 rounded-lg border border-danger-600/30 bg-danger-50 p-3 text-[0.9375rem] text-danger-700">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {formError}
        </div>
      )}

      <Section title="პროდუქტი">
        <FormField id="pf-title" label="დასახელება" error={errors.title} hint="მაგ.: იმერული ყველი, საფერავი — ღვინის ყურძენი">
          {(aria) => (
            <input {...aria} value={values.title} maxLength={90} onChange={(e) => set("title", e.target.value)} className="input" />
          )}
        </FormField>
        <FormField id="pf-category" label="კატეგორია" error={errors.category}>
          {(aria) => (
            <select {...aria} value={values.category} onChange={(e) => set("category", e.target.value as CategorySlug)} className="input">
              <option value="">აირჩიეთ…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id="pf-description"
          label="აღწერა"
          error={errors.description}
          hint={`ჯიში, ხარისხი, შეფუთვა, როდის იკრიფება. ${values.description.trim().length}/1500`}
        >
          {(aria) => (
            <textarea
              {...aria}
              rows={5}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              className="input"
            />
          )}
        </FormField>
      </Section>

      <Section title="ფასი და რაოდენობა">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
          <FormField id="pf-price" label="ფასი, ₾" error={errors.price}>
            {(aria) => (
              <div className="relative">
                <input
                  {...aria}
                  inputMode="decimal"
                  placeholder={values.priceOnRequest ? "შეთანხმებით" : "0,00"}
                  disabled={values.priceOnRequest}
                  value={values.priceOnRequest ? "" : values.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="input pr-20 tabular-nums disabled:bg-cream-100 disabled:text-ink-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">
                  ₾ / {units[values.unit].short}
                </span>
              </div>
            )}
          </FormField>
          <FormField id="pf-unit" label="საზომი ერთეული">
            {(aria) => (
              <select {...aria} value={values.unit} onChange={(e) => set("unit", e.target.value as Unit)} className="input">
                {(Object.keys(units) as Unit[]).map((u) => (
                  <option key={u} value={u}>
                    {units[u].long}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink-700">
          <input
            type="checkbox"
            checked={values.priceOnRequest}
            onChange={(e) => set("priceOnRequest", e.target.checked)}
            className="mt-1 h-4 w-4 accent-forest-700"
          />
          <span>
            ფასი შეთანხმებით
            <span className="block text-sm text-ink-500">მყიდველები ნახავენ „ფასი შეთანხმებით“ და დაგიკავშირდებიან.</span>
          </span>
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField id="pf-quantity" label={`ხელმისაწვდომი რაოდენობა, ${units[values.unit].short}`} optional error={errors.quantity}>
            {(aria) => (
              <input {...aria} inputMode="decimal" value={values.quantity} onChange={(e) => set("quantity", e.target.value)} className="input tabular-nums" />
            )}
          </FormField>
          <FormField id="pf-min" label={`მინიმალური შეკვეთა, ${units[values.unit].short}`} optional error={errors.minOrder}>
            {(aria) => (
              <input {...aria} inputMode="decimal" value={values.minOrder} onChange={(e) => set("minOrder", e.target.value)} className="input tabular-nums" />
            )}
          </FormField>
        </div>
      </Section>

      <Section title="მდებარეობა">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField id="pf-region" label="რეგიონი" error={errors.region}>
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
          <FormField id="pf-locality" label="სოფელი / ქალაქი" optional>
            {(aria) => <input {...aria} value={values.locality} onChange={(e) => set("locality", e.target.value)} className="input" />}
          </FormField>
        </div>
      </Section>

      <Section title="ფოტო">
        <ImagePicker values={values} set={set} error={errors.image} fileBusy={fileBusy} onFile={onFile} preview={preview} />
      </Section>

      <Section title="ხელმისაწვდომობა და გამოქვეყნება">
        <RadioCards
          legend="ხელმისაწვდომობა"
          value={values.availability}
          onChange={(a) => set("availability", a)}
          options={(Object.keys(availabilityLabels) as Availability[]).map((a) => ({ value: a, label: availabilityLabels[a] }))}
        />
        <RadioCards
          legend="სტატუსი"
          value={values.status}
          onChange={(s) => set("status", s)}
          options={[
            { value: "published", label: statusLabels.published, hint: "ჩანს მარკეტპლეისზე" },
            { value: "hidden", label: statusLabels.hidden, hint: "ხედავთ მხოლოდ თქვენ" },
          ]}
        />
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex gap-2 border-t border-line bg-cream-100/95 px-4 py-4 backdrop-blur sm:mx-0 sm:justify-end sm:rounded-b-xl sm:px-0 lg:static lg:bg-transparent lg:backdrop-blur-none">
        <Link href="/dashboard/products" className="btn btn-secondary" aria-disabled={pending} tabIndex={pending ? -1 : undefined}>
          გაუქმება
        </Link>
        <button type="submit" className="btn btn-primary flex-1 sm:min-w-48 sm:flex-none" disabled={pending || fileBusy} aria-busy={pending}>
          {pending && <Spinner />}
          {pending ? "ინახება…" : isEdit ? "ცვლილებების შენახვა" : values.status === "published" ? "გამოქვეყნება" : "შენახვა დამალულად"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-xl border border-line bg-white p-4 sm:p-6">
      <h2 id={id} className="mb-5 font-display text-lg font-semibold text-ink-900">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function RadioCards<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink-900">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-[0.9375rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-600",
              value === o.value ? "border-forest-700 bg-leaf-50 shadow-[inset_0_0_0_1px_var(--color-forest-700)]" : "border-line-strong hover:border-ink-400",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-1 h-4 w-4 shrink-0 accent-forest-700"
            />
            <span className="min-w-0">
              <span className="block font-semibold text-ink-900">{o.label}</span>
              {o.hint && <span className="block text-sm text-ink-500">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ImagePicker({
  values,
  set,
  error,
  fileBusy,
  onFile,
  preview,
}: {
  values: FormValues;
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  error?: string;
  fileBusy: boolean;
  onFile: (file: File | undefined) => void;
  preview: string | null;
}) {
  const modes: { value: ImageMode; label: string; icon: typeof ImagePlus }[] = [
    { value: "library", label: "სადემო ფოტოები", icon: ImagePlus },
    { value: "url", label: "ბმული", icon: Link2 },
    { value: "file", label: "ფაილიდან", icon: Upload },
  ];
  const errorId = error ? "pf-image-error" : undefined;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0">
        <div role="group" aria-label="ფოტოს წყარო" className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-cream-200 p-1 [scrollbar-width:none]">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={values.imageMode === value}
              onClick={() => set("imageMode", value)}
              className={cn(
                "flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                values.imageMode === value ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {values.imageMode === "library" && (
          <div role="radiogroup" aria-label="სადემო ფოტო" className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-line p-2 sm:grid-cols-6 md:grid-cols-5 xl:grid-cols-7">
            {LIBRARY.map((src) => {
              const checked = values.libraryImage === src;
              return (
                <button
                  key={src}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={src.split("/").pop()?.replace(".jpg", "").replace(/-/g, " ")}
                  onClick={() => set("libraryImage", checked ? null : src)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md bg-cream-200 ring-offset-2 transition",
                    checked ? "ring-2 ring-forest-700" : "opacity-90 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              );
            })}
          </div>
        )}

        {values.imageMode === "url" && (
          <div>
            <label htmlFor="pf-image-url" className="mb-1.5 block text-sm font-semibold text-ink-900">
              ფოტოს ბმული
            </label>
            <input
              id="pf-image-url"
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={values.imageUrl}
              aria-invalid={Boolean(error)}
              aria-describedby={errorId}
              onChange={(e) => set("imageUrl", e.target.value)}
              className="input"
            />
            <p className="mt-1.5 text-sm text-ink-500">ბმული უნდა იყოს საჯაროდ ხელმისაწვდომ ფოტოზე. თუ ვერ ჩაიტვირთა, ნაჩვენები იქნება „ფოტო არ არის“.</p>
          </div>
        )}

        {values.imageMode === "file" && (
          <div>
            <label
              htmlFor="pf-image-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-cream-50 px-4 py-8 text-center text-[0.9375rem] text-ink-700 transition-colors hover:border-forest-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest-600"
            >
              {fileBusy ? <Spinner className="h-5 w-5" /> : <Upload className="h-5 w-5 text-forest-700" aria-hidden />}
              <span className="font-semibold">{values.fileImage ? "სხვა ფოტოს არჩევა" : "აირჩიეთ ფოტო მოწყობილობიდან"}</span>
              <span className="text-sm text-ink-500">JPG, PNG ან WebP, მაქს. 10 მბ</span>
              <input
                id="pf-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                onChange={(e) => onFile(e.target.files?.[0])}
                className="sr-only"
              />
            </label>
            <p className="mt-2 flex gap-2 text-sm leading-relaxed text-ink-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              პროტოტიპში ფოტო სერვერზე არ იტვირთება: ის მცირდება და ინახება მხოლოდ ამ ბრაუზერში, ამიტომ სხვა მოწყობილობაზე არ გამოჩნდება.
            </p>
          </div>
        )}

        {error && (
          <p id={errorId} className="mt-2 text-sm text-danger-700">
            {error}
          </p>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-900">გადახედვა</p>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-cream-200">
          <ProductImage src={preview} alt={values.title || "პროდუქტის ფოტო"} sizes="224px" />
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => {
              if (values.imageMode === "library") set("libraryImage", null);
              else if (values.imageMode === "file") set("fileImage", null);
              else set("imageUrl", "");
            }}
            className="mt-2 text-sm font-semibold text-ink-600 hover:text-danger-700 hover:underline"
          >
            ფოტოს მოხსნა
          </button>
        )}
      </div>
    </div>
  );
}
