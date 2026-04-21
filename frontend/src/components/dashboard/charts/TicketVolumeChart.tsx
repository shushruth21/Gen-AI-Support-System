"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { WorkItem } from "@/types";

interface DayPoint { day: string; opened: number; resolved: number; escalated: number }

export function TicketVolumeChart({ items }: { items: WorkItem[] }) {
  const data: DayPoint[] = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    date.setHours(0, 0, 0, 0);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const dayStr = date.toDateString();
    const opened = items.filter((t) => new Date(t.createdAt).toDateString() === dayStr).length;
    const resolved = items.filter((t) => t.resolvedAt && new Date(t.resolvedAt).toDateString() === dayStr).length;
    const escalated = items.filter((t) => t.escalated && new Date(t.createdAt).toDateString() === dayStr).length;
    return { day: label, opened, resolved, escalated };
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Ticket Volume — Last 14 Days</h3>
      <p className="text-xs text-slate-400 mb-4">Opened vs Resolved vs Escalated</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="opened"   stroke="#6366f1" strokeWidth={2} dot={false} name="Opened" />
          <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={false} name="Resolved" />
          <Line type="monotone" dataKey="escalated" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Escalated" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
