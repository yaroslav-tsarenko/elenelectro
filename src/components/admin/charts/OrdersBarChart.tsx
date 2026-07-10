"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";

interface OrdersBarChartProps {
  data: { total: number; createdAt: string; status: string }[];
}

export function OrdersBarChart({ data }: OrdersBarChartProps) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStr = format(date, "yyyy-MM-dd");
    const label = format(date, "EEE");
    const dayOrders = data.filter(
      (o) => format(new Date(o.createdAt), "yyyy-MM-dd") === dayStr
    );
    return {
      day: label,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  if (data.length === 0) {
    return (
      <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)" }}>
        No orders this week
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={last7}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "#f5f5f5",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa" }} />
        <Bar yAxisId="left" dataKey="orders" fill="#0A84FF" radius={[6, 6, 0, 0]} name="Orders" />
        <Bar yAxisId="right" dataKey="revenue" fill="rgba(10,132,255,0.4)" radius={[6, 6, 0, 0]} name="Revenue (€)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
