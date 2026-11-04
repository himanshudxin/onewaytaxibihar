# Project: OneWayTaxiBihar - Market Ready V2 Implementation

## Non-Negotiable Rules
1. **Safety First**: Safety backup snapshot preserved at `data/backups/pre-hardening-1793455570676`.
2. **Zero Invalidation**: Do not break existing API endpoints, admin workflows, or fare matrices.
3. **No Over-Engineering**: Fix bugs, harden security, add missing glue code, and polish edge cases. Do NOT refactor working modules.
4. **Strict Order of Execution**: P0 → P1 → P2 → P3. (Do not proceed to the next phase without verifying the previous phase).

## Architecture
- **Web Platform**: Vanilla HTML5/CSS3/ES6 Multi-Page Application served via `local-server.js` and `vercel.json`/Netlify.
- **Backend API**: Unified Node.js serverless REST router in `api/index.js` routed via `local-server.js` and Vercel serverless rewrites.
- **Database & Data Store**: Multi-tier architecture in `services/db.js` supporting MongoDB Atlas Cloud, PostgreSQL, and local/memory fallback `data/db.json`.
- **Mobile Platform**: Expo SDK 58 React Native monorepo with 3 distinct client applications:
  - `mobile/apps/passenger` (Passenger Mobile App)
  - `mobile/apps/driver` (Driver Mobile App)
  - `mobile/apps/admin` (Fleet Admin Mobile App)
  - `mobile/shared` (Shared UI components, context providers, services, models, utils)
- **Deployment Strategy**: APK-First (Play Store Independent) with self-hosted internal in-app update mechanism.

## Feature Inventory (19 Readiness Criteria + Market-Ready V2 Requirements)
| # | Feature | Description | Phase | Source |
|---|---------|-------------|-------|--------|
| 1 | Automated DB Backups & Restore Test | Automated MongoDB backups + retention + `npm run db:restore-test` non-destructive test | P0 | P0 Brief & R3 AC 2 |
| 2 | IDOR Protection & Data Isolation | Auth middleware on passenger, driver, admin APIs (own PNRs, profiles, wallet logs) | P0 | P0 Brief & R3 AC 3 |
| 3 | Sliding-Window Rate Limiting | Rate limit on Auth/OTP, booking creation, payment webhooks, driver location pings | P0 | P0 Brief & R3 AC 1 |
| 4 | Environment Isolation | Strict `.env` validation on server boot | P0 | P0 Brief & R3 |
| 5 | Live Razorpay & Webhook Resilience | Live key switching, ₹1 real transaction, robust `x-razorpay-signature`, idempotency | P0 | P0 Brief & Payment |
| 6 | End-to-End Lifecycle Smoke Test | Complete test: Booking ➔ Fare ➔ Dispatch ➔ Accept ➔ OTP ➔ Track ➔ Complete ➔ Settle ➔ Wallet | P0 | P0 Brief & AC |
| 7 | Auth Lifecycle Endpoints | Forgot password, reset password, email verification, DPDP Act account deletion receipt | P0 | R1 AC 1-5 |
| 8 | Self-Hosted APK Update Engine | `GET /api/v1/app/version-check`, Admin V2 Release Tab, in-app banner/forced modal, APK download | P1 | P1 Brief |
| 9 | Driver APK Core Resiliency | Background GPS task, 30s audio offer timer, duty ON/OFF persistence, persistent session | P1 | P1 Brief & R1 |
| 10 | Passenger APK Resiliency | WhatsApp button, direct agent call, PNR status screen, copyable PNR, PDF invoice | P1 | P1 Brief & R2 |
| 11 | Mobile Safe Areas & 404 Fallback | Safe areas across iOS notch/dynamic island & Android bars; mobile NotFound screen | P1 | R4 AC 1, 2 |
| 12 | Automated Booking Dispatch Algorithm | Active online drivers in 15-30km radius, vehicle category filter, 30s priority cascade, admin fallback | P2 | P2 Brief |
| 13 | Driver Wallet & Settlement Flow | Fare - Commission - Taxes = Driver Credit; payout request ➔ admin confirmation ➔ balance deduction | P2 | P2 Brief |
| 14 | Real-Time GPS Tracking & Dynamic ETA | WebSocket/Firebase fallback, movement marker, dynamic ETA calculations | P3 | P3 Brief |
| 15 | Automated Notification Pipeline | SMS gateway + WhatsApp Cloud API hooked to lifecycle events | P3 | P3 Brief |
| 16 | UX Feedback States & Form Validators | Loading skeletons, empty states, error toasts, strict form validators (mobile/shared) | P3 | R2 AC 1-4 |
| 17 | Web 404 Fallback & Telemetry | Netlify 404 rule, GA4 on all pages, Sentry/client error & breadcrumb tracking | P3 | R4 AC 2, R5 AC 1, 2 |
| 18 | In-App & Web Legal Compliance | Dedicated in-app Privacy Policy & Terms of Service screens, web footer links | P3 | R5 AC 3 |
| 19 | Client Bundle Secret Hygiene | Zero private secrets in client bundles; proxy external APIs (Google Maps Routes) | P0-P3 | R3 AC 4 |
| 20 | Zero-Error E2E Test Verification | 100% test pass on all 19 readiness checks with 0 TypeScript compilation errors (`npx tsc --noEmit`) | P3/Final | Acceptance Criteria |

## Execution Pipeline (Strict Order: P0 → P1 → P2 → P3)

| Phase | Name | Scope | Dependencies | Status |
|-------|------|-------|-------------|--------|
| **P0** | Production Hardening & Stability (Critical Blockers) | DB backup & restore-test, IDOR middleware, rate limiting, .env validation, Razorpay webhook resilience, auth lifecycle, E2E smoke test script | none | DONE |
| **P1** | APK-First Ecosystem & In-App Updater | Version-check API, Admin Release Management, APK update modal, driver background GPS & 30s timer, passenger PNR/WhatsApp/invoice, safe areas | P0 | DONE |
| **M-REDESIGN** | Passenger Mobile App Redesign (Master Prompt) | Complete redesign of Screens A-J, 5-tab bottom navigation, yellow/white palette, brand logo preservation, 5 fleet tiers, interactive visual preview | P0 | DONE |
| **P2** | Automated Dispatch & Driver Wallet | 15-30km radius cascade dispatch algorithm, driver wallet credit/debit/payout admin settlement | P1 | PLANNED |
| **P3** | GPS Reliability, Telemetry, Legal & Final Verification | Real-time tracking/ETA, notification pipeline, UX feedback & form validation, telemetry/legal, 100% E2E test pass with 0 TS errors | P2 | PLANNED |

## Interface Contracts

### 1. P0 Contracts
- `npm run db:restore-test`: Non-destructive dry-run restore verifying snapshot integrity, SHA-256 checksums, and table records.
- `GET /passenger/trips`: Auth token required; caller can only query own phone records. Cross-phone access returns HTTP 403.
- `GET /driver/earnings`: Auth token required; caller can only query own driver records. Cross-driver access returns HTTP 403.
- Sensitive Rate Limiting: `/auth/login`, `/auth/verify-otp`, `/driver/login`, `/driver/signup`, `/bookings`, `/auth/send-otp`, `/payment/webhook`, `/driver/location` return HTTP 429 when thresholds are exceeded.
- Webhook signature: `POST /api/payment/webhook` validates `x-razorpay-signature` with idempotency cache preventing duplicate event processing.

### 2. P1 Contracts (APK Updater & Polish)
- `GET /api/v1/app/version-check?app=passenger|driver&version=x.x.x` -> Returns:
  ```json
  {
    "latestVersion": "1.2.0",
    "minSupportedVersion": "1.0.0",
    "downloadUrl": "https://onewaytaxibihar.com/downloads/passenger-latest.apk",
    "forceUpdate": false,
    "releaseNotes": "Performance improvements and live tracking fixes"
  }
  ```
- Admin V2 "App Release Management" tab to view/update release records.

### 3. P2 Contracts (Dispatch & Wallet)
- Dispatch Cascade: `POST /api/dispatch/auto-assign` checks active drivers within 15-30km radius matching vehicle category; cascades 30s offer to top candidate, falling back to next driver or Admin alert.
- Driver Wallet: `POST /api/driver/wallet/payout-request` creates payout request; `POST /api/admin/wallet/payout-approve` marks as paid and deducts balance with immutable transaction log.

### 4. P3 Contracts (GPS & Notifications)
- `POST /api/driver/location/ping`: Stores last known location and broadcasts to active passenger tracking channel.
- Notification dispatch hooks for booking confirmed, driver assigned, OTP verified, trip completed.

## Code Layout
- Backend & Server:
  - `api/index.js`: Primary serverless API router (IDOR middleware, rate limiting, auth endpoints, Razorpay webhook, version-check API, dispatch & wallet)
  - `services/security.js`: Rate limiting, secret handling, webhook signature validation
  - `services/notification.js`: Email, SMS, WhatsApp dispatch pipeline
  - `services/db.js`: Database connections, schema, and backups
  - `scripts/backup-db.js`: Backup snapshot and `npm run db:restore-test` script
- Web Portal:
  - Root `*.html`: `passenger.html`, `driver.html`, `admin.html`, `404.html` (analytics, error tracker, legal links)
  - `_redirects`: Netlify 404 routing rule
- Mobile Apps:
  - `mobile/shared/services/storage.ts`: Native persistent session storage
  - `mobile/shared/services/updater.ts`: Self-hosted APK version check and update installer
  - `mobile/shared/utils/formatters.ts`: Form input validation & error formatting
  - `mobile/shared/components/NotFoundScreen.tsx`: Universal 404 screen
  - `mobile/shared/screens/PrivacyPolicyScreen.tsx`: In-app Privacy Policy
  - `mobile/shared/screens/TermsOfServiceScreen.tsx`: In-app Terms of Service
  - `mobile/apps/admin/src/screens/*`: Refactored with `SafeAreaView` + App Release tab
  - `mobile/apps/driver/src/`: Background GPS, 30s offer timer, duty persistence
  - `mobile/apps/passenger/src/`: PNR status screen, WhatsApp button, PDF invoice
- Testing:
  - `tests/e2e-readiness.test.js`: Complete 19-requirement automated verification suite
  - `tests/smoke-lifecycle.test.js`: P0 complete lifecycle integration test
  - `tests/verify-all-19-readiness.ps1`: End-to-end PowerShell verification script
