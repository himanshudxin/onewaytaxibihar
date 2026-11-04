## 2026-11-02T09:19:31Z
You are the Lead Mobile Redesign Worker for OneWayTaxiBihar.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\worker_redesign

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read the Phase 1 Audit reports at:
c:\Users\himan\onewaycabs\.agents\teamwork\orchestrator\PHASE_1_AUDIT_REPORT.md
c:\Users\himan\onewaycabs\.agents\teamwork\explorer_audit_1\audit_screens.md
c:\Users\himan\onewaycabs\.agents\teamwork\explorer_audit_2\audit_apis.md
c:\Users\himan\onewaycabs\.agents\teamwork\explorer_audit_3\audit_design.md

EXCLUSIVE FILE OWNERSHIP:
You own:
- `mobile/apps/passenger/src/` (screens, navigation, components, context)
- `mobile/shared/theme/colors.ts` (theme color tokens)
- `mobile/previews/` (visual screen previews for deliverables 1-9)
- `data/backups/passenger-app-redesign-pre-*` (backup snapshots)
Do NOT touch backend `api/index.js`, database `services/db.js`, `admin.html`, or `mobile/apps/driver/`.

STRICT CONSTRAINTS:
- BRAND IDENTITY STRICTLY PRESERVED: Keep exact OneWayTaxiBihar name. Keep original logo exactly as it appears (`BrandLogo.tsx` with `mobile/shared/assets/logo-reframed.png`). Do not redesign, recreate, replace, or recolor the logo.
- BACKEND COMPATIBILITY: Reuse existing backend endpoints (`/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/fares/calculate`, `/api/bookings`, `/api/booking-status`, `/api/tracking/status`, `/api/passenger/trips`). Never invent or hardcode fares.
- NO FAKE TELEMETRY: Never simulate live GPS tracking with fake math loops. Use real backend status/driver data with graceful fallback when driver is not yet assigned.

EXECUTION INSTRUCTIONS:
Step 1: Safety & Branching
- Check git status. Create and switch to branch `feature/passenger-app-redesign` (or create ref/branch in git).
- Create a backup archive of `mobile/apps/passenger/` in `data/backups/passenger-app-redesign-pre-<timestamp>/`.

Step 2: Theme Tokens (Golden Yellow & White)
- Update `mobile/shared/theme/colors.ts` with premium passenger tokens: Golden Yellow (`#EAB308`, `#F59E0B`, `#D97706`), Clean White (`#FFFFFF`, `#F8FAFC`), modern rounded cards (`borderRadius: 16-20`), soft shadows, and clean slate typography.

Step 3: Redesign All Passenger App Screens & Navigation
- Screen A: Splash (`SplashScreen.tsx`) - Premium yellow background, centered official `BrandLogo`, smooth scale/fade entry animation.
- Screen B: Login/Registration (`AuthScreen.tsx`) - Clean white rounded card, golden CTA, 10-digit Indian phone input, OTP verification, privacy notice, preserving existing auth APIs.
- Screen C: Home Screen (`HomeScreen.tsx`) - Modern ride-hailing dashboard: greeting & customer profile, pickup location, destination search, One-Way/Round-Trip selector, travel date & time, golden "Search Taxis" CTA, popular Bihar destinations, recent bookings card, 24x7 WhatsApp support shortcut.
- Screen D: Location Selection (`AddressSelectScreen.tsx`) - Visual map interface container with interactive markers, pickup search, destination search, location confirmation, and search suggestions for major Bihar travel hubs.
- Screen E: Vehicle Selection (`CabSelectScreen.tsx`) - 5 premium cards:
  1. Hatchback (WagonR/Tiago/Celerio - 4 seats, 2 bags, real car image)
  2. Sedan (Dzire/Etios/Amaze - 4 seats, 3 bags, real car image `images/voyago/car-sedan.jpg`)
  3. XUV (Ertiga/Carens - 6 seats, 3 bags, real car image `images/voyago/car-ertiga.jpg`)
  4. Executive Sedan (Honda City/Ciaz - 4 seats, 3 bags, real car image)
  5. Luxury XUV (Toyota Innova Crysta - 7 seats, 4 bags, real car image `images/voyago/car-suv.jpg`)
  Display live calculated fares from backend `FLEET_RATES`, distance and journey info, "Select & Book" gold CTA.
- Screen F: Booking Confirmation (`CheckoutScreen.tsx` & `BookingConfirmScreen.tsx`) - Clean white summary card: pickup, destination, date, time, selected vehicle preview, calculated fare, booking details, "Confirm Booking" CTA connected to `POST /api/bookings`.
- Screen G & H: Driver Assignment & Live Trip Tracking (`BookingTimelineScreen.tsx`) - 7-stage status stepper: 1. Booking Received, 2. Searching Driver, 3. Driver Assigned, 4. Driver Accepted, 5. Driver Details Ready, 6. Trip Started, 7. Trip Completed. Driver contact (Call / WhatsApp), vehicle badge, real driver telemetry from `GET /api/tracking/status`, no fake simulation, admin fallback message.
- Screen I: My Bookings (`MyTripsScreen.tsx`) - Modern tabbed history: Upcoming, Active, Completed, Cancelled; rich booking cards with PNR, route badges, downloadable invoice action, rebook shortcut.
- Screen J: Profile & Support (`ProfileScreen.tsx` & `SupportScreen.tsx`) - Customer info, edit profile, 1-tap WhatsApp support (`+91 77394 06400`), 24x7 Helpline (`+91 80021 41816`), Terms & Conditions, Privacy Policy, Logout.
- 5-Item Bottom Navigation (`PassengerNavigator.tsx`): Update `MainTabNavigator` to 5 clean tabs:
  1. Home (`HomeScreen`)
  2. My Bookings (`MyTripsScreen`)
  3. Track (`BookingTimelineScreen`)
  4. Support (`SupportScreen`)
  5. Profile (`ProfileScreen`)

Step 4: Screen Previews (Deliverables #1-9)
- Build an interactive, comprehensive visual preview for all 10 screens (A through J + Bottom Bar) at `mobile/previews/passenger-app-preview.html` allowing visual demonstration of the redesigned mobile interface in a mobile viewport mockup with yellow-and-white theme.

Step 5: Verification & Testing
- Run `cd mobile; npx tsc --noEmit` and ensure 0 TypeScript compilation errors.
- Run project test suites to verify zero regressions.
- Verify Android build readiness.

Step 6: Handoff
- Write complete handoff report to `c:\Users\himan\onewaycabs\.agents\teamwork\worker_redesign\handoff.md` with:
  1. Observation & summary of changes
  2. Logic chain
  3. Caveats & Android APK notes
  4. Changed files list
  5. Verification results (`npx tsc --noEmit` output, test runs)
  6. Rollback instructions
- Send completion message to orchestrator with summary.
