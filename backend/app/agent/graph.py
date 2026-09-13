from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.nodes import (
    understand_case_node,
    retrieve_context_node,
    decide_resolution_node,
    resolution_guard_node,
    approval_gate_node,
    execute_action_node,
    verify_node,
    adapt_or_replan_node,
    resolve_node,
    escalate_node
)


def route_guard(state: AgentState) -> str:
    if not state.get("guard_passed", False):
        if state.get("replan_count", 0) < 2:
            return "adapt_or_replan"
        return "escalate"

    if state.get("approval_required", False) and state.get("approval_status") != "approved":
        return "approval_gate"

    return "execute_action"


def route_verify(state: AgentState) -> str:
    ver = state.get("verification_result", {})
    if ver.get("verified", False):
        return "resolve"

    if state.get("replan_count", 0) < 2:
        return "adapt_or_replan"

    return "escalate"


def build_resolution_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("understand_case", understand_case_node)
    workflow.add_node("retrieve_context", retrieve_context_node)
    workflow.add_node("decide_resolution", decide_resolution_node)
    workflow.add_node("resolution_guard", resolution_guard_node)
    workflow.add_node("approval_gate", approval_gate_node)
    workflow.add_node("execute_action", execute_action_node)
    workflow.add_node("verify", verify_node)
    workflow.add_node("adapt_or_replan", adapt_or_replan_node)
    workflow.add_node("resolve", resolve_node)
    workflow.add_node("escalate", escalate_node)

    # Set Entry Point
    workflow.set_entry_point("understand_case")

    # Wire Standard Edges
    workflow.add_edge("understand_case", "retrieve_context")
    workflow.add_edge("retrieve_context", "decide_resolution")
    workflow.add_edge("decide_resolution", "resolution_guard")

    # Conditional Edges from Guard
    workflow.add_conditional_edges(
        "resolution_guard",
        route_guard,
        {
            "adapt_or_replan": "adapt_or_replan",
            "escalate": "escalate",
            "approval_gate": "approval_gate",
            "execute_action": "execute_action"
        }
    )

    # Edge from Approval Gate to END (pauses execution)
    workflow.add_edge("approval_gate", END)

    # Execution to Verification
    workflow.add_edge("execute_action", "verify")

    # Conditional Edges from Verification
    workflow.add_conditional_edges(
        "verify",
        route_verify,
        {
            "resolve": "resolve",
            "adapt_or_replan": "adapt_or_replan",
            "escalate": "escalate"
        }
    )

    # Edge from Adapt to Resolution Guard (Loop)
    workflow.add_edge("adapt_or_replan", "resolution_guard")

    # Terminal Nodes
    workflow.add_edge("resolve", END)
    workflow.add_edge("escalate", END)

    return workflow.compile()


resolution_agent_graph = build_resolution_graph()
