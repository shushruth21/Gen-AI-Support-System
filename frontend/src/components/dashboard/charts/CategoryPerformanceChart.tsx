"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { WorkItem, TicketCategory } from "@/types";

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  authentication: "Auth",
  performance: "Perf",
  billing: "Billing",
  "data-export": "Export",
  integrations: "Integrations",
  "ui-bug": "UI Bug",
  mobile: "Mobile",
  notifications: "Notifs",
  security: "Security",
  other: "Other",
};

function barColor(avgHours: number): string {
  if (avgHours <= 12) return "#22c55e";
  if (avgHours <= 24) return "#f59e0b";
  if (avgHours <= 48) return "#f97316";
  return "#ef4444";
}

export function CategoryPerformanceChart({ items }: { items: WorkItem[] }) {
  const byCategory: Record<string, number[]> = {};
  items.forEach((t) => {
    if (t.category && t.resolutionHours !== undefined) {
      (byCategory[t.category] ??= []).push(t.resolutionHours);
    }
  });

  const data = Object.entries(byCategory)
    .map(([cat, hours]) => ({
      name: CATEGORY_LABELS[cat as TicketCategory] ?? cat,
      avg: Math.round((hours.reduce((s, h) => s + h, 0) / hours.length) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Avg Resolution by Category</h3>
      <p className="text-xs text-slate-400 mb-4">Hours — lower is better</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="h" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
          <Tooltip formatter={(v) => [`${v}h`, "Avg Resolution"]} contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={barColor(entry.avg)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
