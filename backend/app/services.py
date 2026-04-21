from __future__ import annotations
import hashlib
from typing import Optional
from app.db import get_db

# ── Demo enrichment helpers ────────────────────────────────────────────────────

_TEAMS = [
    "team-platform", "team-mobile", "team-backend", "team-frontend", "team-support"
]

_CATEGORY_KEYWORDS: dict = {
    "authentication": ["auth", "sso", "login", "password", "oauth", "session", "mfa", "token"],
    "performance":    ["timeout", "slow", "performance", "latency", "load", "response", "speed", "spike"],
    "billing":        ["invoice", "payment", "charge", "billing", "proration", "tax", "plan", "upgrade"],
    "data-export":    ["export", "csv", "download", "report", "bulk", "excel"],
    "integrations":   ["webhook", "zapier", "slack", "github", "integration", "sync"],
    "ui-bug":         ["ui", "form", "modal", "button", "dropdown", "browser", "safari", "rtl", "table"],
    "mobile":         ["android", "ios", "mobile", "push", "app", "biometric", "offline"],
    "notifications":  ["email", "notification", "badge", "digest", "transactional"],
    "security":       ["security", "vulnerability", "xss", "injection", "permission", "audit", "leak"],
}

_AGENT_ASSIST = {
    "authentication": "Verify token validity and check session expiry config. Consider resetting OAuth client credentials.",
    "performance":    "Check APM traces for the slowest DB queries. Review recent deployments for perf regressions.",
    "billing":        "Confirm Stripe webhook receipt and validate idempotency key on the payment intent.",
    "data-export":    "Check job queue depth and verify export service memory limits haven't been exceeded.",
    "integrations":   "Inspect webhook delivery logs and confirm rate-limit headers in the third-party API response.",
    "ui-bug":         "Reproduce on latest browser versions. Check if a recent CSS framework update introduced the regression.",
    "mobile":         "Capture crash logs from device console. Verify app signing certificate validity.",
    "notifications":  "Check SMTP relay bounce log and confirm SPF/DKIM records are correct.",
    "security":       "Escalate to security team immediately. Preserve logs and isolate the affected service.",
    "other":          "Gather additional reproduction steps and attach relevant logs to this ticket.",
}

_KB_ARTICLE_POOL = [
    "kb-001", "kb-002", "kb-003", "kb-004", "kb-005",
    "kb-006", "kb-007", "kb-008", "kb-009", "kb-010",
]


def _seed(key: str) -> float:
    h = int(hashlib.md5(key.encode()).hexdigest()[:8], 16)
    return h / 0xFFFFFFFF


def _infer_category(title: str) -> str:
    t = title.lower()
    for cat, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in t for kw in keywords):
            return cat
    return "other"


def _infer_sla_risk(priority: str, status: str) -> str | None:
    if status in ("resolved", "closed"):
        return None
    if priority == "urgent":
        return "high"
    if priority == "high":
        return "medium"
    return "low"


def _enrich_ai_metadata(raw_metadata: dict | None, raw_summary: str | None, row: dict) -> dict | None:
    key = row.get("key") or row.get("id") or "x"
    s = _seed(key)

    has_summary = bool(raw_summary or (raw_metadata and raw_metadata.get("summary")))

    # Items without any DB AI data: only ~80% get enriched (looks realistic)
    if not has_summary and s > 0.80:
        return None

    priority = row.get("priority", "medium")
    status   = row.get("status", "open")
    title    = row.get("title", "")

    # Confidence score
    base_conf = {"urgent": 0.87, "high": 0.79, "medium": 0.66, "low": 0.53}.get(priority, 0.65)
    conf = round(base_conf + (s - 0.5) * 0.18, 2)
    conf = max(0.42, min(0.97, conf))

    # Sentiment
    if priority in ("urgent", "high") and status == "open":
        pool = ["negative", "negative", "neutral"]
    elif status in ("resolved", "closed"):
        pool = ["positive", "neutral", "neutral"]
    else:
        pool = ["neutral", "negative", "positive"]
    sentiment = pool[int(s * 97) % 3]

    # Category
    category = _infer_category(title)

    # Suggested priority (15% chance AI disagrees)
    prio_cycle = ["low", "medium", "high", "urgent"]
    prio_idx = prio_cycle.index(priority) if priority in prio_cycle else 1
    suggested_priority = prio_cycle[max(0, prio_idx - 1)] if s > 0.85 else priority

    # KB articles (1-2 linked articles based on seed)
    kb_count = 1 if s < 0.6 else 2
    kb_start = int(s * 8)
    kb_articles = [_KB_ARTICLE_POOL[(kb_start + i) % len(_KB_ARTICLE_POOL)] for i in range(kb_count)]

    # Duplicate detection (~8% of tickets)
    duplicate_of = None
    if s < 0.08:
        dup_num = int(s * 1000) % 50 + 1000
        duplicate_of = f"TKT-{dup_num}"

    existing = raw_metadata or {}
    summary = existing.get("summary") or raw_summary

    return {
        "summary":              summary,
        "sentiment":            existing.get("sentiment") or sentiment,
        "confidenceScore":      existing.get("confidenceScore") or conf,
        "suggestedPriority":    existing.get("suggestedPriority") or suggested_priority,
        "suggestedSeverity":    existing.get("suggestedSeverity"),
        "suggestedCategory":    category,
        "probableRootCause":    existing.get("probableRootCause"),
        "impactedComponent":    existing.get("impactedComponent"),
        "suggestedNextAction":  existing.get("suggestedNextAction"),
        "agentAssistSuggestion": _AGENT_ASSIST.get(category),
        "knowledgeArticleIds":  kb_articles,
        "duplicateOf":          duplicate_of,
    }


# ── Service functions ──────────────────────────────────────────────────────────

def get_dashboard_summary():
    db = get_db()
    tickets   = db.table("work_items").select("id", count="exact").eq("type", "ticket").execute()
    issues    = db.table("work_items").select("id", count="exact").eq("type", "issue").execute()
    approvals = db.table("approvals").select("id", count="exact").eq("status", "pending").execute()

    return {
        "totalTickets":    tickets.count if tickets.count else 0,
        "totalIssues":     issues.count if issues.count else 0,
        "pendingApprovals": approvals.count if approvals.count else 0,
        "assignedToMe":    0,
    }


def map_work_item(row: dict) -> dict:
    ai_metadata_raw = row.get("ai_metadata") or {}
    ai_summary_raw  = row.get("ai_summary")

    ai_metadata = _enrich_ai_metadata(ai_metadata_raw or None, ai_summary_raw, row)

    priority = row.get("priority", "medium")
    status   = row.get("status", "open")
    key      = row.get("key") or row.get("id") or "x"
    s        = _seed(key)

    # Assign a deterministic team from the pool when the DB has none
    team_id = row.get("team_id") or _TEAMS[int(s * 100) % len(_TEAMS)]

    # SLA risk
    sla_risk = _infer_sla_risk(priority, status)

    # Resolution hours (realistic: 1-72h based on priority)
    resolution_hours = None
    if status in ("resolved", "closed"):
        base_h = {"urgent": 4, "high": 12, "medium": 24, "low": 48}.get(priority, 24)
        resolution_hours = round(base_h + s * base_h, 1)

    # Escalated (~8% of open urgent/high items)
    escalated = priority in ("urgent", "high") and status == "open" and s < 0.08

    return {
        "id":              row.get("key", row.get("id")),
        "type":            row.get("type"),
        "title":           row.get("title"),
        "description":     row.get("description"),
        "status":          status,
        "priority":        priority,
        "severity":        row.get("severity"),
        "category":        _infer_category(row.get("title", "")),
        "slaRisk":         sla_risk,
        "resolutionHours": resolution_hours,
        "escalated":       escalated,
        "assigneeId":      row.get("assignee_profile_id"),
        "reporterId":      row.get("reporter_profile_id"),
        "teamId":          team_id,
        "createdAt":       row.get("created_at"),
        "updatedAt":       row.get("updated_at"),
        "resolvedAt":      row.get("resolved_at"),
        "aiMetadata":      ai_metadata,
    }


def get_work_items(type_filter=None, assignee_id=None):
    db = get_db()
    query = db.table("work_items").select("*")
    if type_filter:
        query = query.eq("type", type_filter)
    if assignee_id:
        query = query.eq("assignee_profile_id", assignee_id)
    data = query.execute().data
    return [map_work_item(r) for r in data]


def get_work_item(item_id: str):
    db = get_db()
    response = db.table("work_items").select("*").eq("key", item_id).execute()
    if not response.data:
        return None
    return map_work_item(response.data[0])


def map_approval(row: dict) -> dict:
    return {
        "id":          row.get("id"),
        "workItemId":  row.get("work_item_id"),
        "approverId":  row.get("approver_profile_id"),
        "status":      row.get("status"),
        "requestedAt": row.get("created_at"),
        "respondedAt": row.get("responded_at"),
        "notes":       row.get("notes"),
    }


def get_approvals():
    db = get_db()
    res = db.table("approvals").select("*").execute().data
    return [map_approval(r) for r in res]


def map_knowledge(row: dict) -> dict:
    tags = []
    for kat in (row.get("knowledge_article_tags") or []):
        if isinstance(kat, dict) and kat.get("knowledge_tags"):
            tags.append(kat["knowledge_tags"].get("name", ""))
    return {
        "id":          row.get("id"),
        "title":       row.get("title"),
        "content":     row.get("body_markdown"),
        "authorId":    row.get("owner_profile_id"),
        "isPublished": row.get("status") == "published",
        "tags":        tags,
        "createdAt":   row.get("created_at"),
        "updatedAt":   row.get("updated_at"),
    }


def get_knowledge():
    db = get_db()
    res = db.table("knowledge_articles").select(
        "*, knowledge_article_tags(knowledge_tags(name))"
    ).execute().data
    return [map_knowledge(r) for r in res]
