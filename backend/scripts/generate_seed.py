import uuid
import random
from datetime import datetime, timedelta

def snake_case(s):
    return s.lower().replace(" ", "_")

TEAMS = [
    {"id": "11111111-1111-4111-a111-111111111111", "name": "Platform Engineering", "slug": "platform-engineering", "description": "Core backend and infrastructure"},
    {"id": "22222222-2222-4222-a222-222222222222", "name": "Customer Success", "slug": "customer-success", "description": "Front-line customer support"},
    {"id": "33333333-3333-4333-a333-333333333333", "name": "Billing Support", "slug": "billing-support", "description": "Payments and subscriptions"},
]

# Roles must match DB Constraints: 'requester', 'support_engineer', 'approver', 'knowledge_manager', 'admin'
PROFILES = [
    {"id": "a1111111-1111-4111-a111-111111111111", "email": "admin@example.com", "full_name": "Alice Admin", "role": "admin", "team_id": TEAMS[0]["id"]},
    {"id": "a2222222-2222-4222-a222-222222222222", "email": "agent1@example.com", "full_name": "Bob Support", "role": "support_engineer", "team_id": TEAMS[1]["id"]},
    {"id": "a3333333-3333-4333-a333-333333333333", "email": "agent2@example.com", "full_name": "Charlie Agent", "role": "support_engineer", "team_id": TEAMS[1]["id"]},
    {"id": "a4444444-4444-4444-a444-444444444444", "email": "cust1@example.com", "full_name": "David Customer", "role": "requester", "team_id": None},
    {"id": "a5555555-5555-4555-a555-555555555555", "email": "cust2@example.com", "full_name": "Eve Consumer", "role": "requester", "team_id": None},
    {"id": "a6666666-6666-4666-a666-666666666666", "email": "lead@example.com", "full_name": "Frank TeamLead", "role": "approver", "team_id": TEAMS[0]["id"]},
]

TAGS = [
    {"id": str(uuid.uuid4()), "name": "API", "slug": "api"},
    {"id": str(uuid.uuid4()), "name": "Billing", "slug": "billing"},
    {"id": str(uuid.uuid4()), "name": "Login", "slug": "login"},
    {"id": str(uuid.uuid4()), "name": "Database", "slug": "database"},
]

sql = "-- DEVELOPMENT SEED DATA (Generated)\n\n"

# TEAMS
for t in TEAMS:
    sql += f"INSERT INTO teams (id, name, slug, description) VALUES ('{t['id']}', '{t['name']}', '{t['slug']}', '{t['description']}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# PROFILES
for p in PROFILES:
    team_val = f"'{p['team_id']}'" if p["team_id"] else "NULL"
    sql += f"INSERT INTO profiles (id, email, full_name, role, team_id) VALUES ('{p['id']}', '{p['email']}', '{p['full_name']}', '{p['role']}', {team_val}) ON CONFLICT DO NOTHING;\n"
sql += "\n"

# TAGS
for tg in TAGS:
    sql += f"INSERT INTO knowledge_tags (id, name, slug) VALUES ('{tg['id']}', '{tg['name']}', '{tg['slug']}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# WORK ITEMS
WORK_ITEMS = []
item_types = ["ticket", "ticket", "issue"]
statuses = ["open", "in_progress", "pending_approval", "resolved", "closed"]
priorities = ["low", "medium", "high", "urgent"]
severities = ["sev4", "sev3", "sev2", "sev1"]

topics = [
    ("Login Failing", "I cannot login to the dashboard. It says 500.", "api", "ticket"),
    ("Billing Issue", "My credit card was charged twice.", "billing", "ticket"),
    ("Database Slow", "Queries are taking 5 seconds to load.", "database", "issue"),
    ("Missing data", "The analytics page shows empty charts.", "api", "issue"),
    ("Need more seats", "How do I add 5 more users?", "billing", "ticket"),
]

base_time = datetime.now() - timedelta(days=30)

for i in range(1, 35):
    t_id = str(uuid.uuid4())
    item_type = random.choice(item_types)
    topic = random.choice(topics)
    reporter = random.choice(PROFILES)["id"]
    assignee = random.choice([p["id"] for p in PROFILES if p["role"] in ["support_engineer", "admin", "approver"]]) if random.random() > 0.3 else None
    
    status = random.choice(statuses)
    priority = random.choice(priorities)
    ai_sum = f"User is reporting an issue regarding {topic[2]}." if random.random() > 0.5 else ""
    created = base_time + timedelta(hours=i*5)
    
    WORK_ITEMS.append({"id": t_id, "key": f"TKT-{i+100}"})
    
    assignee_val = f"'{assignee}'" if assignee else "NULL"
    ai_val = f"'{ai_sum}'" if ai_sum else "NULL"
    
    sql += f"INSERT INTO work_items (id, key, type, title, description, status, priority, reporter_profile_id, assignee_profile_id, ai_summary, created_at) "
    sql += f"VALUES ('{t_id}', 'TKT-{i+100}', '{item_type}', '{topic[0]} #{i}', '{topic[1]} happened recently.', '{status}', '{priority}', '{reporter}', {assignee_val}, {ai_val}, '{created.isoformat()}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# COMMENTS
for i in range(25):
    c_id = str(uuid.uuid4())
    w_id = random.choice(WORK_ITEMS)["id"]
    auth_id = random.choice(PROFILES)["id"]
    is_internal = "TRUE" if random.random() > 0.7 else "FALSE"
    sql += f"INSERT INTO comments (id, work_item_id, author_profile_id, content, is_internal) VALUES ('{c_id}', '{w_id}', '{auth_id}', 'This is a sample update or note.', {is_internal}) ON CONFLICT DO NOTHING;\n"
sql += "\n"

# APPROVALS
for i in range(8):
    w_id = random.choice(WORK_ITEMS)["id"]
    approver = PROFILES[0]["id"] # Admin
    status = random.choice(["pending", "approved", "rejected"])
    sql += f"INSERT INTO approvals (id, work_item_id, approver_profile_id, status) VALUES ('{str(uuid.uuid4())}', '{w_id}', '{approver}', '{status}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# KNOWLEDGE
K_ARTICLES = []
for i in range(1, 11):
    k_id = str(uuid.uuid4())
    K_ARTICLES.append(k_id)
    author = PROFILES[0]["id"]
    status = "published" if random.random() > 0.2 else "draft"
    sql += f"INSERT INTO knowledge_articles (id, slug, title, body_markdown, status, owner_profile_id) VALUES ('{k_id}', 'article-{i}', 'How to fix issue {i}', 'Here is the step by step markdown guide.', '{status}', '{author}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# KNOWLEDGE TAG MAPPING
for k_id in K_ARTICLES:
    num_tags = random.randint(1, 3)
    sel_tags = random.sample(TAGS, num_tags)
    for t in sel_tags:
        sql += f"INSERT INTO knowledge_article_tags (article_id, tag_id) VALUES ('{k_id}', '{t['id']}') ON CONFLICT DO NOTHING;\n"
sql += "\n"

# ACTIVITY LOGS
for i in range(15):
    w_id = random.choice(WORK_ITEMS)["id"]
    actor = random.choice(PROFILES)["id"]
    sql += f"INSERT INTO activity_log (id, work_item_id, actor_profile_id, action) VALUES ('{str(uuid.uuid4())}', '{w_id}', '{actor}', 'status_changed') ON CONFLICT DO NOTHING;\n"

with open("backend/supabase/migrations/20260419000011_seed_dev_data_v2.sql", "w") as f:
    f.write(sql)
print("V2 SQL file generated!")
