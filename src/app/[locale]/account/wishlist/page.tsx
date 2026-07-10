"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";

export default function WishlistPage() {
  const t = useTranslations("account");
  const nav = useTranslations("nav");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        setItems(
          data.map((item: { product: Record<string, unknown> }) => item.product)
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>{t("wishlist")}</h1>

      {items.length === 0 ? (
        <EmptyState
          title={t("emptyWishlist")}
          actionLabel={nav("catalog")}
          actionHref="/catalog"
          icon={<Heart size={48} />}
        />
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
