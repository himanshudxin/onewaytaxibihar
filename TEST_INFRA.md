# Test Architecture & Verification Infrastructure (TEST_INFRA.md)
**Project**: OneWayCabs (`onewaytaxibihar.com`)  
**Role**: E2E Test Suite Architect (`teamwork_test_writer`)  
**Standard**: Node.js Native Test Runner (`node:test`, `node:assert`) + TypeScript Strict Typecheck  
**Target Matrix**: All 19 Production-Readiness Criteria across 4 Verification Tiers  

---

## 1. Executive Overview & Testing Philosophy

The OneWayCabs verification infrastructure is an **opaque-box, contract-driven, end-to-end testing system** designed to validate that the web platform and all three mobile applications (Passenger, Driver, Admin) satisfy all 19 production-readiness requirements specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

### Core Architectural Principles:
1. **Zero External Test Framework Dependencies**: Built on Node.js v24+ native test runner (`node:test`, `node:assert`). No brittle third-party test runners (Jest, Mocha, Karma) that introduce version conflicts or slow down execution.
2. **Contract & Behavior Driven (No Dummy Facades)**: Tests exercise real HTTP endpoints, real database operations (`services/db.js`), real security helpers (`services/security.js`), real form validation rules, and real static file assets. Tests never pass blindly without executing genuine application logic.
3. **Progressive Testability & Isolation**: Tests run in an isolated environment using an ephemeral in-process HTTP server on dynamic ports (`127.0.0.1:0`). Every test suite manages its own state and cleans up after itself without cross-test state pollution.
4. **Adversarial Verification**: Includes adversarial inputs (special characters, SQL/NoSQL injection tokens, unicode, boundary overflows, negative values, and concurrent requests) to verify error resilience and data security.

---

## 2. The 4-Tier Verification Methodology

The test suite organizes test cases into four distinct, rigorous tiers:

```
+-----------------------------------------------------------------------------------------+
|                                4-TIER VERIFICATION MODEL                                |
+-----------------------------------------------------------------------------------------+
|  Tier 1: Feature Coverage (>= 5 tests per criterion x 19 criteria = 95+ tests)          |
|    - Validates primary happy paths and contract conformance for each criterion          |
+-----------------------------------------------------------------------------------------+
|  Tier 2: Boundary & Corner Cases (>= 15 tests)                                          |
|    - Malformed phone numbers, invalid emails, bad OTPs, extreme values, rate limits     |
+-----------------------------------------------------------------------------------------+
|  Tier 3: Cross-Feature Combinations (>= 10 tests)                                       |
|    - Auth + RLS, Login + Rate Limiting, Session + Booking, Logout + Token Revocation     |
+-----------------------------------------------------------------------------------------+
|  Tier 4: Real-World Scenarios (>= 5 end-to-end workflows)                               |
|    - Complete Passenger Journey, Driver Duty & Earnings, Admin Fleet Audit              |
+-----------------------------------------------------------------------------------------+
```

### Tier 1: Feature Coverage (Requirements 1 through 19)
Verifies each of the 19 production-readiness criteria with at least 5 dedicated, rigorous tests per criterion:
- **Criterion 1 (R1 AC 1)**: Persistent Session Login (Passenger, Driver, Admin)
- **Criterion 2 (R1 AC 2)**: Clean Logout Teardown & Token Revocation
- **Criterion 3 (R1 AC 3)**: Password & Credential Reset Workflow
- **Criterion 4 (R1 AC 4)**: Email Verification Flow & Provider Integration
- **Criterion 5 (R1 AC 5)**: Self-Service Account Deletion (DPDP Act Compliance)
- **Criterion 6 (R2 AC 1)**: Async Loading States (Spinners & Shimmer Skeletons)
- **Criterion 7 (R2 AC 2)**: Clear Empty State Displays & Action Prompts
- **Criterion 8 (R2 AC 3)**: User-Friendly Error Messages & Exception Sanitization
- **Criterion 9 (R2 AC 4)**: Strict Form Validation (Phone, Email, OTP, UTR, Vehicle)
- **Criterion 10 (R2 AC 5)**: First-Launch Onboarding Carousel Flow
- **Criterion 11 (R3 AC 1)**: Sliding-Window Rate Limiting (HTTP 429)
- **Criterion 12 (R3 AC 2)**: Database Backup Snapshot & Non-Destructive Restore Verification
- **Criterion 13 (R3 AC 3)**: Row-Level Security (RLS) & Scoped Data Isolation
- **Criterion 14 (R3 AC 4)**: Secret Audit & Client Bundle Hygiene (Zero Leaked Keys)
- **Criterion 15 (R4 AC 1)**: Mobile Safe Area Conformity (Dynamic Island & Notch Protection)
- **Criterion 16 (R4 AC 2)**: Custom 404 Fallback Screens (Web & Mobile Navigators)
- **Criterion 17 (R5 AC 1)**: Analytics Telemetry Integration (Lifecycle & Milestones)
- **Criterion 18 (R5 AC 2)**: Error Tracking & Breadcrumbs Ring Buffer
- **Criterion 19 (R5 AC 3)**: Dedicated Legal Pages Accessibility (In-App & Web Footers)

### Tier 2: Boundary & Corner Cases
Exercises inputs at and beyond system limits:
- Indian mobile phone boundaries: 9 digits, 11 digits, invalid leading prefixes (0–5), non-numeric characters, `+91` variations, spaces, and hyphens.
- Email boundaries: missing domain, missing `@`, consecutive dots, trailing dots, empty string, extreme lengths.
- OTP length boundaries: 3 digits, 5 digits, 7 digits, alphanumeric strings, null, undefined.
- Financial UTR boundaries: 11 digits, 13 digits, alphanumeric strings.
- Sliding-window rate limit threshold boundaries: request `N` (allowed), request `N+1` (HTTP 429), `Retry-After` header verification.
- Extreme inputs: negative fares, zero distances, oversized payloads, unicode control characters, and SQL/XSS injections.

### Tier 3: Cross-Feature Combinations
Tests interaction effects and state machines between independent modules:
- **Auth + RLS**: Authenticated Passenger A attempts to query Passenger B's bookings via `/api/passenger/trips` -> Assert HTTP 403 Forbidden.
- **Login + Rate Limiting**: Repeated failed logins trigger sliding-window rate limit -> Verify subsequent attempts return HTTP 429 while isolated IPs remain unaffected.
- **Session Refresh + Booking**: Passenger logs in, re-uses session token across multiple requests, creates outstation booking, and retrieves confirmed booking.
- **Logout + Token Revocation**: Driver logs in, executes authenticated action, logs out, and attempts follow-up action with revoked token -> Assert HTTP 401 Unauthorized.
- **Password Reset + Session Purge**: User requests credential reset, verifies OTP, updates password -> Assert all prior active sessions are immediately invalidated.
- **Error Tracking + Secret Scrubbing**: Client error contains stack trace and breadcrumbs -> Ingest via `/api/telemetry/errors` -> Confirm sensitive tokens (`otb_sess_*`, passwords) are scrubbed before storage.

### Tier 4: Real-World Scenarios
Validates complete user journeys from start to finish:
- **Scenario 1: Complete Passenger Booking Lifecycle**: Search corridor (Patna to Gaya) -> check fare calculation -> authenticate user -> create booking -> confirm booking with payment reference -> retrieve booking in My Trips feed.
- **Scenario 2: Driver Duty & Earnings Ledger Lifecycle**: Driver authenticates with credentials -> goes on duty -> accepts dispatch -> executes trip state progression -> verifies completed trip in isolated earnings ledger.
- **Scenario 3: Admin Operations & Fleet Audit Lifecycle**: Admin logs in -> reviews pending drivers -> inspects system error logs -> triggers backup verification check -> executes clean logout.
- **Scenario 4: P0 Full Lifecycle Integration Smoke Test**: Passenger Booking ➔ Server Fare Calculation ➔ Admin Dispatch / Auto Dispatch ➔ Driver Offer Accept ➔ Start Ride OTP Verification ➔ Live Route GPS Tracking ➔ Trip Complete ➔ Payment Settlement ➔ Driver Wallet Ledger Entry.

---

## 3. 19 Production-Readiness Criteria Detailed Specification

| # | Criterion | Key Target Files | Verification Method & Assertions |
|---|---|---|---|
| 1 | Persistent Session Login | `api/index.js`, `mobile/shared/services/storage.ts` | Verify `/api/auth/login`, `/api/driver/login`, `/api/admin/login` return session tokens; verify protected endpoints validate tokens; verify storage persistence logic. |
| 2 | Clean Logout Teardown | `api/index.js`, `services/security.js` | Call logout endpoints (`/api/auth/logout`, `/api/driver/logout`, `/api/admin/logout`); assert token revoked; assert subsequent protected requests return 401. |
| 3 | Password & Credential Reset | `api/index.js`, `services/db.js` | Call `POST /api/auth/forgot-password`; verify reset token/OTP generated; call `POST /api/auth/reset-password`; verify credential updated; re-login works. |
| 4 | Email Verification Flow | `api/index.js`, `services/notification.js` | Call `/api/auth/send-email-verification`; verify verification token issued; call `/api/auth/verify-email`; assert `isEmailVerified === true`. |
| 5 | Self-Service Account Deletion | `api/index.js` | Require authentication; call `/api/user/delete-account`; assert user record anonymized, sessions wiped, and DPDP Act compliance erasure receipt returned. |
| 6 | Async Loading States | `*.html`, `mobile/shared/components/LoadingSkeleton.tsx` | Static & component inspection: verify shimmer skeletons or loading indicators exist in web views and mobile screens (`MyTripsScreen`, `DriverEarningsScreen`). |
| 7 | Clear Empty State Displays | `mobile/shared/components/EmptyStateView.tsx`, `*.html` | Verify empty states render clear illustrations and CTA action prompts when trip, driver, or search feeds have 0 items. |
| 8 | User-Friendly Error Messages | `api/index.js`, `mobile/shared/utils/formatters.ts` | Assert API returns sanitized JSON error without raw stack traces; assert `formatUserErrorMessage` maps network errors and HTTP 429/401/500 to friendly text. |
| 9 | Strict Form Validation | `mobile/shared/utils/formatters.ts`, `api/index.js` | Validate regex/rules for Indian phone (`/^[6-9]\d{9}$/`), email, OTP (4/6 digits), UTR (12 digits), and vehicle registration number (`/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/`). |
| 10 | First-Launch Onboarding | `mobile/shared/components/OnboardingModal.tsx` | Verify `otb_has_seen_onboarding` persistence flag, multi-slide guarantee details, complete action, and dismiss action. |
| 11 | Sliding-Window Rate Limiting | `api/index.js`, `services/security.js` | Exceed threshold on auth/booking endpoints; assert HTTP 429 status and `Retry-After` header present. |
| 12 | Database Backup & Restore | `scripts/backup-db.js`, `package.json` | Execute backup; assert non-zero snapshot file; verify SHA-256 checksum; execute `--verify` dry-run restore; assert npm scripts exist. |
| 13 | Row-Level Security (RLS) | `api/index.js` | Attempt cross-user query on `/api/passenger/trips` and cross-driver query on `/api/driver/earnings`; assert HTTP 403 Forbidden; reject `x-driver-phone` bypass. |
| 14 | Secret Audit & Client Hygiene | `mobile/`, `js/`, `api/index.js` | Automated regex scanner: assert 0 hardcoded passwords (`harharmahadev@1`), 0 Google Maps keys in client; verify `/api/routes/toll-estimate` proxy. |
| 15 | Mobile Safe Area Conformity | `mobile/apps/admin/src/screens/*` | Inspect admin screens; assert `<SafeAreaView>` usage; assert removal of hardcoded `paddingTop: 54`; verify tab bar insets. |
| 16 | Custom 404 Fallback Screens | `404.html`, `_redirects`, `mobile/shared/components/NotFoundScreen.tsx` | Assert web `/non-existent` returns 404; assert `_redirects` rule uses `/404.html 404`; assert `NotFoundScreen` registered in mobile navigators. |
| 17 | Analytics Telemetry | `api/index.js`, `js/analytics.js`, `mobile/shared/services/analytics.ts` | Dispatch event to `/api/telemetry/events`; assert validated payload logged; assert GA4 on web pages; assert mobile analytics service. |
| 18 | Error Tracking & Breadcrumbs | `api/index.js`, `js/error-tracker.js`, `mobile/shared/services/errorTracker.ts` | Ingest error with breadcrumbs at `/api/telemetry/errors`; assert error payload format; assert rolling buffer; assert secret scrubbing. |
| 19 | Dedicated Legal Pages | `privacy-policy.html`, `terms-of-service.html`, `mobile/shared/screens/*` | Assert web legal pages return 200; assert footer links on all portals; assert native in-app `PrivacyPolicyScreen` and `TermsOfServiceScreen` in mobile apps. |

---

## 4. Test Harness Invocation Commands

### Primary Test Runners:
```powershell
# 1. Full Automated Verification Suite (PowerShell Runner)
# Executes all 19 readiness checks + validates 0 TypeScript compilation errors
powershell -ExecutionPolicy Bypass -File tests/verify-all-19-readiness.ps1

# 2. Node.js Native E2E Test Runner
node --test tests/e2e-readiness.test.js

# 3. Filter by Specific Tier
node --test --test-name-pattern="Tier 1" tests/e2e-readiness.test.js
node --test --test-name-pattern="Tier 2" tests/e2e-readiness.test.js
node --test --test-name-pattern="Tier 3" tests/e2e-readiness.test.js
node --test --test-name-pattern="Tier 4" tests/e2e-readiness.test.js

# 4. Filter by Specific Criterion (e.g., Rate Limiting or RLS)
node --test --test-name-pattern="Criterion 11" tests/e2e-readiness.test.js
node --test --test-name-pattern="Criterion 13" tests/e2e-readiness.test.js

# 5. TypeScript Compilation Check (0 Errors across all mobile configs)
node mobile/node_modules/typescript/bin/tsc -p mobile/tsconfig.json --noEmit
node mobile/node_modules/typescript/bin/tsc -p mobile/apps/passenger/tsconfig.json --noEmit
node mobile/node_modules/typescript/bin/tsc -p mobile/apps/driver/tsconfig.json --noEmit
node mobile/node_modules/typescript/bin/tsc -p mobile/apps/admin/tsconfig.json --noEmit
```

---

## 5. Pass / Fail Semantics & Verification Criteria

1. **Exit Code 0**:
   - The test run is declared **PASSED** if and only if all test assertions pass with 0 unhandled exceptions, AND TypeScript compiler exits with code 0 (zero errors).
2. **Non-Zero Exit Code**:
   - Any assertion failure, unhandled promise rejection, syntax error, or TypeScript type error triggers an immediate non-zero exit code, invalidating the readiness build.
3. **Automated Auditor Verification**:
   - An independent `teamwork_auditor` will execute `tests/verify-all-19-readiness.ps1` in an isolated environment.
   - Any hardcoded return values, facade tests, or mocked passes that do not exercise real logic will be detected and flagged as integrity violations.
