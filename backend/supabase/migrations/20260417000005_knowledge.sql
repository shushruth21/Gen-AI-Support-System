CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    body_markdown TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    owner_profile_id UUID NULL REFERENCES profiles(id),
    approved_by_profile_id UUID NULL REFERENCES profiles(id),
    source_work_item_id UUID NULL REFERENCES work_items(id),
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE knowledge_article_tags (
    article_id UUID REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES knowledge_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE work_item_knowledge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL CHECK (link_type IN ('suggested', 'used', 'created_from')),
    score NUMERIC(5,4) NULL,
    created_by TEXT NOT NULL CHECK (created_by IN ('ai', 'human', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
