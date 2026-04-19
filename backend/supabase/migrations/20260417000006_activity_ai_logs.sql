CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NULL REFERENCES work_items(id) ON DELETE CASCADE,
    actor_profile_id UUID NULL REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    field_name TEXT NULL,
    old_value JSONB NULL,
    new_value JSONB NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NULL REFERENCES work_items(id) ON DELETE SET NULL,
    article_id UUID NULL REFERENCES knowledge_articles(id) ON DELETE SET NULL,
    agent_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    model_name TEXT NULL,
    input_payload JSONB NOT NULL,
    output_payload JSONB NOT NULL,
    confidence NUMERIC(5,4) NULL,
    accepted_by_profile_id UUID NULL REFERENCES profiles(id),
    accepted_at TIMESTAMPTZ NULL,
    rejected_at TIMESTAMPTZ NULL,
    latency_ms INTEGER NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
