import uuid
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.agent.state import AgentState, CandidatePlan
from app.services import (
    CustomerService, OrderService, InventoryService,
    PolicyService, ActionService, VerificationService, AuditService,
    LLMService
)
from app.models import SupportCase, CaseStatus, Approval, Escalation, UserRole


def understand_case_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        title = state.get("case_title", "")
        desc = state.get("case_description", "")

        intent_res = LLMService.understand_customer_intent(title, desc)
        goal = intent_res["goal"]
        category = intent_res.get("category", "return_refund")

        state["goal"] = goal
        state["current_step"] = "understand_case"
        state["replan_count"] = state.get("replan_count", 0)

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="GOAL",
            title="Understood Customer Intent & Goal",
            detail_json={
                "goal": goal,
                "category": category,
                "llm_powered": intent_res.get("llm_powered", False),
                "model": intent_res.get("model", "deterministic-rules"),
                "title": title,
                "description": desc
            }
        )
        return state
    finally:
        db.close()


def retrieve_context_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        cust = CustomerService.get_customer(db, state["customer_id"])
        state["customer_tier"] = cust.tier if cust else "standard"

        order_id = state.get("order_id")
        ordered_items = []
        inventory_evidence = []

        if order_id:
            order = OrderService.get_order(db, order_id)
            if order:
                state["order_status"] = order.order_status
                state["order_total"] = float(order.total_amount)
                state["payment_status"] = order.payment_status
                state["shipment_status"] = order.shipment.shipping_status if order.shipment else "unknown"

                for item in order.items:
                    variant = item.variant
                    ordered_items.append({
                        "item_id": item.id,
                        "variant_id": item.variant_id,
                        "variant_sku": variant.variant_sku if variant else "",
                        "title": variant.title if variant else "",
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price)
                    })

                    # Fetch Inventory
                    inv_info = InventoryService.get_stock_by_variant(db, item.variant_id)
                    inventory_evidence.append(inv_info)

        # Policy RAG Evidence
        rag_results = PolicyService.search_policy_chunks(db, state["case_title"] + " " + state["case_description"])
        state["ordered_items"] = ordered_items
        state["inventory_evidence"] = inventory_evidence
        state["policy_evidence"] = rag_results
        state["current_step"] = "retrieve_context"

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="EVIDENCE",
            title="Collected Real Enterprise & Policy Evidence",
            detail_json={
                "customer_tier": state["customer_tier"],
                "order_status": state.get("order_status"),
                "order_total": state.get("order_total"),
                "ordered_items": ordered_items,
                "inventory_evidence": [
                    {"variant_sku": i.get("variant_sku"), "total_available": i.get("total_available"), "in_stock": i.get("is_in_stock")}
                    for i in inventory_evidence
                ],
                "policy_chunks": [r["matched_chunk"] for r in rag_results]
            }
        )

        case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
        if case:
            case.case_status = CaseStatus.EVIDENCE_COLLECTED.value
            db.commit()

        return state
    finally:
        db.close()


def decide_resolution_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        desc = state.get("case_description", "").lower()
        candidates: List[CandidatePlan] = []
        ordered_items = state.get("ordered_items", [])
        order_total = state.get("order_total", 0.0)

        # If customer asked for replacement & items exist
        if ("replace" in desc or "damaged" in desc or "broken" in desc) and ordered_items:
            item = ordered_items[0]
            candidates.append({
                "action_type": "replace",
                "score": 0.95,
                "reason": "Customer reported damaged item; primary resolution path is physical replacement.",
                "parameters": {
                    "order_id": state["order_id"],
                    "original_variant_id": item["variant_id"],
                    "replacement_variant_id": item["variant_id"],
                    "reason": "Damaged on delivery"
                }
            })
            candidates.append({
                "action_type": "refund",
                "score": 0.80,
                "reason": "Secondary fallback option: issue full refund for damaged product.",
                "parameters": {
                    "order_id": state["order_id"],
                    "amount": order_total,
                    "reason": "Refund for damaged product"
                }
            })
        elif "cancel" in desc:
            candidates.append({
                "action_type": "cancel",
                "score": 0.90,
                "reason": "Customer requested order cancellation prior to shipment.",
                "parameters": {
                    "order_id": state["order_id"],
                    "reason": "Customer cancellation request"
                }
            })
        else:
            candidates.append({
                "action_type": "refund",
                "score": 0.85,
                "reason": "Default policy resolution: process return and refund.",
                "parameters": {
                    "order_id": state["order_id"],
                    "amount": order_total,
                    "reason": "Standard customer refund"
                }
            })

        state["candidate_plans"] = candidates
        selected = candidates[0] if candidates else None
        state["selected_plan"] = selected
        state["current_step"] = "decide_resolution"

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="DECISION",
            title="Generated & Selected Candidate Resolution Plan",
            detail_json={
                "selected_plan": selected,
                "candidate_plans": candidates
            }
        )

        case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
        if case:
            case.case_status = CaseStatus.RESOLUTION_PROPOSED.value
            db.commit()

        return state
    finally:
        db.close()


def resolution_guard_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        plan = state.get("selected_plan")
        guard_reasons = []
        passed = True
        approval_req = False

        if not plan:
            state["guard_passed"] = False
            state["guard_reasons"] = ["No resolution plan selected"]
            return state

        action_type = plan["action_type"]
        params = plan["parameters"]

        # 1. Replacement Stock Guard
        if action_type == "replace":
            rep_variant_id = params.get("replacement_variant_id")
            stock = InventoryService.get_stock_by_variant(db, rep_variant_id)
            if not stock["is_in_stock"] or stock["total_available"] <= 0:
                passed = False
                guard_reasons.append(f"INVENTORY CONSTRAINT: Variant {stock.get('variant_sku', rep_variant_id)} is OUT OF STOCK (Available: 0 across all warehouses).")

        # 2. Refund Amount Threshold Guard (Approval required if > $200)
        if action_type == "refund":
            amt = params.get("amount", 0.0)
            if amt > 200.0:
                approval_req = True
                guard_reasons.append(f"HIGH-VALUE THRESHOLD: Refund amount ₹{amt} exceeds auto-approval limit of ₹200.00.")

        # 3. Cancellation State Guard
        if action_type == "cancel":
            order_status = state.get("order_status")
            if order_status not in ["pending", "processing"]:
                passed = False
                guard_reasons.append(f"INVALID ORDER STATE: Order is '{order_status}' and cannot be cancelled.")

        state["guard_passed"] = passed
        state["guard_reasons"] = guard_reasons
        state["approval_required"] = approval_req
        state["current_step"] = "resolution_guard"

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="EVIDENCE",
            title="Evaluated Deterministic Business Rules & Safety Guard",
            detail_json={
                "guard_passed": passed,
                "approval_required": approval_req,
                "reasons": guard_reasons
            }
        )

        return state
    finally:
        db.close()


def approval_gate_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        if state.get("approval_required") and not state.get("approval_status"):
            # Create Approval Request in DB
            plan = state.get("selected_plan", {})
            reason = f"High-risk operation requiring human review: {', '.join(state.get('guard_reasons', []))}"
            appr = Approval(
                case_id=state["case_id"],
                requester_type="agent",
                required_role=UserRole.OPERATIONS.value,
                status="pending",
                reason=reason
            )
            db.add(appr)

            case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
            if case:
                case.case_status = CaseStatus.AWAITING_APPROVAL.value

            db.commit()

            state["approval_id"] = appr.id
            state["approval_status"] = "pending"
            state["final_outcome"] = "AWAITING_APPROVAL"

            AuditService.log_agent_event(
                db=db,
                case_id=state["case_id"],
                event_type="EVIDENCE",
                title="Routed Case to Human Operations Approval Queue",
                detail_json={"approval_id": appr.id, "reason": reason}
            )

        return state
    finally:
        db.close()


def execute_action_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        plan = state.get("selected_plan")
        if not plan:
            state["action_result"] = {"success": False, "error": "No plan to execute"}
            return state

        action_type = plan["action_type"]
        params = plan["parameters"]
        replan_cnt = state.get("replan_count", 0)
        idem_key = f"IDEM-{state['case_id']}-{action_type}-v{replan_cnt}"

        res = None
        if action_type == "refund":
            res = ActionService.execute_refund(
                db=db,
                case_id=state["case_id"],
                order_id=params["order_id"],
                amount=Decimal(str(params["amount"])),
                reason=params.get("reason", "Agent refund execution"),
                idempotency_key=idem_key
            )
        elif action_type == "replace":
            res = ActionService.execute_replacement(
                db=db,
                case_id=state["case_id"],
                order_id=params["order_id"],
                original_variant_id=params["original_variant_id"],
                replacement_variant_id=params["replacement_variant_id"],
                preferred_warehouse_id=params.get("preferred_warehouse_id"),
                reason=params.get("reason", "Agent replacement execution"),
                idempotency_key=idem_key
            )
        elif action_type == "cancel":
            res = ActionService.execute_cancellation(
                db=db,
                case_id=state["case_id"],
                order_id=params["order_id"],
                reason=params.get("reason", "Agent cancellation execution"),
                idempotency_key=idem_key
            )

        state["action_result"] = res
        state["current_step"] = "execute_action"

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="ACTION",
            title=f"Executed Enterprise Action ({action_type.upper()})",
            detail_json={"action_result": res}
        )

        return state
    except Exception as e:
        print("EXECUTE ACTION EXCEPTION:", str(e))
        state["action_result"] = {"success": False, "execution_status": "failed", "error": str(e)}
        return state
    finally:
        db.close()


def verify_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        plan = state.get("selected_plan")
        action_res = state.get("action_result")

        if not plan or not action_res or action_res.get("execution_status") != "verified":
            state["verification_result"] = {"verified": False, "reason": "Action execution did not return verified status"}
            return state

        action_type = plan["action_type"]
        params = plan["parameters"]
        replan_cnt = state.get("replan_count", 0)
        idem_key = f"IDEM-{state['case_id']}-{action_type}-v{replan_cnt}"

        ver_res = {"verified": False}
        if action_type == "refund":
            ver_res = VerificationService.verify_refund(db, params["order_id"], params["amount"], idem_key)
        elif action_type == "replace":
            ver_res = VerificationService.verify_replacement(db, params["order_id"], idem_key)
        elif action_type == "cancel":
            ver_res = VerificationService.verify_cancellation(db, params["order_id"])

        state["verification_result"] = ver_res
        state["current_step"] = "verify"

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="VERIFICATION",
            title="Independently Verified System State Post-Action",
            detail_json=ver_res
        )

        return state
    finally:
        db.close()


def adapt_or_replan_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        current_plan = state.get("selected_plan", {})
        replan_cnt = state.get("replan_count", 0) + 1
        state["replan_count"] = replan_cnt
        reasons = state.get("guard_reasons", [])

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="ADAPTATION",
            title="Agent Adapted Strategy & Replanned",
            detail_json={
                "previous_plan": current_plan,
                "replan_count": replan_cnt,
                "replan_trigger": reasons
            }
        )

        # ADAPTATION LOGIC:
        # If previous plan was replacement and failed stock check -> Adapt to REFUND!
        if current_plan.get("action_type") == "replace":
            adapt_reason = LLMService.explain_adaptation(
                previous_action="physical replacement",
                reason="variant is out of stock across all warehouses",
                adapted_action="full transaction refund"
            )
            adapted_plan: CandidatePlan = {
                "action_type": "refund",
                "score": 0.90,
                "reason": adapt_reason,
                "parameters": {
                    "order_id": state["order_id"],
                    "amount": state.get("order_total", 199.99),
                    "reason": adapt_reason
                }
            }
            state["selected_plan"] = adapted_plan
            state["guard_passed"] = True
            state["guard_reasons"] = []
            
            # Check if adapted refund exceeds approval threshold (₹200)
            if state.get("order_total", 0.0) > 200.0:
                state["approval_required"] = True
                state["guard_reasons"] = ["HIGH-VALUE THRESHOLD: Adapted refund exceeds ₹200 limit"]
            else:
                state["approval_required"] = False
        else:
            # Cannot adapt further -> Escalate
            state["guard_passed"] = False

        case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
        if case:
            case.case_status = CaseStatus.REPLANNING.value
            db.commit()

        return state
    finally:
        db.close()


def resolve_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        state["final_outcome"] = "RESOLVED"
        state["current_step"] = "resolve"

        case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
        if case:
            case.case_status = CaseStatus.RESOLVED.value
            db.commit()

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="OUTCOME",
            title="Case Successfully Resolved & Verified",
            detail_json={
                "outcome": "RESOLVED",
                "final_action": state.get("selected_plan"),
                "verification": state.get("verification_result")
            }
        )

        return state
    finally:
        db.close()


def escalate_node(state: AgentState) -> AgentState:
    db: Session = SessionLocal()
    try:
        state["final_outcome"] = "ESCALATED"
        reasons = state.get("guard_reasons", ["Unable to complete resolution safely"])

        esc = Escalation(
            case_id=state["case_id"],
            escalation_reason="; ".join(reasons),
            priority="high",
            status="open"
        )
        db.add(esc)

        case = db.query(SupportCase).filter(SupportCase.id == state["case_id"]).first()
        if case:
            case.case_status = CaseStatus.ESCALATED.value

        db.commit()

        AuditService.log_agent_event(
            db=db,
            case_id=state["case_id"],
            event_type="OUTCOME",
            title="Case Escalated to Human Support Queue",
            detail_json={"outcome": "ESCALATED", "escalation_id": esc.id, "reasons": reasons}
        )

        return state
    finally:
        db.close()

