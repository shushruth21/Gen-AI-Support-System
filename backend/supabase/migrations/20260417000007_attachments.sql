CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NULL REFERENCES work_items(id) ON DELETE CASCADE,
    article_id UUID NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    uploaded_by_profile_id UUID NULL REFERENCES profiles(id),
    bucket_name TEXT NOT NULL,
    object_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
