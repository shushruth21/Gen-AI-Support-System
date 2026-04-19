import { getWorkItems } from "@/lib/api";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function IssuesPage() {
  const issues = await getWorkItems('issue');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technical Issues</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system outages, bugs, and engineering escalations</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
            Report Issue
        </button>
      </div>

      <WorkItemTable items={issues} />
    </div>
  );
}
