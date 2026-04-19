import { Priority } from "@/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    low: "text-slate-500 bg-slate-100",
    medium: "text-blue-700 bg-blue-50",
    high: "text-orange-700 bg-orange-50",
    urgent: "text-red-700 bg-red-100 animate-pulse",
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}
