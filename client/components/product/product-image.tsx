"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface ProductImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}

/**
 * Fills its (relatively positioned, aspect-ratio'd) parent. Local photos go
 * through next/image; user-provided URLs or local previews (data:) render as a
 * plain <img>. Missing or broken images fall back to a neutral placeholder so
 * the layout never breaks.
 */
export function ProductImage({ src, alt, sizes, preload = false, className }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,var(--color-cream-200)_0_12px,var(--color-cream-100)_12px_24px)] text-ink-500",
          className,
        )}
        role="img"
        aria-label={alt ? `${alt} — ფოტო არ არის` : "ფოტო არ არის"}
      >
        <ImageOff className="h-6 w-6" aria-hidden />
        <span className="px-2 text-center text-xs font-medium">ფოტო არ არის</span>
      </div>
    );
  }

  const cls = cn("object-cover", className);

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cls}
        onError={() => setFailedSrc(src)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URLs / data: previews can't use the optimizer
    <img
      src={src}
      alt={alt}
      loading={preload ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("absolute inset-0 h-full w-full", cls)}
      onError={() => setFailedSrc(src)}
    />
  );
}
