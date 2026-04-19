CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ticket', 'issue')),
    parent_work_item_id UUID NULL REFERENCES work_items(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    severity TEXT NULL,
    category TEXT NULL,
    source TEXT NULL,
    approval_status TEXT NOT NULL DEFAULT 'not_required',
    approval_required BOOLEAN DEFAULT FALSE,
    reporter_profile_id UUID NULL REFERENCES profiles(id),
    assignee_profile_id UUID NULL REFERENCES profiles(id),
    team_id UUID NULL REFERENCES teams(id),
    worked_by_profile_id UUID NULL REFERENCES profiles(id),
    ai_summary TEXT NULL,
    ai_triage_status TEXT NULL,
    customer_visible BOOLEAN DEFAULT FALSE,
    sla_due_at TIMESTAMPTZ NULL,
    first_response_due_at TIMESTAMPTZ NULL,
    resolution_due_at TIMESTAMPTZ NULL,
    resolved_at TIMESTAMPTZ NULL,
    closed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_item_watchers (
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (work_item_id, profile_id)
);
