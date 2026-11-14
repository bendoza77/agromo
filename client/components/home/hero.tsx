import { Search } from "lucide-react";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { HeroListingTag } from "@/components/home/hero-listing-tag";

const SUGGESTIONS = ["თხილი", "თაფლი", "მანდარინი", "სულგუნი", "კარტოფილი"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Furrow lines: a quiet field motif behind the text column */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 opacity-60 lg:block [background:repeating-linear-gradient(170deg,transparent_0_46px,var(--color-cream-200)_46px_47px)] [mask-image:linear-gradient(to_right,black,transparent)]"
      />
      <div className="container-page relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:py-20">
        <div className="max-w-xl">
          <p className="eyebrow">ქართული აგრო-მარკეტპლეისი</p>
          <h1 className="mt-4 font-display text-[2rem] font-semibold leading-[1.2] text-forest-900 sm:text-[2.6rem] lg:text-[3rem]">
            ქართული პროდუქტი —{" "}
            <span className="relative whitespace-nowrap text-forest-700">
              უშუალოდ
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-harvest-500">
                <path d="M2 8c40-6 120-7 196-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            მწარმოებლისგან
          </h1>
          <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink-600">
            მოძებნეთ ხილი, ბოსტნეული, თხილი, თაფლი და რძის ნაწარმი საქართველოს სხვადასხვა კუთხიდან და დაუკავშირდით ფერმერს
            პირდაპირ — ტელეფონით ან WhatsApp-ით.
          </p>

          <Form action="/products" role="search" className="mt-8">
            <label htmlFor="hero-search" className="sr-only">
              რას ეძებთ?
            </label>
            <div className="flex flex-col gap-2 rounded-xl border border-line-strong bg-white p-2 shadow-[var(--shadow-card)] focus-within:border-forest-600 focus-within:shadow-[var(--shadow-focus)] sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="მაგ.: იმერული ყველი, თხილი…"
                  className="h-12 w-full rounded-lg bg-transparent pl-11 pr-3 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
              </div>
              <button type="submit" className="btn btn-primary h-12 px-6">
                ძიება
              </button>
            </div>
          </Form>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            <span className="text-ink-500">ხშირად ეძებენ:</span>
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/products?q=${encodeURIComponent(s)}`}
                className="rounded-md border border-line bg-white px-2.5 py-1 font-medium text-ink-700 transition-colors hover:border-forest-600 hover:text-forest-800"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-cream-200 lg:aspect-[5/5.2]">
            <Image
              src="/images/photos/grapes-in-hands.jpg"
              alt="მევენახე ხელში ახლად მოკრეფილ თეთრი ყურძნის მტევნებს უჭერს"
              fill
              preload
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 576px, 100vw"
              className="object-cover"
            />
          </div>
          {/* A real listing from the catalogue, styled as a bazaar produce tag */}
          <HeroListingTag
            productId="p-rkatsiteli"
            className="absolute -bottom-4 left-3 max-w-[calc(100%-1.5rem)] sm:left-6 lg:-left-6 lg:bottom-10"
          />
          <figcaption className="sr-only">მოსავალი პირდაპირ ვენახიდან</figcaption>
        </figure>
      </div>
    </section>
  );
}
