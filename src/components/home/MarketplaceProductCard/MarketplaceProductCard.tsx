"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    comparePrice?: number | string | null;
    images: { url: string; alt?: string | null }[];
    categories?: { category: { name: string; slug: string } }[];
    quantity?: number;
    status?: string;
    isFeatured?: boolean;
    brand?: string | null;
  };
}

const actionBtnCls =
  "w-[30px] h-[30px] flex items-center justify-center bg-surface border border-line rounded-md cursor-pointer text-ink-muted transition-colors hover:text-sale hover:border-sale";

export function MarketplaceProductCard({ product }: Props) {
  const { addItem } = useCart();
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const inStock = product.quantity === undefined || product.quantity > 0;
  const imageUrl = product.images?.[0]?.url;
  const imgSrc = getProductImage(imageUrl, product.name);
  const category = product.categories?.[0]?.category;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      imageUrl: imgSrc,
      quantity: 1,
      slug: product.slug,
      sku: product.id,
      maxQuantity: product.quantity ?? 99,
    });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-surface border border-line rounded-lg overflow-hidden no-underline text-ink flex flex-col transition-all hover:border-line-hover hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] hover:-translate-y-1"
    >
      <div className="relative p-3 flex items-center justify-center bg-white aspect-square overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.images?.[0]?.alt || product.name}
          width={200}
          height={200}
          className="object-contain max-w-full max-h-full transition-transform duration-200 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getProductImageFallback();
          }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-sale text-white text-[0.7rem] font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-0 bg-white/75 flex items-center justify-center text-[0.8125rem] font-semibold text-ink-muted">
            Out of Stock
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            className={actionBtnCls}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Add to wishlist"
          >
            <Heart size={15} />
          </button>
          <button
            className={actionBtnCls}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
      <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1">
        {category && (
          <span className="text-[0.65rem] text-ink-subtle uppercase tracking-[0.03em] mb-1">
            {category.name}
          </span>
        )}
        <h4 className="text-[0.8125rem] max-sm:text-xs font-semibold m-0 mb-1.5 leading-[1.35] line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-px mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={11} fill={s <= 4 ? "#f59e0b" : "none"} stroke={s <= 4 ? "#f59e0b" : "#cbd5e1"} />
          ))}
          <span className="text-[0.65rem] text-ink-subtle ml-1">(12)</span>
        </div>
        <div className="flex items-center justify-between mb-1.5 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base max-sm:text-sm font-extrabold text-ink">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-ink-subtle line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>
          <button
            className={`w-8 h-8 flex items-center justify-center text-white border-0 rounded-md cursor-pointer transition-colors shrink-0 ${
              inStock ? "bg-brand hover:bg-brand-hover" : "bg-ink-subtle cursor-not-allowed"
            }`}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
        {inStock ? (
          <span className="text-[0.65rem] text-success font-medium">In stock</span>
        ) : (
          <span className="text-[0.65rem] text-sale font-medium">Out of stock</span>
        )}
      </div>
    </Link>
  );
}
