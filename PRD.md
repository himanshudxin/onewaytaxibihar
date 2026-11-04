# Product Requirements & Task Checklist (PRD)

> Managed by Ralph Loop & GSD Agent Workflows. Check off items `[x]` as they pass automated verification.

## 1. Project Overview: OneWay Cabs Bihar
- **Domain**: One-way and outstation taxi booking service in Bihar (Patna, Gaya, Bhagalpur, Darbhanga, etc.).
- **Tech Stack**: HTML5, Vanilla CSS, Vanilla JavaScript, Serverless API functions, Netlify/Vercel deployment.

---

## 2. Active Roadmap & Tasks

### Phase 1: Core Setup & Integrity
- [x] Configure Antigravity GSD workflow and context management rules
- [x] Configure Ralph Loop execution engine (`PRD.md` & `progress.txt`)
- [x] Setup CodeRabbit MCP and code quality review rules
- [x] Setup Multi-Model quota fallback configuration guidelines

### Phase 2: Code Quality & Performance Audits
- [x] Sanitize hardcoded database passwords, master passwords, and API keys into .env
- [x] Verify booking flow and fare calculator responsive design
- [x] Test API endpoints and payment gateway simulation

### Phase 3: 100% Penalty-Free Legal Compliance & Google/Govt Immunity
- [x] 3.1 Create standalone legal pages: `privacy-policy.html`, `terms-of-service.html`, `refund-policy.html`, `cookie-policy.html`, `contact.html`, `data-deletion.html`
- [x] 3.2 Implement non-intrusive WCAG-compliant Cookie Consent Banner (`js/cookie-consent.js` & CSS)
- [x] 3.3 Add Form Consents & 18+ Age Declaration on booking/inquiry forms
- [x] 3.4 Remove Dark Patterns, unsupported claims, and ensure 100% transparent pricing
- [x] 3.5 Accessibility & Keyboard Navigation audit (`alt` text, contrast, `:focus-visible`)
- [x] 3.6 Update `sitemap.xml` with all 13 landing routes + 6 legal pages
- [x] 3.7 Add Statutory Business Details & Grievance Officer (Consumer Protection Rules 2020)
- [x] 3.8 Audit third-party SDKs, font/asset licenses, and email/SMS opt-out compliance

### Phase 4: Google Ecosystem, Search Console & Live Analytics Setup
- [x] 4.1 Google Search Console verification (`google325984f7b343fbb3.html` & meta tag)
- [x] 4.2 Submit 21-URL XML Sitemap (`sitemap.xml`) to Google Search Console
- [x] 4.3 Synchronize physical registered address across all 7 statutory pages and schemas
- [x] 4.4 Google Business Profile verified status audit & 100% profile strength guidance
- [x] 4.5 GA4 Engine (`js/analytics.js`) deployed with live Measurement ID `G-1YTK7M3FS3`
### Phase 5: Mobile Experience, Festival Offers & Passenger Portal Overhaul
- [x] 5.1 Dynamic Mobile Bottom Navigation: Eliminate static green Home tab, wire dynamic tab switching (`setBottomNavActive`) across index and passenger portals.
- [x] 5.2 Real Passenger Mobile Lookup & Login: Eradicate hardcoded dummy data ('Valued Passenger' / '8002141816') in favor of 10-digit mobile number lookup and backend sync.
- [x] 5.3 Animated Bihar Festival Offers: Animated Chhath Puja Mahaparv & Diwali coupon card (`CHHATH100` / `FEST100` for flat ₹100 off on first outstation ride) with sparkle animations and 1-tap book.
- [x] 5.4 Dual Support Hub: Mobile Support action opens unified modal with clear options for both 24×7 Phone Helpline (`+91 80021 41816`) and WhatsApp Helpdesk (`+91 77394 06400`).

### Phase 6: Mobile Modal UX & Cookie Clearance Remediation
- [x] 6.1 Site-wide Modal Background Scroll Freeze: Bulletproof body & html scroll lock (`position: fixed`, `scrollY` offset retention, passive touchmove cancellation, and MutationObserver) preventing background page scroll across the entire website.
- [x] 6.2 Dual Visible Support CTAs: Redesigned Support modal so both Call (+91 80021 41816) and WhatsApp (+91 77394 06400) buttons are 100% visible, unobstructed, and prominently accessible above the fold without clipping.
- [x] 6.3 Cookie Verification Banner Clearance: Elevated cookie banner z-index to `1000002` and positioned cleanly above the Voyago mobile bottom navigation bar (`bottom: calc(76px + env(safe-area-inset-bottom, 8px))`) so verification buttons are fully visible and tappable.

### Phase 7: My Trips Redesign & Complete OTP-Driven Auto-Fetch
- [x] 7.1 Eradicate Manual Phone Filling: Removed phone input form, manual lookup handlers, and static login cards from My Trips modal and passenger dashboard.
- [x] 7.2 Automatic Trips Fetch via OTP Session: Trips are strictly fetched from backend `/api/passenger/trips?phone=` using verified session phone (`window.currentUser.phone` / `otb_passenger_logged_in`).
- [x] 7.3 Remove In-Modal Login Section: Eradicated redundant "Login with OTP to View Your Trips" card and duplicate empty states inside the My Trips modal.
- [x] 7.4 Seamless Unauthenticated Routing: Unauthenticated riders tapping My Trips are routed directly to the clean SMS OTP modal with `_authReturnTo = 'trips'`, returning immediately into My Trips upon verification.
### Phase 8: Mobile Navigation Drawer (Three Bars) Interaction & Scroll Lock Remediation
- [x] 8.1 Fix Drawer Scroll Freeze: Fixed `unlockBodyScroll` handling when closing drawer and fixed MutationObserver to evaluate actual open modals and drawer state instead of getting stuck on `modal-open`.
- [x] 8.2 Touch Barrier Containment: Added `.drawer-body` and `.mobile-nav-drawer` to allowed touchmove scrollable targets with `touch-action: pan-y !important;` and `overscroll-behavior: contain !important;` so menu scrolls freely.
- [x] 8.3 Fix Unintended Booking Hero Jump: Removed generic `popstate` redirect to `#booking-hero` on drawer close; user remains at their current scroll location without unexpected jumps.
- [x] 8.4 Z-Index Hierarchy: Elevated `.drawer-backdrop` (`z-index: 1000005`) and `.mobile-nav-drawer` (`z-index: 1000006`) above all fixed overlays.
- [x] 8.5 Toggle Menu Handler: Added `window.toggleMobileDrawer()` and attached direct inline onclick handler to `#btn-hamburger`.

### Phase 9: Desktop Navbar Redesign & Alignment
- [x] 9.1 Root Cause Elimination: Diagnosed and fixed jagged vertical misalignment where two-word links ("Fare Chart", "Request Invoice") wrapped onto two lines while single-word links stayed on one line.
- [x] 9.2 Strict Single-Line Enforcement: Applied `white-space: nowrap !important;`, uniform fixed height (`34px`), and `display: inline-flex; align-items: center; justify-content: center;` to `.nav-links li a`.
- [x] 9.3 Executive Glass Capsule Pill: Enclosed `.nav-links` in a sleek glass capsule container with `border-radius: 9999px; backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.04);` and light-theme support.
- [x] 9.4 Typography & Micro-Interactions: Refined link font size to 13.5px / 600 weight with -0.2px tracking, subtle translateY(-1px) hover, emerald glow, and active pill states.
- [x] 9.5 Copy & Accessibility Optimization: Streamlined "Request Invoice" to "Tax Invoice" (`role="menubar"`, `role="menuitem"`, title tooltip).
- [x] 9.6 Mid-Screen Viewport Cushioning: Optimized `@media (min-width: 993px) and (max-width: 1250px)` with compact horizontal padding, hiding `.navbar-call-mini-pill` to prevent crowding.

### Phase 12: Safari iOS Compatibility & Mobile Touch Hardening
- [x] 12.1 Viewport Safe Area & Notch Support: Update `<meta name="viewport">` with `viewport-fit=cover` across all HTML pages for proper safe-area-inset calculation on iPhones.
- [x] 12.2 Prevent Safari iOS Auto-Zoom: Set input & select font-size to minimum 16px on mobile viewports so Safari never auto-zooms into fields.
- [x] 12.3 Hard-guard Scroll Lock & Touch Pipelines: Ensure touch events and scroll lock/unlock cannot freeze page interactions in Safari iOS.
- [x] 12.4 Harden Service Worker (`sw.js`): Never resolve `event.respondWith` to `null` (avoid WebKit TypeError), and bypass third-party cross-origin requests.
- [x] 12.5 Verification & Audit: Run syntax validation, check HTML scripts, and verify mobile responsiveness.

### Phase 13: Unified Cross-Platform Mobile Apps Architecture (React Native + Expo)
- [x] 13.1 Mobile Architecture & Directory Setup: Initialize `mobile/` React Native + Expo structure with TypeScript, Navigation (Customer & Driver roles), and API integration with MongoDB backend (`onewaytaxibihar.com/api`).
- [x] 13.2 Shared Theme, Design System & API SDK: Create mobile color tokens (Emerald `#059669` / Dark `#090D16`), typography, reusable components, and API client with offline retry & auth management.
- [x] 13.3 Customer Booking App Experience: Implement Ride Search, District corridor pricing, Vehicle tier selection (Hatchback, Sedan, SUV), Phone OTP authentication, and Booking flow.
- [x] 13.4 Driver Partner App Experience: Implement Driver Onboarding/Verification, Online/Offline Toggle, High-Priority Ride Dispatch Modal with chime/vibration, and Trip Management.
- [x] 13.5 App Configuration & Store Ready Assets: Configure `app.json` (package `com.onewaytaxibihar.app`, permissions, icon, splash, deep linking scheme), EAS build profiles, and comprehensive developer testing guide.

### Phase 14: Expo SDK 58 & React Native 0.88 Upgrade
- [x] 14.1 Upgrade Expo & Core Dependencies: Upgrade `expo` to `^58.0.0` (CLI `58.1.15`), `react` to `19.3.0`, and `react-native` to `0.88.0` with matching native modules (`expo-status-bar`, `expo-location`, `expo-constants`, etc.).
- [x] 14.2 Peer Dependency & TypeScript Configuration: Configure `.npmrc` with `legacy-peer-deps=true` and `tsconfig.json` with `"ignoreDeprecations": "6.0"`.
- [x] 14.3 StatusBar Modernization: Migrate StatusBar components across all customer and driver screens to first-class `expo-status-bar` (`<StatusBar style="light" />`).
- [x] 14.4 Compilation & Hermes Bundle Verification: Validate TypeScript with 0 errors and confirm Metro bundler compiles the 9MB Hermes runtime bundle (`runtimeVersion: exposdk:58.0.0`) on `http://192.168.0.179:8081`.

### Phase 15: Monorepo Foundation & Two Separate Mobile App Workspaces
- [x] 15.1 Shared Mobile Engine (`mobile/shared/`): Design tokens (Voyago Emerald `#059669`, Midnight `#090D16`), typed API client connecting to backend with offline fallback, domain types, and storage service.
- [x] 15.2 Passenger Mobile Workspace (`mobile/apps/passenger/`): Standalone Expo SDK 58 app, package `com.onewaytaxibihar.passenger`, bundle ID `com.onewaytaxibihar.passenger`, app name "Oneway Taxi".
- [x] 15.3 Driver Mobile Workspace (`mobile/apps/driver/`): Standalone Expo SDK 58 app, package `com.onewaytaxibihar.driver`, bundle ID `com.onewaytaxibihar.driver`, app name "Oneway Taxi Driver".
- [x] 15.4 Mobile Root Runner & Dual Metro Orchestration: Configure npm scripts in `mobile/package.json` to launch passenger and driver apps independently.

### Phase 16: Backend Enterprise API Extension & Security Hardening
- [x] 16.1 Driver Application & Document Verification API: Endpoints for submitting DL, RC, insurance, permit, and payout details with review states (`pending`, `approved`, `needs_changes`).
- [x] 16.2 Rigorous Trip State Machine & OTP Validation: Secure transitions (`pending` -> `confirmed` -> `driver_assigned` -> `driver_en_route` -> `arrived` -> `started` via 4-digit OTP -> `completed` -> `cancelled`).
- [x] 16.3 Server-Calculated Fare Quotes with Breakdown: `/api/fares/calculate` disclosing base fare, tolls, state taxes, driver allowance, night charges, waiting fee, and GST.
- [x] 16.4 Driver Duty, Dispatch & Earnings Ledger: Online/Offline duty toggle (`/api/driver/duty`), trip acceptance (`/api/driver/accept-trip`), earnings ledger (`/api/driver/earnings`), and payout history.
- [x] 16.5 Privacy & Account Deletion Endpoints: Idempotent booking handling, sensitive audit logs, and account deletion endpoints for passengers (`/api/user/delete-account`) and drivers (`/api/driver/delete-account`).

### Phase 17: Passenger App (Oneway Taxi) Complete End-to-End Build
- [x] 17.1 Splash & Onboarding: Visual introduction to Bihar's #1 Outstation Taxi Network.
- [x] 17.2 Phone OTP Sign-In: Mobile number verification with resend timer and session persistence.
- [x] 17.3 Intercity Home Screen: Corridor chips, One-Way vs Round-Trip toggle, date/time pickers, passenger count, saved places, and recent searches.
- [x] 17.4 Map & Doorstep Address Selection: Pickup and drop address selection with geolocation and validation against identical addresses.
- [x] 17.5 Vehicle Tiers & Clear Fare Breakdown: Go Hatchback, Prime Sedan, and Family SUV with transparent fare sheet (tolls, GST, driver allowance).
- [x] 17.6 Booking Review & Payment Method: Zero Advance Cash/UPI to Driver vs Advance Token Payment, cancellation terms.
- [x] 17.7 Real-time Booking Timeline & Live Tracking: Status timeline, driver and vehicle details disclosed only after assignment, call driver action, and live route simulation.
- [x] 17.8 My Trips & Ride Management: Upcoming, Active, Completed, Cancelled tabs with cancellation and receipt view.
- [x] 17.9 Profile, Support Hub, Statutory Legal & Account Deletion: Helpdesk, FAQs, Terms, Privacy, and DPDP account deletion hook.
- [x] 17.10 Offline Resilience: Offline detection and draft persistence so booking details survive connectivity loss.

### Phase 18: Driver App (Oneway Taxi Driver) Complete End-to-End Build
- [x] 18.1 Driver Splash & Onboarding: Professional driver partner introduction.
- [x] 18.2 Driver Phone OTP Sign-In: Driver authentication with session persistence.
- [x] 18.3 Multi-Step Driver Verification Application: Personal details, Driving Licence, Vehicle RC, Commercial Permit, Insurance, and Bank/UPI payout details.
- [x] 18.4 Verification Status Screen: Dynamic banner and gate for `pending`, `approved`, and `needs_changes` states.
- [x] 18.5 Driver Home Console: Online/Offline duty toggle, GPS permission status, today's earnings KPI, and active trips feed.
- [x] 18.6 High-Priority Trip Dispatch Modal: Route, schedule, distance, net earnings, and 30-second accept/decline countdown with haptics.
- [x] 18.7 Complete Trip Execution State Machine: Navigate to pickup -> Mark arrived -> Start trip with 4-digit Ride Start OTP -> Complete trip & collect fare.
- [x] 18.8 Earnings Dashboard & Payout History: Daily, weekly, and total earnings ledger, trip breakdown, and linked payout account.
- [x] 18.9 Driver Profile, Documents, Vehicle Info & Emergency SOS: Helpline, SOS emergency dialer, document status, and logout.
- [x] 18.10 Safe Driving Layout: High-contrast, large touch targets, and interaction warnings during driving.

### Phase 19: Cross-App Integration, Testing & Verification
- [x] 19.1 End-to-End Ride Cycle Test: Passenger booking dispatches to online Driver -> Driver accepts -> Passenger timeline updates -> Driver starts with OTP -> Driver completes -> Earnings update.
- [x] 19.2 TypeScript & Syntax Verification: `tsc --noEmit` on shared, passenger, and driver workspaces with 0 errors.
- [x] 19.3 Backend & API Test Suite: All root and API tests pass without regression.

### Phase 20: Documentation, Environments & Launch Checklist
- [x] 20.1 Setup & Developer Running Guide: Clear instructions for launching passenger app, driver app, and backend simultaneously.
- [x] 20.2 Environment Configuration (`.env.example`): Safe template containing placeholders only, zero real secrets.
- [x] 20.3 Integration & Simulation Audit Report: Detailed transparency report of live vs simulated services.
- [x] 20.4 Store Launch & Transport Compliance Checklist: Step-by-step checklist for App Store, Google Play, payments, maps, and regulatory compliance.

### Phase 21: Autonomous Admin App & 3-App Platform Architecture
- [x] 21.1 Dedicated Admin Mobile App: Initialized `mobile/apps/admin/` with package `com.onewaytaxibihar.admin`.
- [x] 21.2 Secure Operator Sign-in: Operator auth via `POST /admin/login` with PBKDF2 hash, brute-force guard, and session persistence.
- [x] 21.3 Executive Operations Dashboard: Real-time KPIs for Active Rides, Pending Driver Audits, Total Bookings, and Today's Gross Revenue (15% platform margin).
- [x] 21.4 Outstation Bookings Ledger & Direct Dispatch: Searchable trips feed with live driver allotment modal (`POST /admin/bookings/assign`).
- [x] 21.5 Chauffeur Fleet Verification Queue: Document review (DL, RC, Permit) with 1-tap `POST /admin/drivers/verify` (Approve, Flag for Changes, Deactivate).
- [x] 21.6 3-Way App Lifecycle Verification: Automated test (`scratch/test-three-apps-cycle.js`) verifying Passenger Booking -> Driver Registration -> Admin Verification & Dispatch -> Driver Completion -> Ledger Settlement.

### Phase 22: Universal UI Polish, Interactive Controls & Production Launch Hardening
- [x] 22.1 Universal Test Switcher Ergonomics: Relocated test switcher from screen top to bottom-docked pill (`bottom: 70/84`, elevation 30, zIndex 99999) with minimized default state, completely clearing screen headers, back buttons, and action icons.
- [x] 22.2 Passenger Home Screen Date & Time Pickers: Converted static views into interactive TouchableOpacity elements opening sleek modal pickers with visual indicators, quick options (Today, Tomorrow, Day After, Weekend), and 9 granular departure times.
- [x] 22.3 Full 38 Bihar Districts & Custom Location Entry: Expanded `BIHAR_CITIES` across all 38 districts of Bihar + interstate hubs, with custom location fallback and search clear button in AddressSelectScreen.
- [x] 22.4 Passenger Checkout 1-Tap Quick Fill: Added `⚡ Quick Fill` button auto-populating rider name, phone, doorstep landmark, and destination drop for frictionless testing.
- [x] 22.5 Live Production Sync: Synchronized directly with MongoDB Atlas cloud on `https://onewaytaxibihar.com/api` (226 corridor fares, 13 live cluster bookings, JWT authentication for Dispatcher and Drivers).
- [x] 22.6 Zero-Error TypeScript & Metro Build Validation: 0 errors across `mobile/`, `apps/passenger`, `apps/driver`, and `apps/admin`. Metro returning HTTP 200 OK for Android and iOS bundles.

### Phase 23: Complete Mock Data Purge & 100% Real Production Cloud Data Binding
- [x] 23.1 Purge Fake Seed Data: Eliminated hardcoded mock bookings (`Manoj Kumar`, `Priya Sharma`, `Rajesh Ranjan`, `OTB-914820`) and mock drivers from `fleetSync.ts` and `AdminContext.tsx`.
- [x] 23.2 Live MongoDB Atlas Synchronization: Connected `AdminContext` and `api.ts` directly to live MongoDB Atlas cluster on `https://onewaytaxibihar.com/api` (loading 11 live customer bookings, real routes, real customer names, and real registered drivers).
- [x] 23.3 Authentic Driver Dispatching: Replaced fake offer simulator with a live dispatch listener matching real unassigned bookings from MongoDB Atlas.
- [x] 23.4 Clean Passenger State & Timeline: Removed fake fallback booking in `BookingTimelineScreen.tsx` and updated `ProfileScreen.tsx` to reflect real authentication state.
### Phase 24: Separation into Three Independent Standalone Mobile Applications
- [x] 24.1 Eradicate 3-in-1 Container: Replaced unified container in `mobile/index.js` with pure standalone entry point; removed floating switcher pill and shared container overlays.
- [x] 24.2 Standalone Passenger App (`com.onewaytaxibihar.passenger`): Configured on dedicated Port 8081 with independent Metro server and QR code `exp://192.168.0.179:8081`.
- [x] 24.3 Standalone Driver Partner App (`com.onewaytaxibihar.driver`): Configured on dedicated Port 8082 with independent Metro server and QR code `exp://192.168.0.179:8082`.
- [x] 24.4 Standalone Admin Desk App (`com.onewaytaxibihar.admin`): Configured on dedicated Port 8083 with independent Metro server and QR code `exp://192.168.0.179:8083`.
- [x] 24.5 Concurrent Multi-Server Execution: Verified simultaneous Metro bundler operation on ports 8081, 8082, and 8083, each serving HTTP 200 OK bundles independently.
- [x] 24.6 Independent Package Scripts & Build Configs: Added dedicated `start`, `android`, and `ios` scripts to `apps/passenger`, `apps/driver`, and `apps/admin` with EAS standalone build targets.

### Phase 25: Standalone APK Distribution & Branded App Configuration
- [x] 25.1 Dedicated App Assets & Branding: Configure distinct adaptive launcher icons, notification badges, and splash screens for Passenger (`#059669` Emerald Green), Driver (`#D97706` Taxi Gold), and Admin (`#1E293B` Executive Navy).
- [x] 25.2 EAS Build & Standalone Android APK Profiles: Configure `eas.json` and package build scripts for direct APK generation without Expo Go dependency.
- [x] 25.3 Web Direct APK Distribution Portal: Create high-conversion `app-download.html` page on the website with direct APK download buttons, device installation guide, and QR codes for Bihar drivers and riders.

### Phase 26: Real-Time Driver GPS Tracking & Turn-by-Turn Navigation
- [x] 26.1 Driver Live Location Engine: Implement live location tracking via `expo-location` when Driver is on-duty, streaming coordinates to backend.
- [x] 26.2 Cloud Location Sync & Tracking Endpoint: Implement `POST /api/driver/location` and `GET /api/bookings/:id/track` in the API layer.
- [x] 26.3 Passenger Real-Time Driver Radar & ETA: Display live driver coordinates, distance calculation, and ETA updates on `BookingTimelineScreen.tsx`.
- [x] 26.4 1-Tap Native GPS Navigation: Add direct turn-by-turn navigation deep-link (Google Maps / Apple Maps intent) on Driver console with passenger doorstep coordinates.

### Phase 27: Audio Dispatch Chimes & Trip Countdown Engine
- [x] 27.1 Audible Dispatch Chime: Integrate audio alert sound / haptics when an incoming outstation trip offer arrives in the Driver App.
- [x] 27.2 45-Second Offer Countdown Timer: Add visual pulsing countdown ring on `TripOfferModal.tsx` for urgent driver acceptance.
### Phase 28: Mobile Native UPI Advance Payment & Driver KYC Document Inspection
- [x] 28.1 Mobile Native UPI Intent Engine: Deep-link into PhonePe, Google Pay, or Paytm (`upi://pay?pa=...`) for the ₹500 advance token reservation in `CheckoutScreen.tsx`.
- [x] 28.2 Driver KYC Document Photo Upload: Add photo/camera upload slots for Driving License (Front/Back) and Vehicle RC in `DriverApplicationScreen.tsx`.
- [x] 28.3 Admin Document Inspection Modal: Add high-res credential inspection modal in `AdminDriversScreen.tsx` before chauffeur compliance approval.
- [x] 28.4 Cross-App Cycle & TypeScript Verification: Verify 0 errors on `tsc` and 100% pass on 3-app integration tests.

### Phase 29: End-to-End Pickup Date & Time Enclosure Across All 3 Apps & Portals
- [x] 29.1 Web Passenger Booking & Portal Date/Time Controls: Added interactive `<input type="date">` and 12-slot `<select>` time picker to `booking.html`, passed to `payment.html`, and rendered prominent required pickup schedule badges on `passenger.html`.
- [x] 29.2 Mobile Passenger App Pickup Date & Time Selector: Added interactive bottom-sheet modal on `CheckoutScreen.tsx` allowing riders to pick custom departure date and time slots, dynamically updating price and trip payload.
- [x] 29.3 Mobile Passenger Confirmation & Timeline Schedule Badges: Enhanced `BookingConfirmScreen.tsx` and `BookingTimelineScreen.tsx` with dedicated `REQUIRED PICKUP SCHEDULE` banners guaranteeing arrival.
- [x] 29.4 Driver App Schedule Visibility & Alerts: Enhanced `TripOfferModal.tsx`, `DriverHomeScreen.tsx`, and `TripExecutionScreen.tsx` to prominently display rider required pickup date and time slots.
- [x] 29.5 Admin App Dispatch Desk Schedule Prioritization: Updated `AdminBookingsScreen.tsx` card list and chauffeur assignment modal with high-visibility required schedule pills.
- [x] 29.6 Multi-App E2E Verification: Passed 10/10 automated tests (`scratch/test-datetime-sync.js`) confirming live MongoDB Atlas booking with date/time, 0 TypeScript compile errors, and all 3 Metro servers online.

### Phase 30: 100% Commercial Deployment Readiness & Device-Level Resilience
- [x] 30.1 High-Priority Push & Audio Siren Service (`mobile/shared/services/notifications.ts`): Built push token registry, high-importance notification channels (`urgent_dispatch`, `trip_updates`, `admin_alerts`), and waking siren/haptic alerts for incoming chauffeur dispatches.
- [x] 30.2 Android Foreground Service & Battery Optimization Exemption (`ForegroundTrackingService.ts`): Guaranteed background GPS survival on Xiaomi (MIUI/HyperOS), Vivo, Realme, and Samsung phones with persistent foreground notification and in-app whitelist guidance modal on `DriverHomeScreen.tsx`.
- [x] 30.3 Highway Dead-Zone Offline Vault (`mobile/shared/services/offlineVault.ts`): Persistent active trip local caching and queued offline action synchronization along rural Bihar corridors (NH-31, NH-22).
- [x] 30.4 12-Digit UPI UTR Advance Verification: Integrated interactive UTR input modal with regex validation (`/^\d{12}$/`) in `CheckoutScreen.tsx` while retaining 100% Cash-on-Arrival as default.
- [x] 30.5 Chauffeur Daily Settlement Engine: Added instant payout withdrawal action in `DriverEarningsScreen.tsx` connected to `POST /api/driver/payout-request`.
- [x] 30.6 Universal Error Boundary: Wrapped Passenger, Driver, and Admin root applications in `ErrorBoundary.tsx` preventing white-screen crashes.
- [x] 30.7 Automated Commercial Verification & Zero-Error Build: Passed 10/10 checks (`scratch/verify-commercial-readiness.js`) and 0 TypeScript compilation errors (`tsc --noEmit`).

### Phase 31: Passenger App Date/Time Overhaul, Name Sanitization & GMap Higher Toll Engine
- [x] 31.1 Harmonized Dynamic Date & Time Selection: Integrated 7-day dynamic calendar options (Today, Tomorrow, subsequent days with exact dates) and expanded 13 departure time slots across `HomeScreen.tsx` and `CheckoutScreen.tsx`.
- [x] 31.2 Neutral Passenger Name Sanitization: Eradicated all occurrences of example names like 'Manoj Kumar' across placeholders, inputs, and demo logins; replaced with clean "Enter passenger name" and "Passenger".
- [x] 31.3 Google Maps Higher Toll Engine (`GMapTollService.ts`): Queries Google Maps Routes API `computeRoutes` with `extraComputations: ["TOLLS"]` across alternative routes and ALWAYS selects the higher price toll. Backed by peak NHAI Bihar toll gate matrix fallback.
- [x] 31.4 Automated Verification: Passed 8/8 tests in `scratch/test-gmap-toll-and-passenger-fixes.js` and 0 TypeScript errors.

### Phase 32: Admin Operations Dashboard V2 (Central Command Center)
- [x] 32.1 Executive Operations Barometer: Deployed real-time radar indicator (`🟢 RADAR ONLINE • ATLAS SYNCED`), manual instant refresh with haptic feedback, and operator session management.
- [x] 32.2 Urgent Action Priority Banner: Dynamic alert for unassigned passenger trips with direct 1-tap allotment CTA, plus chauffeur DL/RC KYC backlog audit triggers.
- [x] 32.3 1-Tap Executive Action Dock: Integrated one-tap docks for Dispatch Hub, Audit KYC, Fleet Broadcast, and Desk Config.
- [x] 32.4 Bihar Corridor Traffic Pulse: Real-time visual route volume monitors across 5 major Bihar highways (Patna ➔ Gaya/Bodh Gaya, Patna ➔ Muzaffarpur, Patna ➔ Darbhanga, Patna ➔ Bhagalpur, Patna ➔ Varanasi).
- [x] 32.5 V2 Financial & Margin Command Center: Live Gross Booking Value (GBV), Net 15% Platform Commission, 85% Chauffeur Earnings Ledger, and NHAI Higher Peak Toll Engine notice.
- [x] 32.6 Live Outstation Feed & Interactive Filters: Global search across PNR, passenger name, phone, and route with 4 category filter pills (All, Unassigned, In-Transit, Completed).
- [x] 32.7 Trip Cards V2 & Quick Chauffeur Assignment Modal: Trip cards with scheduled pickup slots, cab tier badges, 1-tap direct call buttons (Driver & Rider), and inline modal to allocate verified on-duty drivers in 1 tap without screen switching.
- [x] 32.8 Fleet Broadcast Modal: Dispatch broadcast modal with preset road safety and surge advisories transmitted to all active chauffeurs.
- [x] 32.9 5-Desk Navigation Hub: Updated `AdminNavigator.tsx` to 5 executive operational desks starting on `Dashboard V2` with 0 TypeScript compilation errors.
- [x] 32.10 Automated Verification: Passed 13/13 tests in `scratch/test-admin-dashboard-v2.js`.

### Phase 33: 19-Point Production-Readiness Master Suite
- [x] 33.1 Real Login & Logout (Item 1): Session persistence and secure token clearing across Passenger, Driver, and Admin apps.
- [x] 33.2 Password & Credential Reset (Item 2): Self-service reset workflow for Admins and phone OTP reset for Chauffeurs/Passengers.
- [x] 33.3 Email Verification (Item 3): Verification token generator and status badge for user accounts.
- [x] 33.4 Loading States (Item 4): Universal shimmer skeletons and activity spinners for async operations.
- [x] 33.5 Empty States (Item 5): High-contrast, illustrated zero-data views across all lists and ledgers.
- [x] 33.6 Clear Error Messages (Item 6): User-friendly toast and banner notifications replacing raw exceptions.
- [x] 33.7 Form Validation (Item 7): Centralized regex validators for phone, email, UTR, OTP, and vehicle data.
- [x] 33.8 Rate Limiting (Item 8): Sliding-window rate limiters protecting auth, OTP, and booking endpoints.
- [x] 33.9 Database Backups (Item 9): Automated backup verification script and database snapshot manager.
- [x] 33.10 Row-Level Security & Tenant Isolation (Item 10): Scoped data boundaries for passengers, drivers, and dispatchers.
- [x] 33.11 API Keys Off Frontend (Item 11): Zero secrets in client bundles with backend proxying.
- [x] 33.12 Mobile Layout & Safe Areas (Item 12): Calibrated edge-to-edge layout across iOS notch and Android system bars.
- [x] 33.13 Custom 404 Pages (Item 13): Standalone `404.html` and mobile navigator fallback routes.
- [x] 33.14 Analytics Engine (Item 14): Telemetry logger tracking key user journey events.
- [x] 33.15 Error Tracking (Item 15): Client exception capture and breadcrumb reporting.
- [x] 33.16 Privacy Policy Pages (Item 16): Dedicated in-app screens and compliance links.
- [x] 33.17 Terms of Service Pages (Item 17): Dedicated in-app terms screens covering Bihar outstation carriage.
- [x] 33.18 Delete Account Action (Item 18): App Store / Play Store mandatory self-service data erasure flow.
- [x] 33.19 Onboarding Flow (Item 19): First-time user welcome carousel for Passenger and Driver apps.

### Phase 34: Broadcast Dispatch System, Clear Trip Schedule UI & Manual Admin Override
- [x] 34.1 Multi-Driver Broadcast Engine (`broadcastBooking`): Auto-broadcasts incoming bookings to all eligible candidate drivers simultaneously.
- [x] 34.2 Atomic Claim Locking (`claimBookingAtomic`): First-come first-served concurrency locking with HTTP 409 collision rejection for competing drivers.
- [x] 34.3 Automated 120-Second Escalation (`checkBroadcastTimeouts`): Auto-escalates unaccepted broadcasts to Admin Operations Desk.
- [x] 34.4 Prominent `DD-MMM-YYYY | hh:mm A` Schedule Banners across Passenger App, Driver App, Passenger Web, Driver Web, and Admin Web.
- [x] 34.5 Driver Mobile Broadcast Feed & 1-Tap ⚡ CLAIM TRIP with waking alert and collision handling.
- [x] 34.6 Admin Operations Override Desk: Pulsing `📡 BROADCASTING` badge, 1-tap Broadcast All, Cancel Trip with reason, and Manual Mark Completed.
- [x] 34.7 Automated Self-Test Verification Suite (`self-test-live-system.js`): 22/22 live assertion tests passed cleanly.



### Phase 35: Enterprise Razorpay Payment Gateway Integration
- [x] 35.1 Multi-Mode Order Creation (`createRazorpayOrder`): Supports Token Advance (₹299), ₹1 Live Test Transaction, and 100% Full Pre-Payment.
- [x] 35.2 Cryptographic Verification (`verifyRazorpayPayment`): Timing-safe HMAC SHA-256 signature verification with automated fallback.
- [x] 35.3 Webhook Event Engine (`verifyRazorpayWebhook`): Secure signature check with deduplication ring buffer for `payment.captured` & `payment.failed`.
- [x] 35.4 Web Passenger Checkout UI (`payment.html`): Razorpay SDK modal integration, interactive payment tier selector, and dynamic success receipt.
- [x] 35.5 Admin Dashboard Gateway Desk (`admin.html`): 1-click Razorpay API connection test button, webhook URL clipboard copier, and masked secret storage.
- [x] 35.6 Automated Test Suite (`tests/razorpay-integration.test.js`): 11/11 tests passing covering config, order creation, HMAC validation, and webhooks.

## 3. Ralph Loop Acceptance Criteria
- Code must pass validation tests without syntax errors.
- Commits must be atomic and verified.
- Status log must be recorded in `progress.txt`.





