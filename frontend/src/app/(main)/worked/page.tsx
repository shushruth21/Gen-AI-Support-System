import { getWorkItems } from "@/lib/api";
import { generateMockWorkItems } from "@/lib/generators/ticketDataGenerator";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function WorkedPage() {
  let workedItems;
  try {
    workedItems = await getWorkItems();
    if (!workedItems.length) throw new Error("empty");
    // Show only resolved/closed items as history
    workedItems = workedItems.filter((i) => i.status === 'resolved' || i.status === 'closed');
  } catch {
    workedItems = generateMockWorkItems(60).filter(
      (i) => i.status === 'resolved' || i.status === 'closed'
    );
  }

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
