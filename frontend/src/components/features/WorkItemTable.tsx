import { WorkItem } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

export function WorkItemTable({ items }: { items: WorkItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-slate-500">
        <p className="text-sm font-medium">No items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase bg-slate-100 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">AI Insights</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700">
          {items.map((item) => {
            const displayDate = new Date(item.createdAt).toLocaleDateString();
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-indigo-600">
                    <a href={`/work-items/${item.id}`} className="hover:underline">{item.id}</a>
                </td>
                <td className="px-4 py-3 max-w-xs truncate" title={item.title}>{item.title}</td>
                <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-slate-400">{displayDate}</td>
                <td className="px-4 py-3">
                    {item.aiMetadata ? (
                        <span className="text-indigo-600 text-xs font-semibold bg-indigo-50 px-2 py-1 rounded">Available</span>
                    ) : (
                        <span className="text-slate-300 text-xs">-</span>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
