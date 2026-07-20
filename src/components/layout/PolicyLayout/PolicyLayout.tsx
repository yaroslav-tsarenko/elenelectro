import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { ReactNode } from "react";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const contentCls = [
  "leading-[1.75] text-ink-muted text-[0.9375rem] max-sm:text-sm max-sm:leading-[1.65]",
  "[&_h2]:text-[1.125rem] [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3 max-sm:[&_h2]:text-[1.0625rem] max-sm:[&_h2]:mt-6",
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 max-sm:[&_h3]:text-[0.9375rem]",
  "[&_p]:mb-3",
  "[&_ul]:mt-2 [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:p-0 [&_ul]:list-disc",
  "[&_ul_li]:mb-1",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm [&_table]:block [&_table]:overflow-x-auto",
  "[&_table_thead]:table [&_table_tbody]:table [&_table_tr]:table [&_table_thead]:w-full [&_table_tbody]:w-full [&_table_tr]:w-full [&_table_thead]:table-fixed [&_table_tbody]:table-fixed [&_table_tr]:table-fixed",
  "[&_table_th]:border [&_table_th]:border-line [&_table_th]:px-3 [&_table_th]:py-2 [&_table_th]:text-left [&_table_th]:break-words [&_table_th]:font-semibold [&_table_th]:text-ink [&_table_th]:bg-surface-1",
  "[&_table_td]:border [&_table_td]:border-line [&_table_td]:px-3 [&_table_td]:py-2 [&_table_td]:text-left [&_table_td]:break-words",
].join(" ");

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 [overflow-wrap:anywhere] break-words">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: title },
        ]}
      />
      <h1 className="text-[1.75rem] max-sm:text-[1.375rem] font-extrabold tracking-[-0.02em] mb-5 text-ink">
        {title}
      </h1>
      <div className={contentCls}>
        <p className="mb-4 text-sm text-ink-subtle">Last updated: {lastUpdated}</p>
        {children}
      </div>
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className="mt-2 leading-[1.7] px-4 py-3.5 border border-line rounded-md bg-surface-1 text-sm">
      <p>
        <strong>AVONTRA LTD</strong>
        <br />
        Company number: 17245887
        <br />
        Director: Helen CHAMPION
        <br />
        Registered office: Dept 6735, 196 High Road, Wood Green, London, United Kingdom, N22 8HH
        <br />
        Phone: +44 7360 545980
        <br />
        Email: info@elenelectro.com
      </p>
    </div>
  );
}
