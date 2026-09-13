from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.policy import PolicyRead, PolicyVersionRead, PolicyRAGSearchResult
from app.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("/active/{code}", response_model=PolicyVersionRead)
def get_active_policy(code: str, db: Session = Depends(get_db)):
    version = PolicyService.get_active_policy(db, code)
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Active policy code '{code}' not found")
    return version


@router.get("/search", response_model=List[PolicyRAGSearchResult])
def search_policy(query: str = Query(..., description="Query terms for policy RAG evidence search"), db: Session = Depends(get_db)):
    return PolicyService.search_policy_chunks(db, query)
