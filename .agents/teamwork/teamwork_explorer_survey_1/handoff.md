# Handoff Report: Backend Architecture, Auth, Database & Security Survey

**Agent**: Explorer 1 (`teamwork_explorer_survey_1`)  
**Mission**: Investigate backend architecture, database schema, APIs, authentication, and security across the codebase for R1 and R3.  
**Report Document**: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_1\survey_backend.md`  
**Date**: 2026-10-31  

---

## 1. Observation

1. **API Router & Server**:
   - `api/index.js` (7,360 lines, 323,915 bytes) is the unified serverless REST API router routed via `vercel.json` rewrites (`/api/:path* -> /api`).
   - `local-server.js` (lines 118-121) routes all `/api` traffic to `apiHandler = require('./api/index.js')`.
   - `services/db.js` (lines 15-35, 119-237) implements a multi-tier database service supporting MongoDB Atlas Cloud, PostgreSQL (`oneway_documents` table), an in-memory cache (`memoryDb`, 3s TTL), and local/tmp file fallback (`data/db.json` / `/tmp/db.json`).
2. **Authentication & Session Mechanics (R1)**:
   - **Passenger Auth**: `POST /auth/send-otp` (`api/index.js:861`), `POST /auth/verify-otp` (`api/index.js:939`), `POST /auth/login` (`api/index.js:1076`), `POST /auth/logout` (`api/index.js:1189`), `GET /user/profile` (`api/index.js:1202`).
   - **Driver Auth**: `POST /driver/signup` (`api/index.js:5878`), `POST /driver/login` (`api/index.js:5990`). Verifies PIN via `driver.pin`, phone suffix, or `'1234'`. Issues signed JWT. There is **no** `POST /driver/logout` endpoint in `api/index.js`.
   - **Driver Mobile Bug**: In `mobile/apps/driver/src/context/DriverContext.tsx:108`:
     ```typescript
     const savedPhone = (await StorageService.getItem('otb_driver_phone')) || '9876508888';
     ```
     This fallback automatically logs the driver app into a dummy driver account (`9876508888`) upon initial launch or post-logout.
   - **Admin Mobile Bug**: In `mobile/apps/admin/src/context/AdminContext.tsx:86-94`:
     ```typescript
     if (!storedAdmin || !token) {
       try {
         const authRes = await MobileApiClient.adminLogin('admin', 'harharmahadev@1');
     ```
     Auto-logs the admin app into production using hardcoded master password `'harharmahadev@1'`.
   - **Password Reset**: In `api/index.js`, only `/admin/change-password` exists (line 4888). No unauthenticated password or PIN reset endpoints (`/auth/forgot-password`, `/auth/reset-password`) exist.
   - **Email Verification**: No email sending service exists in `services/notification.js` (only SMS/WhatsApp). No email verification endpoints exist (`/auth/send-email-verification`, `/auth/verify-email`).
   - **Account Deletion**: `POST /user/delete-account` (`api/index.js:1222`) and `POST /driver/delete-account` (`api/index.js:6390`) accept unauthenticated raw `{ phone, reason }` without confirmation validation or formal erasure receipts.
3. **Backend Security & Data Isolation (R3)**:
   - **Rate Limiting**: `services/security.js:250-265` contains a timestamp-based sliding-window `checkRateLimit(key, maxRequests, windowMs)`. However, `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, and `/bookings` (POST) completely lack rate limit calls.
   - **Data Leaks & RLS Bypasses**:
     - `api/index.js:2404-2418`: `GET /passenger/trips?phone=...` and `GET /bookings/by-phone?phone=...` return all trips for ANY requested phone number without authentication.
     - `api/index.js:6360-6385`: `GET /driver/earnings?phone=...` returns arbitrary driver earnings for any query param phone without verifying that the caller is that driver.
     - `api/index.js:729-742`: `getSessionDriver` authenticates callers based on an arbitrary `x-driver-phone` header without cryptographic token validation.
   - **Secret Audit**:
     - Hardcoded master password `'harharmahadev@1'` found in:
       - `mobile/apps/admin/src/context/AdminContext.tsx` (line 88)
       - `mobile/apps/admin/src/screens/AdminLoginScreen.tsx` (lines 24, 52-53)
       - `mobile/shared/services/api.ts` (line 612)
       - `services/security.js` (line 66)
     - `mobile/shared/services/gmapTollService.ts` (lines 123-154) makes direct unproxied calls from the mobile client to `https://routes.googleapis.com/directions/v2:computeRoutes` referencing `GOOGLE_MAPS_API_KEY`.
   - **Database Backup Verification**: `scripts/backup-db.js` creates snapshot folders with SHA-256 checksums, but lacks an automated verification mode (`--verify`) to prove non-destructive dry-run restore integrity.
4. **TypeScript Status**:
   - `cd mobile; npx tsc --noEmit` executed with code 0 (0 errors).

---

## 2. Logic Chain

1. **Session & Auth Flaws**:
   - Observations 1.2 and 1.3 show that `DriverContext.tsx` falls back to `'9876508888'` and `AdminContext.tsx` auto-logs in with `'harharmahadev@1'`.
   - Therefore, neither mobile app respects authentic persistent session state or clean logout teardown.
   - In native React Native, `storage.ts` falls back to in-memory storage because `typeof localStorage === 'undefined'`.
   - Therefore, persistent session tokens are lost upon application reload unless native persistence is employed.
2. **Missing Lifecycle Endpoints**:
   - Search across `api/index.js` revealed zero occurrences of `forgot-password`, `reset-password`, `verify-email`, `send-email-verification`, or `POST /driver/logout`.
   - `services/notification.js` integrates Fast2SMS, MSG91, Twilio, and WhatsApp, but contains no email provider (SendGrid/Resend).
   - Therefore, R1 acceptance criteria for password reset and email verification cannot pass without introducing these endpoints and service integrations.
3. **Data Isolation & Row-Level Security**:
   - Observations 3 show that `GET /passenger/trips` and `GET /driver/earnings` do not check the caller's session token against the requested phone record.
   - Therefore, passengers can view other passengers' bookings, and drivers can view other drivers' earnings, violating R3 acceptance criteria.
4. **Secret Exposure & External API Proxies**:
   - Hardcoded passwords exist in client bundles (`AdminContext.tsx`, `AdminLoginScreen.tsx`, `api.ts`), and Google Maps Routes API is called directly with API keys in `gmapTollService.ts`.
   - Therefore, R3 requirement "Remove all API keys and secret credentials from client bundles, proxying external requests through backend endpoints" is currently breached.

---

## 3. Caveats

- Database connections in local development mode fall back to `data/db.json` when `MONGODB_URI` or `DATABASE_URL` are not active; all tests must ensure fallback JSON stores and MongoDB Atlas behave identically.
- SMS and WhatsApp dispatchers in `services/notification.js` fall back to local console simulation when third-party provider keys are absent; the email verification service must provide equivalent local console simulation for test environments.
- No other caveats.

---

## 4. Conclusion

The backend architecture is structurally sound with an enterprise service layer, high performance, and zero TypeScript compilation errors. However, to meet acceptance criteria for R1 and R3, the following concrete changes must be implemented:
1. **R1 (Authentication & Account Lifecycle)**:
   - Add backend endpoints: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/send-email-verification`, `GET/POST /api/auth/verify-email`, `POST /api/driver/logout`.
   - Integrate an email dispatch service (Resend / SendGrid with console simulation fallback).
   - Require authentication/confirmation on `POST /user/delete-account` and return statutory DPDP Act data erasure confirmation receipts.
   - Remove hardcoded fallbacks and auto-logins in `DriverContext.tsx` and `AdminContext.tsx`; ensure `StorageService` persists sessions across reloads.
2. **R3 (Backend Security & Data Protection)**:
   - Wrap `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, `/auth/send-otp`, and `/bookings` (POST) with `securityService.checkRateLimit`, returning HTTP 429 when thresholds are exceeded.
   - Enforce row-level security on `GET /passenger/trips` (caller must be authenticated as that passenger) and `GET /driver/earnings` (caller must be authenticated as that driver); eliminate `x-driver-phone` bypass.
   - Purge all hardcoded passwords from client files (`AdminContext.tsx`, `AdminLoginScreen.tsx`, `api.ts`, `services/security.js`).
   - Add backend proxy endpoint `POST /api/routes/toll-estimate` so `gmapTollService.ts` never calls Google Maps directly or exposes API keys.
   - Add automated restore verification (`--verify`) to `scripts/backup-db.js` and wire `package.json` scripts (`db:backup`, `db:verify-backup`).

---

## 5. Verification Method

To independently verify these findings:
1. **TypeScript Verification**:
   ```powershell
   cd c:\Users\himan\onewaycabs\mobile
   npx tsc --noEmit
   ```
2. **Secret Scan Verification**:
   Inspect line references in `mobile/apps/admin/src/context/AdminContext.tsx:88`, `mobile/apps/admin/src/screens/AdminLoginScreen.tsx:24`, and `mobile/shared/services/gmapTollService.ts:123`.
3. **Data Leak Inspection**:
   Inspect line references in `api/index.js:2404-2418` (`/passenger/trips`) and `api/index.js:6360-6385` (`/driver/earnings`).
4. **Endpoint Existence Check**:
   Grep `api/index.js` for `/auth/forgot-password`, `/auth/verify-email`, `/driver/logout` to confirm absence.
