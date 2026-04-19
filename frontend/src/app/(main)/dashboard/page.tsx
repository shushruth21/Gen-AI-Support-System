import { getDashboardStats, getWorkItems } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { WorkItemTable } from "@/components/features/WorkItemTable";
import { Ticket, AlertCircle, Clock, Search } from "lucide-react";

export default async function DashboardPage() {
  // Simulate Service fetch
  const stats = await getDashboardStats();
  const recentItems = await getWorkItems(); // grabbing all for now

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overivew</h1>
        <p className="text-sm text-slate-500 mt-1">Key metrics and recent support activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value={stats.totalTickets} icon={<Ticket className="h-5 w-5" />} />
        <StatCard title="Active Issues" value={stats.totalIssues} icon={<AlertCircle className="h-5 w-5" />} />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Assigned To Me" value={stats.assignedToMe} icon={<Search className="h-5 w-5 text-indigo-500" />} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Recent Support Items</h2>
        <WorkItemTable items={recentItems} />
      </div>
    </div>
  );
}
