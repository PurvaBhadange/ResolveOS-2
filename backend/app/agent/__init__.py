import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import SupportCase, AgentRun, Approval
from app.agent.state import AgentState
from app.agent.graph import resolution_agent_graph


def run_agent_on_case(case_id: int) -> Dict[str, Any]:
    db: Session = SessionLocal()
    try:
        case = db.query(SupportCase).filter(SupportCase.id == case_id).first()
        if not case:
            raise ValueError(f"Support Case {case_id} not found")

        run_id = f"RUN-{uuid.uuid4().hex[:8]}"

        agent_run = AgentRun(
            case_id=case.id,
            graph_run_id=run_id,
            current_node="understand_case",
            status="running"
        )
        db.add(agent_run)
        db.commit()

        # Check existing approval status from DB
        appr_rec = db.query(Approval).filter(Approval.case_id == case.id).order_by(Approval.created_at.desc()).first()
        appr_status = appr_rec.status if appr_rec else None
        appr_id = appr_rec.id if appr_rec else None

        initial_state: AgentState = {
            "case_id": case.id,
            "customer_id": case.customer_id,
            "order_id": case.order_id,
            "case_title": case.title,
            "case_description": case.description,
            "customer_tier": "standard",
            "order_status": None,
            "order_total": None,
            "payment_status": None,
            "shipment_status": None,
            "ordered_items": [],
            "policy_evidence": [],
            "inventory_evidence": [],
            "goal": "",
            "candidate_plans": [],
            "selected_plan": None,
            "guard_passed": False,
            "guard_reasons": [],
            "approval_required": True if appr_status == "approved" else False,
            "approval_id": appr_id,
            "approval_status": appr_status,
            "action_result": None,
            "verification_result": None,
            "replan_count": 0,
            "current_step": "start",
            "final_outcome": "RUNNING",
            "error_message": None
        }

        final_state = resolution_agent_graph.invoke(initial_state)

        agent_run.status = final_state.get("final_outcome", "COMPLETED")
        agent_run.current_node = final_state.get("current_step", "end")
        db.commit()

        return final_state
    finally:
        db.close()
