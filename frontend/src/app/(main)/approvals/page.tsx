import { getApprovals } from "@/lib/api";

export default async function ApprovalsPage() {
  const approvalsList = await getApprovals();
  const pendingCount = approvalsList.filter((a: any) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Pending and historical approval requests</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-4 py-3 font-medium">Approval ID</th>
                    <th className="px-4 py-3 font-medium">Work Item</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Requested</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {approvalsList.map((approval: any) => (
                    <tr key={approval.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{approval.id}</td>
                        <td className="px-4 py-3 text-indigo-600 font-medium cursor-pointer">{approval.workItemId}</td>
                        <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5 text-xs font-semibold border border-purple-200">
                                {approval.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{new Date(approval.requestedAt).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
