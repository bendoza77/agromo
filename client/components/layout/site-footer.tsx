import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { categories } from "@/lib/data/taxonomy";

const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-forest-950 text-cream-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream-200/80">
            ქართული აგროპროდუქციის მარკეტპლეისი. მყიდველი პირდაპირ უკავშირდება მწარმოებელს — შუამავლის გარეშე.
          </p>
        </div>

        <FooterColumn title="მარკეტპლეისი">
          <FooterLink href="/products">ყველა პროდუქცია</FooterLink>
          <FooterLink href="/farmers">ფერმერები</FooterLink>
          <FooterLink href="/favorites">რჩეულები</FooterLink>
          <FooterLink href="/#how-it-works">როგორ მუშაობს</FooterLink>
        </FooterColumn>

        <FooterColumn title="კატეგორიები">
          {categories.slice(0, 6).map((c) => (
            <FooterLink key={c.slug} href={`/categories/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="ფერმერებისთვის">
          <FooterLink href="/register?role=farmer">ფერმერის ანგარიშის შექმნა</FooterLink>
          <FooterLink href="/dashboard/products/new">განცხადების დამატება</FooterLink>
          <FooterLink href="/dashboard">ფერმერის პანელი</FooterLink>
          <FooterLink href="/credits">ფოტოების წყაროები</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-cream-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} Agromo</p>
          <p>
            სადემონსტრაციო პროტოტიპი — მონაცემები გამოგონილია და ინახება მხოლოდ თქვენს ბრაუზერში.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-cream-50">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[0.9375rem] text-cream-200/80 transition-colors hover:text-white hover:underline">
        {children}
      </Link>
    </li>
  );
}
