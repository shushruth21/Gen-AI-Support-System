// Shared Types & Literals
export type WorkItemType = 'ticket' | 'issue';
export type WorkItemStatus = 'open' | 'in_progress' | 'pending_approval' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Severity = 'sev4' | 'sev3' | 'sev2' | 'sev1';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type TicketCategory =
  | 'authentication'
  | 'performance'
  | 'billing'
  | 'data-export'
  | 'integrations'
  | 'ui-bug'
  | 'mobile'
  | 'notifications'
  | 'security'
  | 'other';
export type SLARisk = 'low' | 'medium' | 'high' | 'breached';

// User & Team Management
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'agent' | 'admin' | 'user';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

// AI Integration Metadata
export interface AITriageMetadata {
  suggestedPriority?: Priority;
  suggestedSeverity?: Severity;
  suggestedCategory?: TicketCategory;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  confidenceScore?: number;
  duplicateOf?: string;
  agentAssistSuggestion?: string;
  knowledgeArticleIds?: string[];
}

// Core Work Item
export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: Priority;
  severity?: Severity;
  category?: TicketCategory;
  slaRisk?: SLARisk;
  resolutionHours?: number;
  escalated?: boolean;
  reporterId: string;
  assigneeId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  aiMetadata?: AITriageMetadata;
}

// Child Elements of Work Items
export interface Comment {
  id: string;
  workItemId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Approval {
  id: string;
  workItemId: string;
  approverId: string;
  status: ApprovalStatus;
  requestedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  workItemId: string;
  actorId: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Knowledge Base
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Dashboard Analytics
export interface DashboardKPI {
  totalTickets: number;
  totalTicketsDelta: number;
  avgResolutionHours: number;
  avgResolutionHoursDelta: number;
  aiTriageCoverage: number;
  aiTriageCoverageDelta: number;
  slaBreachRisk: number;
  slaBreachRiskDelta: number;
}
