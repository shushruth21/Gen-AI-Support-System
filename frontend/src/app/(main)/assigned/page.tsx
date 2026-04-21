import { getWorkItems } from "@/lib/api";
import { generateMockWorkItems } from "@/lib/generators/ticketDataGenerator";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function AssignedPage() {
  let assignedItems;
  try {
    assignedItems = await getWorkItems();
    if (!assignedItems.length) throw new Error("empty");
    // Show only open/in-progress items as the active queue
    assignedItems = assignedItems.filter((i) => i.status === 'open' || i.status === 'in_progress');
  } catch {
    assignedItems = generateMockWorkItems(40).filter(
      (i) => i.status === 'open' || i.status === 'in_progress'
    );
  }

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
