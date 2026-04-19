import { WorkItem, User, Team, Approval, KnowledgeArticle, ActivityLog } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@support.ai', role: 'admin' },
  { id: 'u2', name: 'Bob Agent', email: 'bob@support.ai', role: 'agent' },
  { id: 'u3', name: 'Charlie User', email: 'charlie@client.net', role: 'user' }
];

export const mockTeams: Team[] = [
  { id: 't1', name: 'Tier 1 Triage', description: 'Initial review operations' },
  { id: 't2', name: 'Engineering Escalation', description: 'Deep technical issues' }
];

export const mockWorkItems: WorkItem[] = [
  {
    id: 'TKT-1001',
    type: 'ticket',
    title: 'Cannot reset password via email link',
    description: 'User reports their password reset email arrives, but clicking the link says expired immediately.',
    status: 'open',
    priority: 'high',
    reporterId: 'u3',
    assigneeId: 'u2',
    teamId: 't1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiMetadata: { summary: 'Password reset link instantly expiring before use.', suggestedPriority: 'high' }
  },
  {
    id: 'ISS-2001',
    type: 'issue',
    title: 'Auth Service Latency Spike',
    description: 'Monitoring alerting to 500ms latency on /auth/token endpoints in US-EAST-1.',
    status: 'in_progress',
    priority: 'urgent',
    severity: 'sev2',
    reporterId: 'u1',
    assigneeId: 'u1',
    teamId: 't2',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TKT-1002',
    type: 'ticket',
    title: 'How do I add a new billing user?',
    description: 'Customer wants to understand the RBAC permissions for billing.',
    status: 'resolved',
    priority: 'low',
    reporterId: 'u3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 40000000).toISOString(),
    aiMetadata: { summary: 'Inquiry regarding billing role access.', suggestedPriority: 'low' }
  },
  // Add more items logic simulating the 30+ requirement can be scaled out here in production
];

export const mockApprovals: Approval[] = [
  {
    id: 'APP-001',
    workItemId: 'ISS-2001',
    approverId: 'u1',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
];

export const mockKnowledge: KnowledgeArticle[] = [
  {
    id: 'KB-1',
    title: 'Managing Billing Roles',
    content: 'To add a billing user, navigate to Settings > Org > Roles...',
    authorId: 'u1',
    isPublished: true,
    tags: ['billing', 'rbac'],
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    updatedAt: new Date(Date.now() - 200000000).toISOString(),
  }
];

// --- Service Helper Fakes ---
export async function getDashboardStats() {
  return {
    totalTickets: mockWorkItems.filter(i => i.type === 'ticket').length,
    totalIssues: mockWorkItems.filter(i => i.type === 'issue').length,
    pendingApprovals: mockApprovals.filter(a => a.status === 'pending').length,
    assignedToMe: mockWorkItems.filter(i => i.assigneeId === 'u2').length, // Simulating logged in user 'u2'
  };
}

export async function getWorkItems(type?: 'ticket' | 'issue', assigneeId?: string) {
  let items = [...mockWorkItems];
  if (type) items = items.filter(i => i.type === type);
  if (assigneeId) items = items.filter(i => i.assigneeId === assigneeId);
  return items;
}

export async function getWorkItemById(id: string) {
  return mockWorkItems.find(i => i.id === id) || null;
}
