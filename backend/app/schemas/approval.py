from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ApprovalRead(BaseModel):
    id: int
    case_id: int
    action_id: Optional[int] = None
    requester_type: str
    required_role: str
    status: str
    reason: str
    decision_by: Optional[str] = None
    decision_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalDecisionRequest(BaseModel):
    decision: str  # approved or rejected
    reason: Optional[str] = None
