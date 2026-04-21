"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { WorkItem, WorkItemStatus } from "@/types";

const STATUS_CONFIG: Record<WorkItemStatus, { label: string; color: string }> = {
  open:             { label: "Open",             color: "#6366f1" },
  in_progress:      { label: "In Progress",      color: "#3b82f6" },
  pending_approval: { label: "Pending Approval", color: "#f59e0b" },
  resolved:         { label: "Resolved",         color: "#22c55e" },
  closed:           { label: "Closed",           color: "#94a3b8" },
};

export function StatusDistributionChart({ items }: { items: WorkItem[] }) {
  const counts: Partial<Record<WorkItemStatus, number>> = {};
  items.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });

  const data = (Object.keys(STATUS_CONFIG) as WorkItemStatus[])
    .filter((s) => counts[s])
    .map((s) => ({ name: STATUS_CONFIG[s].label, value: counts[s]!, color: STATUS_CONFIG[s].color }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Status Distribution</h3>
      <p className="text-xs text-slate-400 mb-4">Current ticket breakdown by status</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
