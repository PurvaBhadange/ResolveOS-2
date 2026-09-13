# ResolveOS Security & Compliance

ResolveOS adheres to strict security standards to guarantee safe operations and prevent LLM misuse.

## Security Principles

1. **LLM Non-Authority**:
   - Google Gemini proposes candidate decisions only.
   - All state mutations are validated and executed by backend services using parameterized SQL queries and deterministic business logic.

2. **Secrets & Environment Safety**:
   - Connection strings (`DATABASE_URL`), API keys (`GEMINI_API_KEY`), and authentication secrets (`AUTH_SECRET`) are loaded strictly from `.env`.
   - Credentials are never logged, printed, or exposed in API responses or git commits.

3. **Authentication & Role-Based Access Control (RBAC)**:
   - NextAuth (Auth.js) Google OAuth and JWT sessions.
   - Backend RBAC middleware enforcing permissions for staff roles (`admin`, `support_agent`, `operations`, `viewer`).

4. **Idempotency & Audit Logging**:
   - Idempotency key headers required on all state-changing endpoints (`POST /actions/*`).
   - Comprehensive audit logging in `action_audit_log` with timestamp, user/agent ID, action payload, and result.
