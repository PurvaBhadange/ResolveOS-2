from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import SupportCase, CaseStatus, AgentEvent
from app.schemas.case import SupportCaseCreate, SupportCaseRead, SupportCaseDetail, AgentEventSchema
from app.agent import run_agent_on_case

router = APIRouter(prefix="/cases", tags=["Support Cases"])


@router.get("", response_model=List[SupportCaseRead])
def list_cases(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SupportCase).order_by(SupportCase.created_at.desc()).limit(limit).all()


@router.get("/{case_id}", response_model=SupportCaseDetail)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
    return case


@router.get("/{case_id}/events", response_model=List[AgentEventSchema])
def get_case_events(case_id: int, db: Session = Depends(get_db)):
    return db.query(AgentEvent).filter(AgentEvent.case_id == case_id).order_by(AgentEvent.timestamp.asc()).all()


@router.post("", response_model=SupportCaseRead, status_code=status.HTTP_201_CREATED)
def create_case(payload: SupportCaseCreate, db: Session = Depends(get_db)):
    case_num = f"CASE-{int(datetime.utcnow().timestamp())}"
    case = SupportCase(
        case_number=case_num,
        customer_id=payload.customer_id,
        order_id=payload.order_id,
        title=payload.title,
        description=payload.description,
        category=payload.category or "return_refund",
        case_status=CaseStatus.SUBMITTED.value,
        priority="medium"
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # Automatically run resolution agent on newly created case
    try:
        run_agent_on_case(case.id)
        db.refresh(case)
    except Exception as e:
        pass

    return case


@router.post("/{case_id}/run")
def trigger_agent_run(case_id: int, db: Session = Depends(get_db)):
    case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")

    res = run_agent_on_case(case.id)
    return {"message": "Agent execution completed", "final_state": res}
