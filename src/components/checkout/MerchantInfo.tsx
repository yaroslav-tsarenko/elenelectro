import { Store } from "lucide-react";
import { COMPANY } from "@/lib/company";

export function MerchantInfo({ title }: { title: string }) {
  return (
    <div className="mt-5 pt-5 border-t border-line text-xs leading-[1.7] text-ink-muted">
      <div className="flex items-center gap-1.5 mb-1.5 font-semibold text-ink">
        <Store size={14} />
        {title}
      </div>
      <p className="m-0">
        <strong className="font-semibold">{COMPANY.name}</strong>
        <br />
        {COMPANY.addressLine}
        <br />
        {COMPANY.country}
        <br />
        Company number: {COMPANY.companyNumber}
        <br />
        <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-brand transition-colors">
          {COMPANY.phone}
        </a>
        {" · "}
        <a href={`mailto:${COMPANY.email}`} className="hover:text-brand transition-colors">
          {COMPANY.email}
        </a>
      </p>
    </div>
  );
}
