# BRIEFING — 2026-11-02T09:45:00Z

## Mission
Lead Mobile Redesign Worker for OneWayTaxiBihar: Redesign Passenger React Native app with premium Golden Yellow & White identity, 5-fleet vehicle tier, 7-stage status tracking stepper, 5-tab navigation, preserving BrandLogo and real backend APIs.

## 🔒 My Identity
- Archetype: Lead Mobile Redesign Worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\himan\onewaycabs\.agents\teamwork\worker_redesign
- Original parent: b201e31c-6334-4a43-bc28-a273bc1d05db
- Milestone: Passenger Mobile Redesign Implementation & Previews

## 🔒 Key Constraints
- BRAND IDENTITY STRICTLY PRESERVED: Keep exact OneWayTaxiBihar name. Keep original logo exactly as it appears (`BrandLogo.tsx` with `mobile/shared/assets/logo-reframed.png`). Do not redesign, recreate, replace, or recolor the logo.
- BACKEND COMPATIBILITY: Reuse existing backend endpoints (`/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/fares/calculate`, `/api/bookings`, `/api/booking-status`, `/api/tracking/status`, `/api/passenger/trips`). Never invent or hardcode fares.
- NO FAKE TELEMETRY: Never simulate live GPS tracking with fake math loops. Use real backend status/driver data with graceful fallback when driver is not yet assigned.
- EXCLUSIVE FILE OWNERSHIP:
  - `mobile/apps/passenger/src/` (screens, navigation, components, context)
  - `mobile/shared/theme/colors.ts` (theme color tokens)
  - `mobile/previews/` (visual screen previews for deliverables 1-9)
  - `data/backups/passenger-app-redesign-pre-*` (backup snapshots)
  - Do NOT touch backend `api/index.js`, database `services/db.js`, `admin.html`, or `mobile/apps/driver/`.

## Current Parent
- Conversation ID: b201e31c-6334-4a43-bc28-a273bc1d05db
- Updated: 2026-11-02T09:45:00Z

## Task Summary
- **What to build**: Complete redesign of Passenger App (Screens A-J: Splash, Auth, Home, AddressSelect, CabSelect, Checkout & BookingConfirm, BookingTimeline, MyTrips, Profile, Support; 5-item Bottom Navigation; theme tokens; interactive HTML preview).
- **Success criteria**: 0 TypeScript compilation errors in `mobile/`, backend compatibility preserved, genuine BrandLogo preserved, zero fake telemetry, 100% working previews, comprehensive handoff report.
- **Interface contracts**: Backend endpoints in `api/index.js` and `api/fares/calculate`.

## Key Decisions Made
- Created non-destructive safety backup at `data/backups/passenger-app-redesign-pre-20261102_092000/`.
- Modernized theme tokens in `mobile/shared/theme/colors.ts` with `PassengerColors` & `PassengerTheme` using Golden Yellow (`#EAB308`/`#F59E0B`), Clean White (`#FFFFFF`/`#F8FAFC`), Slate (`#0F172A`/`#334155`), rounded cards `borderRadius: 16-20`, and subtle elevation/shadows.
- Kept `BrandLogo.tsx` and `mobile/shared/assets/logo-reframed.png` completely untouched to honor brand invariant.
- Generated 5 clean studio vehicle photography assets under `mobile/apps/passenger/assets/vehicles/` (hatchback, sedan, suv, sedan_prime, innova_crysta).
- Maintained exact backend fare calculation mapping to `FLEET_RATES` (`hatchback` 21/km, `sedan` 25/km, `sedan_prime` 29/km, `suv` 33/km, `innova_crysta` 44/km).
- Rebuilt all screens A-J with responsive layouts, native styling, modal controls, and direct deep links for phone and WhatsApp support.
- Built an interactive, zero-dependency browser preview at `mobile/previews/passenger-app-preview.html` with iPhone/Android framing, live tab/screen switching, and specifications overview.
- Checked APK build readiness: Expo managed workflow with `mobile/apps/passenger/eas.json` configured for APK internal preview and Play Store AAB production builds.

## Artifact Index
- `DISPATCH.md` — Task assignment
- `progress.md` — Execution heartbeat
- `handoff.md` — Final deliverable report
- `data/backups/passenger-app-redesign-pre-20261102_092000/` — Snapshot backup
- `mobile/shared/theme/colors.ts` — Updated theme tokens
- `mobile/apps/passenger/assets/vehicles/` — Studio vehicle image assets
- `mobile/apps/passenger/src/screens/*` — Redesigned screens A-J
- `mobile/apps/passenger/src/navigation/PassengerNavigator.tsx` — 5-item bottom tab navigation
- `mobile/apps/passenger/app.json` — Expo app config updated for Golden Yellow theme
- `mobile/previews/passenger-app-preview.html` — Interactive visual preview

## Change Tracker
- **Files modified**:
  - `mobile/shared/theme/colors.ts` — Theme tokens (Golden Yellow, Clean White, Slate typography)
  - `mobile/apps/passenger/app.json` — Splash & adaptive icon background to #F59E0B
  - `mobile/apps/passenger/src/screens/SplashScreen.tsx` — Golden Yellow entrance, animated BrandLogo
  - `mobile/apps/passenger/src/screens/AuthScreen.tsx` — Clean white card, OTP verification, DPDP notice
  - `mobile/apps/passenger/src/screens/HomeScreen.tsx` — OneWay/RoundTrip toggle, route pickers, Golden CTA
  - `mobile/apps/passenger/src/screens/AddressSelectScreen.tsx` — Visual map canvas, animated pin, transit hubs
  - `mobile/apps/passenger/src/screens/CabSelectScreen.tsx` — 5-tier fleet cards, studio photos, FLEET_RATES calculation
  - `mobile/apps/passenger/src/screens/CheckoutScreen.tsx` — Route summary, fare breakdown, 12-digit UTR modal
  - `mobile/apps/passenger/src/screens/BookingConfirmScreen.tsx` — Start OTP card, driver assignment status
  - `mobile/apps/passenger/src/screens/BookingTimelineScreen.tsx` — 7-stage status stepper, driver card, real telemetry fallback
  - `mobile/apps/passenger/src/screens/MyTripsScreen.tsx` — 5-tab trip history, invoice download trigger, rebook CTA
  - `mobile/apps/passenger/src/screens/ProfileScreen.tsx` — Customer profile, DPDP deletion, edit modal
  - `mobile/apps/passenger/src/screens/SupportScreen.tsx` — 24x7 phone helpline, WhatsApp desk, statutory links
  - `mobile/apps/passenger/src/navigation/PassengerNavigator.tsx` — 5-item bottom tab bar (Home, Bookings, Track, Support, Profile)
- **Files created**:
  - `mobile/apps/passenger/assets/vehicles/hatchback.jpg`
  - `mobile/apps/passenger/assets/vehicles/sedan.jpg`
  - `mobile/apps/passenger/assets/vehicles/suv.jpg`
  - `mobile/apps/passenger/assets/vehicles/sedan_prime.jpg`
  - `mobile/apps/passenger/assets/vehicles/innova_crysta.jpg`
  - `mobile/previews/passenger-app-preview.html`
- **Build status**: PASS (`cd mobile; npx tsc --noEmit` -> 0 errors; `npm test` -> 79/79 JS + 40/40 HTML scripts OK)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (TypeScript 0 errors, npm test passed)
- **Lint status**: 0 errors
- **Tests added/modified**: TypeScript strict type safety validated across all screens; root test suite executed cleanly
