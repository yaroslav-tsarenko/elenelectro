"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0A84FF", "#8b5cf6", "#00C853", "#F59E0B", "#EF4444", "#06b6d4", "#ec4899", "#14b8a6"];

interface CategoryChartProps {
  data: { name: string; _count: { products: number } }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data
    .map((c, i) => ({
      name: c.name,
      products: c._count.products,
      fill: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.products - a.products);

  if (chartData.length === 0) {
    return (
      <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)" }}>
        No categories
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={120} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "#f5f5f5",
          }}
        />
        <Bar dataKey="products" radius={[0, 6, 6, 0]} name="Products">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
