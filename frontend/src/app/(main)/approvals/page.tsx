import { getApprovals } from "@/lib/api";
import { Approval } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default async function ApprovalsPage() {
  let approvalsList: Approval[] = [];
  try {
    approvalsList = await getApprovals();
  } catch {
    // Show empty state gracefully if backend is unavailable
  }

  const pendingCount = approvalsList.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pending and historical approval requests
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {approvalsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-slate-500">
          <p className="text-sm font-medium">No approval requests</p>
          <p className="text-xs mt-1 text-slate-400">Approval requests will appear here when triggered by workflow rules</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Approval ID</th>
                <th className="px-4 py-3 font-medium">Work Item</th>
                <th className="px-4 py-3 font-medium">Approver</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Responded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {approvalsList.map((approval) => (
                <tr key={approval.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{approval.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <a href={`/work-items/${approval.workItemId}`} className="text-indigo-600 font-medium hover:underline">
                      {approval.workItemId}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{approval.approverId.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${STATUS_STYLES[approval.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {approval.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(approval.requestedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {approval.respondedAt ? new Date(approval.respondedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
