from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Order, OrderItem, Shipment, Payment


class OrderService:
    @staticmethod
    def get_order(db: Session, order_id: int) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_order_by_number(db: Session, order_number: str) -> Optional[Order]:
        return db.query(Order).filter(Order.order_number == order_number).first()

    @staticmethod
    def get_customer_orders(db: Session, customer_id: int) -> List[Order]:
        return db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).all()
