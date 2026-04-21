import { AITriageMetadata, Priority, Severity, TicketCategory } from "@/types";

const CATEGORIES: TicketCategory[] = [
  "authentication", "performance", "billing", "data-export",
  "integrations", "ui-bug", "mobile", "notifications", "security", "other",
];

const SUMMARIES: Record<TicketCategory, string[]> = {
  authentication: [
    "User cannot log in after password reset — auth token not being invalidated correctly.",
    "Enterprise SSO via Okta failing on SAML assertion timestamp validation.",
    "Session expiring after 5 minutes on mobile; expected 24-hour TTL.",
  ],
  performance: [
    "Checkout flow degrading under peak load — 30% timeout rate during business hours.",
    "Dashboard takes 30+ seconds to render for accounts with over 50K records.",
    "Search latency spiking to 10s+ — Elasticsearch index appears under-provisioned.",
  ],
  billing: [
    "Invoice not generated after plan upgrade — payment processor webhook not received.",
    "Customer double-charged after a failed payment retry on the same billing cycle.",
    "Proration calculation incorrect after mid-cycle plan downgrade.",
  ],
  "data-export": [
    "CSV export returns partial records for datasets exceeding 10K rows.",
    "Export job silently failing for accounts with soft-deleted records.",
    "Scheduled export not triggering after customer changed timezone configuration.",
  ],
  integrations: [
    "Webhook delivery failing with 429s from downstream API — retry logic not engaging.",
    "Zapier integration dropping events when payload exceeds 1MB.",
    "Slack notification integration stopped working after recent token rotation.",
  ],
  "ui-bug": [
    "Form validation error messages overlapping on iOS Safari 17 — CSS z-index conflict.",
    "Modal close button unclickable on mobile viewports below 375px width.",
    "Date picker not rendering correctly in RTL language mode.",
  ],
  mobile: [
    "Push notifications silently dropping on Android 14 due to new permission model.",
    "App crashes on launch for users on iOS 17.4.1 after latest release.",
    "Offline mode not syncing changes when device reconnects to network.",
  ],
  notifications: [
    "Email delivery queue backing up — SMTP relay reporting capacity limits reached.",
    "In-app notification badge not clearing after user reads all messages.",
    "Digest emails sending duplicate entries for the same work item.",
  ],
  security: [
    "Account deletion leaves orphaned API tokens with valid authentication scopes.",
    "Audit log missing entries for bulk operations performed via the API.",
    "Password reset link not expiring after first use as expected.",
  ],
  other: [
    "General inquiry about data retention policy for resolved and closed tickets.",
    "Request for bulk import feature to migrate legacy support tickets.",
    "Intermittent performance degradation observed — root cause not yet identified.",
  ],
};

const KEYWORDS: Record<TicketCategory, string[]> = {
  authentication: ["login", "auth", "session", "SSO", "password", "token"],
  performance: ["latency", "timeout", "throughput", "degradation", "load"],
  billing: ["invoice", "payment", "charge", "plan", "proration"],
  "data-export": ["export", "CSV", "records", "pagination", "dataset"],
  integrations: ["webhook", "API", "rate-limit", "retry", "payload"],
  "ui-bug": ["CSS", "rendering", "modal", "z-index", "Safari"],
  mobile: ["Android", "iOS", "push", "crash", "offline"],
  notifications: ["email", "SMTP", "badge", "digest", "delivery"],
  security: ["token", "audit", "deletion", "scope", "expiry"],
  other: ["general", "inquiry", "migration", "import"],
};

const AGENT_ASSIST: Record<TicketCategory, string> = {
  authentication: "Ask customer to clear cookies and retry. If persistent, pull auth logs and check token invalidation timestamps.",
  performance: "Escalate to infrastructure team. Attach load balancer metrics from the reported time window before responding.",
  billing: "Verify payment processor webhook delivery in admin. Manually trigger invoice regeneration if webhook was not received.",
  "data-export": "Advise exporting in batches of 5K rows as a workaround. Engineering ticket filed for pagination fix.",
  integrations: "Check webhook delivery logs and manually retry the last 10 failed events from the admin panel.",
  "ui-bug": "Recommend Chrome or Firefox as a temporary workaround. Engineering has triaged for the next sprint.",
  mobile: "Request device model and OS version from customer. Cross-reference crash reporting tool for matching stack traces.",
  notifications: "Verify SMTP quota in relay dashboard. Advise 24-hour delivery window for currently backlogged items.",
  security: "Immediately revoke orphaned tokens via the admin panel and escalate to the security team for investigation.",
  other: "Gather additional context from the customer and route to the appropriate specialist team.",
};

const KB_ARTICLES: Record<TicketCategory, string[]> = {
  authentication: ["KB-001", "KB-002"],
  performance: ["KB-010", "KB-011"],
  billing: ["KB-020", "KB-021"],
  "data-export": ["KB-030"],
  integrations: ["KB-040", "KB-041"],
  "ui-bug": ["KB-050"],
  mobile: ["KB-060", "KB-061"],
  notifications: ["KB-070"],
  security: ["KB-080", "KB-081"],
  other: [],
};

// Deterministic pseudo-random for SSR stability
function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function generateAIMetadata(seed: number): AITriageMetadata {
  const category = CATEGORIES[Math.floor(seeded(seed) * CATEGORIES.length)];
  const summaryPool = SUMMARIES[category];
  const summaryIdx = Math.floor(seeded(seed + 1) * summaryPool.length);
  const priorities: Priority[] = ["low", "medium", "high", "urgent"];
  const severities: Severity[] = ["sev4", "sev3", "sev2", "sev1"];
  const sentiments: Array<"positive" | "neutral" | "negative"> = ["positive", "neutral", "negative"];

  const confidence = Math.round((0.58 + seeded(seed + 2) * 0.40) * 100) / 100;
  const isDuplicate = seeded(seed + 3) < 0.12 && seed > 5;
  const hasKB = KB_ARTICLES[category].length > 0 && seeded(seed + 4) > 0.4;

  return {
    summary: summaryPool[summaryIdx],
    suggestedPriority: priorities[Math.floor(seeded(seed + 5) * priorities.length)],
    suggestedSeverity: severities[Math.floor(seeded(seed + 6) * severities.length)],
    suggestedCategory: category,
    sentiment: sentiments[Math.floor(seeded(seed + 7) * sentiments.length)],
    keywords: KEYWORDS[category],
    confidenceScore: confidence,
    duplicateOf: isDuplicate ? `WI-${String(Math.floor(seed * 0.6)).padStart(4, "0")}` : undefined,
    agentAssistSuggestion: AGENT_ASSIST[category],
    knowledgeArticleIds: hasKB ? KB_ARTICLES[category] : undefined,
  };
}
