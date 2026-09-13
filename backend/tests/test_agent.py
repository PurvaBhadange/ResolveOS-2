from app.agent import run_agent_on_case
from app.services.verification_service import VerificationService
from app.core.database import SessionLocal


def test_primary_demo_agent_adaptation():
    """
    Primary Demo Scenario:
    Customer requested replacement for damaged headphones (ORD-2026-8801).
    Headphones variant (SKU-HD-BLK) is OUT OF STOCK (0 available across WH-EAST and WH-WEST).
    Resolution Guard fails replacement -> Agent ADAPTS plan to REFUND.
    Agent executes refund -> Verification verifies refund state independently -> Case resolved.
    """
    final_state = run_agent_on_case(1)

    print("FINAL AGENT STATE VERIFICATION RESULT:", final_state.get("verification_result"))
    assert final_state["case_id"] == 1
    assert final_state["replan_count"] > 0  # Adapted!
    assert final_state["selected_plan"]["action_type"] == "refund"  # Adapted to refund!
    assert final_state["verification_result"]["verified"] == True  # Independently verified!

    # Verify independently against DB
    db = SessionLocal()
    try:
        ver = VerificationService.verify_refund(db, 1, 199.99, "IDEM-1-refund-v1")
        assert ver["verified"] == True
    finally:
        db.close()
