import uuid
import pytest
from decimal import Decimal
from app.agent import run_agent_on_case
from app.services.verification_service import VerificationService
from app.core.database import SessionLocal
from app.models import SupportCase, CaseStatus, Order, OrderStatus, ProductVariant, Inventory, Customer


def test_scenario_1_in_stock_replacement():
    """
    Scenario 1: Damaged item with replacement in stock -> Physical replacement + Independent verification.
    """
    db = SessionLocal()
    try:
        # Find or create an order with in-stock variant (SKU-HD-SLV)
        var = db.query(ProductVariant).filter(ProductVariant.variant_sku == "SKU-HD-SLV").first()
        order = db.query(Order).filter(Order.order_number == "ORD-2026-8805").first()
        if not order:
            cust = db.query(Customer).first()
            order = Order(
                order_number="ORD-2026-8805", customer_id=cust.id,
                total_amount=Decimal("199.99"), order_status=OrderStatus.DELIVERED.value
            )
            db.add(order)
            db.commit()

        # Unique case number for idempotent re-runs
        unique_case_num = f"TEST-CASE-REPLACE-{uuid.uuid4().hex[:8]}"
        case = SupportCase(
            case_number=unique_case_num,
            customer_id=order.customer_id,
            order_id=order.id,
            title="Headphones damaged on delivery - Request replacement",
            description="AuraSound headphones arrived with cracked headband. Please replace.",
            category="damaged",
            case_status=CaseStatus.SUBMITTED.value
        )
        db.add(case)
        db.commit()

        final_state = run_agent_on_case(case.id)
        assert final_state["case_id"] == case.id
        # Plan was replacement
        assert final_state["selected_plan"]["action_type"] == "replace"
        assert final_state["action_result"]["execution_status"] == "verified"
        # Independently verified in database
        assert final_state["verification_result"]["verified"] is True
        assert final_state["final_outcome"] == "RESOLVED"
    finally:
        db.close()


def test_scenario_2_stockout_autonomous_adaptation():
    """
    Scenario 2: Damaged product -> Replacement OUT OF STOCK -> Autonomously replans to refund + verifies.
    """
    db = SessionLocal()
    try:
        # ORD-2026-8801 has item with SKU-HD-BLK (0 inventory across all warehouses)
        order1 = db.query(Order).filter(Order.order_number == "ORD-2026-8801").first()
        assert order1 is not None

        unique_case_num = f"TEST-CASE-ADAPT-{uuid.uuid4().hex[:8]}"
        case = SupportCase(
            case_number=unique_case_num,
            customer_id=order1.customer_id,
            order_id=order1.id,
            title="Headphones defective - Request replacement",
            description="AuraSound headphones left ear cup dead. Please send a replacement.",
            category="damaged",
            case_status=CaseStatus.SUBMITTED.value
        )
        db.add(case)
        db.commit()

        final_state = run_agent_on_case(case.id)
        assert final_state["case_id"] == case.id
        # Verified autonomous replanning occurred
        assert final_state["replan_count"] > 0
        # Strategy pivoted from replacement to refund due to stockout
        assert final_state["selected_plan"]["action_type"] == "refund"
        # Independently verified against ledger
        assert final_state["verification_result"]["verified"] is True
        assert final_state["final_outcome"] == "RESOLVED"
    finally:
        db.close()


def test_scenario_3_high_value_approval_gate():
    """
    Scenario 3: High-value $499.98 claim exceeds $200 threshold -> Routes to Human Approval Queue.
    """
    db = SessionLocal()
    try:
        order2 = db.query(Order).filter(Order.order_number == "ORD-2026-8802").first()
        assert order2 is not None

        unique_case_num = f"TEST-CASE-HIGHVAL-{uuid.uuid4().hex[:8]}"
        case = SupportCase(
            case_number=unique_case_num,
            customer_id=order2.customer_id,
            order_id=order2.id,
            title="Defective Smartwatch Bundle ($499.98)",
            description="Defective screen. Requesting full refund.",
            category="damaged",
            case_status=CaseStatus.SUBMITTED.value
        )
        db.add(case)
        db.commit()

        final_state = run_agent_on_case(case.id)
        # Approval gate triggered
        assert final_state["approval_required"] is True
        assert final_state["final_outcome"] == "AWAITING_APPROVAL"
        assert final_state["approval_id"] is not None
    finally:
        db.close()


def test_scenario_4_order_cancellation():
    """
    Scenario 4: Pre-shipment cancellation on processing order -> Cancels order and issues refund.
    """
    db = SessionLocal()
    try:
        order4 = db.query(Order).filter(Order.order_number == "ORD-2026-8804").first()
        assert order4 is not None

        unique_case_num = f"TEST-CASE-CANCEL-{uuid.uuid4().hex[:8]}"
        case = SupportCase(
            case_number=unique_case_num,
            customer_id=order4.customer_id,
            order_id=order4.id,
            title="Cancel order before shipment",
            description="Please cancel order ORD-2026-8804 before shipment and issue refund.",
            category="cancellation",
            case_status=CaseStatus.SUBMITTED.value
        )
        db.add(case)
        db.commit()

        final_state = run_agent_on_case(case.id)
        assert final_state["selected_plan"]["action_type"] == "cancel"
        assert final_state["action_result"]["execution_status"] == "verified"
        assert final_state["verification_result"]["verified"] is True
        assert final_state["final_outcome"] == "RESOLVED"
    finally:
        db.close()
