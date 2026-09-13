from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EscalationRead(BaseModel):
    id: int
    case_id: int
    escalation_reason: str
    priority: str
    status: str
    assigned_to: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
