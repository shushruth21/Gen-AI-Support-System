import { getWorkItemById } from "@/lib/api";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Clock, User as UserIcon, Bot } from "lucide-react";

export default async function WorkItemDetailPage({ params }: { params: { id: string } }) {
  let item;
  try {
    item = await getWorkItemById(params.id);
  } catch {
    notFound();
  }

  if (!item) {
    notFound(); // Triggers the default Next.js 404 behavior safely
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500">{item.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-medium text-slate-600 capitalize">{item.type}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">{item.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={item.status} />
            </div>
        </div>

        {/* Content Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{item.description}</p>
                </div>

                {/* AI Insights Panel */}
                {item.aiMetadata && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
                            <Bot className="h-4 w-4" />
                            <h3 className="text-sm">AI Triage Summary</h3>
                        </div>
                        <p className="text-sm text-indigo-900">{item.aiMetadata.summary}</p>
                        {item.aiMetadata.suggestedPriority && (
                            <p className="text-xs text-indigo-600 mt-2 font-medium">
                                Suggested Priority: {item.aiMetadata.suggestedPriority.toUpperCase()}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar properties */}
            <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Details</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><UserIcon className="h-4 w-4"/> Assignee</span>
                        <span className="font-medium text-slate-900">{item.assigneeId || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><UserIcon className="h-4 w-4"/> Reporter</span>
                        <span className="font-medium text-slate-900">{item.reporterId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4"/> Created</span>
                        <span className="font-medium text-slate-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    {item.severity && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Severity</span>
                            <span className="font-medium text-slate-900">{item.severity.toUpperCase()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
