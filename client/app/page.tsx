import { MessageCircle, Search, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryStrip } from "@/components/home/category-strip";
import { Hero } from "@/components/home/hero";
import { RecentProducts } from "@/components/home/recent-products";
import { RegionsIndex } from "@/components/home/regions-index";
import { SectionHeading } from "@/components/home/section-heading";
import { SellerList } from "@/components/seller/seller-list";

const STEPS = [
  {
    icon: Search,
    title: "მოძებნეთ პროდუქტი",
    text: "გამოიყენეთ ძიება, კატეგორიები და რეგიონის ფილტრი — ნახეთ ფასი, რაოდენობა და მდებარეობა.",
  },
  {
    icon: UserRound,
    title: "გაეცანით გამყიდველს",
    text: "ფერმერის პროფილზე ნახავთ მის მეურნეობას, რეგიონს და სხვა განცხადებებს.",
  },
  {
    icon: MessageCircle,
    title: "დაუკავშირდით პირდაპირ",
    text: "დარეკეთ ან მისწერეთ WhatsApp-ზე და შეუთანხმდით ფასს, რაოდენობასა და ჩამოტანას.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section aria-labelledby="categories-heading" className="container-page pt-14 sm:pt-16">
        <SectionHeading id="categories-heading" title="კატეგორიები" link={{ href: "/products", label: "ყველა პროდუქცია" }} />
        <CategoryStrip />
      </section>

      <section aria-labelledby="recent-heading" className="container-page py-14 sm:py-16">
        <SectionHeading
          id="recent-heading"
          eyebrow="ახლად დამატებული"
          title="ბოლოს გამოქვეყნებული განცხადებები"
          link={{ href: "/products?sort=newest", label: "ყველა განცხადება" }}
        />
        <RecentProducts />
      </section>

      <section aria-labelledby="regions-heading" className="border-y border-line bg-white">
        <div className="container-page grid gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
          <figure className="relative order-2 lg:order-1">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-cream-200">
              <Image
                src="/images/photos/alazani-valley.jpg"
                alt="ალაზნის ველი — ვენახები და მინდვრები კავკასიონის ფონზე"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-ink-500">ალაზნის ველი, კახეთი</figcaption>
          </figure>
          <div className="order-1 lg:order-2">
            <SectionHeading
              id="regions-heading"
              eyebrow="რეგიონების მიხედვით"
              title="ყოველ კუთხეს თავისი მოსავალი აქვს"
              description="კახური ყურძენი, მეგრული თხილი, აჭარული ციტრუსი, ჯავახური კარტოფილი — აირჩიეთ რეგიონი და ნახეთ, რას ყიდიან იქაური ფერმერები."
              className="mb-6"
            />
            <RegionsIndex />
          </div>
        </div>
      </section>

      <section aria-labelledby="sellers-heading" className="container-page py-14 sm:py-16">
        <SectionHeading
          id="sellers-heading"
          eyebrow="მწარმოებლები"
          title="გაიცანით, ვისგან ყიდულობთ"
          description="Agromo-ზე პროდუქციას ფერმერები და მცირე მეურნეობები თავად ათავსებენ."
          link={{ href: "/farmers", label: "ყველა ფერმერი" }}
        />
        <SellerList limit={4} />
      </section>

      <section id="how-it-works" aria-labelledby="how-heading" className="border-t border-line bg-cream-50">
        <div className="container-page py-14 sm:py-16">
          <SectionHeading id="how-heading" eyebrow="როგორ მუშაობს" title="სამი ნაბიჯი ფერმერამდე" />
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative flex gap-4 md:flex-col">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-forest-700/20 bg-leaf-100 text-forest-800">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="hidden font-display text-sm font-semibold text-ink-400 md:inline">0{i + 1}</span>
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-3xl border-l-2 border-harvest-500 pl-4 text-[0.9375rem] leading-relaxed text-ink-600">
            Agromo არ ამუშავებს გადახდებს და არ ახორციელებს მიწოდებას. ფასს, ხარისხსა და ჩამოტანას მყიდველი და გამყიდველი
            უშუალოდ ერთმანეთს უთანხმებენ.
          </p>
        </div>
      </section>

      <section aria-labelledby="farmer-cta-heading" className="bg-forest-900 text-cream-50">
        <div className="container-page grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2">
          <div className="max-w-lg">
            <p className="eyebrow text-leaf-200">ფერმერებისთვის</p>
            <h2 id="farmer-cta-heading" className="mt-3 font-display text-[1.75rem] font-semibold leading-tight sm:text-3xl">
              გაქვთ მოსავალი გასაყიდად?
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-cream-200/85">
              შექმენით მეურნეობის პროფილი, დაამატეთ პროდუქცია ფოტოთი და ფასით და მიიღეთ ზარები პირდაპირ მყიდველებისგან.
              განცხადებების რედაქტირება და დამალვა ნებისმიერ დროს შეგიძლიათ.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register?role=farmer" className="btn bg-cream-50 text-forest-900 hover:bg-white">
                ფერმერად რეგისტრაცია
              </Link>
              <Link href="/login" className="btn border-cream-50/30 text-cream-50 hover:border-cream-50/60 hover:bg-white/5">
                უკვე მაქვს ანგარიში
              </Link>
            </div>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
            <Image
              src="/images/photos/churchkhela-stall.jpg"
              alt="ჩურჩხელით, ხილითა და საზამთროთი სავსე ბაზრის დახლი"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
