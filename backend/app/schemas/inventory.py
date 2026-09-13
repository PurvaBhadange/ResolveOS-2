from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class WarehouseSchema(BaseModel):
    id: int
    code: str
    name: str
    location: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class InventoryRead(BaseModel):
    id: int
    warehouse_id: int
    variant_id: int
    available_stock: int
    reserved_stock: int
    total_stock: int
    updated_at: datetime
    warehouse: Optional[WarehouseSchema] = None

    model_config = ConfigDict(from_attributes=True)


class StockAvailabilityRead(BaseModel):
    variant_id: int
    variant_sku: str
    total_available: int
    is_in_stock: bool
    warehouse_breakdown: List[InventoryRead] = []
