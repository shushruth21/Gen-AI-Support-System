-- Profiles
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Work Items
CREATE UNIQUE INDEX idx_work_items_key ON work_items(key);
CREATE INDEX idx_work_items_type ON work_items(type);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_priority ON work_items(priority);
CREATE INDEX idx_work_items_severity ON work_items(severity);
CREATE INDEX idx_work_items_approval_status ON work_items(approval_status);
CREATE INDEX idx_work_items_assignee ON work_items(assignee_profile_id);
CREATE INDEX idx_work_items_reporter ON work_items(reporter_profile_id);
CREATE INDEX idx_work_items_team ON work_items(team_id);
CREATE INDEX idx_work_items_created_at_desc ON work_items(created_at DESC);
CREATE INDEX idx_work_items_updated_at_desc ON work_items(updated_at DESC);
CREATE INDEX idx_work_items_pending_approval ON work_items(updated_at DESC) WHERE approval_status = 'pending';

-- Comments
CREATE INDEX idx_comments_work_item ON comments(work_item_id, created_at);

-- Approvals
CREATE INDEX idx_approvals_work_item ON approvals(work_item_id);
CREATE INDEX idx_approvals_approver ON approvals(approver_profile_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- Knowledge
CREATE UNIQUE INDEX idx_knowledge_articles_slug ON knowledge_articles(slug);
CREATE INDEX idx_knowledge_articles_status ON knowledge_articles(status);

-- Activity Log
CREATE INDEX idx_activity_log_work_item ON activity_log(work_item_id, created_at DESC);
CREATE INDEX idx_activity_log_actor ON activity_log(actor_profile_id, created_at DESC);

-- AI Audit Log
CREATE INDEX idx_ai_audit_log_work_item ON ai_audit_log(work_item_id, created_at DESC);
CREATE INDEX idx_ai_audit_log_agent ON ai_audit_log(agent_name, created_at DESC);
CREATE INDEX idx_ai_audit_log_accepted_by ON ai_audit_log(accepted_by_profile_id);
