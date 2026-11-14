import { Info, MessageCircle, Phone, PhoneOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { getContactState, productInquiryMessage, sellerInquiryMessage, telHref, whatsappHref } from "@/lib/contact";
import type { Seller } from "@/lib/types";

interface ContactActionsProps {
  seller: Pick<Seller, "phone" | "whatsapp" | "name">;
  productTitle?: string;
  layout?: "stack" | "bar";
  className?: string;
}

/**
 * Phone + WhatsApp actions derived from the seller's mock data. Unavailable
 * channels are shown as such — never as working buttons.
 */
export function ContactActions({ seller, productTitle, layout = "stack", className }: ContactActionsProps) {
  const state = getContactState(seller);

  if (state.kind === "none") {
    if (layout === "bar") return null;
    return (
      <div className={cn("flex gap-3 rounded-lg border border-line bg-cream-100 p-4 text-[0.9375rem] text-ink-700", className)}>
        <PhoneOff className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden />
        <p>
          <span className="font-semibold text-ink-900">საკონტაქტო ნომერი არ არის მითითებული.</span> გამყიდველს ტელეფონი ჯერ არ
          დაუმატებია პროფილში.
        </p>
      </div>
    );
  }

  const phone = state.phone;
  const waMessage = productTitle ? productInquiryMessage(productTitle) : sellerInquiryMessage();
  const waAvailable = state.kind === "full";

  if (layout === "bar") {
    return (
      <div className={cn("flex gap-2", className)}>
        <a href={telHref(phone)} className="btn btn-primary flex-1">
          <Phone className="h-4 w-4" aria-hidden />
          დარეკვა
        </a>
        {waAvailable && (
          <a
            href={whatsappHref(phone, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp flex-1"
            aria-label="WhatsApp-ით მიწერა (იხსნება ახალ ფანჯარაში)"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <a href={telHref(phone)} className="btn btn-primary h-12 text-base">
          <Phone className="h-5 w-5" aria-hidden />
          <span className="tabular-nums">{phone.display}</span>
        </a>
        {waAvailable ? (
          <a
            href={whatsappHref(phone, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp h-12 text-base"
            aria-label="WhatsApp-ით მიწერა (იხსნება ახალ ფანჯარაში)"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp
          </a>
        ) : (
          <span className="btn btn-secondary h-12 cursor-not-allowed text-base opacity-60" aria-disabled="true">
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp მიუწვდომელია
          </span>
        )}
      </div>
      <p className="flex gap-2 text-sm leading-relaxed text-ink-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {waAvailable
          ? "WhatsApp გაიხსნება მზა ტექსტით. შეტყობინება გაიგზავნება მხოლოდ მაშინ, როცა თავად დააჭერთ „გაგზავნას“."
          : state.reason === "landline"
            ? "ეს სახლის/ოფისის ნომერია — მასზე WhatsApp არ მუშაობს. გამყიდველს დაურეკეთ."
            : "გამყიდველს WhatsApp არ აქვს მითითებული. დაუკავშირდით ზარით."}
      </p>
    </div>
  );
}
