from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class PolicyVersionRead(BaseModel):
    id: int
    version_number: str
    effective_date: datetime
    return_window_days: int
    conditions_json: Optional[Any] = None
    policy_text: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class PolicyRead(BaseModel):
    id: int
    code: str
    name: str
    category: str
    active_version: Optional[PolicyVersionRead] = None

    model_config = ConfigDict(from_attributes=True)


class PolicyRAGSearchResult(BaseModel):
    policy_code: str
    policy_name: str
    version_number: str
    effective_date: datetime
    score: float
    matched_chunk: str
