"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
};

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface Props {
  tabs: TabData[];
}

export function HorizontalTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;

  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-3">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab, i) => {
          const Icon = tab.icon ? ICON_MAP[tab.icon] : Tag;
          const isActive = i === active;
          return (
            <Link
              key={tab.id}
              href={tab.linkUrl}
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-surface border rounded-md text-[0.8125rem] font-medium text-ink no-underline whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand bg-brand-soft"
                  : "border-line hover:border-line-hover hover:shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              }`}
              onClick={() => setActive(i)}
            >
              <Icon size={15} style={{ color: tab.color }} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
