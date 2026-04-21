import { Suspense } from "react";
import { getWorkItems } from "@/lib/api";
import { generateMockWorkItems, computeDashboardKPI } from "@/lib/generators/ticketDataGenerator";
import { KPICards } from "@/components/dashboard/KPICards";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TicketRecordsTable } from "@/components/dashboard/TicketRecordsTable";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { WorkItem, SLARisk } from "@/types";

function applyDateRange(items: WorkItem[], range: string | undefined): WorkItem[] {
  if (!range || range === "all") return items;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((i) => new Date(i.createdAt).getTime() >= cutoff);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    team?: string;
    dateRange?: string;
    minConfidence?: string;
    slaRisk?: string;
  };
}) {
  let allItems: WorkItem[];

  try {
    allItems = await getWorkItems();
    // If API returns empty, fall back to mock data
    if (!allItems.length) throw new Error("empty");
  } catch {
    allItems = generateMockWorkItems(120);
  }

  const kpi = computeDashboardKPI(allItems);

  // Apply filters
  let filtered = applyDateRange(allItems, searchParams.dateRange);

  if (searchParams.type)   filtered = filtered.filter((i) => i.type === searchParams.type);
  if (searchParams.status) filtered = filtered.filter((i) => i.status === searchParams.status);
  if (searchParams.priority) filtered = filtered.filter((i) => i.priority === searchParams.priority);
  if (searchParams.team)   filtered = filtered.filter((i) => i.teamId === searchParams.team);
  if (searchParams.slaRisk) filtered = filtered.filter((i) => i.slaRisk === (searchParams.slaRisk as SLARisk));

  if (searchParams.minConfidence) {
    const minConf = Number(searchParams.minConfidence) / 100;
    filtered = filtered.filter((i) =>
      i.aiMetadata && (i.aiMetadata.confidenceScore ?? 0) >= minConf
    );
  }

  if (searchParams.search) {
    const q = searchParams.search.toLowerCase();
    filtered = filtered.filter(
      (i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ticket Intelligence Hub</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analytics, AI triage signals, and workload visibility across your support operation
        </p>
      </div>

      <KPICards kpi={kpi} />

      <AIInsightsPanel items={allItems} />

      <DashboardCharts items={allItems} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Support Records</h2>
        <Suspense>
          <FilterBar />
        </Suspense>
        <p className="text-xs text-slate-400">
          Showing {filtered.length} of {allItems.length} tickets
        </p>
        <TicketRecordsTable items={filtered} />
      </div>
    </div>
  );
}
