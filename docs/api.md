# ResolveOS API Documentation

The FastAPI backend provides structured REST endpoints for enterprise operations and agent lifecycle management.

## Core Endpoint Categories

### Enterprise Resources
- `GET /api/v1/customers/{customer_id}`: Customer details and history.
- `GET /api/v1/orders/{order_id}`: Order state, line items, payment status, tracking.
- `GET /api/v1/inventory/{variant_id}`: Warehouse stock levels and availability.
- `GET /api/v1/policies`: Active policies and version details.

### Enterprise State-Changing Actions
- `POST /api/v1/actions/refund`: Process order refund (requires idempotency key).
- `POST /api/v1/actions/replace`: Process item replacement request.
- `POST /api/v1/actions/cancel`: Cancel order prior to shipment.

### Verification & Audit
- `GET /api/v1/verification/refund/{refund_id}`: Verify refund state independently.
- `GET /api/v1/verification/replacement/{replacement_id}`: Verify stock reservation & status.
- `GET /api/v1/verification/cancellation/{order_id}`: Verify order status and cancellation effects.

### Agent & Operations Lifecycle
- `POST /api/v1/cases`: Submit new support case & trigger agent run.
- `GET /api/v1/cases/{case_id}/trace`: Retrieve structured agent trace events.
- `GET /api/v1/approvals`: List pending human approval requests.
- `POST /api/v1/approvals/{approval_id}/decision`: Approve or reject pending action.
- `GET /api/v1/escalations`: List escalated support cases.
