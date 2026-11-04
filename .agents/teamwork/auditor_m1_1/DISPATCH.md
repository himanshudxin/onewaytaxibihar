# Dispatch: Forensic Integrity Auditor for Milestone M1

## Mission
Perform independent forensic integrity verification on Milestone M1 implementations.

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Worker Handoff: `c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md`

## Audit Focus (Integrity Forensics)
1. Cheating Detection: Check for hardcoded test responses, fake bypass flags (`if (process.env.TEST) return true`), dummy mocks that avoid genuine logic, or synthetic facades.
2. Logic Veracity: Verify that `checkRateLimit` executes real timestamps and window math in `services/security.js`.
3. RLS Veracity: Verify that `api/index.js` inspects real caller tokens and queries real database records before deciding access.
4. Backup Veracity: Verify that `scripts/backup-db.js --verify` calculates real SHA-256 hashes and inspects real JSON records.
5. Render binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
6. Author handoff to `c:\Users\himan\onewaycabs\.agents\teamwork\auditor_m1_1\handoff.md` and message orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).

## 2026-10-31T14:45:56Z
You are the Forensic Integrity Auditor (teamwork_auditor) for Milestone M1.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\auditor_m1_1
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\auditor_m1_1\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master plan: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md
Read the worker handoff: c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md

Your tasks:
1. Conduct forensic integrity audit of M1 implementations in api/index.js, services/security.js, services/notification.js, scripts/backup-db.js.
2. Verify absence of cheating, fake facades, hardcoded test strings, dummy mocks, or test-mode bypasses.
3. Verify that rate limiting, RLS, auth lifecycle, and DB restore verification execute genuine, production logic.
4. Render binary verdict: CLEAN or INTEGRITY VIOLATION.
5. Write your handoff to: c:\Users\himan\onewaycabs\.agents\teamwork\auditor_m1_1\handoff.md
6. Message orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.
