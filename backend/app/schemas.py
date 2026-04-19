from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class User(BaseModel):
    id: str
    name: str
    email: str
    role: Literal['agent', 'admin', 'user']

class AITriageMetadata(BaseModel):
    suggestedPriority: Optional[str] = None
    suggestedSeverity: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    confidenceScore: Optional[float] = None

class WorkItem(BaseModel):
    id: str
    type: Literal['ticket', 'issue']
    title: str
    description: str
    status: Literal['open', 'in_progress', 'pending_approval', 'resolved', 'closed']
    priority: Literal['low', 'medium', 'high', 'urgent']
    severity: Optional[str] = None
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
