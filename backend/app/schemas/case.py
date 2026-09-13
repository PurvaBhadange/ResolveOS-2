from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.customer import CustomerRead
from app.schemas.order import OrderRead


class SupportCaseCreate(BaseModel):
    customer_id: int
    order_id: Optional[int] = None
    title: str
    description: str
    category: Optional[str] = "return_refund"


class AgentEventSchema(BaseModel):
    id: int
    event_type: str
    title: str
    detail_json: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportCaseRead(BaseModel):
    id: int
    case_number: str
    customer_id: int
    order_id: Optional[int] = None
    title: str
    description: str
    category: str
    case_status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportCaseDetail(SupportCaseRead):
    customer: Optional[CustomerRead] = None
    order: Optional[OrderRead] = None
    events: List[AgentEventSchema] = []

    model_config = ConfigDict(from_attributes=True)
