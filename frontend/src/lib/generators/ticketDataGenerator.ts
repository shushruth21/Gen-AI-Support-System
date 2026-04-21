import {
  WorkItem, WorkItemStatus, Priority, WorkItemType,
  TicketCategory, SLARisk, DashboardKPI,
} from "@/types";
import { generateAIMetadata } from "./aiMetadataGenerator";

export const TEAMS = [
  { id: "team-platform",  name: "Platform" },
  { id: "team-mobile",    name: "Mobile" },
  { id: "team-backend",   name: "Backend" },
  { id: "team-frontend",  name: "Frontend" },
  { id: "team-support",   name: "Support" },
];

const ASSIGNEES: Record<string, { id: string; name: string }[]> = {
  "team-platform":  [{ id: "u-01", name: "Alice Chen" }, { id: "u-02", name: "Bob Park" }, { id: "u-03", name: "Carlos Rivera" }],
  "team-mobile":    [{ id: "u-04", name: "Diana Lee" }, { id: "u-05", name: "Eric Thompson" }, { id: "u-06", name: "Fiona Zhang" }],
  "team-backend":   [{ id: "u-07", name: "George Kim" }, { id: "u-08", name: "Hannah Walsh" }, { id: "u-09", name: "Ivan Petrov" }],
  "team-frontend":  [{ id: "u-10", name: "Julia Santos" }, { id: "u-11", name: "Kevin Okafor" }, { id: "u-12", name: "Laura Müller" }],
  "team-support":   [{ id: "u-13", name: "Mike Johnson" }, { id: "u-14", name: "Nina Patel" }, { id: "u-15", name: "Omar Al-Rashid" }],
};

const TITLES: Record<TicketCategory, string[]> = {
  authentication: [
    "Cannot log in after password reset",
    "SSO integration failing for enterprise accounts",
    "Session expiring too quickly on mobile devices",
    "MFA enrollment not persisting after setup",
    "OAuth redirect loop on third-party login",
  ],
  performance: [
    "Checkout page timing out under load",
    "Search results taking 10+ seconds to return",
    "API response times spiking during business hours",
    "Dashboard slow to render for large accounts",
    "Background job queue backing up overnight",
  ],
  billing: [
    "Invoice not generated after plan upgrade",
    "Customer double-charged after failed payment retry",
    "Proration calculation wrong after downgrade",
    "Tax ID not appearing on invoice",
    "Usage report not matching billed amount",
  ],
  "data-export": [
    "Bulk CSV export returns partial records",
    "Export job failing silently for large datasets",
    "Scheduled export not triggering after timezone change",
    "Export missing soft-deleted records in output",
    "Excel export formatting broken for Unicode fields",
  ],
  integrations: [
    "Webhook delivery failing with rate limit errors",
    "Zapier integration dropping events over 1MB",
    "Slack notifications stopped after token rotation",
    "GitHub sync not reflecting merged PR status",
    "PagerDuty alert integration not triggering on sev1",
  ],
  "ui-bug": [
    "Form validation messages overlapping on Safari",
    "Modal close button unclickable on small screens",
    "Date picker broken in RTL mode",
    "Dropdown menu clipped by overflow container",
    "Table sort arrow not reflecting active column",
  ],
  mobile: [
    "Push notifications silently dropping on Android 14",
    "App crashing on launch for iOS 17.4.1 users",
    "Offline mode not syncing on reconnect",
    "Biometric login failing after OS update",
    "Camera permission not requested before upload",
  ],
  notifications: [
    "Email delivery queue backing up",
    "In-app badge not clearing after reading messages",
    "Digest email sending duplicate entries",
    "Notification preferences not saving correctly",
    "Transactional emails landing in spam folder",
  ],
  security: [
    "Account deletion leaving orphaned API tokens",
    "Audit log missing bulk operation entries",
    "Password reset link not expiring after first use",
    "API key visible in plain text in response body",
    "Rate limiting not applied to password reset endpoint",
  ],
  other: [
    "Data retention policy inquiry for closed tickets",
    "Request for bulk ticket import feature",
    "Intermittent errors with no clear pattern",
    "Documentation unclear on webhook retry behavior",
    "Request to add custom fields to ticket form",
  ],
};

const STATUSES: WorkItemStatus[] = ["open", "in_progress", "pending_approval", "resolved", "closed"];
const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const TYPES: WorkItemType[] = ["ticket", "issue"];
const CATEGORIES = Object.keys(TITLES) as TicketCategory[];
const SLA_RISKS: SLARisk[] = ["low", "medium", "high", "breached"];

// SLA thresholds in hours by priority
const SLA_HOURS: Record<Priority, number> = {
  low: 72, medium: 48, high: 24, urgent: 4,
};

function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seeded(seed) * arr.length)];
}

export function generateMockWorkItems(count = 120): WorkItem[] {
  const now = Date.now();
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const category = pick(CATEGORIES, seed * 3);
    const priority = pick(PRIORITIES, seed * 7);
    const type: WorkItemType = seeded(seed * 11) > 0.3 ? "ticket" : "issue";
    const status = pick(STATUSES, seed * 13);
    const team = pick(TEAMS, seed * 17);
    const assignees = ASSIGNEES[team.id];
    const assignee = seeded(seed * 19) > 0.1 ? pick(assignees, seed * 23) : null;

    // Spread creation times over last 60 days with slight clustering
    const ageMs = seeded(seed * 29) * sixtyDaysMs;
    const createdAt = new Date(now - ageMs).toISOString();
    const updatedAt = new Date(now - ageMs * seeded(seed * 31)).toISOString();

    const isResolved = status === "resolved" || status === "closed";
    const slaLimit = SLA_HOURS[priority];
    // Resolution time is 20%-200% of SLA limit
    const resolutionHours = isResolved
      ? Math.round(slaLimit * (0.2 + seeded(seed * 37) * 1.8) * 10) / 10
      : undefined;

    const resolvedAt = isResolved && resolutionHours
      ? new Date(new Date(createdAt).getTime() + resolutionHours * 3600000).toISOString()
      : undefined;

    // SLA risk for open/in-progress items
    const ageHours = ageMs / 3600000;
    let slaRisk: SLARisk = "low";
    if (!isResolved) {
      const pct = ageHours / slaLimit;
      if (pct >= 1.0) slaRisk = "breached";
      else if (pct >= 0.75) slaRisk = "high";
      else if (pct >= 0.5) slaRisk = "medium";
    }

    const hasAI = seeded(seed * 41) > 0.25;
    const titlePool = TITLES[category];
    const titleIdx = Math.floor(seeded(seed * 43) * titlePool.length);

    return {
      id: `WI-${String(i + 1).padStart(4, "0")}`,
      type,
      title: titlePool[titleIdx],
      description: `Support ${type} reported by customer — category: ${category}, team: ${team.name}.`,
      status,
      priority,
      category,
      slaRisk: isResolved ? undefined : slaRisk,
      resolutionHours,
      escalated: seeded(seed * 47) < 0.08,
      reporterId: `reporter-${Math.floor(seeded(seed * 53) * 20) + 1}`,
      assigneeId: assignee?.id,
      teamId: team.id,
      createdAt,
      updatedAt,
      resolvedAt,
      aiMetadata: hasAI ? generateAIMetadata(seed) : undefined,
    };
  });
}

export function computeDashboardKPI(items: WorkItem[]): DashboardKPI {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const current = items.filter((i) => now - new Date(i.createdAt).getTime() <= thirtyDaysMs);
  const previous = items.filter((i) => {
    const age = now - new Date(i.createdAt).getTime();
    return age > thirtyDaysMs && age <= thirtyDaysMs * 2;
  });

  function kpi(subset: WorkItem[]) {
    const active = subset.filter((i) => i.status === "open" || i.status === "in_progress");
    const resolved = subset.filter((i) => i.resolutionHours !== undefined);
    const avgRes = resolved.length
      ? resolved.reduce((s, i) => s + (i.resolutionHours ?? 0), 0) / resolved.length
      : 0;
    const aiCoverage = subset.length
      ? Math.round((subset.filter((i) => i.aiMetadata).length / subset.length) * 100)
      : 0;
    const slaRisk = subset.filter((i) => i.slaRisk === "high" || i.slaRisk === "breached").length;
    return { active: active.length, avgRes, aiCoverage, slaRisk, total: subset.length };
  }

  const cur = kpi(current);
  const prev = kpi(previous);

  function delta(a: number, b: number) {
    if (b === 0) return 0;
    return Math.round(((a - b) / b) * 100);
  }

  return {
    totalTickets: cur.active,
    totalTicketsDelta: delta(cur.active, prev.active),
    avgResolutionHours: Math.round(cur.avgRes * 10) / 10,
    avgResolutionHoursDelta: delta(cur.avgRes, prev.avgRes),
    aiTriageCoverage: cur.aiCoverage,
    aiTriageCoverageDelta: delta(cur.aiCoverage, prev.aiCoverage),
    slaBreachRisk: cur.slaRisk,
    slaBreachRiskDelta: delta(cur.slaRisk, prev.slaRisk),
  };
}

// Backward-compatible shim for pages that used the old stats shape
export function generateMockDashboardStats() {
  const items = generateMockWorkItems();
  const kpi = computeDashboardKPI(items);
  return {
    totalTickets: kpi.totalTickets,
    totalIssues: items.filter((i) => i.type === "issue" && i.status === "open").length,
    pendingApprovals: items.filter((i) => i.status === "pending_approval").length,
    assignedToMe: items.filter((i) => i.assigneeId === "u-01").length,
  };
}
