"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface RevenueChartProps {
  data: {
    createdAt: string;
    _sum: { total: number };
    _count: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.createdAt), "MMM d"),
    revenue: Number(item._sum.total) || 0,
    orders: item._count,
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)" }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "#f5f5f5",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0A84FF"
          fill="url(#revenueGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
