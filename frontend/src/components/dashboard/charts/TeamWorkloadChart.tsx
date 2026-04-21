"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { WorkItem } from "@/types";
import { TEAMS } from "@/lib/generators/ticketDataGenerator";

const OVERLOAD_THRESHOLD = 12;

export function TeamWorkloadChart({ items }: { items: WorkItem[] }) {
  const openItems = items.filter((t) => t.status === "open" || t.status === "in_progress");

  const data = TEAMS.map((team) => {
    const count = openItems.filter((t) => t.teamId === team.id).length;
    const breached = items.filter(
      (t) => t.teamId === team.id && (t.slaRisk === "breached" || t.slaRisk === "high")
    ).length;
    return { name: team.name, open: count, atRisk: breached };
  }).sort((a, b) => b.open - a.open);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Team Workload</h3>
      <p className="text-xs text-slate-400 mb-4">Open tickets per team — red line = overload threshold</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <ReferenceLine y={OVERLOAD_THRESHOLD} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Overload", position: "right", fontSize: 10, fill: "#ef4444" }} />
          <Bar dataKey="open" name="Open Tickets" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.open >= OVERLOAD_THRESHOLD ? "#ef4444" : "#6366f1"} />
            ))}
          </Bar>
          <Bar dataKey="atRisk" name="SLA At-Risk" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
