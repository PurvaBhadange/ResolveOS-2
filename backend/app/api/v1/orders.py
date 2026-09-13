from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.order import OrderRead, OrderDetail
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order {order_id} not found")
    return order


@router.get("/number/{order_number}", response_model=OrderDetail)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_number(db, order_number)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order number '{order_number}' not found")
    return order


@router.get("/customer/{customer_id}", response_model=List[OrderRead])
def get_customer_orders(customer_id: int, db: Session = Depends(get_db)):
    return OrderService.get_customer_orders(db, customer_id)
