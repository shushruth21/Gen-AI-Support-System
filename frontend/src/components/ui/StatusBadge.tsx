import { WorkItemStatus } from "@/types";

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  const styles: Record<WorkItemStatus, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    pending_approval: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const labels: Record<WorkItemStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    pending_approval: "Pending Approval",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
