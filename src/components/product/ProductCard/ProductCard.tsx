"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  imageUrl?: string | null;
  category?: string;
  quantity: number;
}

const badgeBase =
  "absolute top-3 left-3 px-3 py-[0.3rem] rounded-pill text-[0.6875rem] font-bold z-[4] tracking-[0.03em] uppercase";
const overlayBtnBase =
  "w-10 h-10 rounded-pill bg-surface border-0 flex items-center justify-center cursor-pointer text-ink shadow-[var(--shadow-md)] transition-all hover:scale-110 hover:bg-brand hover:text-white active:scale-95";

export function ProductCard({
  id,
  name,
  slug,
  sku,
  price,
  comparePrice,
  imageUrl,
  category,
  quantity,
}: ProductCardProps) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const isOnSale = comparePrice && comparePrice > price;
  const outOfStock = quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: id,
      name,
      slug,
      sku,
      price,
      quantity: 1,
      imageUrl: imageUrl || null,
      maxQuantity: quantity,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={`/product/${slug}`}
      className="group rounded-xl overflow-hidden bg-surface border border-line transition-all duration-300 flex flex-col min-w-0 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {imageUrl ? (
          <div className="absolute inset-3 max-sm:inset-1.5">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-500 group-hover:scale-[1.06]"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink-subtle text-[0.8125rem]">
            <ImageOff size={32} />
            No Image
          </div>
        )}

        {isOnSale && (
          <span className={`${badgeBase} bg-sale text-white`}>Sale</span>
        )}
        {outOfStock && (
          <span className={`${badgeBase} bg-ink-subtle text-white`}>
            {t("outOfStock")}
          </span>
        )}

        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-pill bg-surface border-0 flex items-center justify-center cursor-pointer z-[4] text-ink-subtle shadow-[var(--shadow-sm)] transition-all opacity-0 group-hover:opacity-100 hover:text-danger hover:scale-[1.15]"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className="p-4 max-sm:p-3 flex-1 flex flex-col gap-1.5 max-sm:gap-1">
        {category && (
          <span className="text-[0.6875rem] max-sm:text-[0.625rem] text-brand uppercase tracking-[0.06em] font-semibold">
            {category}
          </span>
        )}
        <h3 className="text-[0.9375rem] max-sm:text-[0.8125rem] font-semibold text-ink line-clamp-2 leading-[1.4] max-sm:leading-[1.35] break-words [overflow-wrap:anywhere] min-h-[calc(0.9375rem*1.4*2)] max-sm:min-h-[calc(0.8125rem*1.35*2)]">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <PriceDisplay price={price} comparePrice={comparePrice} size="sm" />
          <button
            className={`w-9 h-9 max-sm:w-8 max-sm:h-8 rounded-lg bg-brand-soft border-0 flex items-center justify-center cursor-pointer text-brand transition-all ${
              outOfStock
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-brand hover:text-white hover:scale-[1.08] active:scale-95"
            }`}
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={t("addToCart")}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
