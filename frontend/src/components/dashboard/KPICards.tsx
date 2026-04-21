import { DashboardKPI } from "@/types";
import { Ticket, Clock, Brain, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  invertDelta?: boolean; // true = lower is better (e.g. resolution time, SLA risk)
}

function DeltaBadge({ delta, invert }: { delta: number; invert?: boolean }) {
  const isGood = invert ? delta <= 0 : delta >= 0;
  const isNeutral = delta === 0;

  if (isNeutral) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-slate-400">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${isGood ? "text-green-600" : "text-red-500"}`}>
      {delta > 0
        ? <TrendingUp className="h-3 w-3" />
        : <TrendingDown className="h-3 w-3" />}
      {Math.abs(delta)}%
    </span>
  );
}

function KPICard({ title, value, delta, deltaLabel = "vs last 30d", icon, invertDelta }: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
      <div className="flex items-center gap-1.5">
        <DeltaBadge delta={delta} invert={invertDelta} />
        <span className="text-xs text-slate-400">{deltaLabel}</span>
      </div>
    </div>
  );
}

export function KPICards({ kpi }: { kpi: DashboardKPI }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Active Tickets"
        value={kpi.totalTickets}
        delta={kpi.totalTicketsDelta}
        invertDelta
        icon={<Ticket className="h-5 w-5 text-indigo-500" />}
      />
      <KPICard
        title="Avg Resolution Time"
        value={`${kpi.avgResolutionHours}h`}
        delta={kpi.avgResolutionHoursDelta}
        invertDelta
        icon={<Clock className="h-5 w-5 text-amber-500" />}
      />
      <KPICard
        title="AI Triage Coverage"
        value={`${kpi.aiTriageCoverage}%`}
        delta={kpi.aiTriageCoverageDelta}
        icon={<Brain className="h-5 w-5 text-violet-500" />}
      />
      <KPICard
        title="SLA Breach Risk"
        value={kpi.slaBreachRisk}
        delta={kpi.slaBreachRiskDelta}
        invertDelta
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
      />
    </div>
  );
}
