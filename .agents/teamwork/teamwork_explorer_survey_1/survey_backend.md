# Comprehensive Backend, Auth, Database & Security Survey Report
**Target Project**: OneWayCabs (`onewaytaxibihar.com`)  
**Investigator**: Explorer 1 (`teamwork_explorer_survey_1`)  
**Scope**: Backend Architecture, Database Schema, APIs, R1 (Auth & Account Lifecycle), R3 (Backend Security & Data Protection)  
**Date**: 2026-10-31  

---

## Executive Summary

The OneWayCabs platform runs a dual-runtime Node.js architecture: a primary serverless REST API router deployed on Vercel (`api/index.js`, ~324 KB, 7,360 lines) with a high-throughput standalone HTTP/Gzip server for local development and non-serverless hosting (`local-server.js`). Data is managed through a multi-tier database service (`services/db.js`) supporting MongoDB Atlas Cloud as the primary persistent data store, PostgreSQL as an alternative SQL engine, an in-memory cache with a 3-second TTL for sub-millisecond query responses, and a local JSON store (`data/db.json` / `/tmp/db.json`).

While core customer OTP verification, direct login, admin RBAC, and dispatch mechanics are operational, critical production-readiness gaps exist in **R1 (Authentication & Account Lifecycle)** and **R3 (Backend Security & Data Protection)**:
1. **R1 Deficiencies**: Mobile storage lacks persistent session survival across app reloads in native environments; Driver and Admin apps possess hardcoded credentials/defaults that disrupt genuine login/logout flows; no password/credential reset workflow exists; no email verification mechanism or external email provider (Resend/SendGrid) exists; account deletion lacks authentication checks and formal erasure confirmation receipts.
2. **R3 Deficiencies**: Sliding-window rate limiting is missing on key auth, login, and booking endpoints; the database backup engine lacks an automated single-command restore verification runner; severe Row-Level Security (RLS) data leaks exist allowing unauthenticated access to passenger trip history and arbitrary driver earnings; client bundles leak production administrative passwords and make direct unproxied calls to Google Maps Routes API.

---

## 1. Backend Architecture & Runtime Environment

### 1.1 Server & API Framework
- **Primary Serverless Gateway**: `api/index.js`
  - Routes are mapped via `vercel.json` rewrites (`{ "source": "/api/:path*", "destination": "/api" }`).
  - Standalone routing is also defined for `/api/health` and `/api/leads`.
  - Request processing handles JSON body parsing, CORS headers, URL routing, query parameter parsing, and centralized error logging to `db.error_logs`.
- **High-Performance Local Server**: `local-server.js` (port 8080)
  - Implements native HTTP server with in-memory buffer caching and pre-gzipped static asset delivery.
  - Forwards all `/api` and `/api/*` requests directly to `apiHandler = require('./api/index.js')`.
  - Built-in traffic spike throttling (returns HTTP 429 when concurrent connections exceed `MAX_CONCURRENT_CONNECTIONS = 1500`).

### 1.2 Multi-Tier Database Layer (`services/db.js`)
- **Supported Engines**:
  - **MongoDB Atlas Cloud**: Initialized via `initMongo()` using connection pool (`maxPoolSize: 50, minPoolSize: 5`), compound indexes across `bookings`, `users`, `drivers`, `leads`, `fares`, `notifications`, and `sessions`.
  - **PostgreSQL**: Initialized via `initPostgres()` using `pg.Pool`, storing document collections in `oneway_documents (collection_name, data JSONB, updated_at)`.
  - **Local/Vercel JSON**: `data/db.json` seeded to `/tmp/db.json` in serverless runtime.
  - **In-Memory Cache**: `memoryDb` hydrated with 3,000ms TTL (`CACHE_TTL_MS`), backed by asynchronous cloud collection synchronization (`syncCollectionToCloud`, `syncToRemoteCloud`).
- **Core Collections** (`ALL_COLLECTIONS` in `services/db.js:15-35`):
  - `bookings`, `drivers`, `driver_applications`, `users`, `vehicles`, `payments`, `wallet_ledger`, `leads`, `notifications`, `coupons`, `audit_logs`, `sessions`, `support_tickets`, `error_logs`, `settings`, `admins`, `fares`, `tourism_packages`, `tourism_bookings`.

### 1.3 Service Modules
| Service | File Path | Current Capabilities |
|---|---|---|
| Database Engine | `services/db.js` | Multi-tier MongoDB/Postgres/JSON caching, indexing, data hygiene |
| Security & RBAC | `services/security.js` | PBKDF2 hashing, JWT signing/verifying (HS256), brute force lockout, sliding-window rate limiting helper, admin OTP, audit logging |
| Notifications | `services/notification.js` | Fast2SMS (Route OTP & Route Q), MSG91, Twilio, WhatsApp Cloud API, WhatsApp deep link generation |
| Payments | `services/payment.js` | Razorpay order creation, HMAC-SHA256 signature verification, webhook processing, UPI QR generator |
| Fares Engine | `services/fares-excel.js` | Dynamic corridor pricing, distance calculations, Bihar district matrices |
| Caching | `services/cache.js` | In-memory key-value cache with TTL |

---

## 2. Requirement R1: Authentication & Account Lifecycle Survey

### 2.1 Persistent Sessions & Login/Logout
#### Existing Implementation:
- **Passenger Auth**:
  - `POST /auth/send-otp` (`api/index.js:861-934`): Generates 6-digit numeric OTP, stores in `activeVerificationCodes` (Map, 10-minute expiry), dispatches via Fast2SMS/MSG91/Twilio.
  - `POST /auth/verify-otp` (`api/index.js:939-1071`): Validates OTP, creates/finds user in `db.users`, awards ₹100 welcome bonus, generates session token `otb_sess_<16 hex bytes>`, stores session in `db.sessions`.
  - `POST /auth/login` (`api/index.js:1076-1184`): Direct login with Name + 10-digit Indian mobile number; generates session token `otb_sess_<hex>`, persists to `db.sessions`.
  - `POST /auth/logout` (`api/index.js:1189-1197`): Removes token from `db.sessions`.
  - `GET /user/profile` (`api/index.js:1202-1217`): Validates session token via `getSessionUser(req, db)`.
- **Driver Auth**:
  - `POST /driver/signup` (`api/index.js:5878-5988`): Creates driver record in `db.drivers` and `db.driver_applications`, creates session token `drv_sess_<hex>`.
  - `POST /driver/login` (`api/index.js:5990-6095`): Accepts `phone` and `pin`; verifies 4-digit PIN against `driver.pin`, default last 4 digits of phone, or `'1234'`. Issues signed JWT with `securityService.createJwt({ driverId, phone, name, role: 'driver' })` and creates session in `db.sessions`.
  - **DEFECT**: There is NO `/driver/logout` endpoint in `api/index.js`!
- **Admin Auth**:
  - `POST /admin/login` (`api/index.js:3358-3454`): Verifies admin username and PBKDF2 password hash using `securityService.verifyPassword`. Generates HS256 JWT, sets `otb_adm_token` cookie, records login attempt.
  - `POST /admin/logout` (`api/index.js:3456-3478`): Clears `otb_adm_token` cookie, removes matching session from `db.sessions`.
- **Mobile Client Session Persistence**:
  - `mobile/shared/services/storage.ts`: Uses `typeof localStorage !== 'undefined'`, which evaluates to `false` in React Native native execution, causing session tokens to store in an ephemeral in-memory dictionary that disappears upon app reload.
  - `mobile/apps/driver/src/context/DriverContext.tsx:108`:
    ```typescript
    const savedPhone = (await StorageService.getItem('otb_driver_phone')) || '9876508888';
    ```
    Because of `|| '9876508888'`, whenever a driver logs out or launches on first install, the app auto-logs into a dummy driver account.
  - `mobile/apps/admin/src/context/AdminContext.tsx:86-94`:
    ```typescript
    if (!storedAdmin || !token) {
      try {
        const authRes = await MobileApiClient.adminLogin('admin', 'harharmahadev@1');
    ```
    The admin mobile app automatically logs into production with hardcoded credentials `'harharmahadev@1'` whenever a session is absent!
  - `AdminContext.tsx:143-147`: Admin logout only removes local storage keys without calling `/admin/logout` on the backend, and upon subsequent app launch, auto-logs back in.

#### Required Implementations for R1.1:
1. **Backend**:
   - Add `POST /api/driver/logout` (or update `/auth/logout` to support all roles) to revoke driver JWT tokens and clear driver sessions from `db.sessions`.
   - Implement `db.revoked_tokens` list in `services/db.js` and `services/security.js` so that logged-out JWT tokens are immediately blocked from `getSessionAdmin` and `getSessionDriver` before their 8-hour expiry.
2. **Mobile Persistence**:
   - Update `mobile/shared/services/storage.ts` to utilize persistent native storage (e.g., using `expo-secure-store` or `@react-native-async-storage/async-storage` or file-system-backed persistence) so sessions survive app reload.
   - Fix `mobile/apps/driver/src/context/DriverContext.tsx`: Remove fallback `'9876508888'`. Validate `otb_auth_token` against `/driver/trips` or `/driver/profile`. If missing or invalid, set `isLoggedIn: false` and navigate to `DriverAuthScreen`.
   - Fix `mobile/apps/admin/src/context/AdminContext.tsx`: Completely remove auto-login with `'harharmahadev@1'`. Show `AdminLoginScreen` when unauthenticated.
   - Update `logout()` in all three mobile apps to make an asynchronous call to the backend invalidation endpoint before clearing client-side tokens.

---

### 2.2 Password & Credential Reset Workflow
#### Current State:
- **MISSING**: There is currently no password reset or PIN reset endpoint for unauthenticated users in `api/index.js`.
- The only password-related endpoint is `/admin/change-password` (`api/index.js:4888`), which requires the caller to already be authenticated as an admin.
- Neither Passenger, Driver, nor Admin apps have a "Forgot Password" or "Reset PIN" backend flow.

#### Required Implementations for R1.2:
1. **Database Schema**:
   - Add collection/field `password_resets` in `services/db.js`:
     ```json
     {
       "id": "rst_9876543210_1730000000",
       "phone": "9876543210",
       "role": "passenger" | "driver" | "admin",
       "otpHash": "<sha256>",
       "resetToken": "<crypto_hex>",
       "expiresAt": "<timestamp_iso>",
       "attempts": 0,
       "used": false
     }
     ```
2. **Backend Endpoints to Add**:
   - `POST /api/auth/forgot-password`:
     - Parameters: `{ phone: string, role?: 'passenger' | 'driver' | 'admin' }`.
     - Validates phone; checks user/driver/admin existence.
     - Enforces sliding-window rate limiting (max 3 requests per 15 minutes).
     - Generates 6-digit cryptographic OTP and unique reset token (`crypto.randomBytes(24).toString('hex')`).
     - Dispatches OTP via `notificationService.sendSms` (and email if associated).
     - Returns `{ success: true, message: 'Reset OTP sent to your registered mobile number', resetToken: string }`.
   - `POST /api/auth/reset-password`:
     - Parameters: `{ phone: string, otp: string, resetToken: string, newPassword?: string, newPin?: string, role?: string }`.
     - Validates OTP and reset token against `password_resets` record within 10-minute validity.
     - If role is `driver`: updates `driver.pin = newPin` in `db.drivers`.
     - If role is `admin`: updates `admin.passwordHash = hashPassword(newPassword, salt)` in `db.admins`.
     - If role is `passenger`: updates customer credentials in `db.users`.
     - Marks reset token as `used: true`, burns active OTP, purges all active sessions in `db.sessions` for that phone.
     - Records entry in `db.audit_logs`.
     - Returns `{ success: true, message: 'Credentials updated successfully. Please log in with your new credentials.' }`.

---

### 2.3 Email Verification & External Email Service Integration
#### Current State:
- **MISSING**: No email verification endpoints exist in `api/index.js`.
- `services/notification.js` only integrates SMS (Fast2SMS, MSG91, Twilio) and WhatsApp Cloud API; it has zero email provider capabilities.
- `db.users` records include an optional `email` string, but lack `isEmailVerified`, `emailVerificationToken`, or `emailVerifiedAt`.

#### Required Implementations for R1.3:
1. **Email Service Integration**:
   - Create `services/email.js` (or extend `services/notification.js`) supporting **Resend** or **SendGrid** via standard HTTPS REST calls:
     - **Resend**: `POST https://api.resend.com/emails` with `Authorization: Bearer process.env.RESEND_API_KEY`.
     - **SendGrid**: `POST https://api.sendgrid.com/v3/mail/send` with `Authorization: Bearer process.env.SENDGRID_API_KEY`.
     - Provide development/local simulation fallback: returns `{ success: true, isSimulated: true, provider: 'local_console' }` with token/link logged to server console when API keys are absent.
     - Include branded HTML email templates for Email Verification and Password Reset.
2. **Backend Endpoints to Add**:
   - `POST /api/auth/send-email-verification`:
     - Requires authenticated user session (or `{ phone, email }`).
     - Validates email format (`^[^\s@]+@[^\s@]+\.[^\s@]+$`).
     - Generates 32-byte cryptographic token (`emv_<hex>`) with 24-hour expiration.
     - Updates user record with `emailVerificationToken`, `emailVerificationExpiresAt`.
     - Sends verification link (e.g., `https://onewaytaxibihar.com/verify-email?token=...`) and 6-digit numeric verification code via email service.
     - Returns `{ success: true, message: 'Verification email dispatched' }`.
   - `POST /api/auth/verify-email` and `GET /api/auth/verify-email`:
     - Accepts `{ token: string }` or query parameter `?token=...`.
     - Validates token and checks expiry.
     - Updates user record: `isEmailVerified = true`, `emailVerifiedAt = new Date().toISOString()`, `emailVerificationToken = null`.
     - Returns `{ success: true, message: 'Email address verified successfully!', isEmailVerified: true }`.
   - `GET /api/auth/email-verification-status`:
     - Accepts authenticated session, returns `{ isEmailVerified: boolean, email: string }`.

---

### 2.4 Self-Service Account Deletion & Data Erasure Confirmation
#### Existing Implementation:
- `POST /user/delete-account` (`api/index.js:1222-1260`): Sets `u.name = 'Deleted User'`, `u.isDeleted = true`, removes sessions, records audit log.
- `POST /driver/delete-account` (`api/index.js:6390-6425`): Sets `d.dutyStatus = 'OFF_DUTY'`, `d.isDeleted = true`, removes sessions, records audit log.

#### Deficiencies:
- **SECURITY FLAW**: Neither endpoint requires authentication! Any unauthorized actor can submit `{ phone: "target_phone", reason: "delete" }` and mark another user's or driver's account as deleted.
- No verification/confirmation step (e.g., re-authentication or OTP verification).
- No structured erasure confirmation certificate/receipt with statutory DPDP Act compliance reference.
- Does not sanitize location trails or anonymize historical booking references.

#### Required Implementations for R1.4:
1. **Authentication Enforcement**:
   - Require valid Bearer token matching the user/driver, or require OTP verification (`{ phone, otp, reason }`) before initiating deletion.
2. **Comprehensive Erasure Workflow**:
   - Anonymize user records (`name = 'Anonymized User'`, `email = null`, `phone = 'DELETED_' + randomId`).
   - Purge active sessions from `db.sessions`.
   - Purge live GPS coordinates and location records.
   - Anonymize customer identifiers in non-financial logs.
   - Generate unique cryptographic data erasure confirmation certificate:
     ```json
     {
       "success": true,
       "confirmationCode": "DPDP-DEL-2026-981240",
       "phoneMasked": "+91 ******4210",
       "erasureTimestamp": "2026-10-31T14:00:00.000Z",
       "erasedDataCategories": ["profile_identifiers", "auth_sessions", "gps_breadcrumbs", "contact_info"],
       "retainedForStatutoryTaxCompliance": ["tax_invoices_anonymized"],
       "message": "Account deleted and personal data irreversibly erased under DPDP Act 2023."
     }
     ```

---

## 3. Requirement R3: Backend Security & Data Protection Survey

### 3.1 Sliding-Window Rate Limiting (HTTP 429)
#### Existing Implementation:
- `services/security.js:250-265` contains a timestamp-based sliding-window implementation:
  ```javascript
  function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const key = String(identifier || 'unknown');
    const now = Date.now();
    let timestamps = rateLimitMap.get(key) || [];
    timestamps = timestamps.filter(t => now - t < windowMs);
    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, retryAfter };
    }
    timestamps.push(now);
    rateLimitMap.set(key, timestamps);
    return { allowed: true, retryAfter: 0 };
  }
  ```
- **Current Coverage Gap**:
  - `/auth/login` (passenger direct login): **NO RATE LIMITING**.
  - `/auth/verify-otp`: **NO RATE LIMITING** on endpoint calls (only an internal 5-attempt counter on the verification code itself).
  - `/driver/login`: **NO RATE LIMITING**.
  - `/driver/signup`: **NO RATE LIMITING**.
  - `/bookings` (POST): **NO RATE LIMITING** (only 15-second duplicate booking deduplication).
  - `/auth/send-otp`: Uses fixed-window `checkOtpRateLimit` mapped solely by phone number, vulnerable to IP-based bot flooding.

#### Required Implementations for R3.1:
1. Apply `securityService.checkRateLimit` systematically across all critical entry points:
   - **Auth Endpoints** (`/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, `/admin/login`):
     - Window: 60 seconds. Limit: 10 requests per `ip + '_' + action`.
     - Additional account-level lockouts via `securityService.checkBruteForce`.
   - **OTP Endpoints** (`/auth/send-otp`, `/admin/send-whatsapp-otp`, `/auth/forgot-password`):
     - Window: 60 seconds. Limit: 3 requests per phone.
     - Window: 600 seconds (10 min). Limit: 5 requests per IP.
   - **Booking Creation** (`/bookings` POST, `/rides` POST, `/tourism/book` POST):
     - Window: 60 seconds. Limit: 10 requests per `ip + '_' + cleanPhone`.
2. Standard HTTP 429 Response:
   ```javascript
   if (!rateLimit.allowed) {
     res.setHeader('Retry-After', String(rateLimit.retryAfter));
     return sendJson(429, {
       success: false,
       error: 'Too Many Requests',
       message: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds before trying again.`,
       retryAfter: rateLimit.retryAfter
     });
   }
   ```

---

### 3.2 Database Backup Snapshot Management & Automated Restore Verification
#### Existing Implementation:
- `scripts/backup-db.js`:
  - Dumps database to `data/backups/snapshot-<timestamp>/database-dump.json`.
  - Calculates SHA-256 hash in `checksum.sha256`.
  - Generates `manifest.json` with collection summaries and `latest-snapshot.json`.
- `scripts/restore-db.js`:
  - Validates `checksum.sha256` against `database-dump.json`.
  - Deserializes snapshot and calls `dbService.saveDbAsync(restoredDb)`.

#### Deficiencies:
- **No Automated Restore Verification Routine**: The backup script executes creation, but does not autonomously execute a non-destructive verification pass (dry-run parse, schema check, and in-memory restore validation) to certify that the created snapshot is 100% restorable.
- **Missing NPM Scripts**: Neither `package.json` nor automation scripts expose a standardized `npm run db:backup` or `npm run db:verify-backup` command.

#### Required Implementations for R3.2:
1. Extend `scripts/backup-db.js` with an automated verification flag (`--verify` or default execution):
   - Immediately upon snapshot creation:
     - Verify file readability and byte count > 0.
     - Recompute SHA-256 and confirm zero checksum discrepancy.
     - Validate JSON syntax and required collection schemas (`bookings`, `drivers`, `users`, `fares`).
     - Execute a dry-run in-memory restore test to verify that the snapshot hydrates all records without schema collisions.
   - Outputs:
     ```
     [Backup Verification] 🛡️ Validating snapshot integrity...
     [Backup Verification] ✅ Checksum match: SHA-256 verified.
     [Backup Verification] ✅ Payload integrity: 19 collections validated.
     [Backup Verification] ✅ Dry-run restore test: 100% passed without errors.
     ```
2. Add NPM commands in `package.json`:
   - `"db:backup": "node scripts/backup-db.js"`
   - `"db:verify-backup": "node scripts/backup-db.js --verify"`
   - `"db:restore": "node scripts/restore-db.js"`

---

### 3.3 Row-Level Security (RLS) & Data Isolation
#### Identified Severe Security Leaks:
1. **Unauthenticated Passenger Trip Leak** (`api/index.js:2404-2418`):
   ```javascript
   if ((pathname === '/passenger/trips' || pathname === '/bookings/by-phone') && method === 'GET') {
     const phone = (url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);
     const matching = (db.bookings || []).filter(b => ...);
     return sendJson(200, { success: true, count: matching.length, bookings: matching });
   }
   ```
   **Vulnerability**: Any anonymous caller can query ANY customer's complete booking history by passing `?phone=<target_number>` without any token or credential!
2. **Arbitrary Driver Earnings Leak** (`api/index.js:6360-6385`):
   ```javascript
   if (pathname === '/driver/earnings' && (method === 'GET' || method === 'POST')) {
     const driverAuth = getSessionDriver(req, db);
     const phoneParam = url.searchParams.get('phone') || body.phone;
     const cleanPhone = (phoneParam || (driverAuth?.driver?.phone) || '').replace(/\D/g, '').slice(-10);
     const driver = (db.drivers || []).find(d => ...);
     ...
     return sendJson(200, { success: true, earnings: ... });
   }
   ```
   **Vulnerability**: An unauthenticated user or competing driver can pass `?phone=<other_driver>` and view their full daily and weekly payout earnings and completed trips!
3. **Driver Auth Impersonation Bypass** (`api/index.js:729-742`):
   ```javascript
   let phoneParam = body?.phone || req.headers['x-driver-phone'];
   ...
   if (phoneParam) {
     const clean = String(phoneParam).replace(/\D/g, '').slice(-10);
     const driver = (db.drivers || []).find(d => ...);
     if (driver) return { driver, session: { role: 'driver', driverId: driver.id } };
   }
   ```
   **Vulnerability**: Any request providing header `x-driver-phone: <number>` is automatically authenticated as that driver without token or cryptographic signature verification!

#### Required Implementations for R3.3:
1. **Passenger Isolation**:
   - Enforce `getSessionUser(req, db)` on `/passenger/trips` and `/bookings/by-phone`.
   - Ensure `cleanUserPhone === auth.user.phone.replace(/\D/g, '').slice(-10)`.
   - If an unauthenticated user or a different user attempts to access another passenger's phone data, return HTTP 403 Forbidden.
2. **Driver Earnings Isolation**:
   - Enforce `getSessionDriver(req, db)` on `/driver/earnings`.
   - Disallow querying another driver's phone. The earnings MUST strictly be computed for `driverAuth.driver.id`.
   - Remove the unauthenticated `x-driver-phone` header fallback from `getSessionDriver`. Require valid JWT or session token.
3. **Admin Scope Isolation**:
   - Only authenticated admin tokens verified with `getSessionAdmin(req, db)` with roles `'owner'`, `'admin'`, `'manager'`, or `'accounts'` can access cross-fleet ledgers (`/admin/bookings`, `/admin/payments`, `/admin/wallet-ledger`).

---

### 3.4 Secret Audit & Backend Proxy Requirements
#### Identified Secret Leaks in Client Bundles:
1. `mobile/apps/admin/src/context/AdminContext.tsx:88-89`:
   - Hardcoded master password `'harharmahadev@1'` embedded in client bundle for automatic login.
2. `mobile/apps/admin/src/screens/AdminLoginScreen.tsx:24, 52-53`:
   - Pre-populated password state `setPassword('harharmahadev@1')` and demo login handler.
3. `mobile/shared/services/api.ts:612`:
   - Hardcoded password check `password === 'harharmahadev@1' || password === 'admin123'` providing mock admin tokens on the client.
4. `mobile/shared/services/gmapTollService.ts:123-154`:
   - Direct client-side invocation of `https://routes.googleapis.com/directions/v2:computeRoutes` referencing `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` or `GOOGLE_MAPS_API_KEY`.

#### Required Implementations for R3.4:
1. **Purge Client-Side Secrets**:
   - Remove all occurrences of `'harharmahadev@1'` and `'admin123'` from `AdminContext.tsx`, `AdminLoginScreen.tsx`, and `api.ts`.
   - Remove client references to `GOOGLE_MAPS_API_KEY` and `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
2. **Backend Proxy Endpoint**:
   - Create `POST /api/routes/toll-estimate` in `api/index.js`:
     - Accepts `{ origin: string, destination: string, distanceKm: number }`.
     - Validates input.
     - Calls Google Maps Routes API from the backend using server environment variable `GOOGLE_MAPS_API_KEY`.
     - Selects higher toll among alternative routes, falling back to authoritative NHAI Bihar matrix.
     - Returns `{ tollAmount: number, source: string, higherPriceTollApplied: true }`.
   - Update `mobile/shared/services/gmapTollService.ts` to call `/api/routes/toll-estimate` through `MobileApiClient.request()`, ensuring client bundles contain zero external API keys.

---

## 4. Comprehensive File and Line-of-Interest Inventory

| File Path | Lines | Category | Current Status & Necessary Modification |
|---|---|---|---|
| `api/index.js` | 648–658 | Auth | `getSessionUser`: add session expiry check and revoked token validation |
| `api/index.js` | 660–710 | Auth | `getSessionAdmin`: enforce revoked token check via `db.revoked_tokens` |
| `api/index.js` | 712–744 | Security / RLS | `getSessionDriver`: REMOVE insecure `x-driver-phone` header fallback |
| `api/index.js` | 861–934 | R1 / R3 | `POST /auth/send-otp`: replace fixed-window rate limit with sliding-window IP+phone limit |
| `api/index.js` | 939–1071 | R1 / R3 | `POST /auth/verify-otp`: add sliding-window rate limit (HTTP 429) |
| `api/index.js` | 1076–1184 | R1 / R3 | `POST /auth/login`: add sliding-window rate limit (HTTP 429) |
| `api/index.js` | 1189–1197 | R1 | `POST /auth/logout`: add revoked token tracking |
| `api/index.js` | 1222–1260 | R1 | `POST /user/delete-account`: require authentication/confirmation; return formal confirmation receipt |
| `api/index.js` | New Endpoint | R1 | Add `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` |
| `api/index.js` | New Endpoint | R1 | Add `POST /api/auth/send-email-verification` and `GET/POST /api/auth/verify-email` |
| `api/index.js` | New Endpoint | R1 | Add `POST /api/driver/logout` |
| `api/index.js` | New Endpoint | R3 | Add `POST /api/routes/toll-estimate` (proxy for Google Maps Routes API) |
| `api/index.js` | 1972–2370 | R3 | `POST /bookings`: add sliding-window rate limit (10 requests/min per IP/user) |
| `api/index.js` | 2404–2418 | R3 / RLS | `GET /passenger/trips`: enforce `getSessionUser`, restrict to authenticated phone |
| `api/index.js` | 5878–5988 | R3 | `POST /driver/signup`: add sliding-window rate limit |
| `api/index.js` | 5990–6095 | R3 | `POST /driver/login`: add sliding-window rate limit |
| `api/index.js` | 6360–6385 | R3 / RLS | `GET /driver/earnings`: enforce `getSessionDriver`, restrict strictly to own driver ID |
| `services/security.js` | 61–85 | Security | Remove hardcoded fallback password `'harharmahadev@1'`; rely solely on hashed credentials |
| `services/security.js` | 250–265 | R3 | `checkRateLimit`: enhance with key prefixing and sliding window helper |
| `services/notification.js` | 1–294 | R1 | Add email dispatch integration (`sendEmail` supporting Resend/SendGrid + console simulation) |
| `scripts/backup-db.js` | 1–82 | R3 | Add automated restore verification check and `--verify` option |
| `scripts/restore-db.js` | 1–70 | R3 | Restore validation routine |
| `package.json` | 8–14 | R3 | Add scripts: `db:backup`, `db:verify-backup`, `db:restore` |
| `mobile/shared/services/storage.ts` | 1–60 | R1 | Ensure reliable persistent storage in native React Native/Expo runtime |
| `mobile/shared/services/api.ts` | 610–625 | Security | Purge hardcoded credentials (`harharmahadev@1`, `admin123`) from mock fallbacks |
| `mobile/shared/services/gmapTollService.ts` | 122–192 | Security | Remove direct client-side Google Maps call; proxy through `/api/routes/toll-estimate` |
| `mobile/apps/admin/src/context/AdminContext.tsx` | 86–94 | R1 / Security | Remove auto-login with hardcoded `'harharmahadev@1'`; handle unauthenticated state cleanly |
| `mobile/apps/admin/src/context/AdminContext.tsx` | 143–147 | R1 | Call backend `POST /api/admin/logout` on logout |
| `mobile/apps/admin/src/screens/AdminLoginScreen.tsx` | 24, 52–53 | Security | Remove pre-filled password `'harharmahadev@1'` and demo quick-fill |
| `mobile/apps/driver/src/context/DriverContext.tsx` | 108 | R1 | Remove default fallback `'9876508888'`; enforce real login persistence |
| `mobile/apps/driver/src/context/DriverContext.tsx` | 258–269 | R1 | Call backend `POST /api/driver/logout` on logout |

---

## 5. Architectural Verification & Zero-Regression Roadmap

1. **TypeScript Compilation Integrity**:
   - `mobile/` monorepo currently compiles with **0 TypeScript errors** (`npx tsc --noEmit` exited code 0).
   - Any modifications to mobile contexts, screens, or `MobileApiClient` must preserve 100% type safety.
2. **Backward Compatibility**:
   - Web portals (`admin.html`, `passenger.html`, `driver.html`, `booking.html`) continue to function without breaking existing checkout or booking confirmation logic.
   - Database backwards compatibility is maintained across MongoDB Atlas, Postgres, and local JSON mirror.
3. **Automated Acceptance Test Alignment**:
   - Tests in `tests/test-all-acceptance.ps1` and new acceptance test suites will verify:
     - Real persistent login & logout teardown across all 3 apps.
     - Forgot-password OTP issuing & credential updating.
     - Email verification token generation & status update.
     - Self-service account deletion confirmation.
     - HTTP 429 sliding-window rate limit enforcement on Auth, OTP, and Bookings.
     - Database backup generation and automated restore verification.
     - RLS rejection of unauthorized cross-user bookings and driver earnings.
     - Zero private API keys or secrets in client bundles.
