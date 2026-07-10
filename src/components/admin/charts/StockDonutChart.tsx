"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StockDonutChartProps {
  data: { outOfStock: number; lowStock: number; inStock: number };
}

export function StockDonutChart({ data }: StockDonutChartProps) {
  const chartData = [
    { name: "In Stock", value: data.inStock, color: "#00C853" },
    { name: "Low Stock", value: data.lowStock, color: "#F59E0B" },
    { name: "Out of Stock", value: data.outOfStock, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  const total = data.inStock + data.lowStock + data.outOfStock;

  if (total === 0) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)" }}>
        No products
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              color: "#f5f5f5",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--admin-text)" }}>{total}</div>
        <div style={{ fontSize: "0.6875rem", color: "var(--admin-text-muted)" }}>Total</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
        {chartData.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
            <span style={{ color: "var(--admin-text-secondary)" }}>{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
