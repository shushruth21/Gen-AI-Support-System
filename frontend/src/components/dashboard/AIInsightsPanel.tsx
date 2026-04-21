import { WorkItem, TicketCategory } from "@/types";
import { Brain, BookOpen, Headphones, Copy, TrendingDown, TrendingUp } from "lucide-react";

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  authentication: "Authentication",
  performance:    "Performance",
  billing:        "Billing",
  "data-export":  "Data Export",
  integrations:   "Integrations",
  "ui-bug":       "UI Bug",
  mobile:         "Mobile",
  notifications:  "Notifications",
  security:       "Security",
  other:          "Other",
};

export function AIInsightsPanel({ items }: { items: WorkItem[] }) {
  const withAI = items.filter((i) => i.aiMetadata);
  const coverage = items.length > 0 ? Math.round((withAI.length / items.length) * 100) : 0;

  // Sentiment counts
  const sentiment = { positive: 0, neutral: 0, negative: 0 };
  withAI.forEach((i) => { sentiment[i.aiMetadata!.sentiment ?? "neutral"]++; });

  // Avg confidence
  const avgConf = withAI.length > 0
    ? Math.round((withAI.reduce((s, i) => s + (i.aiMetadata!.confidenceScore ?? 0), 0) / withAI.length) * 100)
    : 0;

  // Top recurring themes (by suggested category)
  const themeCounts: Partial<Record<TicketCategory, number>> = {};
  withAI.forEach((i) => {
    const cat = i.aiMetadata!.suggestedCategory;
    if (cat) themeCounts[cat] = (themeCounts[cat] ?? 0) + 1;
  });
  const topThemes = Object.entries(themeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) as [TicketCategory, number][];

  // Knowledge articles referenced
  const kbSet = new Set<string>();
  withAI.forEach((i) => i.aiMetadata!.knowledgeArticleIds?.forEach((id) => kbSet.add(id)));

  // Duplicates detected
  const duplicates = withAI.filter((i) => i.aiMetadata!.duplicateOf).length;

  // Agent assist opportunities (items with a suggestion but still open)
  const agentAssist = withAI.filter(
    (i) => i.aiMetadata!.agentAssistSuggestion && (i.status === "open" || i.status === "in_progress")
  ).length;

  const negativeRate = withAI.length > 0
    ? Math.round((sentiment.negative / withAI.length) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base font-semibold text-indigo-900">AI Triage Intelligence</h2>
        <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
          {coverage}% coverage · {avgConf}% avg confidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sentiment */}
        <div className="rounded-lg bg-white border border-indigo-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer Sentiment</p>
          <div className="flex items-end gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{sentiment.positive}</p>
              <p className="text-xs text-slate-400">Positive</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-500">{sentiment.neutral}</p>
              <p className="text-xs text-slate-400">Neutral</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-500">{sentiment.negative}</p>
              <p className="text-xs text-slate-400">Negative</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs ${negativeRate > 40 ? "text-red-500" : "text-slate-400"}`}>
            {negativeRate > 40 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {negativeRate}% negative sentiment rate
          </div>
        </div>

        {/* Action Metrics */}
        <div className="rounded-lg bg-white border border-indigo-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Action Signals</p>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-sm text-slate-700">
              <span className="font-bold text-indigo-700">{agentAssist}</span> agent assist opportunities
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-sm text-slate-700">
              <span className="font-bold text-amber-600">{duplicates}</span> duplicate tickets detected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm text-slate-700">
              <span className="font-bold text-green-600">{kbSet.size}</span> knowledge articles linked
            </span>
          </div>
        </div>

        {/* Top Themes */}
        <div className="rounded-lg bg-white border border-indigo-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Recurring Themes</p>
          <div className="space-y-1.5">
            {topThemes.length === 0 && (
              <p className="text-xs text-slate-400">No theme data available</p>
            )}
            {topThemes.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="flex-1 bg-indigo-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min((count / (topThemes[0]?.[1] ?? 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 w-28 truncate">{CATEGORY_LABELS[cat]}</span>
                <span className="text-xs font-semibold text-indigo-700 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
