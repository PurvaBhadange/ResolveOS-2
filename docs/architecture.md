# ResolveOS Architecture Overview

ResolveOS is an autonomous customer resolution platform designed around a safe, verifiable, and adaptive agentic execution engine.

## Core Architectural Loop

$$\text{UNDERSTAND} \longrightarrow \text{EVIDENCE} \longrightarrow \text{DECIDE} \longrightarrow \text{GUARD / APPROVAL} \longrightarrow \text{ACT} \longrightarrow \text{VERIFY} \longrightarrow \text{ADAPT / ESCALATE}$$

### System Layers

1. **Frontend UI (Next.js 14, TypeScript, Custom Design System)**:
   - **Customer Help Portal**: Issue filing, real-time case status tracking, order lookup, and clear timeline visualization.
   - **Operations & Judge Dashboard**: Live metrics, human approval queue, escalation management, inventory/policy views, and full structured Agent Trace Inspector.

2. **Enterprise API & Services (FastAPI, Python, SQLAlchemy, PostgreSQL)**:
   - Restful API routers for Customer, Order, Inventory, Policy, Refund, Replacement, Cancellation, Verification, and Audit services.
   - Deterministic backend rule enforcement and transactional database persistence.

3. **LangGraph Agent Engine**:
   - Directed state graph managing case lifecycle transitions.
   - Google Gemini integration for structured intent parsing and candidate plan generation.
   - Policy RAG for evidence-based decision making.

4. **Safety & Verification Engine**:
   - Deterministic Resolution Guard evaluating policy windows, inventory levels, and financial thresholds.
   - Idempotent action execution.
   - Independent post-action state verification.
   - Adaptive replanning engine when constraints block primary resolution.
