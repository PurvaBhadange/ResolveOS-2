from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.inventory import StockAvailabilityRead
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/variant/{variant_id}", response_model=StockAvailabilityRead)
def get_variant_inventory(variant_id: int, db: Session = Depends(get_db)):
    stock_info = InventoryService.get_stock_by_variant(db, variant_id)
    if stock_info["variant_id"] == 0 and not stock_info["variant_sku"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Variant {variant_id} not found")
    return stock_info
