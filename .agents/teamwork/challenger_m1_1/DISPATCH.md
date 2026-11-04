# Dispatch: Challenger 1 for Milestone M1

## Mission
Adversarially challenge Milestone M1: test rate limiting under rapid-fire burst conditions, test token forging / bypass attempts on RLS endpoints, and test negative cases on auth reset endpoints.

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Worker Handoff: `c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md`

## Adversarial Focus
1. Rate limit bypass: Test rapid bursts on `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/bookings`. Verify that client cannot bypass sliding-window tracking via forged headers or variations.
2. IDOR / RLS bypass: Attempt `GET /passenger/trips` and `GET /driver/earnings` with tampered JWTs, expired tokens, missing bearer headers, and `x-driver-phone` headers. Confirm zero data leaks and strict HTTP 403.
3. Auth reset edge cases: Invalid OTPs, expired tokens, malformed phone numbers, missing parameters.
4. Render verdict: `CONFIRMED` (passes adversarial verification) or `DEFECT_FOUND`.
5. Author handoff to `c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_1\handoff.md` and message orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).

## 2026-10-31T14:45:41Z
You are Challenger 1 (teamwork_challenger) for Milestone M1.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_1
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_1\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master plan: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md
Read the worker handoff: c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md

Your tasks:
1. Adversarially challenge rate limiting: test burst limits and bypass attempts on sensitive routes.
2. Adversarially challenge RLS & IDOR: attempt cross-user trip and driver earning queries with forged or missing credentials.
3. Render your adversarial verification verdict: CONFIRMED or DEFECT_FOUND.
4. Write your handoff to: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_1\handoff.md
5. Message orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.
