import { WorkItem, Approval, KnowledgeArticle } from "@/types";

// In Phase 1, we still fall back to mock data if the API base URL is not provided.
// In Phase 3, we force resolution to the FastAPI backend.
import { getWorkItems as getMockWorkItems, getWorkItemById as getMockWorkItemById, getDashboardStats as getMockDashboardStats, mockApprovals, mockKnowledge } from "../mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function getDashboardStats() {
    if (!API_BASE_URL) return getMockDashboardStats();

    const res = await fetch(`${API_BASE_URL}/api/v1/dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch dashboard stats');
    return res.json();
}

export async function getWorkItems(type?: 'ticket' | 'issue', assigneeId?: string): Promise<WorkItem[]> {
    if (!API_BASE_URL) return getMockWorkItems(type, assigneeId);

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (assigneeId) params.append('assigneeId', assigneeId);

    const res = await fetch(`${API_BASE_URL}/api/v1/work-items?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch work items');
    return res.json();
}

export async function getWorkItemById(id: string): Promise<WorkItem | null> {
    if (!API_BASE_URL) return getMockWorkItemById(id);

    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch work item detail');
    return res.json();
}

export async function getApprovals(): Promise<Approval[]> {
    if (!API_BASE_URL) return mockApprovals;

    const res = await fetch(`${API_BASE_URL}/api/v1/approvals`, { cache: 'no-store' });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch approvals');
    return res.json();
}

export async function getKnowledge(): Promise<KnowledgeArticle[]> {
    if (!API_BASE_URL) return mockKnowledge;

    const res = await fetch(`${API_BASE_URL}/api/v1/knowledge`, { cache: 'no-store' });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch knowledge base');
    return res.json();
}
