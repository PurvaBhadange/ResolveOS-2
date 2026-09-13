from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Escalation
from app.schemas.escalation import EscalationRead

router = APIRouter(prefix="/escalations", tags=["Escalations"])


@router.get("", response_model=List[EscalationRead])
def list_escalations(db: Session = Depends(get_db)):
    return db.query(Escalation).order_by(Escalation.created_at.desc()).all()
