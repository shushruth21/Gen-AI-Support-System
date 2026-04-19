CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    manager_profile_id UUID NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    display_name TEXT,
    role TEXT CHECK (role IN ('requester', 'support_engineer', 'approver', 'knowledge_manager', 'admin')),
    team_id UUID NULL REFERENCES teams(id),
    title TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Need to add the manager FK back to teams now that profiles exists
ALTER TABLE teams ADD CONSTRAINT fk_teams_manager FOREIGN KEY (manager_profile_id) REFERENCES profiles(id);
