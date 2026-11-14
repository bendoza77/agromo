"use client";

import { Heart } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useFavoriteIds, useSession } from "@/lib/hooks";
import { toggleFavorite } from "@/lib/services/favorites";

let guestHintShown = false;

interface FavoriteButtonProps {
  productId: string;
  productTitle: string;
  variant?: "overlay" | "button";
  className?: string;
}

export function FavoriteButton({ productId, productTitle, variant = "overlay", className }: FavoriteButtonProps) {
  const favorites = useFavoriteIds();
  const { user, ready } = useSession();
  const saved = ready && favorites.has(productId);

  function onClick() {
    const nowSaved = toggleFavorite(productId);
    if (nowSaved && !user && !guestHintShown) {
      guestHintShown = true;
      toast.info("შენახულია ამ ბრაუზერში. ანგარიშზე შესვლისას რჩეულები ავტომატურად გადავა თქვენს ანგარიშზე.");
    }
  }

  const label = saved ? `„${productTitle}“ რჩეულებიდან ამოშლა` : `„${productTitle}“ რჩეულებში შენახვა`;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className={cn("btn btn-secondary", saved && "border-forest-600 text-forest-800", className)}
      >
        <Heart className={cn("h-5 w-5 transition-transform", saved && "scale-110 fill-current text-danger-600")} aria-hidden />
        <span>{saved ? "შენახულია" : "შენახვა"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "რჩეულებიდან ამოშლა" : "რჩეულებში შენახვა"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-ink-900",
        className,
      )}
    >
      <Heart
        className={cn("h-5 w-5 transition-transform duration-200", saved && "scale-110 fill-danger-600 text-danger-600")}
        aria-hidden
      />
    </button>
  );
}
