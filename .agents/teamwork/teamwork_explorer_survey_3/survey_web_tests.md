# Comprehensive Survey: Web Platform, Testing Infrastructure, Telemetry & Legal Compliance

**Date**: 2026-10-31  
**Author**: Explorer 3 (`teamwork_explorer_survey_3`)  
**Scope**: Web Portal Architecture, R4 Web Fallbacks (Custom 404), R5 Telemetry (Analytics & Error Tracking), R5 Legal Compliance, Testing Infrastructure & E2E Acceptance Criteria (All 19 checks + TypeScript 0 errors).

---

## Executive Summary

1. **Web Portal Architecture**: The web portal is a high-performance native **HTML5 / CSS3 / Vanilla ES6 Multi-Page Application (MPA)** with micro-frontends (`passenger.html`, `driver.html`, `admin.html`, `booking.html`, `cabs.html`, `fare-chart.html`, `payment.html`, etc.). It is served by a custom Node.js server (`local-server.js`) locally and statically routed via Vercel (`vercel.json`) and Netlify (`_redirects`, `netlify.toml`). **It is NOT Next.js, Vite, or a React SPA on the web**; the React/TypeScript stack is strictly located in `mobile/` (React Native Expo SDK 58).
2. **R4 Web Fallback (404 Page)**: A standalone `404.html` exists and is properly served by `local-server.js` (lines 185–195) and Vercel. However, `_redirects` line 37 rewrites `/*` to `/index.html 200`, causing invalid URLs on Netlify to return 200 with index.html instead of 404. Furthermore, `404.html` lacks analytics/telemetry tracking, and mobile navigators lack a fallback `NotFoundScreen`.
3. **R5 Telemetry (Analytics)**: `js/analytics.js` configures Google Analytics 4 (`G-1YTK7M3FS3`), but it is omitted from `passenger.html`, `driver.html`, `admin.html`, and `404.html`. Mobile (`mobile/`) has **zero analytics code**. Key user milestones (auth login/logout/signup, password reset, account deletion, verification) are not tracked.
4. **R5 Telemetry (Error Tracking)**: **100% missing across the entire codebase**. There is no client exception capture, no `window.onerror` / `unhandledrejection` handlers on web, no React `ErrorBoundary` on mobile, no breadcrumb ring buffer, and no external provider adapter (Sentry).
5. **R5 Legal Compliance**: Web has `privacy-policy.html` and `terms-of-service.html` at root, linked in `index.html`. However, `passenger.html`, `driver.html`, and `admin.html` have **no footer links** to legal pages. Mobile apps lack dedicated native in-app screens (passenger only opens external Safari/Chrome URLs, while driver and admin have zero links).
6. **Testing & TypeScript Compilation**: 
   - `npx tsc --noEmit` across `mobile/tsconfig.json` and all 3 app configs (`mobile/apps/passenger/tsconfig.json`, `mobile/apps/driver/tsconfig.json`, `mobile/apps/admin/tsconfig.json`) compiles with **0 errors**.
   - Root lacks a `tsconfig.json` and TypeScript binary, which causes naked `npx tsc` at root to hang prompting for package installation.
   - Designed a unified automated E2E test runner executing all 19 production readiness criteria with Node 24 native runner (`node --test`) and PowerShell (`verify-all-19-readiness.ps1`).

---

## 1. Web Portal Architecture & Routing

### 1.1 Architecture Type & Technology Stack
- **Web Frontend**: Native HTML5, modern CSS3 (with CSS custom variables and theme switcher in `css/style.css`, `css/components.css`, `css/voyago-theme.css`), and Vanilla JavaScript (ES6+).
- **Mobile Frontend**: React Native `0.88.0` / Expo SDK `58.0.0` with TypeScript `6.0.3` and React `19.3.0` located in `mobile/apps/{passenger, driver, admin}`.
- **Backend API**: Node.js serverless REST handler (`api/index.js`, 7360 lines) backed by services (`services/db.js`, `services/security.js`, `services/notification.js`, `services/payment.js`, `services/cache.js`, `services/fares-excel.js`, `services/booking-state.js`, `services/dispatch.js`).

### 1.2 Routing Mechanics
| Hosting Environment | Routing Mechanism | Configuration File | Behavior |
| :--- | :--- | :--- | :--- |
| **Local Development** | Native Node.js HTTP server | `local-server.js` | Direct static file serving with in-memory caching and gzip; clean URL `.html` resolution (e.g. `/passenger` -> `/passenger.html`). Routes `/api/*` to `api/index.js`. |
| **Vercel Cloud** | Serverless functions & rewrites | `vercel.json` | 48 rewrites mapping `/api/*` to serverless handlers and clean URLs to `.html` files. |
| **Netlify Cloud** | Redirects engine | `_redirects`, `netlify.toml` | 38 rewrite rules. |

### 1.3 Core Web Pages Matrix
| Page File | Role / Purpose | Current Status |
| :--- | :--- | :--- |
| `index.html` | Public landing page, booking widget, fare estimation | Fully functional; loads `js/analytics.js` |
| `passenger.html` | Passenger portal: trip history, active ride tracking, GST invoice, tourism desk | Functional; **missing analytics, missing privacy/terms footer links** |
| `driver.html` | Driver / Chauffeur portal: duty console, KYC document upload, earnings | Functional; **missing analytics, missing privacy/terms footer links** |
| `admin.html` | Enterprise dispatch hub, KYC approval, fare management, audit logs | Functional; **missing analytics, missing privacy/terms footer links** |
| `booking.html` | Multi-step booking checkout (customer details, cab selection, trip options) | Functional; loads `js/analytics.js` |
| `cabs.html` | Fleet showcase (Sedan, Ertiga, Innova, Crysta) | Functional; loads `js/analytics.js` |
| `fare-chart.html` | 108 Bihar intercity corridor fare matrix | Functional; loads `js/analytics.js` |
| `payment.html` | Payment checkout and token calculations | Functional; loads `js/analytics.js` |
| `privacy-policy.html` | DPDP Act 2023 compliant privacy policy | Functional; standalone page |
| `terms-of-service.html` | Terms of service and booking terms | Functional; standalone page |
| `404.html` | Custom error 404 page | Functional; standalone page |
| `500.html` | Custom error 500 page | Functional; standalone page |

---

## 2. R4 Web Fallback (Custom 404 Page) Survey

### 2.1 Current Implementation in `404.html`
- **File Path**: `c:\Users\himan\onewaycabs\404.html` (81 lines)
- **Visual Design**: Dark theme (`#0b0f19`), responsive error card with high-contrast text:
  - Error code: `404` (Amber `#f59e0b`)
  - Headline: "Destination Route Not Found"
  - Description: Outstation cab booking reassurance
  - Call to Action: `← Return to Booking Desk` linking to `/`
  - Emergency contact: Call dispatch `<a href="tel:+918002141816">+91 80021 41816</a>`
- **Missing Elements**:
  - No analytics / telemetry tag (`js/analytics.js` is not loaded).
  - No error reporting or 404 hit telemetry.
  - No secondary navigation links to `/cabs`, `/fare-chart`, or `/contact`.

### 2.2 Server-Side 404 Routing Verification
1. **`local-server.js` (Lines 185–195)**:
   ```javascript
   // 3. 404 Fallback
   const custom404 = path.join(WORKSPACE_DIR, '404.html');
   if (fs.existsSync(custom404)) {
     res.statusCode = 404;
     res.setHeader('Content-Type', 'text/html; charset=utf-8');
     return fs.createReadStream(custom404).pipe(res);
   }
   res.statusCode = 404;
   res.setHeader('Content-Type', 'text/plain');
   res.end('404 Not Found');
   ```
   **Verdict**: Correctly returns HTTP status code 404 and pipes `404.html`.
2. **`vercel.json`**:
   - Vercel automatically matches unrouted requests to `404.html` and responds with HTTP 404.
3. **`_redirects` (Netlify)**:
   - Line 37 contains:
     ```
     /*                        /index.html                    200
     ```
   - **CRITICAL DEFECT**: This catch-all rewrite forces Netlify to return `200 OK` with `index.html` for any invalid URL, breaking R4 acceptance criteria on Netlify deployments!
   - **Remediation**: Change line 37 in `_redirects` to:
     ```
     /*                        /404.html                      404
     ```

### 2.3 Mobile Navigator 404 Fallback Survey
- **Requirement**: "Invalid mobile routes display a not-found screen."
- **Current Mobile Navigators**:
  - `mobile/apps/passenger/src/navigation/PassengerNavigator.tsx`: Has 8 stack screens, **no `NotFound` screen**.
  - `mobile/apps/driver/src/navigation/DriverNavigator.tsx`: Has 7 stack screens, **no `NotFound` screen**.
  - `mobile/apps/admin/src/navigation/AdminNavigator.tsx`: Has 2 conditional screens, **no `NotFound` screen**.
- **Remediation**:
  - Create a shared `NotFoundScreen.tsx` in `mobile/shared/components/NotFoundScreen.tsx`.
  - Register `<Stack.Screen name="NotFound" component={NotFoundScreen} />` across all three navigators.
  - Add deep linking linking configuration with wildcard fallback `path: '*'` mapping to `NotFound`.

---

## 3. R5 Telemetry: Analytics Integration Survey

### 3.1 Web Analytics (`js/analytics.js`)
- **Current State**:
  - Measurement ID: `G-1YTK7M3FS3` (configurable via `window.GA_MEASUREMENT_ID`).
  - Initializes `window.dataLayer` and `window.gtag`.
  - Methods provided in `window.OTBAnalytics`:
    - `track(eventName, eventParams)`
    - `trackPhoneCall(phoneNumber, placement)`
    - `trackWhatsApp(placement)`
    - `trackRouteSearch(origin, destination, distanceKm, estimatedFare)`
    - `trackCabSelection(cabTier, modelName, fare, origin, destination)`
    - `trackBookingStep(stepNumber, stepName)`
    - `trackBookingCompleted(booking)`
- **Gaps on Web**:
  1. `passenger.html`, `driver.html`, `admin.html`, and `404.html` **do not include `<script src="/js/analytics.js"></script>`**.
  2. Missing user account lifecycle telemetry:
     - `auth_login` (methods: OTP, direct, password)
     - `auth_logout`
     - `auth_signup` (new user registration with ₹100 reward)
     - `password_reset_requested`, `password_reset_completed`
     - `email_verification_requested`, `email_verified`
     - `account_deletion_requested`, `account_deleted`
  3. No fallback buffering if gtag script fails to load or user is offline.

### 3.2 Mobile Analytics (`mobile/`)
- **Current State**: **100% Absent**. Grep search for `analytics` in `mobile/` returned 0 occurrences.
- **Required Implementation**:
  - Create `mobile/shared/services/analytics.ts` with singleton `AnalyticsService`.
  - Adapter Architecture:
    - Primary: GA4 Measurement Protocol / External HTTP REST adapter.
    - Fallback: Local offline buffer / Mock adapter for test environments.
  - Event Taxonomy:
    - `screen_view` (screenName, app: 'passenger' | 'driver' | 'admin')
    - `app_open`
    - `auth_login`, `auth_logout`, `auth_signup`
    - `booking_flow_start`, `cab_selected`, `booking_confirmed`
    - `driver_duty_on`, `driver_duty_off`, `trip_accepted`, `trip_completed`
    - `admin_booking_assigned`, `admin_driver_verified`

---

## 4. R5 Telemetry: Error Tracking & Breadcrumbs Survey

### 4.1 Current Status: Complete Absence
- Grep for `sentry` across the repository: **0 results**.
- Grep for breadcrumbs (telemetry): **0 results** (only UI breadcrumbs exist in HTML).
- Global uncaught exception listeners:
  - Backend has basic process listeners in `local-server.js` (lines 199–235) appending to `db.error_logs`.
  - Web client has **zero** `window.onerror` or `unhandledrejection` listeners.
  - Mobile client has **zero** React `ErrorBoundary` or global error handlers.

### 4.2 Architecture for External Provider Error Tracking (Sentry Compatible)
To fulfill: *"Integrate error tracking to capture client exceptions and breadcrumbs with an external provider (e.g., Sentry)"* while satisfying R3: *"Remove all API keys and secret credentials from client bundles, proxying external requests through backend endpoints"*:

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT PLATFORMS                                     |
|                                                                                         |
|  [ Web Browser: js/error-tracker.js ]      [ Mobile Apps: shared/services/errorTracker.ts ]
|    - window.onerror                          - ErrorUtils.setGlobalHandler              |
|    - window.onunhandledrejection             - React ErrorBoundary Component             |
|    - Breadcrumb Ring Buffer (max 50)         - Breadcrumb Ring Buffer (max 50)           |
+-----------------------------------------------------------------------------------------+
                                             |
                   POST /api/telemetry/errors (JSON Payload)
                                             v
+-----------------------------------------------------------------------------------------+
|                                  BACKEND API GATEWAY                                    |
|                                                                                         |
|  [ api/index.js -> services/telemetry.js ]                                              |
|    - Validates error payload & rate-limits incoming error spikes                        |
|    - Attaches server timestamp, sanitized IP, environment tag                          |
|    - Logs to local db.error_logs for immediate admin dashboard visibility               |
|    - If SENTRY_DSN configured in server env: forwards to Sentry Ingestion API via HTTPS |
+-----------------------------------------------------------------------------------------+
```

### 4.3 Breadcrumb Schema & Event Structure
```typescript
interface Breadcrumb {
  timestamp: string;      // ISO 8601
  category: 'ui.click' | 'navigation' | 'http' | 'auth' | 'state';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

interface ErrorPayload {
  exception: {
    name: string;
    message: string;
    stack?: string;
  };
  breadcrumbs: Breadcrumb[];
  platform: 'web' | 'mobile_passenger' | 'mobile_driver' | 'mobile_admin';
  user?: { id?: string; phone?: string; role?: string };
  context: {
    url?: string;
    userAgent?: string;
    appVersion: string;
    themeMode?: string;
  };
}
```

---

## 5. R5 Legal Compliance Survey (Privacy Policy & Terms of Service)

### 5.1 Web Platform
- **Existing Pages**:
  - `c:\Users\himan\onewaycabs\privacy-policy.html` (15,014 bytes, 278 lines): Fully written, compliant with India's Digital Personal Data Protection (DPDP) Act 2023, IT Act 2000, and Google Ads guidelines.
  - `c:\Users\himan\onewaycabs\terms-of-service.html` (13,194 bytes, 240 lines): Terms of contract, tariffs, cancellation policies, liability limits, and arbitration terms.
- **Reachability Status**:
  - `index.html`: Contains clear footer links to `/privacy-policy` and `/terms-of-service`.
  - `passenger.html`: **FAIL** — No footer links to privacy policy or terms of service.
  - `driver.html`: **FAIL** — No footer links to privacy policy or terms of service.
  - `admin.html`: **FAIL** — No footer links to privacy policy or terms of service.
- **Required Action**:
  - Add standardized statutory footer link blocks to `passenger.html`, `driver.html`, and `admin.html` referencing `/privacy-policy` and `/terms-of-service`.

### 5.2 Mobile Platform
- **Acceptance Criterion**: *"Privacy Policy and Terms of Service screens/pages are reachable via in-app navigation and footer links."*
- **Current Status**:
  - `mobile/apps/passenger/src/screens/ProfileScreen.tsx` (lines 237–251): Uses `Linking.openURL('https://onewaytaxibihar.com/privacy-policy.html')`. This launches an external browser, which does **NOT** provide a dedicated in-app screen.
  - `mobile/apps/driver/src/screens/DriverProfileScreen.tsx`: **Zero** legal links or screens exist.
  - `mobile/apps/admin/src/screens/AdminSettingsScreen.tsx`: **Zero** legal links or screens exist.
- **Required Action**:
  1. Create shared in-app screens:
     - `mobile/shared/screens/PrivacyPolicyScreen.tsx`: Native scrollable screen displaying full DPDP Act 2023 privacy notice, data retention, user rights, and grievance officer contact.
     - `mobile/shared/screens/TermsOfServiceScreen.tsx`: Native scrollable screen displaying comprehensive terms of service, billing rules, chauffeur obligations, and dispute resolution.
  2. Register `PrivacyPolicy` and `TermsOfService` in Stack Navigators across all three apps:
     - `PassengerNavigator.tsx`
     - `DriverNavigator.tsx`
     - `AdminNavigator.tsx`
  3. Add in-app navigation buttons:
     - In `ProfileScreen.tsx` (Passenger): navigate to `PrivacyPolicy` and `TermsOfService`.
     - In `DriverProfileScreen.tsx` (Driver): add "Statutory Legal & Privacy" section navigating to both screens.
     - In `AdminSettingsScreen.tsx` (Admin): add "Statutory Legal & Compliance" section navigating to both screens.

---

## 6. Testing Infrastructure & Acceptance Criteria Architecture

### 6.1 Existing Test Scripts Survey
The workspace currently possesses several testing scripts:
- `npm test`: Executes `node scripts/check-syntax.js && node scripts/check-html-scripts.js` (validates JS syntax across 53 files and 40 inline scripts; currently **passing cleanly**).
- `tests/test-all-acceptance.ps1`: 159-line PowerShell script testing 42 historical criteria.
- `scripts/qa-integration-test.js`: 187-line Node HTTP test suite testing basic API health and fares.
- `scripts/test-all-apis.js`: Comprehensive 20KB test script testing backend CRUD and dispatch.
- `scripts/test-failure-scenarios.js`: 20KB script testing edge cases, malformed payloads, and server recoveries.
- `scripts/test-launch-readiness.js`: Uses Headless Chrome with Chrome DevTools Protocol (CDP) for browser-level validation.

### 6.2 TypeScript Compilation Status (`npx tsc --noEmit`)
- **Environment**: TypeScript `6.0.3` installed in `mobile/node_modules/typescript`.
- **Test Executions**:
  1. `mobile/tsconfig.json`: **0 errors** (exited code 0).
  2. `mobile/apps/passenger/tsconfig.json`: **0 errors** (exited code 0).
  3. `mobile/apps/driver/tsconfig.json`: **0 errors** (exited code 0).
  4. `mobile/apps/admin/tsconfig.json`: **0 errors** (exited code 0).
- **Workspace Root Finding**: The repository root does not contain a `tsconfig.json`. When running `npx tsc --noEmit` from root, npm tries to download typescript or prompts interactively.
- **Remediation**:
  - Add a root `tsconfig.json` configuring project references or path mapping to `mobile/tsconfig.json`.
  - Add a script in root `package.json`:
    ```json
    "typecheck": "tsc -p mobile/tsconfig.json --noEmit && tsc -p mobile/apps/passenger/tsconfig.json --noEmit && tsc -p mobile/apps/driver/tsconfig.json --noEmit && tsc -p mobile/apps/admin/tsconfig.json --noEmit"
    ```

---

## 7. Architecture for the 19-Check E2E Acceptance Test Suite

The requirement mandates:
*"Automated end-to-end test suite passes all 19 readiness checks with 0 TypeScript compilation errors (`npx tsc --noEmit`)."*

We architect a dual-runner verification suite:
1. **Node.js Automated Test Runner**: `tests/e2e-readiness.test.js` (using Node 24 native `node:test` and `node:assert`).
2. **PowerShell Test Script**: `tests/verify-all-19-readiness.ps1` for local terminal execution.

### 7.1 Detailed Verification Architecture for All 19 Criteria

| # | Readiness Check | Implementation & Test Logic | Verification Command / Assertion |
| :-: | :--- | :--- | :--- |
| **1** | **Real login with persistent session tokens** | Call `POST /api/auth/login`, `POST /api/driver/login`, and `POST /api/admin/login`. Verify returned token (`otb_sess_*`). Call `GET /api/user/profile` with Bearer token; assert 200 OK and valid user profile. | `assert(res.status === 200 && res.data.token && res.data.user.phone)` |
| **2** | **Logout & clean token teardown** | Call `POST /api/auth/logout`, `POST /api/driver/logout`, `POST /api/admin/logout`. Call authenticated endpoint with previous token; assert 401 Unauthorized. | `assert(logoutRes.data.success && testReq.status === 401)` |
| **3** | **Password / credential reset workflow** | Call `POST /api/auth/reset-password/request`. Verify reset token/OTP generated. Call `POST /api/auth/reset-password/confirm` with new password. Assert credentials updated and login works with new password. | `assert(confirmRes.data.success && reLogin.status === 200)` |
| **4** | **Email verification workflow** | Call `POST /api/auth/verify-email/request` with email. Verify verification token issued. Call `GET /api/auth/verify-email/confirm?token=...`. Assert `emailVerified === true`. | `assert(verifyRes.data.emailVerified === true)` |
| **5** | **Self-service account deletion** | Call `POST /api/user/delete-account` with confirmation. Verify user record is erased/anonymized in DB, sessions revoked, and subsequent login returns 404/deleted. | `assert(delRes.status === 200 && dbCheck.isDeleted === true)` |
| **6** | **Loading states (spinners/skeletons)** | Static & DOM inspection: Verify loading spinner elements / shimmer skeleton components exist in HTML portals and React Native screens (`ActivityIndicator` or skeleton placeholders). | `assert(domContent.includes('spinner') \|\| hasSkeleton(code))` |
| **7** | **Empty state views** | Request trips feed for brand new user with 0 bookings. Assert response/UI renders empty state illustration and action prompt ("No rides booked yet"). | `assert(emptyFeed.length === 0 && rendersEmptyPrompt)` |
| **8** | **User-friendly error messages (no crashes)** | Send invalid payloads (empty body, bad data types) to auth and booking endpoints. Assert server returns clean HTTP 4xx JSON `{ success: false, message: "..." }` with no unhandled 500 exceptions or raw stack traces. | `assert(res.status >= 400 && res.status < 500 && !res.data.stack)` |
| **9** | **Strict form validation** | Validate Indian phone format (`/^[6-9]\d{9}$/`), email regex, OTP length (4 or 6 digits), and valid UTR string. Test malformed inputs; assert 400 rejection with specific field error. | `assert(invalidPhoneRes.status === 400 && validPhoneRes.status === 200)` |
| **10** | **Onboarding flow on first launch** | Inspect onboarding state management in mobile storage / web local storage (`otb_has_seen_onboarding`). Verify first launch renders flow, completion/dismissal sets persistent flag. | `assert(onboardingKeyInStorage && componentExists)` |
| **11** | **Sliding-window rate limiting (HTTP 429)** | Dispatch 15 rapid consecutive requests within 2 seconds to `/api/auth/login` or `/api/bookings`. Assert server responds with HTTP 429 and `Retry-After` header. | `assert(rateLimitHit.status === 429 && rateLimitHit.headers['retry-after'])` |
| **12** | **Automated database backup & restore** | Execute `node scripts/backup-db.js`. Verify snapshot `.json` or `.gz` created with non-zero size. Execute integrity verification check; assert checksum passes. | `assert(fs.existsSync(snapshotPath) && verifySnapshot(snapshotPath))` |
| **13** | **Row-level security (RLS) data isolation** | User A queries User B's booking by ID (`/api/bookings/B_ID`). Driver A queries Driver B's earnings (`/api/driver/earnings?driverId=B`). Assert HTTP 403 Forbidden. | `assert(passengerLeakedRes.status === 403 && driverLeakedRes.status === 403)` |
| **14** | **Zero client secrets in bundles** | Automated static regex scanner: scan `js/`, `*.html`, `mobile/apps/`, and `mobile/shared/` for AWS secret keys, MongoDB URIs, and private JWT keys. Assert 0 leaked secrets. | `assert(leakedSecretMatches.length === 0)` |
| **15** | **Safe Area Boundaries (Mobile)** | Inspect mobile screen roots in `apps/passenger`, `apps/driver`, `apps/admin`. Verify use of `SafeAreaView` or `useSafeAreaInsets` from `react-native-safe-area-context` on all screens. | `assert(screensUsingSafeArea === totalScreens)` |
| **16** | **Custom 404 Web & Mobile Fallback** | 1. Web: Request `/non-existent-page-xyz`; assert status 404 and HTML contains custom 404 card.<br>2. Mobile: Verify `NotFoundScreen` registered in `Stack.Navigator` for unknown routes. | `assert(web404.status === 404 && mobileHasNotFoundScreen)` |
| **17** | **Analytics telemetry for lifecycle & milestones** | Dispatch analytics event via client adapter or `/api/telemetry/events`. Verify event payload schema, event name, user ID, timestamp, and delivery recording. | `assert(eventLogged.success && eventLogged.eventName === 'auth_login')` |
| **18** | **Error tracker capturing exceptions & breadcrumbs** | Trigger client exception; record breadcrumbs (`navigation`, `click`, `api`). Verify error payload contains stack trace and breadcrumb trail delivered to `/api/telemetry/errors`. | `assert(errorReported.breadcrumbs.length > 0 && errorReported.exception)` |
| **19** | **Privacy Policy & Terms of Service Reachability** | 1. Web: Verify `privacy-policy.html` and `terms-of-service.html` return 200 OK; verify footer links exist on `index.html`, `passenger.html`, `driver.html`, `admin.html`.<br>2. Mobile: Verify `PrivacyPolicy` and `TermsOfService` screens exist and are reachable via in-app navigation in all 3 apps. | `assert(webLegalFootersPresent && mobileInAppRoutesPresent)` |
| **Meta** | **0 TypeScript compilation errors** | Run TypeScript compiler across mobile workspace and apps. | `assert(tscExitCode === 0 && tscErrors.length === 0)` |

---

## 8. Exact File-by-File Implementation Recommendations

### 8.1 Web Portal Files to Modify
1. **`c:\Users\himan\onewaycabs\_redirects`**:
   - Change line 37:
     ```diff
     - /*                        /index.html                    200
     + /*                        /404.html                      404
     ```
2. **`c:\Users\himan\onewaycabs\404.html`**:
   - Include `<script src="/js/analytics.js"></script>`.
   - Add inline script reporting 404 event: `window.OTBAnalytics && OTBAnalytics.track('not_found', { path: window.location.pathname });`.
   - Add secondary navigation links to `/cabs` and `/contact`.
3. **`c:\Users\himan\onewaycabs\passenger.html`**:
   - Include `<script src="/js/analytics.js"></script>` and `<script src="/js/error-tracker.js"></script>`.
   - Add statutory footer section with links to `/privacy-policy` and `/terms-of-service`.
   - Track passenger login, logout, and trip view events.
4. **`c:\Users\himan\onewaycabs\driver.html`**:
   - Include `<script src="/js/analytics.js"></script>` and `<script src="/js/error-tracker.js"></script>`.
   - Add statutory footer section with links to `/privacy-policy` and `/terms-of-service`.
   - Track driver duty toggle, trip accept, and payout events.
5. **`c:\Users\himan\onewaycabs\admin.html`**:
   - Include `<script src="/js/analytics.js"></script>` and `<script src="/js/error-tracker.js"></script>`.
   - Add footer links to `/privacy-policy` and `/terms-of-service`.
6. **`c:\Users\himan\onewaycabs\js\analytics.js`**:
   - Add account milestone helpers: `trackLogin(method)`, `trackLogout()`, `trackSignUp()`, `trackPasswordReset()`, `trackEmailVerified()`, `trackAccountDeleted()`.
7. **`c:\Users\himan\onewaycabs\js\error-tracker.js`** *(NEW FILE)*:
   - Provide `window.OTBErrorTracker` with `addBreadcrumb()`, `captureException()`, global `window.onerror`, and `window.onunhandledrejection`. Dispatches to `/api/telemetry/errors`.
8. **`c:\Users\himan\onewaycabs\api\index.js`**:
   - Add endpoints:
     - `POST /api/auth/logout`: Revokes session token in `db.sessions`.
     - `POST /api/telemetry/events`: Ingests analytics events.
     - `POST /api/telemetry/errors`: Ingests client errors and breadcrumbs, forwards to external Sentry if DSN is set.

### 8.2 Mobile Platform Files to Modify & Create
1. **`c:\Users\himan\onewaycabs\mobile\shared\components\NotFoundScreen.tsx`** *(NEW FILE)*:
   - Safe-area styled screen with "Route Not Found", back button to home, and hotline button.
2. **`c:\Users\himan\onewaycabs\mobile\shared\screens\PrivacyPolicyScreen.tsx`** *(NEW FILE)*:
   - In-app scrollable view with full DPDP Act 2023 privacy statement and grievance contacts.
3. **`c:\Users\himan\onewaycabs\mobile\shared\screens\TermsOfServiceScreen.tsx`** *(NEW FILE)*:
   - In-app scrollable view with terms of carriage, tariff terms, cancellation/refund terms.
4. **`c:\Users\himan\onewaycabs\mobile\shared\services\analytics.ts`** *(NEW FILE)*:
   - Analytics service with `track(event, params)`, `screenView(name)`, and lifecycle helpers.
5. **`c:\Users\himan\onewaycabs\mobile\shared\services\errorTracker.ts`** *(NEW FILE)*:
   - Error tracking service with breadcrumbs buffer, `captureException`, and `/api/telemetry/errors` dispatch.
6. **`c:\Users\himan\onewaycabs\mobile\shared\components\ErrorBoundary.tsx`** *(NEW FILE)*:
   - React Error Boundary component capturing unhandled component errors and rendering fallback UI.
7. **`c:\Users\himan\onewaycabs\mobile\apps\passenger\src\navigation\PassengerNavigator.tsx`**:
   - Register `NotFound`, `PrivacyPolicy`, and `TermsOfService` in Stack.Navigator.
8. **`c:\Users\himan\onewaycabs\mobile\apps\driver\src\navigation\DriverNavigator.tsx`**:
   - Register `NotFound`, `PrivacyPolicy`, and `TermsOfService` in Stack.Navigator.
9. **`c:\Users\himan\onewaycabs\mobile\apps\admin\src\navigation\AdminNavigator.tsx`**:
   - Register `NotFound`, `PrivacyPolicy`, and `TermsOfService` in Stack.Navigator.
10. **`c:\Users\himan\onewaycabs\mobile\apps\passenger\src\screens\ProfileScreen.tsx`**:
    - Update legal row buttons to call `navigation.navigate('PrivacyPolicy')` and `navigation.navigate('TermsOfService')` instead of `Linking.openURL`.
11. **`c:\Users\himan\onewaycabs\mobile\apps\driver\src\screens\DriverProfileScreen.tsx`**:
    - Add "Statutory Legal & Privacy" section with in-app navigation to `PrivacyPolicy` and `TermsOfService`.
12. **`c:\Users\himan\onewaycabs\mobile\apps\admin\src\screens\AdminSettingsScreen.tsx`**:
    - Add "Statutory Legal & Compliance" section with in-app navigation to `PrivacyPolicy` and `TermsOfService`.

### 8.3 Testing Infrastructure Files to Create
1. **`c:\Users\himan\onewaycabs\tests\e2e-readiness.test.js`** *(NEW FILE)*:
   - Automated test suite validating all 19 readiness checks using native Node 24 test runner (`node --test tests/e2e-readiness.test.js`).
2. **`c:\Users\himan\onewaycabs\tests\verify-all-19-readiness.ps1`** *(NEW FILE)*:
   - PowerShell script running the 19 checks with colorized PASS/FAIL output.
3. **`c:\Users\himan\onewaycabs\package.json`**:
   - Add `"test:e2e": "node --test tests/e2e-readiness.test.js"` and `"typecheck": "node mobile/node_modules/typescript/bin/tsc -p mobile/tsconfig.json --noEmit && node mobile/node_modules/typescript/bin/tsc -p mobile/apps/passenger/tsconfig.json --noEmit && node mobile/node_modules/typescript/bin/tsc -p mobile/apps/driver/tsconfig.json --noEmit && node mobile/node_modules/typescript/bin/tsc -p mobile/apps/admin/tsconfig.json --noEmit"`.

---

## 9. Conclusion

The web portal is a robust, lightweight Vanilla MPA with dedicated portals, while the mobile apps are modern Expo React Native applications. The architecture is sound and performs well. The gaps identified in R4 (Netlify 404 rewrite and mobile NotFound screens), R5 (analytics coverage on key portals, complete error tracking / Sentry adapter implementation, and native in-app legal screens), and testing (automated verification of all 19 readiness criteria and root TypeScript command coordination) are clearly scoped and have precise, low-risk implementation paths detailed above.
