"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { MapPin } from "lucide-react";

export default function AddressesPage() {
  const t = useTranslations("account");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>{t("addresses")}</h1>
      <EmptyState
        title="No addresses yet"
        subtitle="Add a shipping address for faster checkout"
        icon={<MapPin size={48} />}
      />
    </div>
  );
}
