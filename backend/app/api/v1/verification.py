from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.get("/refund")
def verify_refund(order_id: int, expected_amount: float, idempotency_key: str, db: Session = Depends(get_db)):
    return VerificationService.verify_refund(db, order_id, expected_amount, idempotency_key)


@router.get("/replacement")
def verify_replacement(order_id: int, idempotency_key: str, db: Session = Depends(get_db)):
    return VerificationService.verify_replacement(db, order_id, idempotency_key)


@router.get("/cancellation")
def verify_cancellation(order_id: int, db: Session = Depends(get_db)):
    return VerificationService.verify_cancellation(db, order_id)
