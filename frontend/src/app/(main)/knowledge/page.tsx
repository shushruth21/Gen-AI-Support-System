import { getKnowledge } from "@/lib/api";

export default async function KnowledgePage() {
  const knowledgeList = await getKnowledge();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">Internal support documentation and runbooks</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
            New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledgeList.map((article: any) => (
            <div key={article.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-indigo-500">
                <h3 className="font-semibold text-slate-900">{article.title}</h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{article.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-slate-600 bg-slate-100 rounded-md px-2 py-1">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
