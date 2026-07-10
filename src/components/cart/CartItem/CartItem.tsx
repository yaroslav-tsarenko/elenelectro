"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-5 border-b border-line first:pt-0">
      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[linear-gradient(135deg,var(--color-bg-tertiary)_0%,var(--color-bg-secondary)_100%)] shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            style={{ objectFit: "contain", padding: "4px" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[0.625rem] text-ink-subtle">
            No Image
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="font-semibold text-[0.9375rem]">{item.name}</h3>
        {item.variantName && (
          <span className="text-xs text-ink-subtle">{item.variantName}</span>
        )}
        <div className="flex items-center justify-between mt-auto">
          <QuantitySelector
            quantity={item.quantity}
            maxQuantity={item.maxQuantity}
            onChange={(qty) => updateQuantity(item.productId, qty, item.variantId)}
          />
          <div className="flex items-center gap-3">
            <PriceDisplay price={item.price * item.quantity} size="sm" />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => removeItem(item.productId, item.variantId)}
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
