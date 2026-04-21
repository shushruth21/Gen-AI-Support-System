import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Bind backend context
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import get_db

print("Starting Live Seed Engine...")
db = get_db()

# Step 1: Wipe mock data carefully from our public tables
print("Cleaning existing mock data...")
# Supabase Python SDK doesn't natively support DELETE without a filter, so we filter by id is not null
try:
    db.table("activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("knowledge_article_tags").delete().neq("article_id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("knowledge_articles").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("knowledge_tags").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("approvals").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("work_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    db.table("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
except Exception as e:
    print(f"Delete step may have hit a non-fatal constraint: {e}")

# Step 2: Create Authenticated Mock Users using Auth Admin API
# This mathematically guarantees the `profiles_id_fkey` constraint passes!
MOCK_USERS = [
    {"email": "admin@example.com", "full_name": "Alice Admin", "role": "admin", "team_index": 0},
    {"email": "agent1@example.com", "full_name": "Bob Support", "role": "support_engineer", "team_index": 1},
    {"email": "agent2@example.com", "full_name": "Charlie Agent", "role": "support_engineer", "team_index": 1},
    {"email": "cust1@example.com", "full_name": "David Customer", "role": "requester", "team_index": None},
    {"email": "cust2@example.com", "full_name": "Eve Consumer", "role": "requester", "team_index": None},
]

print("Injecting explicit Auth.users...")
live_profiles = []

for u in MOCK_USERS:
    try:
        # Create user with a unified password so you can actually log in later during Stage 6
        user_res = db.auth.admin.create_user({
            "email": u["email"],
            "password": "Password123!",
            "email_confirm": True,
            "user_metadata": {"full_name": u["full_name"]}
        })
        user_id = user_res.user.id
        live_profiles.append({"id": user_id, "data": u})
        print(f"Created Auth User: {u['email']} -> {user_id}")
    except Exception as e:
        print(f"User {u['email']} may already exist, fetching their ID...")
        # If they already exist, we need their ID. 
        # Supabase list_users is paginated
        users_resp = db.auth.admin.list_users()
        for eu in users_resp:
            if eu.email == u["email"]:
                live_profiles.append({"id": eu.id, "data": u})
                break

# Step 3: Insert Teams
print("Constructing Teams...")
TEAMS = [
    {"name": "Platform Engineering", "slug": "platform-engineering", "description": "Core"},
    {"name": "Customer Success", "slug": "customer-success", "description": "Support"},
    {"name": "Billing Support", "slug": "billing-support", "description": "Payments"},
]
created_teams = []
for t in TEAMS:
    try:
        res = db.table("teams").insert(t).execute()
        created_teams.append(res.data[0])
    except:
        res = db.table("teams").select("*").eq("slug", t["slug"]).execute()
        created_teams.append(res.data[0])

# Step 4: Map profiles metadata securely directly to the real auth records
print("Mapping public.profiles to real auth keys...")
structured_profiles = []
for p in live_profiles:
    t_id = created_teams[p["data"]["team_index"]]["id"] if p["data"]["team_index"] is not None else None
    
    prof_data = {
        "id": p["id"],
        "email": p["data"]["email"],
        "full_name": p["data"]["full_name"],
        "role": p["data"]["role"],
        "team_id": t_id
    }
    structured_profiles.append(prof_data)
    try:
        db.table("profiles").upsert(prof_data).execute()
    except Exception as e:
        print(f"Upsert profile failed: {e}")

# Step 5: Tags
print("Injecting tags...")
tags_data = [
    {"name": "API", "slug": "api"},
    {"name": "Billing", "slug": "billing"},
    {"name": "Login", "slug": "login"}
]
created_tags = db.table("knowledge_tags").insert(tags_data).execute().data


# Step 6: Expand realistic Work Items with actual validated generated IDs
print("Spawning Work Items...")
statuses = ["open", "in_progress", "pending_approval", "resolved", "closed"]
topics = [("Login Error", "500 failure", "ticket"), ("Billing Fail", "Double charge", "ticket"), ("App Slow", "Latency spikes", "issue")]
base_time = datetime.now() - timedelta(days=30)
work_item_ids = []

for i in range(1, 35):
    topic = random.choice(topics)
    reporter = random.choice(structured_profiles)["id"]
    assignee = random.choice([p for p in structured_profiles if p["role"] in ["support_engineer", "admin"]])["id"]
    status = random.choice(statuses)
    
    res = db.table("work_items").insert({
        "key": f"TKT-{i+100}",
        "type": topic[2],
        "title": f"{topic[0]} #{i}",
        "description": topic[1],
        "status": status,
        "priority": random.choice(["low", "medium", "high"]),
        "reporter_profile_id": reporter,
        "assignee_profile_id": assignee if random.random() > 0.3 else None,
        "ai_summary": "Auto triaged summary." if random.random() > 0.5 else None
    }).execute()
    work_item_ids.append(res.data[0]["id"])

print("Generating Comments & Approvals...")
for i in range(25):
    db.table("comments").insert({
        "work_item_id": random.choice(work_item_ids),
        "author_profile_id": random.choice(structured_profiles)["id"],
        "body": f"Update message trace #{i}",
        "is_internal": random.choice([True, False])
    }).execute()

for i in range(8):
    db.table("approvals").insert({
        "work_item_id": random.choice(work_item_ids),
        "approver_profile_id": structured_profiles[0]["id"], # Admin
        "requested_by_profile_id": structured_profiles[1]["id"], # Agent 1
        "status": random.choice(["pending", "approved", "rejected"])
    }).execute()

print("Generating Knowledge Articles...")
for i in range(1, 10):
    k_res = db.table("knowledge_articles").insert({
        "slug": f"guide-{i}",
        "title": f"Fixing Problem {i}",
        "body_markdown": "## Guide\nDo this carefully.",
        "status": random.choice(["published", "draft"]),
        "owner_profile_id": structured_profiles[0]["id"]
    }).execute()
    
    # Map random tag
    db.table("knowledge_article_tags").insert({
        "article_id": k_res.data[0]["id"],
        "tag_id": random.choice(created_tags)["id"]
    }).execute()

print("\n--- SYNCHRONIZATION COMPLETE! ---")
print("All mock dev data securely seeded. Use passwords 'Password123!' for your auth users later.")
