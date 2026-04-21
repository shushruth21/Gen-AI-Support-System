"use client";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WorkItemStatus, Priority, WorkItemType, SLARisk } from "@/types";
import { TEAMS } from "@/lib/generators/ticketDataGenerator";
import { X } from "lucide-react";

const STATUSES: WorkItemStatus[] = ["open", "in_progress", "pending_approval", "resolved", "closed"];
const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const TYPES: WorkItemType[] = ["ticket", "issue"];
const SLA_RISKS: SLARisk[] = ["low", "medium", "high", "breached"];
const DATE_RANGES = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const SELECT_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [confidence, setConfidence] = useState(
    Number(searchParams.get("minConfidence") ?? "0")
  );

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleConfidence(val: number) {
    setConfidence(val);
    update("minConfidence", val > 0 ? String(val) : "");
  }

  function clearAll() {
    setConfidence(0);
    router.replace(pathname);
  }

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search tickets..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
        />

        {/* Date Range */}
        <select defaultValue={searchParams.get("dateRange") ?? "30d"} onChange={(e) => update("dateRange", e.target.value)} className={SELECT_CLASS}>
          {DATE_RANGES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        {/* Team */}
        <select defaultValue={searchParams.get("team") ?? ""} onChange={(e) => update("team", e.target.value)} className={SELECT_CLASS}>
          <option value="">All Teams</option>
          {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Type */}
        <select defaultValue={searchParams.get("type") ?? ""} onChange={(e) => update("type", e.target.value)} className={SELECT_CLASS}>
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        {/* Status */}
        <select defaultValue={searchParams.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={SELECT_CLASS}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>

        {/* Priority */}
        <select defaultValue={searchParams.get("priority") ?? ""} onChange={(e) => update("priority", e.target.value)} className={SELECT_CLASS}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>

        {/* SLA Risk */}
        <select defaultValue={searchParams.get("slaRisk") ?? ""} onChange={(e) => update("slaRisk", e.target.value)} className={SELECT_CLASS}>
          <option value="">Any SLA Risk</option>
          {SLA_RISKS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-2">
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* AI Confidence Slider */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-slate-500 whitespace-nowrap">Min AI Confidence</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={confidence}
          onChange={(e) => handleConfidence(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="text-xs font-semibold text-indigo-600 w-10 text-right">
          {confidence > 0 ? `≥${confidence}%` : "Any"}
        </span>
      </div>
    </div>
  );
}
