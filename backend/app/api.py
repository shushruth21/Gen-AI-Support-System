from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app import schemas, services

api_router = APIRouter()

@api_router.get("/dashboard", response_model=schemas.DashboardSummary)
def read_dashboard_stats():
    return services.get_dashboard_summary()

@api_router.get("/work-items", response_model=List[schemas.WorkItem])
def read_work_items(
    type: Optional[str] = None,
    assigneeId: Optional[str] = None
):
    return services.get_work_items(type_filter=type, assignee_id=assigneeId)

@api_router.get("/work-items/{item_id}", response_model=schemas.WorkItem)
def read_work_item(item_id: str):
    item = services.get_work_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    return item

@api_router.get("/approvals", response_model=List[schemas.Approval])
def read_approvals():
    return services.get_approvals()

@api_router.get("/knowledge", response_model=List[schemas.KnowledgeArticle])
def read_knowledge():
    return services.get_knowledge()
