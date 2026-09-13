from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CustomerAddressSchema(BaseModel):
    id: int
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool

    model_config = ConfigDict(from_attributes=True)


class CustomerProfileSchema(BaseModel):
    id: int
    total_orders: int
    lifetime_value: Decimal
    fraud_score: float
    return_rate: float
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CustomerRead(BaseModel):
    id: int
    customer_number: str
    full_name: str
    email: str
    phone: Optional[str] = None
    tier: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerDetail(CustomerRead):
    addresses: List[CustomerAddressSchema] = []
    profile: Optional[CustomerProfileSchema] = None

    model_config = ConfigDict(from_attributes=True)
