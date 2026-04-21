"use client";
import { WorkItem } from "@/types";
import { TicketVolumeChart } from "./charts/TicketVolumeChart";
import { CategoryPerformanceChart } from "./charts/CategoryPerformanceChart";
import { StatusDistributionChart } from "./charts/StatusDistributionChart";
import { TeamWorkloadChart } from "./charts/TeamWorkloadChart";

export function DashboardCharts({ items }: { items: WorkItem[] }) {
  return (
    <div className="space-y-6">
      <TicketVolumeChart items={items} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryPerformanceChart items={items} />
        <StatusDistributionChart items={items} />
        <TeamWorkloadChart items={items} />
      </div>
    </div>
  );
}
