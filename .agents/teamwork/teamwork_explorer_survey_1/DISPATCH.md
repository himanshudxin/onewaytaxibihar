# Dispatch for Explorer 1: Backend, Auth, DB & Security Survey

## Objective
Investigate the backend architecture, database schema, APIs, authentication, and security across the codebase to assess the current state and exact requirements for R1 (Authentication & Account Lifecycle) and R3 (Backend Security & Data Protection).

## Source of Truth
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Working Directory: `c:\Users\himan\onewaycabs`

## Specific Areas to Investigate
1. Server/API framework (Supabase, Next.js API routes, Express, serverless functions, etc.).
2. Database schema, migrations, tables for users, drivers, admins, bookings, earnings, OTPs, verification tokens.
3. R1 backend implementation:
   - Login, session persistence, tokens, logout invalidation.
   - Password reset workflow (OTP / token generation, verification, password update).
   - Email verification (token generation, verification status, external email integration like SendGrid/Resend).
   - Account deletion endpoint and data erasure confirmation.
4. R3 backend security & data protection:
   - Rate limiting (sliding-window on auth, OTP, booking endpoints returning HTTP 429).
   - Database backup snapshot management script and automated restore verification.
   - Row-level security (RLS) policies / data isolation (passenger cannot query others' bookings, driver cannot query others' earnings).
   - Secret audit: verify no secrets or private API keys in client bundles, identify proxy requirements.
5. Identify file paths, missing implementations, gaps, and concrete implementation recommendations.

## Output Requirements
Write your detailed technical report to:
`c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1/survey_backend.md`
And write your completion handoff to:
`c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1/handoff.md`


## 2026-10-31T13:48:33Z
You are Explorer 1 (teamwork_explorer) investigating the backend architecture, database schema, APIs, authentication, and security for the OneWayCabs project.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md

Your tasks:
1. Explore backend architecture (APIs, serverless functions, database schema, Supabase or SQL migrations, auth handlers).
2. Survey current status and required changes for R1 (Authentication & Account Lifecycle):
   - Real login/logout with persistent sessions.
   - Password reset workflow via OTP / reset token.
   - Email verification with token generation and external email service integration (SendGrid/Resend).
   - Self-service account deletion workflow with data erasure confirmation.
3. Survey current status and required changes for R3 (Backend Security & Data Protection):
   - Sliding-window rate limiting on auth, OTP, and booking endpoints (returning HTTP 429).
   - Database backup snapshot management script and automated restore verification.
   - Row-level security (RLS) & data isolation (passengers can only access their bookings; drivers can only access their earnings; admin scope).
   - Secret audit: ensure no private API keys or secrets in client bundles; proxy requirements for external requests.
4. Document all relevant existing files, lines of interest, missing endpoints, database tables, and exact implementation recommendations.
5. Write your detailed report to: c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\survey_backend.md
6. Write your self-contained handoff report to: c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\handoff.md
7. Message the orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.
