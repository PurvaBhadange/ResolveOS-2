from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ProductVariantSchema(BaseModel):
    id: int
    variant_sku: str
    title: str
    color: Optional[str] = None
    size: Optional[str] = None
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderItemSchema(BaseModel):
    id: int
    variant_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    item_status: str
    variant: Optional[ProductVariantSchema] = None

    model_config = ConfigDict(from_attributes=True)


class ShipmentSchema(BaseModel):
    id: int
    tracking_number: str
    carrier: str
    shipping_status: str
    estimated_delivery: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentSchema(BaseModel):
    id: int
    transaction_id: str
    payment_method: str
    amount: Decimal
    payment_status: str

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    order_number: str
    customer_id: int
    total_amount: Decimal
    currency: str
    order_status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDetail(OrderRead):
    items: List[OrderItemSchema] = []
    shipment: Optional[ShipmentSchema] = None
    payment: Optional[PaymentSchema] = None

    model_config = ConfigDict(from_attributes=True)
