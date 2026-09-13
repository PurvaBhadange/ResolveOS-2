from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Approval, ApprovalStatus, SupportCase, CaseStatus
from app.schemas.approval import ApprovalRead, ApprovalDecisionRequest

router = APIRouter(prefix="/approvals", tags=["Human Approvals"])


@router.get("", response_model=List[ApprovalRead])
def list_approvals(status_filter: str = "pending", db: Session = Depends(get_db)):
    query = db.query(Approval)
    if status_filter:
        query = query.filter(Approval.status == status_filter)
    return query.order_by(Approval.created_at.desc()).all()


@router.post("/{approval_id}/decision", response_model=ApprovalRead)
def submit_approval_decision(approval_id: int, payload: ApprovalDecisionRequest, db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Approval request {approval_id} not found")

    if approval.status != ApprovalStatus.PENDING.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Approval request {approval_id} is already '{approval.status}'")

    if payload.decision not in ["approved", "rejected"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be 'approved' or 'rejected'")

    approval.status = ApprovalStatus.APPROVED.value if payload.decision == "approved" else ApprovalStatus.REJECTED.value
    approval.decision_by = "operations_user"
    approval.decision_at = datetime.utcnow()

    # Update case status & trigger agent run
    case = db.query(SupportCase).filter(SupportCase.id == approval.case_id).first()
    if case:
        if payload.decision == "approved":
            case.case_status = CaseStatus.ACTION_EXECUTING.value
            db.commit()
            try:
                from app.agent import run_agent_on_case
                run_agent_on_case(case.id)
            except Exception as e:
                print("Error running agent after approval:", e)
        else:
            case.case_status = CaseStatus.ESCALATED.value
            db.commit()

    db.refresh(approval)
    return approval
