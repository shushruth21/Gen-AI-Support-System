import { getWorkItems } from "@/lib/api";
import { WorkItemTable } from "@/components/features/WorkItemTable";

export default async function TicketsPage() {
  // Service layer fetch specifically for 'tickets'
  const tickets = await getWorkItems('ticket');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage standard customer inquiries and requests</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
            Create Ticket
        </button>
      </div>

      <WorkItemTable items={tickets} />
    </div>
  );
}
