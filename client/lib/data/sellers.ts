import type { Seller } from "@/lib/types";

/**
 * Demo sellers. Names, farms and phone numbers are fictional and exist only to
 * demonstrate the marketplace; they do not represent real businesses.
 */
export const seedSellers: Seller[] = [
  {
    id: "s-mamulashvili",
    name: "მამულაშვილების ვენახი",
    ownerName: "ნიკოლოზ მამულაშვილი",
    region: "kakheti",
    locality: "ველისციხე, გურჯაანი",
    description:
      "ოჯახური მეურნეობა ალაზნის ველზე. ოთხ ჰექტარზე მოგვყავს რქაწითელი და საფერავი, ეზოში — კაკალი და ბროწეული. შემოდგომით ჩურჩხელას ვამზადებთ საკუთარი ყურძნის ტკბილით.",
    phone: "+995 555 10 21 34",
    whatsapp: true,
    memberSince: 2023,
    coverImage: "/images/photos/grapes-crates.jpg",
  },
  {
    id: "s-kardava",
    name: "ქარდავების თხილის ბაღი",
    ownerName: "ლევან ქარდავა",
    region: "samegrelo",
    locality: "რუხი, ზუგდიდი",
    description:
      "თხილის ბაღი, რომელსაც მესამე თაობა უვლის. ვყიდით ნაჭუჭიან და გაფცქვნილ თხილს, მცირე რაოდენობით — ოჯახში დამზადებულ სულგუნს.",
    phone: "+995 577 21 44 09",
    whatsapp: true,
    memberSince: 2022,
    coverImage: "/images/photos/hazelnut-orchard.jpg",
  },
  {
    id: "s-chkhaidze",
    name: "ჩხაიძეების მეურნეობა",
    ownerName: "ნანა ჩხაიძე",
    region: "guria",
    locality: "ლიხაური, ოზურგეთი",
    description:
      "გურული ეზო-მეურნეობა: კივი, ხურმა და თეთრი სიმინდი. ვმუშაობთ როგორც ცალკეულ მყიდველებთან, ისე მცირე მაღაზიებთან.",
    phone: "+995 593 31 82 25",
    whatsapp: true,
    memberSince: 2024,
    coverImage: null,
  },
  {
    id: "s-lortkipanidze",
    name: "ლორთქიფანიძეების ფერმა",
    ownerName: "თამარ ლორთქიფანიძე",
    region: "imereti",
    locality: "ზედა სიმონეთი, თერჯოლა",
    description:
      "პატარა საოჯახო ფერმა 14 ძროხით და ქათმებით. ვამზადებთ იმერულ ყველსა და მაწონს, ვყიდით სოფლის კვერცხს. შეკვეთებს ვიღებთ კვირის ბოლომდე.",
    phone: "+995 599 40 71 18",
    whatsapp: true,
    memberSince: 2023,
    coverImage: null,
  },
  {
    id: "s-japaridze",
    name: "რაჭული საფუტკრე",
    ownerName: "ზურაბ ჯაფარიძე",
    region: "racha",
    locality: "ხვანჭკარა, ამბროლაური",
    description:
      "60 სკა რაჭის მთის ფერდობებზე. თაფლს ვწურავთ წელიწადში ორჯერ. ასევე გვაქვს რაჭული ლობიო საკუთარი ნაკვეთიდან. ზარებს ვპასუხობ საღამოს 6 საათის შემდეგ.",
    phone: "+995 558 62 03 01",
    whatsapp: false,
    memberSince: 2021,
    coverImage: "/images/photos/honeycomb.jpg",
  },
  {
    id: "s-maisuradze",
    name: "ქარალეთის ბაღები",
    ownerName: "დავით მაისურაძე",
    region: "shida-kartli",
    locality: "ქარალეთი, გორი",
    description:
      "ვაშლისა და ტყემლის ბაღები ლიახვის ხეობაში. ვყიდით ყუთებად და დიდი მოცულობით. ტელეფონი სახლისაა — WhatsApp-ით ვერ გიპასუხებთ.",
    phone: "+995 370 27 14 05",
    whatsapp: false,
    memberSince: 2022,
    coverImage: null,
  },
  {
    id: "s-aliev",
    name: "მარნეულის სათბური",
    ownerName: "რამაზ ალიევი",
    region: "kvemo-kartli",
    locality: "ალგეთი, მარნეული",
    description:
      "სათბურისა და ღია გრუნტის ბოსტნეული მთელი წლის განმავლობაში. პომიდორს, კიტრსა და წიწაკას ყოველდღე ვკრეფთ; საბითუმო შეკვეთებს წინასწარ ვთანხმდებით.",
    phone: "+995 551 73 39 02",
    whatsapp: true,
    memberSince: 2024,
    coverImage: "/images/photos/tomatoes-vine.jpg",
  },
  {
    id: "s-petrosyan",
    name: "ჯავახეთის კარტოფილი",
    ownerName: "არმენ პეტროსიანი",
    region: "samtskhe-javakheti",
    locality: "ფოკა, ნინოწმინდა",
    description:
      "მაღალმთიანი ჯავახეთის კარტოფილი, 2000 მეტრზე მოყვანილი. ვყიდით ტომრებად და ტონობით, ვინახავთ საკუთარ სარდაფში გაზაფხულამდე.",
    phone: "+995 568 94 52 10",
    whatsapp: true,
    memberSince: 2023,
    coverImage: "/images/photos/potato-harvest.jpg",
  },
  {
    id: "s-beridze",
    name: "ხელვაჩაურის ციტრუსი",
    ownerName: "მერაბ ბერიძე",
    region: "adjara",
    locality: "ქედქედი, ხელვაჩაური",
    description:
      "მანდარინისა და ხურმის ბაღი აჭარის ზღვისპირეთში. სეზონი ნოემბრიდან იანვრამდე გრძელდება. დიდ შეკვეთებს ყუთებად ვაფასოებთ.",
    phone: "+995 595 55 10 78",
    whatsapp: true,
    memberSince: 2022,
    coverImage: "/images/photos/mandarins-tree.jpg",
  },
  {
    id: "s-khositashvili",
    name: "შირაქის მარცვლეული",
    ownerName: "ალექსანდრე ხოსიტაშვილი",
    region: "kakheti",
    locality: "დედოფლისწყარო",
    description:
      "მარცვლეულის მეურნეობა შირაქის ველზე. ვყიდით ხორბალს და ქერს ტონობით — ძირითადად წისქვილებისა და ფერმერებისთვის.",
    phone: "+995 579 11 64 82",
    whatsapp: true,
    memberSince: 2021,
    coverImage: "/images/photos/wheat-harvest.jpg",
  },
  {
    id: "s-gelashvili",
    name: "საგურამოს მწვანილი",
    ownerName: "ეკა გელაშვილი",
    region: "mtskheta-mtianeti",
    locality: "საგურამო, მცხეთა",
    description:
      "ახალი მწვანილი თბილისის მახლობლად. პროფილი ახლახან შეიქმნა — საკონტაქტო ნომერი ჯერ არ არის დამატებული.",
    phone: null,
    whatsapp: false,
    memberSince: 2026,
    coverImage: null,
  },
];
