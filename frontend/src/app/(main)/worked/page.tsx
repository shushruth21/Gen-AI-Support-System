import { getWorkItems } from "@/lib/api";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function WorkedPage() {
  // Just show all items as placeholder for 'worked history'
  const workedItems = await getWorkItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Previously Worked</h1>
          <p className="text-sm text-slate-500 mt-1">Items you have recently contributed to or resolved</p>
        </div>
      </div>

      <WorkItemTable items={workedItems} />
    </div>
  );
}
