from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.action import RefundRequest, ReplacementRequestSchema, CancellationRequest, ActionResponse
from app.services.action_service import ActionService

router = APIRouter(prefix="/actions", tags=["Enterprise Actions"])


@router.post("/refund", response_model=ActionResponse)
def execute_refund(req: RefundRequest, db: Session = Depends(get_db)):
    try:
        res = ActionService.execute_refund(
            db=db,
            case_id=req.case_id,
            order_id=req.order_id,
            amount=req.amount,
            reason=req.reason,
            idempotency_key=req.idempotency_key
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/replace", response_model=ActionResponse)
def execute_replacement(req: ReplacementRequestSchema, db: Session = Depends(get_db)):
    try:
        res = ActionService.execute_replacement(
            db=db,
            case_id=req.case_id,
            order_id=req.order_id,
            original_variant_id=req.original_variant_id,
            replacement_variant_id=req.replacement_variant_id,
            preferred_warehouse_id=req.preferred_warehouse_id,
            reason=req.reason,
            idempotency_key=req.idempotency_key
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/cancel", response_model=ActionResponse)
def execute_cancellation(req: CancellationRequest, db: Session = Depends(get_db)):
    try:
        res = ActionService.execute_cancellation(
            db=db,
            case_id=req.case_id,
            order_id=req.order_id,
            reason=req.reason,
            idempotency_key=req.idempotency_key
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
