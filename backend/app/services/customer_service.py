from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Customer, CustomerAddress, CustomerProfile


class CustomerService:
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def get_customer_by_number(db: Session, customer_number: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.customer_number == customer_number).first()

    @staticmethod
    def list_customers(db: Session, limit: int = 50) -> List[Customer]:
        return db.query(Customer).order_by(Customer.created_at.desc()).limit(limit).all()
