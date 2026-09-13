import sys
import os
import uuid
import json
import functools
from decimal import Decimal

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure unbuffered prints
print = functools.partial(print, flush=True)

from app.core.database import SessionLocal
from app.models import SupportCase, CaseStatus, Order, OrderStatus, ProductVariant, Customer
from app.agent import run_agent_on_case


def print_step_banner(title: str):
    print("\n" + "=" * 76)
    print(f"  {title}")
    print("=" * 76)


def run_scenario(scenario_num: int, title: str, case_data: dict):
    print_step_banner(f"SCENARIO {scenario_num}: {title.upper()}")
    db = SessionLocal()
    try:
        # Create a support case in DB
        case_num = f"DEMO-CASE-{scenario_num}-{uuid.uuid4().hex[:6].upper()}"
        case = SupportCase(
            case_number=case_num,
            customer_id=case_data["customer_id"],
            order_id=case_data["order_id"],
            title=case_data["title"],
            description=case_data["description"],
            category=case_data["category"],
            case_status=CaseStatus.SUBMITTED.value
        )
        db.add(case)
        db.commit()

        print(f"\n[1. INTAKE] Customer Statement:")
        print(f"    Case Number : {case.case_number}")
        print(f"    Subject     : {case.title}")
        print(f"    Statement   : \"{case.description}\"")
        print(f"    Order ID    : #{case.order_id}")

        print("\n[2. AGENT EXECUTION] Triggering Autonomous LangGraph Pipeline...")
        final_state = run_agent_on_case(case.id)

        print("\n[3. WORKFLOW TRACE DETAILS]")
        print(f"    - Understood Goal  : {final_state.get('goal')}")
        print(f"    - Customer Tier    : {final_state.get('customer_tier')}")
        print(f"    - Order Total      : INR {final_state.get('order_total')}")
        print(f"    - Inventory Checked: {len(final_state.get('inventory_evidence', []))} variant(s) queried")
        for inv in final_state.get("inventory_evidence", []):
            print(f"       -> Variant {inv.get('variant_sku')}: in_stock={inv.get('is_in_stock')}, available={inv.get('total_available')}")

        print(f"    - Policy Chunks    : {len(final_state.get('policy_evidence', []))} chunks retrieved via RAG")

        selected = final_state.get("selected_plan", {})
        print(f"\n[4. DECISION & PLAN]")
        print(f"    - Selected Action  : {selected.get('action_type', 'none').upper()}")
        print(f"    - Plan Rationale   : {selected.get('reason')}")
        print(f"    - Parameters       : {json.dumps(selected.get('parameters', {}))}")

        if final_state.get("replan_count", 0) > 0:
            print(f"\n[!] AUTONOMOUS ADAPTATION DETECTED:")
            print(f"    - Replan Count     : {final_state.get('replan_count')}")
            print(f"    - Guard Warning    : {final_state.get('guard_reasons')}")
            print(f"    - Adapted Strategy : Switched to {selected.get('action_type').upper()}")

        print(f"\n[5. EXECUTION & VERIFICATION]")
        action_res = final_state.get("action_result")
        if action_res:
            print(f"    - Action Executed  : {action_res.get('action_type', '').upper()} (ID: #{action_res.get('action_id')})")
            print(f"    - Idempotency Key  : {action_res.get('idempotency_key')}")
            print(f"    - Status           : {action_res.get('execution_status')}")

        ver_res = final_state.get("verification_result")
        if ver_res:
            print(f"    - Independent DB Verification: {'VERIFIED [OK]' if ver_res.get('verified') else 'FAILED'}")
            print(f"    - Verification Audit Trail   : {json.dumps(ver_res)}")

        print(f"\n[6. FINAL STATUS]")
        print(f"    - Outcome: {final_state.get('final_outcome')}")
        if final_state.get("approval_required"):
            print(f"    - Gated to Human Operations Queue (Approval ID: #{final_state.get('approval_id')})")

        return final_state
    finally:
        db.close()


def main():
    print("*" * 76)
    print("   RESOLVE OS - AUTONOMOUS CUSTOMER RESOLUTION AGENT DEMO")
    print("   Executing Real Actions Across Simulated Enterprise Systems")
    print("*" * 76)

    db = SessionLocal()
    order1 = db.query(Order).filter(Order.order_number == "ORD-2026-8801").first()
    order2 = db.query(Order).filter(Order.order_number == "ORD-2026-8802").first()
    order4 = db.query(Order).filter(Order.order_number == "ORD-2026-8804").first()
    order5 = db.query(Order).filter(Order.order_number == "ORD-2026-8805").first()
    if not order5:
        cust = db.query(Customer).first()
        order5 = Order(
            order_number="ORD-2026-8805", customer_id=cust.id,
            total_amount=Decimal("199.99"), order_status=OrderStatus.DELIVERED.value
        )
        db.add(order5)
        db.commit()
    db.close()

    # Scenario 1: In-Stock Replacement
    run_scenario(
        scenario_num=1,
        title="In-Stock Replacement & Ledger Verification",
        case_data={
            "customer_id": order5.customer_id,
            "order_id": order5.id,
            "title": "AuraSound Headphones Damaged on Arrival - Request Replacement",
            "description": "Headphones headband arrived cracked. Requesting a direct physical replacement.",
            "category": "damaged"
        }
    )

    # Scenario 2: Out-of-Stock Autonomous Adaptation
    run_scenario(
        scenario_num=2,
        title="Stockout Fallback Guard -> Autonomous Adaptation to Refund",
        case_data={
            "customer_id": order1.customer_id,
            "order_id": order1.id,
            "title": "AuraSound Headphones Defective - Request Replacement",
            "description": "Left ear cup defective with no audio. Please send replacement unit.",
            "category": "damaged"
        }
    )

    # Scenario 3: High-Value Gate (> ₹200 limit)
    run_scenario(
        scenario_num=3,
        title="High-Value Transaction Gate -> Human Supervisory Queue",
        case_data={
            "customer_id": order2.customer_id,
            "order_id": order2.id,
            "title": "Defective Apex Smartwatch Bundle (₹499.98)",
            "description": "Smartwatch touchscreen completely unresponsive. Requesting full refund.",
            "category": "damaged"
        }
    )

    # Scenario 4: Pre-Shipment Cancellation
    run_scenario(
        scenario_num=4,
        title="Pre-Shipment Order Cancellation & Void Shipment",
        case_data={
            "customer_id": order4.customer_id,
            "order_id": order4.id,
            "title": "Cancel ErgoMech Keyboard Order Before Dispatch",
            "description": "Please cancel order ORD-2026-8804 prior to shipment and issue refund.",
            "category": "cancellation"
        }
    )

    print("\n" + "=" * 76)
    print("  ALL AUTONOMOUS AGENT DEMO SCENARIOS EXECUTED SUCCESSFULLY")
    print("=" * 76)


if __name__ == "__main__":
    main()
