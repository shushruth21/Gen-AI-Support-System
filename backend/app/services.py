from app.db import get_db

def get_dashboard_summary():
    db = get_db()
    # Execute native Supabase HTTP queries
    tickets = db.table("work_items").select("id", count="exact").eq("type", "ticket").execute()
    issues = db.table("work_items").select("id", count="exact").eq("type", "issue").execute()
    approvals = db.table("approvals").select("id", count="exact").eq("status", "pending").execute()
    
    return {
        "totalTickets": tickets.count if tickets.count else 0,
        "totalIssues": issues.count if issues.count else 0,
        "pendingApprovals": approvals.count if approvals.count else 0,
        "assignedToMe": 0 # Temporarily 0 until auth context is fully propagated 
    }

def map_work_item(row):
    return {
        "id": row.get("key", row.get("id")), # Surface the 'TKT-123' key as the ID for the frontend UI
        "type": row.get("type"),
        "title": row.get("title"),
        "description": row.get("description"),
        "status": row.get("status"),
        "priority": row.get("priority"),
        "severity": row.get("severity"),
        "assigneeId": row.get("assignee_profile_id"),
        "reporterId": row.get("reporter_profile_id"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
        "aiMetadata": row.get("ai_summary") # Temporarily map to string, wait AITriageMetadata schema was JSONB
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
    # Search by key since that's what the UI requested
    response = db.table("work_items").select("*").eq("key", item_id).execute()
    if not response.data:
        return None
    return map_work_item(response.data[0])

def get_approvals():
    db = get_db()
    return db.table("approvals").select("*").execute().data

def get_knowledge():
    db = get_db()
    return db.table("knowledge_articles").select("*").execute().data
