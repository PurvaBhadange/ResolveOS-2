from typing import Dict, Any, List, Optional
from typing_extensions import TypedDict


class CandidatePlan(TypedDict):
    action_type: str  # refund, replace, cancel, escalate
    score: float
    reason: str
    parameters: Dict[str, Any]


class AgentState(TypedDict):
    case_id: int
    customer_id: int
    order_id: Optional[int]
    case_title: str
    case_description: str

    # Context & Evidence
    customer_tier: str
    order_status: Optional[str]
    order_total: Optional[float]
    payment_status: Optional[str]
    shipment_status: Optional[str]
    ordered_items: List[Dict[str, Any]]
    policy_evidence: List[Dict[str, Any]]
    inventory_evidence: List[Dict[str, Any]]

    # Agent Planning State
    goal: str
    candidate_plans: List[CandidatePlan]
    selected_plan: Optional[CandidatePlan]
    guard_passed: bool
    guard_reasons: List[str]

    # Approval & Execution
    approval_required: bool
    approval_id: Optional[int]
    approval_status: Optional[str]
    action_result: Optional[Dict[str, Any]]
    verification_result: Optional[Dict[str, Any]]

    # Lifecycle & Trace
    replan_count: int
    current_step: str
    final_outcome: str  # RESOLVED, ESCALATED, AWAITING_APPROVAL, FAILED
    error_message: Optional[str]
