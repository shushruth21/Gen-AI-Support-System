from pydantic import BaseModel
from typing import List, Optional, Literal

class User(BaseModel):
    id: str
    name: str
    email: str
    role: Literal['agent', 'admin', 'user']

class AITriageMetadata(BaseModel):
    suggestedPriority: Optional[str] = None
    suggestedSeverity: Optional[str] = None
    suggestedCategory: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    keywords: Optional[List[str]] = None
    confidenceScore: Optional[float] = None
    probableRootCause: Optional[str] = None
    impactedComponent: Optional[str] = None
    suggestedNextAction: Optional[str] = None
    duplicateOf: Optional[str] = None
    agentAssistSuggestion: Optional[str] = None
    knowledgeArticleIds: Optional[List[str]] = None

class WorkItem(BaseModel):
    id: str
    type: Literal['ticket', 'issue']
    title: str
    description: str
    status: Literal['open', 'in_progress', 'pending_approval', 'resolved', 'closed']
    priority: Literal['low', 'medium', 'high', 'urgent']
    severity: Optional[str] = None
    category: Optional[str] = None
    slaRisk: Optional[str] = None
    resolutionHours: Optional[float] = None
    escalated: Optional[bool] = None
    assigneeId: Optional[str] = None
    teamId: Optional[str] = None
    reporterId: str
    createdAt: str
    updatedAt: str
    resolvedAt: Optional[str] = None
    aiMetadata: Optional[AITriageMetadata] = None

class Approval(BaseModel):
    id: str
    workItemId: str
    approverId: str
    status: Literal['pending', 'approved', 'rejected']
    requestedAt: str
    respondedAt: Optional[str] = None
    notes: Optional[str] = None

class KnowledgeArticle(BaseModel):
    id: str
    title: str
    content: str
    authorId: str
    isPublished: bool
    tags: List[str]
    createdAt: str
    updatedAt: str

class DashboardSummary(BaseModel):
    totalTickets: int
    totalIssues: int
    pendingApprovals: int
    assignedToMe: int
