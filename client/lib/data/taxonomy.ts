import type { Availability, Category, CategorySlug, ListingStatus, Region, RegionSlug, Unit } from "@/lib/types";

const photo = (key: string) => `/images/photos/${key}.jpg`;

export const categories: Category[] = [
  {
    slug: "fruits",
    name: "ხილი",
    description: "ყურძენი, ციტრუსი, ხურმა და სეზონური ხილი პირდაპირ ბაღიდან.",
    image: photo("mandarins-bowl"),
  },
  {
    slug: "vegetables",
    name: "ბოსტნეული",
    description: "პომიდორი, კარტოფილი, წიწაკა და ბოსტნეული ქართული მეურნეობებიდან.",
    image: photo("tomatoes-market"),
  },
  {
    slug: "nuts",
    name: "თხილი და კაკალი",
    description: "სამეგრელოს თხილი და კახური კაკალი — ნაჭუჭით ან გულად.",
    image: photo("hazelnuts-in-shell"),
  },
  {
    slug: "honey",
    name: "თაფლი",
    description: "მთისა და ველის თაფლი, ფიჭა — მეფუტკრეებისგან.",
    image: photo("honey-comb-jar"),
  },
  {
    slug: "dairy-eggs",
    name: "რძე და კვერცხი",
    description: "სულგუნი, იმერული ყველი, მაწონი და სოფლის კვერცხი.",
    image: photo("imeretian-cheese"),
  },
  {
    slug: "grains",
    name: "მარცვლეული",
    description: "ხორბალი, სიმინდი და პარკოსნები — მცირე და დიდი მოცულობით.",
    image: photo("wheat-grain"),
  },
  {
    slug: "herbs",
    name: "მწვანილი",
    description: "ქინძი, ტარხუნა და ახალი მწვანილი შეკვრებად.",
    image: photo("herbs-crate"),
  },
  {
    slug: "other",
    name: "სხვა პროდუქტი",
    description: "ჩურჩხელა და სხვა ტრადიციული აგროპროდუქტი.",
    image: photo("churchkhela"),
  },
];

export const regions: Region[] = [
  { slug: "kakheti", name: "კახეთი" },
  { slug: "imereti", name: "იმერეთი" },
  { slug: "guria", name: "გურია" },
  { slug: "samegrelo", name: "სამეგრელო" },
  { slug: "adjara", name: "აჭარა" },
  { slug: "shida-kartli", name: "შიდა ქართლი" },
  { slug: "kvemo-kartli", name: "ქვემო ქართლი" },
  { slug: "samtskhe-javakheti", name: "სამცხე-ჯავახეთი" },
  { slug: "racha", name: "რაჭა" },
  { slug: "mtskheta-mtianeti", name: "მცხეთა-მთიანეთი" },
  { slug: "tbilisi", name: "თბილისი" },
];

export const units: Record<Unit, { short: string; long: string }> = {
  kg: { short: "კგ", long: "კილოგრამი" },
  ton: { short: "ტ", long: "ტონა" },
  liter: { short: "ლ", long: "ლიტრი" },
  piece: { short: "ცალი", long: "ცალი" },
  bundle: { short: "შეკვრა", long: "შეკვრა" },
  jar: { short: "ქილა", long: "ქილა" },
  dozen: { short: "ათეული", long: "ათეული" },
};

export const availabilityLabels: Record<Availability, string> = {
  available: "ხელმისაწვდომია",
  preorder: "წინასწარი შეკვეთით",
  sold_out: "ამოწურულია",
};

export const statusLabels: Record<ListingStatus, string> = {
  published: "გამოქვეყნებული",
  hidden: "დამალული",
};

const categoryMap = new Map(categories.map((c) => [c.slug, c]));
const regionMap = new Map(regions.map((r) => [r.slug, r]));

export function getCategory(slug: string): Category | undefined {
  return categoryMap.get(slug as CategorySlug);
}

export function getRegion(slug: string): Region | undefined {
  return regionMap.get(slug as RegionSlug);
}

export function isCategorySlug(value: string): value is CategorySlug {
  return categoryMap.has(value as CategorySlug);
}

export function isRegionSlug(value: string): value is RegionSlug {
  return regionMap.has(value as RegionSlug);
}
