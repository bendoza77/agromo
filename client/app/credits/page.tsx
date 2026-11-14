import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { photoCredits } from "@/lib/data/photo-credits";

export const metadata: Metadata = {
  title: "ფოტოების წყაროები",
  description: "Agromo-ს პროტოტიპში გამოყენებული ფოტოების ავტორები და ლიცენზიები.",
};

export default function CreditsPage() {
  return (
    <>
      <PageHeader
        title="ფოტოების წყაროები"
        description="პროტოტიპში გამოყენებული ფოტოები აღებულია Wikimedia Commons-იდან თავისუფალი ლიცენზიებით. ფოტოები ილუსტრაციულია და არ ასახავს კონკრეტული გამყიდველის პროდუქციას."
        crumbs={[{ href: "/", label: "მთავარი" }, { label: "ფოტოების წყაროები" }]}
      />
      <div className="container-page py-8 sm:py-10">
        <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {photoCredits.map((c) => (
            <li key={c.file} className="flex min-w-0 gap-3.5 border-b border-line pb-4">
              <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-cream-200">
                <Image src={c.file} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <div className="min-w-0 text-sm">
                <a
                  href={c.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 font-semibold text-ink-900 hover:text-forest-800 hover:underline"
                >
                  {c.title}
                </a>
                <p className="mt-0.5 truncate text-ink-600">ავტორი: {c.author}</p>
                <p className="text-ink-500">{c.license}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
