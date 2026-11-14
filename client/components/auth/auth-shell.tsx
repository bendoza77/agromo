import { FlaskConical } from "lucide-react";
import Image from "next/image";

export function AuthShell({
  title,
  description,
  image,
  imageAlt,
  caption,
  children,
}: {
  title: string;
  description: React.ReactNode;
  image: string;
  imageAlt: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex justify-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[1.875rem] font-semibold leading-tight text-forest-900">{title}</h1>
          <div className="mt-2 text-[1rem] leading-relaxed text-ink-600">{description}</div>
          <div className="mt-8">{children}</div>
          <p className="mt-10 flex gap-2 rounded-lg border border-dashed border-line-strong p-3 text-sm leading-relaxed text-ink-500">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              სადემონსტრაციო პროტოტიპი: ანგარიშები ინახება მხოლოდ ამ ბრაუზერში, სერვერზე არაფერი იგზავნება. ნუ გამოიყენებთ
              რეალურ პაროლს.
            </span>
          </p>
        </div>
      </div>
      <figure className="relative hidden lg:block">
        <Image src={image} alt={imageAlt} fill sizes="45vw" className="object-cover" />
        <figcaption className="absolute bottom-6 left-6 right-6 max-w-sm rounded-lg bg-forest-950/70 px-4 py-3 text-[0.9375rem] text-cream-50 backdrop-blur-sm">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
}
