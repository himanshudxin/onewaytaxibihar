# Dispatch: Milestone M1 Worker (Backend Security, Data Isolation & Core Lifecycle APIs)

## Mission
Implement all backend security hardening, row-level data isolation, rate-limiting, authentication lifecycle endpoints, email verification service, DPDP account deletion receipt, and database backup verification script.

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Explorer 1 Backend Technical Survey: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\survey_backend.md`
- Explorer 1 Handoff: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\handoff.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## File Ownership
You exclusively own:
- `api/index.js`
- `services/security.js`
- `services/notification.js`
- `scripts/backup-db.js`
- `package.json`

## Concrete Implementation Tasks
1. **Sliding-Window Rate Limiting (R3 AC 1)**:
   - In `services/security.js` and `api/index.js`, apply sliding-window rate limiting (`checkRateLimit`) to `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, `/auth/send-otp`, and `POST /bookings`.
   - When threshold is exceeded, return HTTP 429 with `{ success: false, error: 'Too many requests. Please try again later.', retryAfter: ... }`.
2. **Row-Level Security & Data Isolation (R3 AC 3)**:
   - In `api/index.js:2404-2418`, restrict `GET /passenger/trips` and `GET /bookings/by-phone` so passengers can ONLY access their own bookings. Validate caller auth token against requested phone. Cross-user access must return HTTP 403.
   - In `api/index.js:6360-6385`, restrict `GET /driver/earnings` so drivers can ONLY access their own earnings. Validate driver auth token against requested driver phone. Cross-driver access must return HTTP 403.
   - Remove `x-driver-phone` bypass in `getSessionDriver` (`api/index.js:729-742`); require valid cryptographically signed driver JWT/token.
3. **Authentication & Account Lifecycle Endpoints (R1 AC 1, 2, 3, 4, 5)**:
   - `POST /api/auth/forgot-password`: Generates reset token and OTP, saves to user/driver/admin record.
   - `POST /api/auth/reset-password`: Validates reset token and OTP, updates password/PIN securely using PBKDF2/bcrypt hashing.
   - `POST /api/auth/send-email-verification`: Generates email verification token, dispatches via notification service, records pending status.
   - `GET/POST /api/auth/verify-email`: Validates verification token and marks user email as verified (`emailVerified: true`).
   - `POST /api/driver/logout`: Invalidates driver session/token.
   - `POST /api/user/delete-account` & `POST /api/driver/delete-account`: Requires confirmation parameter `{ confirm: true }`, verifies caller auth, wipes personal data, and returns DPDP Act statutory data erasure receipt (`{ id, timestamp, standard: 'DPDP_ACT_2023' }`).
4. **Email Notification Service**:
   - In `services/notification.js`, implement `sendEmailVerification(email, token, user)` supporting Resend / SendGrid with console simulation fallback for local/test environments.
5. **Backend Route Proxy (R3 AC 4)**:
   - Add backend endpoint `POST /api/routes/toll-estimate` in `api/index.js` to proxy Google Maps Routes / Toll calculation, keeping API keys exclusively on the server.
   - Remove hardcoded master password from `services/security.js:66`.
6. **Automated Database Backup Verification (R3 AC 2)**:
   - In `scripts/backup-db.js`, add automated `--verify` mode that validates snapshot JSON integrity, SHA-256 checksums, and performs non-destructive dry-run restore verification.
   - Add `"db:backup"` and `"db:verify-backup"` scripts to root `package.json`.
7. **Verification**:
   - Run `npm test` and test backend endpoints via Node scripts.
   - Write your handoff report to `c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1\handoff.md` and message the orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).


## 2026-10-31T14:04:46Z
Received dispatch from parent (caa8f9da-9e6f-46fd-b0de-1d76e287aaba).
Tasks:
1. Sliding-window rate limiting on `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, `/auth/send-otp`, and `POST /bookings`.
2. Row-level security on `GET /passenger/trips` and `GET /driver/earnings`, eliminate `x-driver-phone` bypass.
3. Auth lifecycle endpoints: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/send-email-verification`, `GET/POST /api/auth/verify-email`, `POST /api/driver/logout`, and DPDP-compliant `POST /api/user/delete-account`.
4. Email verification dispatch in `services/notification.js`.
5. Backend proxy endpoint `POST /api/routes/toll-estimate` in `api/index.js`, purge hardcoded password in `services/security.js:66`.
6. Add `--verify` automated restore verification to `scripts/backup-db.js` and wire npm scripts `db:backup` and `db:verify-backup` in `package.json`.
7. Run tests and verify.
8. Write handoff report and notify orchestrator.


## 2026-10-31T14:08:04Z
Updated Master Task Brief from parent (caa8f9da-9e6f-46fd-b0de-1d76e287aaba):
1. Automated MongoDB backups + retention + npm script `npm run db:restore-test` to test backup restore integrity.
2. IDOR Protection: Auth middleware on passenger, driver, and admin APIs ensuring callers only access their own PNRs, profiles, and wallet logs.
3. API Rate Limiting: Sensitive routes including Auth/OTP, booking creation, payment webhooks, and driver location pings.
4. Environment Isolation: `.env` configuration validation on boot.
5. Live Payment & Webhook Resilience (Razorpay): live key config support, ₹1 real transaction flow, robust `x-razorpay-signature` verification across all states (`payment.captured`, `payment.failed`, `order.paid`), and idempotency for duplicate webhooks.
