// Shared Types & Literals (Used over Enums for better frontend/backend serialization compatibility)
export type WorkItemType = 'ticket' | 'issue';
export type WorkItemStatus = 'open' | 'in_progress' | 'pending_approval' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Severity = 'sev4' | 'sev3' | 'sev2' | 'sev1'; // Typically reserved for Issues
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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

// AI Integration Metadata (For later use, keeping the structure ready)
export interface AITriageMetadata {
  suggestedPriority?: Priority;
  suggestedSeverity?: Severity;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  confidenceScore?: number;
}

// Core Work Item (Shared base for Tickets & Issues)
export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: Priority;
  severity?: Severity; 
  reporterId: string;
  assigneeId?: string; // Supports "Assigned" View
  teamId?: string;
  createdAt: string; // ISO string for easy JSON transit
  updatedAt: string;
  resolvedAt?: string;
  
  // AI metadata isolated so it can be added incrementally later
  aiMetadata?: AITriageMetadata; 
}

// Child Elements of Work Items
export interface Comment {
  id: string;
  workItemId: string;
  authorId: string;
  content: string;
  isInternal: boolean; // True if it's a private note for staff
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
  details?: Record<string, any>; // JSON payload for what changed
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
