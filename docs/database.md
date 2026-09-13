# ResolveOS Database Schema & Design

ResolveOS relies on a normalized relational PostgreSQL schema hosted on Neon PostgreSQL, managed via Alembic database migrations.

## Core Relational Entities

### Authentication & Users
- `users`: Internal staff & admin accounts (roles: `admin`, `support_agent`, `operations`, `viewer`).

### Enterprise E-Commerce Domain
- `customers`: Customer profiles, tier levels, email, and contact info.
- `customer_addresses`: Shipping and billing addresses.
- `products`: Product catalog entries.
- `product_variants`: SKUs, colors, sizes, attributes.
- `warehouses`: Warehouse locations and fulfillment capabilities.
- `inventory`: Variant availability, reserved stock, total stock per warehouse.
- `orders`: Order totals, payment status, fulfillment status, timestamps.
- `order_items`: Purchased SKUs, quantities, unit prices.
- `shipments`: Tracking numbers, carriers, status, timestamps.
- `payments`: Transaction IDs, gateway references, amounts, status.
- `returns`: Return requests, tracking, reason codes, status.
- `refunds`: Refund transaction records, amounts, status, idempotency keys.
- `replacement_requests`: Target replacement SKUs, warehouse allocations, status.

### Resolution Agent & RAG Domain
- `policies`: Versioned policy titles, categories.
- `policy_versions`: Effective dates, return windows, rules markdown, active flags.
- `policy_chunks`: Vector embeddings and text chunks for RAG search.
- `support_cases`: Customer support issues, assigned agent runs, current resolution state.
- `resolution_actions`: Proposed and executed resolution operations.
- `action_audit_log`: Strict audit log of all backend mutations.
- `agent_runs`: Execution runs of the LangGraph state machine.
- `agent_events`: Structured lifecycle events (`GOAL`, `EVIDENCE`, `DECISION`, `ACTION`, `RESULT`, `ADAPTATION`, `VERIFICATION`, `OUTCOME`).
- `approvals`: High-risk human approval queue items.
- `escalations`: Escalated cases requiring manual human intervention.
