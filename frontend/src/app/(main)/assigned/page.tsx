import { getWorkItems } from "@/lib/api";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function AssignedPage() {
  // Removing hardcoded user 'u2' as it is not a valid Postgres UUID
  const assignedItems = await getWorkItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned To Me</h1>
          <p className="text-sm text-slate-500 mt-1">Your active queue of tickets and issues</p>
        </div>
      </div>

      <WorkItemTable items={assignedItems} />
    </div>
  );
}
