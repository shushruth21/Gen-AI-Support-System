import sys
import os
import random
import uuid
import json
from datetime import datetime, timedelta, timezone

# Bind backend context
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import get_db

def run_seed():
    print("Starting Cloud Realism Live Seed Engine...")
    db = get_db()

    print("Cleaning existing mock data...")
    # Clean tables safely via TRUNCATE or cascading deletes if possible. Since we want a robust flush:
    tables_to_clean = ["attachments", "activity_log", "ai_audit_log", "work_item_knowledge_links", 
                       "knowledge_article_tags", "knowledge_articles", "knowledge_tags", 
                       "approvals", "comments", "work_items", "profiles", "teams"]
    for table in tables_to_clean:
        try:
            db.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except:
            pass

    # -- TEAMS & PROFILES --
    TEAMS = [
        {"name": "Site Reliability Engineering", "slug": "sre", "description": "L2/L3 escalations"},
        {"name": "Customer Support", "slug": "support", "description": "L1 Triage"},
        {"name": "Platform Engineering", "slug": "platform", "description": "Core architecture"},
    ]
    created_teams = []
    for t in TEAMS:
        try:
            res = db.table("teams").insert(t).execute()
            created_teams.append(res.data[0])
        except Exception:
            created_teams.append(db.table("teams").select("*").eq("slug", t["slug"]).execute().data[0])

    MOCK_USERS = [
        {"email": "admin@example.com", "full_name": "System Admin", "role": "admin", "team_index": 2},
        {"email": "oncall@example.com", "full_name": "SRE On-Call", "role": "support_engineer", "team_index": 0},
        {"email": "agent1@example.com", "full_name": "L1 Agent Alpha", "role": "support_engineer", "team_index": 1},
        {"email": "approver@example.com", "full_name": "Security Approver", "role": "approver", "team_index": 0},
        {"email": "cust1@acme.corp", "full_name": "Acme CTO", "role": "requester", "team_index": None},
        {"email": "cust2@startup.io", "full_name": "Startup Dev", "role": "requester", "team_index": None},
    ]

    live_profiles = []
    for u in MOCK_USERS:
        # Guarantee Auth Users exist
        try:
            user_res = db.auth.admin.create_user({"email": u["email"], "password": "Password123!", "email_confirm": True})
            user_id = user_res.user.id
        except Exception:
            users_resp = db.auth.admin.list_users()
            user_id = next(eu.id for eu in users_resp if eu.email == u["email"])
            
        t_id = created_teams[u["team_index"]]["id"] if u["team_index"] is not None else None
        prof_data = {"id": user_id, "email": u["email"], "full_name": u["full_name"], "role": u["role"], "team_id": t_id}
        try:
            db.table("profiles").upsert(prof_data).execute()
        except:
            pass
        live_profiles.append(prof_data)

    agents = [p for p in live_profiles if p["role"] in ["support_engineer", "admin", "approver"]]
    customers = [p for p in live_profiles if p["role"] == "requester"]

    # -- KNOWLEDGE TAGS & ARTICLES --
    tags = ["Networking", "Auth", "Cache", "Database", "Kubernetes", "Storage", "Latency", "Outage", "Certificate", "IAM"]
    tag_records = db.table("knowledge_tags").insert([{"name": t, "slug": t.lower()} for t in tags]).execute().data

    runbooks = [
        ("Mitigating Cloud SQL Exhaustion", "Database", "Run `SELECT pg_terminate_backend(pid)` and bounce the connection pooler. Monitor connections via Cloud Monitoring."),
        ("Debugging GKE OOMKilled", "Kubernetes", "Verify `limits.memory` in deployment manifests. Check if memory utilization spikes unexpectedly under load."),
        ("IAM Permission Regressions", "IAM", "Review Cloud Audit Logs. Check if CI/CD wiped Terraform state roles. Re-apply `roles/storage.objectViewer`."),
        ("API Gateway 504 Timeouts", "Networking", "Check upstream backend status. If downstream is healthy, scaling API Gateway load balancers is necessary."),
        ("Clearing Redis Saturation", "Cache", "Memory fragmentation $> 1.5$ requires `MEMORY PURGE`. Apply `volatile-lru` maxmemory-policy."),
        ("Rotating Expired Certificates", "Certificate", "Automate cert-manager in GKE or verify Cloud Load Balancing managed certificates DNS validation paths."),
        ("Pub/Sub Subscriber Deadlocks", "Networking", "Force restart subscriber clients. Validate if message pulling threads are starved by synchronous DB locks."),
        ("DNS Resolution Failures", "Outage", "Verify Cloud DNS forwarding zones. Attempt querying `metadata.google.internal` natively."),
        ("Auth Token Jitter Mitigation", "Auth", "Validate JWK endpoints. Extend cache TTL for public keys or move validation boundary closer to Edge."),
        ("Storage Access Policies", "Storage", "Ensure Uniform bucket-level access is ON. Review bucket policy only bindings."),
        ("Service Dependency Graphing", "Outage", "When downstream cascading failure occurs, implement aggressive circuit breakers via Istio or application level."),
        ("Handling Regional Capacity", "Networking", "Failover traffic via GLB to secondary region. File capacity request quota ticket.")
    ]

    k_ids = []
    print("Generating 12-20 Knowledge Articles...")
    for title, t_name, body in runbooks:
        k_res = db.table("knowledge_articles").insert({
            "slug": f"rb-{uuid.uuid4().hex[:6]}",
            "title": f"Runbook: {title}",
            "body_markdown": f"## Overview\n{body}\n\n### Mitigation Steps\n1. Acknowledge\n2. Diagnose\n3. Remediate\n4. Verify",
            "status": "published",
            "owner_profile_id": random.choice(agents)["id"]
        }).execute()
        k_id = k_res.data[0]["id"]
        k_ids.append((k_id, t_name))
        
        tag_id = next(t["id"] for t in tag_records if t["name"] == t_name)
        db.table("knowledge_article_tags").insert({"article_id": k_id, "tag_id": tag_id}).execute()

    # -- 12 CLOUD INCIDENT MOTIFS --
    MOTIFS = [
        {"title": "Compute Engine regional capacity issue", "type": "issue", "tag": "Outage", "summary": "Zone resource exhaustion blocking instance spawning.", "rc": "Zone Capacity", "part": "Compute API", "act": "Move to zone-b."},
        {"title": "GKE pod crash loop", "type": "ticket", "tag": "Kubernetes", "summary": "Pods terminating with OOMKilled post-deploy.", "rc": "Memory Limits", "part": "GKE", "act": "Increase memory limit limits."},
        {"title": "Cloud SQL connection exhaustion", "type": "issue", "tag": "Database", "summary": "Postgres rejecting connections, pool saturated.", "rc": "Zombie Transactions", "part": "Cloud SQL Postgres", "act": "Restart pgBouncer."},
        {"title": "Pub/Sub backlog growth", "type": "issue", "tag": "Networking", "summary": "Unacknowledged messages piling up constantly.", "rc": "Subscriber Deadlock", "part": "Pub/Sub Subscriptions", "act": "Rollback worker app."},
        {"title": "IAM permission regression", "type": "ticket", "tag": "IAM", "summary": "Accounts getting 403 Forbidden suddenly.", "rc": "Terraform overwrite", "part": "Cloud IAM", "act": "Re-grant binding."},
        {"title": "Certificate expiration on LB", "type": "issue", "tag": "Certificate", "summary": "SSL Handshake failing on primary domain.", "rc": "Unmanaged Cert", "part": "Cloud Load Balancing", "act": "Provision Managed Cert."},
        {"title": "Auth token latency spike", "type": "ticket", "tag": "Auth", "summary": "Login taking 6+ seconds due to token validation.", "rc": "Redis IOPS limit", "part": "Auth Service", "act": "Scale Redis tier."},
        {"title": "API gateway timeout increase", "type": "issue", "tag": "Networking", "summary": "504 Timeouts spiking across EU regions.", "rc": "Backend Degradation", "part": "API Gateway", "act": "Page backend team."},
        {"title": "Cache memory saturation", "type": "issue", "tag": "Cache", "summary": "Cache evictions causing DB read load spikes.", "rc": "Keyspace Thrashing", "part": "Redis Enterprise", "act": "Upgrade node size."},
        {"title": "Storage object access failures", "type": "ticket", "tag": "Storage", "summary": "Signed URLs failing to fetch PDF assets.", "rc": "Service Account Key Expired", "part": "Cloud Storage", "act": "Rotate SA keys."},
        {"title": "DNS resolution issue", "type": "issue", "tag": "Networking", "summary": "Internal microservices unable to resolve metadata.", "rc": "DNS Forwarding Loops", "part": "Cloud DNS", "act": "Flush DNS rules."},
        {"title": "Service dependency outage", "type": "issue", "tag": "Outage", "summary": "Payment service down bringing down entire frontend.", "rc": "Cascading Failure", "part": "Payment Gateway Integration", "act": "Trigger circuit breaker."}
    ]

    print("Spawning 150 Work Items...")
    statuses = ["open", "in_progress", "pending_approval", "resolved", "closed"]
    base_time = datetime.now(timezone.utc) - timedelta(days=90)
    
    for i in range(1, 151):
        m = MOTIFS[i % len(MOTIFS)]
        reporter = random.choice(customers)["id"]
        assignee = random.choice(agents)["id"] if random.random() > 0.3 else None
        status = random.choice(statuses)
        if status in ["resolved", "closed"] and not assignee:
            assignee = agents[0]["id"]

        delta = timedelta(days=random.randint(0, 88), hours=random.randint(0, 23))
        created_at = base_time + delta
        resolved_at = (created_at + timedelta(days=1, hours=random.randint(1,10))) if status in ["resolved", "closed"] else None

        metadata = {
            "summary": m["summary"],
            "suggestedPriority": random.choice(["high", "urgent"]),
            "suggestedSeverity": random.choice(["medium", "high", "urgent"]),
            "probableRootCause": m["rc"],
            "impactedComponent": m["part"],
            "suggestedNextAction": m["act"],
            "confidenceScore": round(random.uniform(0.75, 0.98), 2)
        }

        wi_data = {
            "key": f"TKT-{1000+i}",
            "type": m["type"],
            "title": f"[{m['tag']}] {m['title']} - Environment {random.choice(['Prod', 'Staging'])}",
            "description": f"Encountering {m['title']} errors. Impacting {random.randint(5, 5000)} users. Please advise.\n\nLogs show: ERROR_CODE_{random.randint(100,600)}",
            "status": status,
            "priority": metadata["suggestedPriority"],
            "severity": metadata["suggestedSeverity"],
            "reporter_profile_id": reporter,
            "assignee_profile_id": assignee,
            "ai_summary": metadata["summary"],
            "created_at": created_at.isoformat(),
        }
        if resolved_at:
            wi_data["resolved_at"] = resolved_at.isoformat()
            if status == "closed":
                wi_data["closed_at"] = (resolved_at + timedelta(days=1)).isoformat()

        res = db.table("work_items").insert(wi_data).execute()
        w_id = res.data[0]["id"]

        # 1. Base Activity Log
        db.table("activity_log").insert({
            "work_item_id": w_id, "actor_profile_id": reporter, "event_type": "created",
            "created_at": created_at.isoformat()
        }).execute()

        # 2. AI Triage Audit Log & Activity Log
        ai_time = created_at + timedelta(seconds=15)
        db.table("activity_log").insert({
            "work_item_id": w_id, "event_type": "triaged_by_ai", "created_at": ai_time.isoformat()
        }).execute()
        db.table("ai_audit_log").insert({
            "work_item_id": w_id, "agent_name": "Triage AI Bot", "action_type": "initial_triage",
            "model_name": "gemini-1.5-pro", "input_payload": {"text": wi_data["description"]},
            "output_payload": metadata, "confidence": metadata["confidenceScore"],
            "created_at": ai_time.isoformat()
        }).execute()

        # 3. Assignment
        if assignee:
            db.table("activity_log").insert({
                "work_item_id": w_id, "actor_profile_id": agents[0]["id"], "event_type": "assigned",
                "new_value": {"assignee_id": assignee}, "created_at": (ai_time + timedelta(minutes=5)).isoformat()
            }).execute()

        # 4. Approvals
        if status == "pending_approval":
            db.table("approvals").insert({
                "work_item_id": w_id, "approver_profile_id": next(a["id"] for a in agents if a["role"]=="approver"),
                "status": "pending", "notes": "Requesting infrastructure quota increase.",
                "requested_by_profile_id": assignee or agents[0]["id"],
                "created_at": (ai_time + timedelta(hours=1)).isoformat()
            }).execute()

        # 5. Comments
        comments = ["Looking into this now.", "Checking Cloud Monitoring metrics. Confirming saturation.", "Applied mitigation strategy. Let's observe."]
        for idx, c in enumerate(random.sample(comments, random.randint(1, 3))):
            db.table("comments").insert({
                "work_item_id": w_id, "author_profile_id": assignee or agents[0]["id"], "body": c,
                "is_internal": random.choice([True, False]), "created_at": (ai_time + timedelta(minutes=15*(idx+1))).isoformat()
            }).execute()

        # 6. Attachments
        if random.random() > 0.5:
            db.table("attachments").insert({
                "work_item_id": w_id, "uploaded_by_profile_id": reporter,
                "bucket_name": "support-files", "object_path": f"{w_id}/trace_diagram.png",
                "file_name": "trace_diagram.png", "mime_type": "image/png", "size_bytes": random.randint(10000, 50000)
            }).execute()

        # 7. Knowledge Suggestion Links
        # Match tag to runbook
        rel_books = [k[0] for k in k_ids if k[1] == m["tag"]]
        if rel_books:
            db.table("work_item_knowledge_links").insert({
                "work_item_id": w_id, "article_id": rel_books[0], "link_type": "suggested",
                "score": round(random.uniform(0.70, 0.99), 2), "created_by": "ai"
            }).execute()
            db.table("activity_log").insert({
                "work_item_id": w_id, "event_type": "linked_knowledge", 
                "metadata": {"article_id": rel_books[0]}, "created_at": ai_time.isoformat()
            }).execute()

    print("\n--- SYNCHRONIZATION COMPLETE! ---")

if __name__ == "__main__":
    run_seed()
