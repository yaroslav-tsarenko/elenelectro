"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STAR_COLORS = ["#EF4444", "#f97316", "#F59E0B", "#84cc16", "#00C853"];

interface ReviewsChartProps {
  data: { rating: number; _count: number }[];
}

export function ReviewsChart({ data }: ReviewsChartProps) {
  const chartData = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star}★`,
    count: data.find((d) => d.rating === star)?._count || 0,
    fill: STAR_COLORS[star - 1],
  }));

  const total = chartData.reduce((s, d) => s + d.count, 0);
  const avg = total > 0
    ? [1, 2, 3, 4, 5].reduce((s, star) => s + star * (data.find((d) => d.rating === star)?._count || 0), 0) / total
    : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--admin-text)" }}>{avg.toFixed(1)}</span>
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-text-muted)" }}>avg from {total} reviews</span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="star" type="category" width={35} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              color: "#f5f5f5",
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Reviews">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
