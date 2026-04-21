import { WorkItem } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Brain } from "lucide-react";

export function TicketRecordsTable({ items }: { items: WorkItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-slate-500">
        <p className="text-sm font-medium">No items match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">AI Triage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-indigo-600">
                <a href={`/work-items/${item.id}`} className="hover:underline">
                  {item.id}
                </a>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.type === "ticket"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {item.type}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate" title={item.title}>
                {item.title}
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={item.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {item.aiMetadata ? (
                  <div className="flex items-center gap-1 text-indigo-600">
                    <Brain className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">
                      {Math.round((item.aiMetadata.confidenceScore ?? 0) * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
