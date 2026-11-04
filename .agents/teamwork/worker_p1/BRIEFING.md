# BRIEFING — 2026-10-31T15:10:00Z

## Mission
Implement Phase P1: Professional APK Ecosystem, Self-Hosted In-App Updater, Driver APK Background GPS & 30s Offer Modal, and Passenger APK Self-Service Polish (PNR, WhatsApp, PDF Invoice, Onboarding, and Safe Area Conformity).

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa
- Working directory: c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1
- Original parent: caa8f9da-9e6f-46fd-b0de-1d76e287aaba
- Milestone: Phase P1

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine. No dummy/facade implementations.
- Do NOT alter backend databases or core fare engines. Focus entirely on UI polish, background reliability, and release management.
- File ownership: `api/index.js` (version-check/release routes), `admin.html` (Release tab), `mobile/shared/services/updater.ts`, `mobile/shared/components/UpdateModal.tsx`, `mobile/shared/components/NotFoundScreen.tsx`, `mobile/shared/components/OnboardingScreen.tsx`, `mobile/shared/screens/PrivacyPolicyScreen.tsx`, `mobile/shared/screens/TermsOfServiceScreen.tsx`, `mobile/apps/driver/src/`, `mobile/apps/passenger/src/`, `mobile/apps/admin/src/`.
- Must pass `cd mobile; npx tsc --noEmit` (0 errors).
- Must pass `npm test`.

## Current Parent
- Conversation ID: caa8f9da-9e6f-46fd-b0de-1d76e287aaba
- Updated: 2026-10-31T15:06:52Z

## Task Summary
- **What to build**:
  1. Self-hosted in-app updater backend & mobile client + admin.html release management.
  2. Driver APK: ForegroundTrackingService background GPS, TripOfferModal 30s countdown with audio alert, Duty state persistence.
  3. Passenger APK: Direct WhatsApp + Call quick-actions, dynamic PNR status screen + PDF invoice download, Onboarding carousel.
  4. Safe Areas & Nav fallbacks: Replace hardcoded `paddingTop: 54` in admin screens with SafeAreaView, add universal NotFoundScreen fallback.
- **Success criteria**: All P1 deliverables genuinely implemented, TypeScript passes with 0 errors across all 4 mobile configs, npm test passes, verification script runs cleanly.
- **Interface contracts**: `PROJECT.md`, `ORIGINAL_REQUEST.md` (lines 128-157).
- **Code layout**: `PROJECT.md` § Code Layout.

## Key Decisions Made
- [TBD - Initializing implementation plan]

## Artifact Index
- `c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\DISPATCH.md` — Worker dispatch instructions
- `c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\BRIEFING.md` — Situational awareness working memory
- `c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\progress.md` — Liveness & progress tracking
- `c:\Users\himan\onewaycabs\.agents\teamwork\worker_p1\handoff.md` — 5-component handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending initial baseline verification
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending verification
- **Lint status**: 0 known violations
- **Tests added/modified**: TBD

## Loaded Skills
- None requested in dispatch
