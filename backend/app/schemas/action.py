from datetime import datetime
from decimal import Decimal
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class RefundRequest(BaseModel):
    case_id: int
    order_id: int
    amount: Decimal
    reason: str
    idempotency_key: str


class ReplacementRequestSchema(BaseModel):
    case_id: int
    order_id: int
    original_variant_id: int
    replacement_variant_id: int
    preferred_warehouse_id: Optional[int] = None
    reason: str
    idempotency_key: str


class CancellationRequest(BaseModel):
    case_id: int
    order_id: int
    reason: str
    idempotency_key: str


class ActionResponse(BaseModel):
    action_id: int
    action_type: str
    execution_status: str
    idempotency_key: str
    message: str
    data: Optional[Dict[str, Any]] = None
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)
