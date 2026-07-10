"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface ProductTabsProps {
  description?: string | null;
  characteristics?: Record<string, Record<string, string>> | null;
  reviews: Review[];
}

function countCharacteristics(chars: Record<string, Record<string, string>>): number {
  return Object.values(chars).reduce((sum, group) => sum + Object.keys(group).length, 0);
}

export function ProductTabs({ description, characteristics, reviews }: ProductTabsProps) {
  const t = useTranslations("product");
  const [activeTab, setActiveTab] = useState<"description" | "characteristics" | "reviews">("description");

  const groups = characteristics ? Object.entries(characteristics) : [];
  const totalCharCount = characteristics ? countCharacteristics(characteristics) : 0;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-12 max-md:mt-8">
      <div className="flex border-b-2 border-line gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
        <button
          className={`px-7 py-4 max-sm:px-4 max-sm:py-3.5 text-[0.9375rem] max-sm:text-sm font-semibold bg-transparent border-0 border-b-2 -mb-0.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${activeTab === "description" ? "text-brand border-brand" : "text-ink-muted border-transparent hover:text-ink"}`}
          onClick={() => setActiveTab("description")}
          role="tab"
          aria-selected={activeTab === "description"}
        >
          {t("description")}
        </button>
        <button
          className={`px-7 py-4 max-sm:px-4 max-sm:py-3.5 text-[0.9375rem] max-sm:text-sm font-semibold bg-transparent border-0 border-b-2 -mb-0.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${activeTab === "characteristics" ? "text-brand border-brand" : "text-ink-muted border-transparent hover:text-ink"}`}
          onClick={() => setActiveTab("characteristics")}
          role="tab"
          aria-selected={activeTab === "characteristics"}
        >
          {t("characteristics")}
          {totalCharCount > 0 && (
            <span className="text-xs font-normal text-ink-subtle ml-1">({totalCharCount})</span>
          )}
        </button>
        <button
          className={`px-7 py-4 max-sm:px-4 max-sm:py-3.5 text-[0.9375rem] max-sm:text-sm font-semibold bg-transparent border-0 border-b-2 -mb-0.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${activeTab === "reviews" ? "text-brand border-brand" : "text-ink-muted border-transparent hover:text-ink"}`}
          onClick={() => setActiveTab("reviews")}
          role="tab"
          aria-selected={activeTab === "reviews"}
        >
          {t("reviews", { count: reviews.length })}
        </button>
      </div>

      <div className="py-8 max-sm:py-5" role="tabpanel">
        {activeTab === "description" && (
          description ? (
            <div className="text-[0.9375rem] leading-[1.8] text-ink-muted max-w-[80ch] [&_p]:mb-4">
              {description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-ink-subtle text-[0.9375rem] py-8 text-center">-</p>
          )
        )}

        {activeTab === "characteristics" && (
          groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-8">
              {groups.map(([groupName, entries]) => (
                <div key={groupName} className="flex flex-col">
                  <h3 className="text-[1.0625rem] font-extrabold text-ink mb-3 pb-2 border-b-2 border-line">{groupName}</h3>
                  <table className="w-full border-collapse [&_tr:nth-child(even)]:bg-surface-1 [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-sm [&_td]:border-b [&_td]:border-line [&_td]:align-top">
                    <tbody>
                      {Object.entries(entries).map(([key, value]) => (
                        <tr key={key}>
                          <td className="text-ink-muted font-normal w-[55%]">{key}</td>
                          <td className="text-ink font-bold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-subtle text-[0.9375rem] py-8 text-center">-</p>
          )
        )}

        {activeTab === "reviews" && (
          reviews.length > 0 ? (
            <>
              <div className="flex items-center gap-8 max-sm:gap-5 p-6 max-sm:p-5 bg-surface-1 rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-[2.5rem] max-sm:text-3xl font-extrabold leading-none text-ink">{avgRating.toFixed(1)}</div>
                  <div className="text-warning text-[1.125rem] mt-1">
                    {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                  </div>
                  <div className="text-[0.8125rem] text-ink-subtle mt-1">{reviews.length} {t("reviews", { count: reviews.length }).toLowerCase().replace(/\(\d+\)/, "").trim()}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 max-sm:px-5 max-sm:py-4 border border-line rounded-xl bg-surface transition-shadow hover:shadow-[var(--shadow-md)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[0.9375rem] text-ink">
                        {review.user.name || "Anonymous"}
                      </span>
                      <span className="text-warning text-sm tracking-widest">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-ink-muted text-sm leading-[1.65]">{review.comment}</p>
                    )}
                    <div className="text-xs text-ink-subtle mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-ink-subtle text-[0.9375rem] py-8 text-center">{t("noReviews")}</p>
          )
        )}
      </div>
    </div>
  );
}
