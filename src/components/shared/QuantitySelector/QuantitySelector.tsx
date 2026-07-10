"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({ quantity, maxQuantity, onChange }: QuantitySelectorProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        onPress={() => onChange(Math.max(1, quantity - 1))}
        isDisabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </Button>
      <span
        style={{
          minWidth: "2rem",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        {quantity}
      </span>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        onPress={() => onChange(Math.min(maxQuantity, quantity + 1))}
        isDisabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
