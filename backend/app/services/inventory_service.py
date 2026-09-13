from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.models import Inventory, Warehouse, ProductVariant


class InventoryService:
    @staticmethod
    def get_stock_by_variant(db: Session, variant_id: int) -> Dict:
        variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
        if not variant:
            return {"variant_id": 0, "variant_sku": "", "is_in_stock": False, "total_available": 0, "warehouse_breakdown": []}

        inventories = db.query(Inventory).filter(Inventory.variant_id == variant_id).all()
        total_available = sum(inv.available_stock for inv in inventories)

        return {
            "variant_id": variant.id,
            "variant_sku": variant.variant_sku,
            "total_available": total_available,
            "is_in_stock": total_available > 0,
            "warehouse_breakdown": inventories
        }

    @staticmethod
    def find_available_warehouse(db: Session, variant_id: int, min_qty: int = 1) -> Optional[Warehouse]:
        inv = db.query(Inventory).filter(
            Inventory.variant_id == variant_id,
            Inventory.available_stock >= min_qty
        ).first()
        return inv.warehouse if inv else None
