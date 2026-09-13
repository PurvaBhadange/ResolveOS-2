# ResolveOS 🛡️
> **Autonomous Enterprise Customer Resolution Engine**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-000000.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-StateMachine-FF6F00.svg?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D76B00.svg?style=flat-square)](https://www.sqlalchemy.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**ResolveOS** is an autonomous, safe, and verifiable customer-resolution platform built to handle enterprise e-commerce issues—returns, physical replacements, order cancellations, and damaged goods. 

Unlike traditional chatbots that only generate conversational text, ResolveOS integrates directly with simulated inventory databases, payment processors, and order management systems. It evaluates policy rules, executes transactional database updates, verifies state changes post-action, and dynamically adapts plans when constraints (like inventory stockouts) are encountered.

---

## 🔄 Agentic State Machine Loop

ResolveOS operates on an explicit **7-Node LangGraph State Machine**:

```mermaid
flowchart TD
    A[1. UNDERSTAND] --> B[2. RETRIEVE EVIDENCE]
    B --> C[3. DECIDE RESOLUTION]
    C --> D[4. RESOLUTION GUARD]
    D -->|Safe & <= $200| E[5. EXECUTE ACTION]
    D -->|High Value > $200| F[HUMAN APPROVAL GATE]
    F -->|Approved| E
    F -->|Rejected| G[ESCALATE]
    E --> H[6. INDEPENDENT VERIFY]
    H -->|Verified OK| I[7. RESOLVE CASE]
    H -->|Stockout / Constraint| J[8. ADAPT & REPLAN]
    J --> C
```

1. **UNDERSTAND**: Parses customer intent, order ID, and desired outcome from raw text.
2. **EVIDENCE**: Queries RAG policy vectors and enterprise DB records (order status, item delivery dates, warehouse stock).
3. **DECIDE**: Generates scored candidate resolution plans.
4. **GUARD**: Enforces policy return windows (15 days for electronics) and financial safety caps ($200.00 auto-approval limit).
5. **ACT**: Executes database transactions using idempotency keys.
6. **VERIFY**: Re-queries relational database tables post-execution to independently confirm state changes (`refunds`, `payments`, `inventory`).
7. **ADAPT**: Automatically replans strategy if a constraint (e.g., zero warehouse stock) blocks execution.

---

## 🚀 Pre-Configured Demo Scenarios

Test all core capabilities in 1 click from the **Help Center** hero banner:

| Scenario | Demo Order # | Condition & Policy Rule | Expected Agent Behavior |
| :--- | :--- | :--- | :--- |
| **1. Stockout Adaptation** | `ORD-2026-8801` | Customer requests replacement for damaged headphones ($199.99). Warehouse stock is **0**. | Agent detects zero stock $\rightarrow$ **adapts plan to Full Refund ($199.99)** $\rightarrow$ executes & verifies DB state. |
| **2. High-Value $200+ Approval** | `ORD-2026-8802` | Customer requests refund for defective smartwatch ($499.98). | Amount exceeds $200 auto-approval cap $\rightarrow$ **routes to Operations Approval Queue** $\rightarrow$ auto-executes on approval. |
| **3. Expired Return Window** | `ORD-2026-8803` | Customer requests return for earbuds delivered 40 days ago. | Delivery exceeds 15-day policy return window ($40 > 15$) $\rightarrow$ **safely escalates case** to Tier 2 support team. |
| **4. Pre-Shipment Cancellation** | `ORD-2026-8804` | Customer requests cancellation for unfulfilled order (`PROCESSING`). | Status verified as `PROCESSING` $\rightarrow$ **cancels order**, issues full refund, and updates order status. |

---

## 🛠️ Architecture & Tech Stack

```text
ResolveOS/
├── backend/
│   ├── app/
│   │   ├── agent/          # LangGraph state machine & node logic
│   │   ├── api/v1/         # FastAPI REST endpoints (cases, orders, inventory, approvals)
│   │   ├── models/         # SQLAlchemy 2.0 domain schemas (25+ entities)
│   │   ├── services/       # Business logic (Action execution, DB verification, RAG)
│   │   └── seed/           # Data generator for warehouses, inventory, & orders
│   ├── tests/              # Pytest unit & integration test suite
│   ├── Dockerfile          # Production Docker container setup
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── app/                # Next.js 14 App Router pages & NextAuth handlers
    ├── components/         # Zapier-styled UI components (Help Center, Ops Dashboard, Trace Inspector)
    └── lib/                # API client with URL normalization
```

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS (Zapier Design System), NextAuth.js (Auth.js v4).
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Pytest.
- **Database**: SQLite (Local Dev) / PostgreSQL (Neon Serverless).

---

## 💻 Quickstart (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start Backend API Server
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies & seed database
pip install -r requirements.txt
python app/seed/seed_data.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
Backend API: `http://127.0.0.1:8001` | Swagger Docs: `http://127.0.0.1:8001/docs`

### 2. Start Frontend Web Application
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend App: `http://localhost:3001`

---

## 🧪 Automated Testing & Audit Commands

Run backend pytest suite (unit tests, failure injection, and adaptation tests):
```bash
cd backend
python -m pytest -v
```

Run database structural and relational integrity check:
```bash
cd backend
python app/scripts/check_integrity.py
```

---

## 🌐 Production Deployment

- **Backend (Render)**: Deploy `backend/` using the included `Dockerfile` or `Procfile`.
- **Frontend (Vercel)**: Import `frontend/` to Vercel, set `NEXT_PUBLIC_API_URL` to your live Render API URL.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
