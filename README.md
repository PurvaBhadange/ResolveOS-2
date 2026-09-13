# ResolveOS: Autonomous Customer Resolution Platform

ResolveOS is an autonomous agentic customer-resolution platform built to resolve enterprise customer issues safely, verifiably, and adaptively.

## Key Features

- **Agentic Resolution Loop**: LangGraph state machine driving structured execution:
  $$\text{UNDERSTAND} \longrightarrow \text{EVIDENCE} \longrightarrow \text{DECIDE} \longrightarrow \text{GUARD / APPROVAL} \longrightarrow \text{ACT} \longrightarrow \text{VERIFY} \longrightarrow \text{ADAPT / ESCALATE}$$
- **Non-Negotiable Safety Architecture**: LLM proposes plans; backend business rules authorize; human approval required for high-risk actions.
- **Independent Verification**: Re-queries relational state post-execution to confirm transaction integrity.
- **Dynamic Replanning**: Automatically adapts when primary resolution paths are constrained (e.g. stock out $\rightarrow$ refund).
- **Policy RAG**: Retrieves versioned policy clauses for evidence-grounded decisions.
- **Polished Operations & Help Center UI**: Modern Next.js interface with real-time agent trace visualization, approval queues, and customer case tracking.

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, NextAuth / Auth.js
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Alembic, PostgreSQL / Neon DB
- **AI / Agent**: LangGraph, Google Gemini, Local/Vector Embeddings
- **Testing**: pytest, httpx, FastAPI TestClient

## Quick Start (Local Setup)

### 1. Environment Configuration
Copy environment templates and configure local variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed.seed_data
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the ResolveOS platform.
