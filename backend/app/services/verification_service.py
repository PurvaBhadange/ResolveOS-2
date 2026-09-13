from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Order, OrderStatus, PaymentStatus, Refund, ReplacementRequest


class VerificationService:
    @staticmethod
    def verify_refund(db: Session, order_id: int, expected_amount: float, idempotency_key: str) -> Dict[str, Any]:
        refund = db.query(Refund).filter(
            Refund.order_id == order_id,
            Refund.idempotency_key == idempotency_key
        ).first()

        if not refund:
            return {
                "verified": False,
                "reason": f"No refund record found matching idempotency key {idempotency_key}",
                "order_id": order_id
            }

        order = db.query(Order).filter(Order.id == order_id).first()
        if not order or order.payment_status not in [PaymentStatus.REFUNDED.value, PaymentStatus.PARTIALLY_REFUNDED.value]:
            return {
                "verified": False,
                "reason": f"Order payment status '{order.payment_status if order else 'None'}' does not reflect REFUNDED status",
                "order_id": order_id
            }

        if float(refund.amount) != float(expected_amount):
            return {
                "verified": False,
                "reason": f"Refund amount mismatch: Expected {expected_amount}, Found {refund.amount}",
                "order_id": order_id
            }

        return {
            "verified": True,
            "message": f"Refund verified independently: ${refund.amount} refunded on Order {order.order_number}",
            "refund_number": refund.refund_number,
            "order_number": order.order_number
        }

    @staticmethod
    def verify_replacement(db: Session, order_id: int, idempotency_key: str) -> Dict[str, Any]:
        rep = db.query(ReplacementRequest).filter(
            ReplacementRequest.order_id == order_id,
            ReplacementRequest.idempotency_key == idempotency_key
        ).first()

        if not rep:
            return {
                "verified": False,
                "reason": f"No replacement request found matching idempotency key {idempotency_key}",
                "order_id": order_id
            }

        return {
            "verified": True,
            "message": f"Replacement verified: Item allocated from Warehouse {rep.warehouse_id}",
            "replacement_id": rep.id,
            "replacement_status": rep.replacement_status
        }

    @staticmethod
    def verify_cancellation(db: Session, order_id: int) -> Dict[str, Any]:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order or order.order_status != OrderStatus.CANCELLED.value:
            return {
                "verified": False,
                "reason": f"Order status '{order.order_status if order else 'None'}' is not CANCELLED",
                "order_id": order_id
            }

        return {
            "verified": True,
            "message": f"Order {order.order_number} cancellation verified independently",
            "order_number": order.order_number
        }
