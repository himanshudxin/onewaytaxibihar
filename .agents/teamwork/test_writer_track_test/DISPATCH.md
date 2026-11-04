# Dispatch: E2E Testing Track (Track-Test)

## Mission
Design and implement the comprehensive, opaque-box, requirement-driven E2E test suite covering all 19 production-readiness criteria across 4 tiers.

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Explorer 3 Survey Report: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_3\survey_web_tests.md`
- Explorer 1 Backend Report: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\survey_backend.md`
- Explorer 2 Mobile Report: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_2\survey_mobile.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## File Ownership
You exclusively own:
- `TEST_INFRA.md` (at repo root `c:\Users\himan\onewaycabs\TEST_INFRA.md`)
- `tests/e2e-readiness.test.js`
- `tests/verify-all-19-readiness.ps1`
- `TEST_READY.md` (at repo root `c:\Users\himan\onewaycabs\TEST_READY.md`)

## Specific Requirements
1. Create `TEST_INFRA.md` at repository root using the template in `PROJECT.md`, documenting test philosophy, 4-tier methodology, feature checklist, and invocation instructions.
2. Implement `tests/e2e-readiness.test.js` using Node.js native test runner (`node:test`, `node:assert`):
   - Tier 1: Feature Coverage (≥5 tests per requirement across all 19 requirements).
   - Tier 2: Boundary & Corner Cases (invalid phone numbers, malformed emails, bad OTP lengths, negative numbers, extreme inputs, rate-limit thresholds).
   - Tier 3: Cross-Feature Combinations (auth + RLS, login + rate limiting, session refresh + booking, logout + token invalidation).
   - Tier 4: Real-World Scenarios (complete passenger booking lifecycle, driver earnings ledger, admin credential reset).
3. Implement `tests/verify-all-19-readiness.ps1` for one-click verification of all 19 criteria and TypeScript compilation check (`npx tsc --noEmit`).
4. Execute tests against the codebase to establish baseline test coverage.
5. Publish `TEST_READY.md` at root when test harness and all test cases are fully generated and ready.
6. Write your handoff report to `c:\Users\himan\onewaycabs\.agents\teamwork\test_writer_track_test\handoff.md` and message the orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).

## 2026-10-31T14:04:37Z
Sender: caa8f9da-9e6f-46fd-b0de-1d76e287aaba
Priority: MESSAGE_PRIORITY_HIGH
Content:
You are the E2E Test Suite Architect (teamwork_test_writer) for OneWayCabs.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\test_writer_track_test
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\test_writer_track_test\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project plan at: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your tasks:
1. Create c:\Users\himan\onewaycabs\TEST_INFRA.md documenting the test architecture, 4-tier methodology, invocation commands, and pass/fail semantics.
2. Implement c:\Users\himan\onewaycabs\tests\e2e-readiness.test.js using Node.js native test runner (node:test, node:assert) testing all 19 production readiness criteria across 4 tiers (Tier 1: Feature Coverage, Tier 2: Boundary & Corner Cases, Tier 3: Cross-Feature Combinations, Tier 4: Real-World Scenarios).
3. Implement c:\Users\himan\onewaycabs\tests\verify-all-19-readiness.ps1 to execute the complete verification suite and check TypeScript compilation (0 errors).
4. Run the test suite and verify test execution syntax.
5. Create c:\Users\himan\onewaycabs\TEST_READY.md when the test suite is ready.
6. Write your handoff report to: c:\Users\himan\onewaycabs\.agents\teamwork\test_writer_track_test\handoff.md
7. Message the orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.

## 2026-10-31T14:08:09Z
Sender: caa8f9da-9e6f-46fd-b0de-1d76e287aaba
Priority: MESSAGE_PRIORITY_HIGH
Content:
**Context**: P0 Lifecycle Smoke Test Requirement
**Content**: An updated master task brief has been received requiring a complete lifecycle integration smoke test covering:
Passenger Booking ➔ Fare Calculation ➔ Admin Dispatch / Auto Dispatch ➔ Driver Offer Accept ➔ Start OTP ➔ Live Route Tracking ➔ Trip Complete ➔ Payment Settlement ➔ Wallet Ledger Entry.
Please ensure this complete lifecycle integration flow is explicitly tested in `tests/e2e-readiness.test.js` or a dedicated lifecycle test.
**Action**: Incorporate into test suite and report in handoff.md.
