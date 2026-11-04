# Dispatch: Phase P1 Worker (APK-First Ecosystem, In-App Updater & Mobile Polish)

## Mission
Implement Phase P1: Professional APK Ecosystem, Self-Hosted In-App Updater, Driver APK Background GPS & 30s Offer Modal, and Passenger APK Self-Service Polish (PNR, WhatsApp, PDF Invoice, Onboarding, and Safe Area Conformity).

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md` (read P1 Specification lines 128-157)
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Test Ready Declaration: `c:\Users\himan\onewaycabs\TEST_READY.md`
- Explorer 2 Mobile Survey: `c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_2\survey_mobile.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## File Ownership
You exclusively own:
- `api/index.js` (version-check and release management endpoints)
- `admin.html` (App Release Management tab)
- `mobile/shared/services/updater.ts`
- `mobile/shared/components/UpdateModal.tsx`
- `mobile/shared/components/NotFoundScreen.tsx`
- `mobile/shared/components/OnboardingScreen.tsx`
- `mobile/shared/screens/PrivacyPolicyScreen.tsx`
- `mobile/shared/screens/TermsOfServiceScreen.tsx`
- `mobile/apps/driver/src/` (ForegroundTrackingService, TripOfferModal, duty persistence)
- `mobile/apps/passenger/src/` (PNR status screen, WhatsApp button, PDF invoice, onboarding integration)
- `mobile/apps/admin/src/` (SafeAreaView refactor, App Release screen)

## Deliverables & Tasks
1. **Self-Hosted In-App Updater (Play Store Independent)**:
   - Backend endpoint in `api/index.js`: `GET /api/v1/app/version-check?app=passenger|driver&version=x.x.x`
     Returns: `{ latestVersion, minSupportedVersion, downloadUrl, forceUpdate: boolean, releaseNotes }`.
   - Admin release management in `admin.html` and mobile admin to view/update release records.
   - `mobile/shared/services/updater.ts` & `UpdateModal.tsx`:
     - Checks version on app boot.
     - Graceful Update: Dismissible notification banner if `currentVersion < latestVersion`.
     - Mandatory Update: Un-dismissible modal overlay blocking app access if `currentVersion < minSupportedVersion`, directing to download and trigger package install directly.
2. **Driver APK Enhancements**:
   - `ForegroundTrackingService.ts`: Expo Location / TaskManager background GPS pinging without process drops.
   - `TripOfferModal.tsx`: 30-second countdown timer modal with audio alert chime when booking dispatched.
   - Duty State: Ensure Driver "Online/Offline" toggle persists across app restarts and background in `StorageService`.
3. **Passenger APK & Self-Service Polish**:
   - Direct WhatsApp Support button (`https://wa.me/918002141816`) and Direct Agent Call (`tel:+918002141816`).
   - PNR & Invoicing: Dynamic PNR status screen showing trip status, assigned driver details, trip OTP, and post-trip downloadable/viewable dynamic PDF invoice.
   - First-launch Onboarding carousel (`OnboardingScreen.tsx`) dismissible and completable.
4. **Layout & Navigation Safe Areas**:
   - Replace hardcoded `paddingTop: 54` in all Admin screens with `SafeAreaView` from `react-native-safe-area-context`.
   - Add universal `NotFoundScreen.tsx` fallback across navigators.
5. **Verification**:
   - Run `cd mobile; npx tsc --noEmit` (must pass with 0 errors).
   - Run `npm test` (must pass cleanly).
   - Run `powershell -ExecutionPolicy Bypass -File tests/verify-all-19-readiness.ps1` and report updated test pass count.
   - Write handoff report to `c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\handoff.md` and message orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).


## 2026-10-31T15:06:52Z
You are the Phase P1 Mobile & Updater Worker (teamwork_worker) for OneWayCabs.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md (specifically lines 128-157 for P1)
Read the master project plan at: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md
Read the test ready declaration at: c:\Users\himan\onewaycabs\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership: You exclusively own `api/index.js` (version-check/release routes), `admin.html` (Release tab), `mobile/shared/services/updater.ts`, `mobile/shared/components/UpdateModal.tsx`, `mobile/shared/components/NotFoundScreen.tsx`, `mobile/shared/components/OnboardingScreen.tsx`, `mobile/shared/screens/PrivacyPolicyScreen.tsx`, `mobile/shared/screens/TermsOfServiceScreen.tsx`, `mobile/apps/driver/src/`, `mobile/apps/passenger/src/`, `mobile/apps/admin/src/`.

Your tasks:
1. Implement the Self-Hosted In-App Updater:
   - Backend: `GET /api/v1/app/version-check?app=passenger|driver&version=x.x.x` returning `{ latestVersion, minSupportedVersion, downloadUrl, forceUpdate, releaseNotes }`.
   - Admin V2: App Release Management tab in admin.html and mobile admin.
   - Mobile: `mobile/shared/services/updater.ts` and `UpdateModal.tsx` handling banner and forced update modal with direct download.
2. Driver APK:
   - `ForegroundTrackingService.ts`: background GPS pinging via Location/TaskManager without process drops.
   - `TripOfferModal.tsx`: 30-second countdown timer modal with audio chime.
   - Duty State: persist Driver Online/Offline toggle across app restarts in StorageService.
3. Passenger APK:
   - Direct WhatsApp button (`https://wa.me/918002141816`) and Direct Call.
   - PNR & Invoicing: Dynamic PNR status screen showing trip status, assigned driver details, trip OTP, and post-trip dynamic PDF invoice download.
   - First-launch Onboarding carousel (`OnboardingScreen.tsx`).
4. Safe Areas:
   - Replace hardcoded `paddingTop: 54` in all Admin screens with `SafeAreaView` from `react-native-safe-area-context`.
   - Add universal `NotFoundScreen.tsx` fallback across navigators.
5. Verification:
   - Run `cd mobile; npx tsc --noEmit` (must pass with 0 errors).
   - Run `npm test` (must pass cleanly).
   - Run `powershell -ExecutionPolicy Bypass -File tests/verify-all-19-readiness.ps1`.
   - Author your handoff report to: c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\handoff.md
   - Message orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.
