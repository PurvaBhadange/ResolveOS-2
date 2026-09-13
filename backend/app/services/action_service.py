import uuid
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    Order, OrderStatus, PaymentStatus, Refund, ReplacementRequest,
    ResolutionAction, ActionType, ActionStatus, ActionAuditLog,
    Inventory, SupportCase, CaseStatus
)


class ActionService:
    @staticmethod
    def execute_refund(
        db: Session,
        case_id: int,
        order_id: int,
        amount: Decimal,
        reason: str,
        idempotency_key: str,
        actor_id: str = "agent"
    ) -> Dict[str, Any]:
        # 1. Check idempotency
        existing_refund = db.query(Refund).filter(Refund.idempotency_key == idempotency_key).first()
        if existing_refund:
            return {
                "action_id": existing_refund.id,
                "action_type": ActionType.REFUND.value,
                "execution_status": ActionStatus.VERIFIED.value,
                "idempotency_key": idempotency_key,
                "message": "Refund already executed (Idempotent replay)",
                "data": {
                    "refund_number": existing_refund.refund_number,
                    "amount": float(existing_refund.amount),
                    "order_id": order_id
                },
                "executed_at": existing_refund.created_at.isoformat()
            }

        # 2. Validate Order
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        # 3. Create Refund Record
        refund_num = f"REF-{int(datetime.utcnow().timestamp())}-{uuid.uuid4().hex[:4].upper()}"
        refund = Refund(
            order_id=order.id,
            refund_number=refund_num,
            amount=amount,
            reason=reason,
            refund_status="processed",
            idempotency_key=idempotency_key
        )
        db.add(refund)

        # 4. Update Order State
        order.payment_status = PaymentStatus.REFUNDED.value
        order.order_status = OrderStatus.RETURNED.value
        order.updated_at = datetime.utcnow()

        # 5. Record Resolution Action
        res_action = ResolutionAction(
            case_id=case_id,
            action_type=ActionType.REFUND.value,
            parameters_json={"order_id": order_id, "amount": float(amount), "reason": reason},
            execution_status=ActionStatus.VERIFIED.value,
            idempotency_key=idempotency_key
        )
        db.add(res_action)
        db.flush()

        # 6. Audit Log
        audit = ActionAuditLog(
            action_id=res_action.id,
            case_id=case_id,
            actor_type="agent",
            actor_id=actor_id,
            event_name="EXECUTE_REFUND",
            payload_json={"refund_number": refund_num, "amount": float(amount), "idempotency_key": idempotency_key}
        )
        db.add(audit)

        # 7. Update Case Status
        case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
        if case:
            case.case_status = CaseStatus.ACTION_EXECUTING.value

        db.commit()

        return {
            "action_id": res_action.id,
            "action_type": ActionType.REFUND.value,
            "execution_status": ActionStatus.VERIFIED.value,
            "idempotency_key": idempotency_key,
            "message": f"Successfully processed refund of ₹{amount} for Order {order.order_number}",
            "data": {
                "refund_number": refund_num,
                "amount": float(amount),
                "order_number": order.order_number
            },
            "executed_at": datetime.utcnow().isoformat()
        }

    @staticmethod
    def execute_replacement(
        db: Session,
        case_id: int,
        order_id: int,
        original_variant_id: int,
        replacement_variant_id: int,
        preferred_warehouse_id: Optional[int],
        reason: str,
        idempotency_key: str,
        actor_id: str = "agent"
    ) -> Dict[str, Any]:
        # 1. Idempotency Check
        existing_rep = db.query(ReplacementRequest).filter(ReplacementRequest.idempotency_key == idempotency_key).first()
        if existing_rep:
            return {
                "action_id": existing_rep.id,
                "action_type": ActionType.REPLACE.value,
                "execution_status": ActionStatus.VERIFIED.value,
                "idempotency_key": idempotency_key,
                "message": "Replacement already created (Idempotent replay)",
                "data": {"replacement_id": existing_rep.id},
                "executed_at": existing_rep.created_at.isoformat()
            }

        # 2. Check Inventory Availability
        inv_query = db.query(Inventory).filter(
            Inventory.variant_id == replacement_variant_id,
            Inventory.available_stock > 0
        )
        if preferred_warehouse_id:
            inv_query = inv_query.filter(Inventory.warehouse_id == preferred_warehouse_id)

        inv = inv_query.first()
        if not inv or inv.available_stock <= 0:
            raise ValueError(f"Inventory constraint: Replacement variant {replacement_variant_id} is out of stock in all available warehouses!")

        # 3. Deduct Inventory & Reserve
        inv.available_stock -= 1
        inv.reserved_stock += 1

        # 4. Create Replacement Request Record
        rep = ReplacementRequest(
            order_id=order_id,
            original_variant_id=original_variant_id,
            replacement_variant_id=replacement_variant_id,
            warehouse_id=inv.warehouse_id,
            replacement_status="allocated",
            idempotency_key=idempotency_key
        )
        db.add(rep)

        # 5. Record Action & Audit Log
        res_action = ResolutionAction(
            case_id=case_id,
            action_type=ActionType.REPLACE.value,
            parameters_json={"order_id": order_id, "replacement_variant_id": replacement_variant_id, "warehouse_id": inv.warehouse_id},
            execution_status=ActionStatus.VERIFIED.value,
            idempotency_key=idempotency_key
        )
        db.add(res_action)
        db.flush()

        audit = ActionAuditLog(
            action_id=res_action.id,
            case_id=case_id,
            actor_type="agent",
            actor_id=actor_id,
            event_name="EXECUTE_REPLACEMENT",
            payload_json={"replacement_id": rep.id, "warehouse_id": inv.warehouse_id}
        )
        db.add(audit)

        case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
        if case:
            case.case_status = CaseStatus.ACTION_EXECUTING.value

        db.commit()

        return {
            "action_id": res_action.id,
            "action_type": ActionType.REPLACE.value,
            "execution_status": ActionStatus.VERIFIED.value,
            "idempotency_key": idempotency_key,
            "message": f"Successfully allocated replacement unit from Warehouse {inv.warehouse.code}",
            "data": {"replacement_id": rep.id, "warehouse_code": inv.warehouse.code},
            "executed_at": datetime.utcnow().isoformat()
        }

    @staticmethod
    def execute_cancellation(
        db: Session,
        case_id: int,
        order_id: int,
        reason: str,
        idempotency_key: str,
        actor_id: str = "agent"
    ) -> Dict[str, Any]:
        # 1. Idempotency Check
        existing_action = db.query(ResolutionAction).filter(ResolutionAction.idempotency_key == idempotency_key).first()
        if existing_action:
            return {
                "action_id": existing_action.id,
                "action_type": ActionType.CANCEL.value,
                "execution_status": ActionStatus.VERIFIED.value,
                "idempotency_key": idempotency_key,
                "message": "Cancellation already executed (Idempotent replay)",
                "data": {"order_id": order_id},
                "executed_at": existing_action.executed_at.isoformat() if hasattr(existing_action.executed_at, 'isoformat') else str(existing_action.executed_at)
            }

        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        if order.order_status not in [OrderStatus.PENDING.value, OrderStatus.PROCESSING.value]:
            raise ValueError(f"Order {order.order_number} cannot be cancelled because its status is '{order.order_status}'")

        order.order_status = OrderStatus.CANCELLED.value
        order.payment_status = PaymentStatus.REFUNDED.value
        order.updated_at = datetime.utcnow()

        res_action = ResolutionAction(
            case_id=case_id,
            action_type=ActionType.CANCEL.value,
            parameters_json={"order_id": order_id, "reason": reason},
            execution_status=ActionStatus.VERIFIED.value,
            idempotency_key=idempotency_key
        )
        db.add(res_action)
        db.flush()

        audit = ActionAuditLog(
            action_id=res_action.id,
            case_id=case_id,
            actor_type="agent",
            actor_id=actor_id,
            event_name="EXECUTE_CANCELLATION",
            payload_json={"order_id": order_id, "reason": reason}
        )
        db.add(audit)

        case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
        if case:
            case.case_status = CaseStatus.ACTION_EXECUTING.value

        db.commit()

        return {
            "action_id": res_action.id,
            "action_type": ActionType.CANCEL.value,
            "execution_status": ActionStatus.VERIFIED.value,
            "idempotency_key": idempotency_key,
            "message": f"Successfully cancelled Order {order.order_number}",
            "data": {"order_number": order.order_number},
            "executed_at": datetime.utcnow().isoformat()
        }

