# ResolveOS LangGraph Agent Architecture

The ResolveOS agent is implemented using LangGraph and Google Gemini, structured as a explicit state machine that enforces safety principles.

## LangGraph State Machine Workflow

```
[START]
   ↓
understand_case       (Parse intent & goals)
   ↓
retrieve_context      (Fetch customer, order, inventory, RAG policy evidence)
   ↓
decide_resolution     (Generate scored candidate plans)
   ↓
resolution_guard      (Validate business rules & eligibility constraints)
   ↓
approval_gate         (Check high-risk / financial thresholds for human approval)
   ↓
execute_action        (Call enterprise API with idempotency key)
   ↓
verify                (Independently query state from DB)
   ↓
 [Check Verification] ── Verified ──> resolve [END]
   │
 Failed
   ↓
 adapt_or_replan      (Evaluate secondary options e.g. stock out -> refund)
   ↓
 execute_action ...
```

## Agent Event Trace
All agent operations emit structured, user-safe events (`agent_events` table):
- `GOAL`: Target outcome requested by customer.
- `EVIDENCE`: Real system state & policy clauses retrieved.
- `DECISION`: Selected candidate resolution.
- `ACTION`: Execution parameters and target API.
- `RESULT`: Outcome returned by action execution.
- `ADAPTATION`: Replanning trigger and secondary strategy.
- `VERIFICATION`: Independent state assertion outcome.
- `OUTCOME`: Final case status (Resolved / Escalated).
