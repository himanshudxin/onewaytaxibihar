# Comprehensive Mobile Architecture & Screens Audit Report
**Project:** OneWayTaxiBihar (onewaytaxibihar.com) — Passenger Mobile App Redesign  
**Auditor:** Explorer 1 (Mobile Architecture Auditor)  
**Target:** `mobile/apps/passenger` & `mobile/shared`  
**Date:** 2026-11-02  
**Baseline Verification:** `cd mobile; npx tsc --noEmit` PASS (0 errors)

---

## 1. Executive Summary & Technology Stack Verification

### 1.1 Confirmation of Mobile Application Existence
In accordance with user instructions (*"If the repository contains only a website and no separate mobile app, STOP and report that before attempting to create or replace an application"*):
- **Finding:** A complete, modern, production-grade native mobile application codebase **DOES EXIST** in this repository.
- It is located at `c:\Users\himan\onewaycabs\mobile\apps\passenger` within a unified Expo / React Native monorepo that also houses the driver partner app (`mobile/apps/driver`), the fleet admin console (`mobile/apps/admin`), and the shared core library (`mobile/shared`).

### 1.2 Technology & Framework Audit
| Stack Dimension | Current Specification | Source File |
|---|---|---|
| **Framework** | Expo SDK 58 (`expo: ^58.0.0`) | `mobile/package.json:25` |
| **React Native** | 0.88.0 (`react-native: 0.88.0`) | `mobile/package.json:35` |
| **React Runtime** | 19.3.0 (`react: 19.3.0`) | `mobile/package.json:34` |
| **Architecture Engine** | React Native New Architecture (`newArchEnabled: true`) | `mobile/apps/passenger/app.json:10` |
| **Language** | TypeScript ~6.0.3 | `mobile/package.json:43` |
| **Navigation** | React Navigation v7 (`native-stack: ^7.2.0`, `bottom-tabs: ^7.2.0`) | `mobile/package.json:22-24` |
| **Iconography** | `lucide-react-native: ^0.475.0` | `mobile/package.json:32` |
| **Device Capabilities** | `expo-location`, `expo-haptics`, `expo-linear-gradient`, `expo-asset`, `expo-status-bar` | `mobile/package.json` |
| **Bundle Identifier (iOS)** | `com.onewaytaxibihar.passenger` | `mobile/apps/passenger/app.json:18` |
| **Package Name (Android)** | `com.onewaytaxibihar.passenger` | `mobile/apps/passenger/app.json:31` |
| **URL Scheme** | `onewaytaxi` | `mobile/apps/passenger/app.json:8` |
| **TypeScript Health** | **0 Errors** (`npx tsc --noEmit` exited with code 0) | Verified via terminal execution |

---

## 2. Comprehensive Screen-by-Screen & Route Audit (Screens A through J)

| Screen ID | Screen Name | File Location | Route Name | Current Status & Capabilities | Gaps Against User Specifications |
|---|---|---|---|---|---|
| **A** | **Splash Screen** | `mobile/apps/passenger/src/screens/SplashScreen.tsx` | `Splash` | • Displays `BrandLogo` hero<br>• Badges: "Zero Return Fare", "Doorstep Pickup"<br>• Loading spinner<br>• 1.8s timer transitions to `MainTabs` | • Background is dark/theme-dependent (`colors.background`).<br>• **User Specification Requires:** Premium yellow background, existing OneWayTaxiBihar logo, smooth loading animation, professional app introduction. |
| **B** | **Login & Registration** | `mobile/apps/passenger/src/screens/AuthScreen.tsx` | `Auth` (modal) | • 10-digit mobile number input (`+91`)<br>• Real OTP trigger (`/auth/send-otp`)<br>• 4-digit OTP verification with 30s resend timer<br>• 1-tap demo login bypass (`9876543210` / `1234`)<br>• DPDP Act statutory compliance badge | • Visual styling is emerald/dark theme.<br>• Needs redesign with yellow/gold and white aesthetic.<br>• Authentication API contracts are fully functional and must remain untouched. |
| **C** | **Home Screen** | `mobile/apps/passenger/src/screens/HomeScreen.tsx` | `MainTabs` ➔ `Home` | • Brand header with account badge<br>• One-Way / Round Trip toggle<br>• Pickup & Drop destination selector inputs<br>• Interactive Date & Time picker modals (7 dynamic days, 13 departure slots)<br>• Passenger count selector (1, 2, 4, 6)<br>• "Explore Guaranteed Fares" CTA button<br>• Popular Corridors horizontal carousel (Patna to Gaya, Muzaffarpur, etc.)<br>• Quick Transit Hubs grid<br>• Value Guarantee badge<br>• App Updater Modal & First-Launch Onboarding Modal | • Missing personalized greeting & customer profile header (e.g., "Hello Himanshu" or customer avatar).<br>• Missing "Recent Bookings" quick card/carousel on Home screen.<br>• Missing floating/embedded 1-tap customer support shortcut.<br>• Visual language needs transition to premium yellow/gold and white cards. |
| **D** | **Location Selection** | `mobile/apps/passenger/src/screens/AddressSelectScreen.tsx` | `AddressSelect` | • Search input filtering 45+ Bihar districts<br>• GPS auto-detection button (simulated 800ms to Patna)<br>• Doorstep pickup / drop landmark text input<br>• List of service districts | • **CRITICAL GAP:** The user requested an *"attractive map-based interface with current location, pickup search, destination search, map markers, location confirmation, search suggestions"*. Currently, this screen is **purely text/list-based without map rendering or pins/markers**.<br>• Must introduce an attractive visual map view canvas with interactive pickup/destination markers. |
| **E** | **Vehicle Selection** | `mobile/apps/passenger/src/screens/CabSelectScreen.tsx` | `CabSelect` | • Route info header (origin ➔ dest, km, trip type)<br>• Promo value strip<br>• **Only 3 vehicle tiers** (`sedan`, `hatchback`, `suv`)<br>• Specs (passengers, bags, AC)<br>• Transparent fare breakdown modal<br>• Sticky bottom bar with all-inclusive price | • **CRITICAL GAP:** User specification demands **5 vehicle tiers**: Hatchback, Sedan, XUV, Executive Sedan, Luxury XUV.<br>• Currently only 3 tiers are rendered.<br>• **NO vehicle images are displayed** (only Lucide icons). Must display real vehicle images for all 5 tiers.<br>• Backend discovery: `api/index.js` **already supports all 5 tiers** (`hatchback`, `sedan`, `sedan_prime`, `suv`, `innova_crysta`). |
| **F** | **Booking Confirmation** | `mobile/apps/passenger/src/screens/CheckoutScreen.tsx` & `BookingConfirmScreen.tsx` | `Checkout` ➔ `BookingConfirm` | • `CheckoutScreen.tsx`: Trip review, doorstep address inputs, departure time slot picker, passenger name/phone with Quick Fill, payment option (Cash on Arrival vs ₹500 Token Advance with 12-digit UTR input), calls `MobileApiClient.createBooking`<br>• `BookingConfirmScreen.tsx`: Success badge, reference number (`OTB-2026-XXXX`), 4-digit ride start OTP (`startOtp`), itinerary card, "Track Live Booking Timeline" CTA | • Review and confirmation workflow works smoothly with backend booking APIs.<br>• Visual presentation needs to be refined into a cohesive, high-end booking summary matching the yellow-and-white visual identity. |
| **G** | **Driver Assignment** | `mobile/apps/passenger/src/screens/BookingTimelineScreen.tsx` | `BookingTimeline` | • Real-time status stages synced with `FleetSyncService`<br>• Verified driver card (name, phone, rating, trips, vehicle plate, Start OTP, Call button)<br>• Admin manual assignment fallback retained | • Status stages need clear visual alignment with the exact 7 stages specified by the user: Booking received, Searching for driver, Driver assigned, Driver accepted, Driver details available, Trip started, Trip completed.<br>• Never show fake driver assignment. |
| **H** | **Live Trip Tracking** | `mobile/apps/passenger/src/screens/BookingTimelineScreen.tsx` | `BookingTimeline` | • Visual vehicle position on simulated radar canvas<br>• Real-time ETA and GPS coordinates (if emitted by driver)<br>• Direct driver call button<br>• 1-tap Google Maps external GPS navigation<br>• GST Tax Invoice download link | • Current map is a dark 140px custom simulated canvas.<br>• Needs clean, modern ride-hailing tracking presentation with live telemetry, vehicle specs, and support shortcut. |
| **I** | **My Bookings** | `mobile/apps/passenger/src/screens/MyTripsScreen.tsx` | `MainTabs` ➔ `MyTrips` | • Filter tabs: `All`, `Upcoming`, `Completed`, `Cancelled`<br>• FlatList with ride cards (Ref PNR, route, date, fare, status)<br>• Pull-to-refresh connected to `MobileApiClient.getPassengerTrips`<br>• Empty state with "Book an Outstation Cab" CTA | • Functionality perfectly maps to requirements.<br>• Needs visual redesign with rounded white/golden cards, badge accents, and clean status typography. |
| **J** | **Profile and Support** | `mobile/apps/passenger/src/screens/ProfileScreen.tsx` & `SupportScreen.tsx` | `MainTabs` ➔ `Profile` & `Support` | • Passenger avatar, name, phone, verified badge<br>• Display theme switcher (System, Light, Dark)<br>• 24x7 Helpdesk hotline (+91 80021 41816)<br>• WhatsApp Live Chat (+91 77394 06400)<br>• Expandable FAQs<br>• In-App Privacy Policy & Terms of Service links<br>• DPDP Act "Delete Account & Data" action<br>• Sign out | • Comprehensive feature coverage.<br>• Unify profile and support access points, update design to yellow/gold and white theme. |

---

## 3. Bottom Navigation Setup Audit

### 3.1 Current Navigator Configuration (`PassengerNavigator.tsx`)
Currently, `MainTabNavigator` in `mobile/apps/passenger/src/navigation/PassengerNavigator.tsx` defines only **4 bottom tabs**:

```tsx
// Current MainTabNavigator:
<Tab.Navigator ...>
  <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Book Taxi', ... }} />
  <Tab.Screen name="MyTrips" component={MyTripsScreen} options={{ tabBarLabel: 'My Rides', ... }} />
  <Tab.Screen name="Support" component={SupportScreen} options={{ tabBarLabel: '24x7 Help', ... }} />
  <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Account', ... }} />
</Tab.Navigator>
```

### 3.2 Audit Gap vs. User Specification #4
The user specification explicitly mandates:
> **"4. BOTTOM NAVIGATION**  
> **Use a clean five-item bottom navigation:**  
> **- Home**  
> **- My Bookings**  
> **- Track**  
> **- Support**  
> **- Profile"**

### 3.3 Root Cause & Remediation Path
- **Defect:** The **Track** tab is currently omitted from bottom navigation. `BookingTimelineScreen` is only reachable via stack push after booking or tapping a trip in `MyTripsScreen`. A passenger returning to the app has no 1-tap bottom tab to view active trip progress.
- **Remediation:** 
  1. Add a 5th tab to `MainTabNavigator`: `Track` mapped to `BookingTimelineScreen` (or a dedicated `TrackScreen` wrapper that displays the active trip if present, or allows searching active bookings by Reference Number if none is active).
  2. Use clean Lucide icons:
     - `Home`: `<Home size={22} />`
     - `My Bookings`: `<Calendar size={22} />` or `<Clock size={22} />`
     - `Track`: `<Navigation size={22} />` or `<Compass size={22} />`
     - `Support`: `<Headphones size={22} />`
     - `Profile`: `<User size={22} />`
  3. Set active tint to Premium Gold (`#F59E0B` / `#D97706`) and surface to crisp white/light with subtle elevation.

---

## 4. Vehicle Tiers & Backend Fare Calculation Alignment

### 4.1 Discovery: Authoritative Backend Fleet Engine (`api/index.js`)
Inspection of `api/index.js` (lines 233-250) revealed that the backend **already has the 5 exact tiers programmed in its authoritative calculation engine**:

```javascript
// api/index.js lines 233-239:
const FLEET_RATES = {
  hatchback:     { perKm: 21.0, minFare: 1698, minKm: 50, name: "Go Hatchback", model: "WagonR, Tiago, Celerio", seats: 4 },
  sedan:         { perKm: 25.0, minFare: 2198, minKm: 50, name: "Prime Sedan", model: "Dzire, Etios, Amaze", seats: 4 },
  sedan_prime:   { perKm: 29.0, minFare: 2698, minKm: 50, name: "Executive Sedan", model: "Honda City, Ciaz", seats: 4 },
  suv:           { perKm: 33.0, minFare: 3398, minKm: 50, name: "Family SUV (6+1)", model: "Maruti Ertiga, Carens", seats: 6 },
  innova_crysta: { perKm: 44.0, minFare: 4598, minKm: 50, name: "Toyota Innova Crysta", model: "Innova Crysta", seats: 7 }
};
```

### 4.2 Exact Mapping Table for Required 5 Tiers
| Required User Tier | Backend Identifier (`cabTier`) | Display Title | Example Vehicle Models | Passenger Capacity | Luggage Capacity |
|---|---|---|---|---|---|
| **1. Hatchback** | `hatchback` | Go Hatchback | Maruti WagonR, Tata Tiago, Celerio | 4 Passengers | 2 Medium Bags |
| **2. Sedan** | `sedan` | Prime Sedan | Maruti Dzire, Toyota Etios, Hyundai Aura | 4 Passengers | 3-4 Large Bags |
| **3. XUV** | `suv` | Family SUV (6+1) | Maruti Ertiga, Kia Carens, Renault Triber | 6 Passengers | 4-5 Bags |
| **4. Executive Sedan** | `sedan_prime` | Executive Sedan | Honda City, Maruti Ciaz, Hyundai Verna | 4 Passengers | 4 Large Bags |
| **5. Luxury XUV** | `innova_crysta` | Luxury XUV | Toyota Innova Crysta | 7 Passengers | 6 Large Bags |

### 4.3 Vehicle Imagery Assets
Available vehicle imagery in `c:\Users\himan\onewaycabs\images\voyago`:
- `car-sedan.jpg` (Sedan / Executive Sedan)
- `car-ertiga.jpg` (XUV / Ertiga)
- `car-suv.jpg` (Luxury XUV / Innova)
- `deal-car.jpg` (Hatchback)

---

## 5. Brand Identity & Strict System Protection Audit

### 5.1 Preservation of Existing Brand Assets
- **Name:** "OneWayTaxiBihar" (Strictly preserved).
- **Logo Component:** `mobile/shared/components/BrandLogo.tsx`.
- **Logo Assets:** `mobile/shared/assets/logo-reframed.png` and root `img/logo-reframed.png`.
- **Typography:** Bold dual-colored lockup `"OneWay"` + `"TaxiBihar"`. Proportions, badge shape, and subtitle `"BIHAR INTERCITY CAB NETWORK"` are preserved intact.

### 5.2 Color Scheme Transition
- **Previous Palette:** Voyago Emerald `#059669` as primary accent.
- **Redesign Palette Required by User:**
  - **Primary Gold / Warm Yellow:** `#F59E0B` (Amber 500) / `#EAB308` (Yellow 500) / `#D97706` (Amber 600)
  - **Background / Surface:** `#FFFFFF` (Pure White cards), `#F8FAFC` (Light Slate backdrop)
  - **Card Borders & Accents:** Subtle golden halos `rgba(245, 158, 11, 0.2)` and soft borders `#E2E8F0`
  - **Contrast Text:** `#0F172A` (Slate 900 for high-contrast readability) and `#64748B` (Slate 500 for secondary details)
  - **Night Mode Support:** `#0B0F19` obsidian background with warm golden accents

---

## 6. Shared Components & State Management Architecture

### 6.1 State Management Layer (`mobile/apps/passenger/src/context/PassengerContext.tsx`)
- Manages:
  - `search`: draft origin, destination, pickup/drop addresses, trip type, dates, passenger count.
  - `selectedTier`: currently selected cab category.
  - `fares`: live fares fetched from backend `/fares`.
  - `myTrips`: synced passenger trip history.
  - `activeBooking`: current in-flight ride.
  - `userPhone` & `isLoggedIn`: phone-based auth session.
- Subscribes to `FleetSyncService` for zero-lag cross-app sync when Admin assigns drivers or Driver updates trip status.

### 6.2 Shared Library (`mobile/shared`)
- **Components:**
  - `BrandLogo.tsx` — Protected brand lockup.
  - `ErrorBoundary.tsx` — React error boundary guarding root runtime.
  - `LoadingSkeleton.tsx` & `EmptyStateView.tsx` — UX loading & empty states.
  - `OnboardingModal.tsx` & `AppUpdaterModal.tsx` — Self-hosted update & onboarding engine.
  - `NotFoundScreen.tsx` — 404 navigation fallback.
- **Services:**
  - `api.ts` — Unified `MobileApiClient` connecting to backend endpoints.
  - `storage.ts` — Persistent session engine.
  - `fleetSync.ts` — Event emitter and live memory bus between apps.
  - `gmapTollService.ts` — NHAI expressway toll matrix engine.

---

## 7. Actionable Phase 2 & Phase 3 Roadmap for Downstream Agents

| Priority | Task Area | Detailed Architectural Guidance |
|---|---|---|
| **P1** | **Bottom Navigation (5 Tabs)** | Update `PassengerNavigator.tsx` to include all 5 tabs: `Home`, `MyTrips` (My Bookings), `Track`, `Support`, `Profile`. Connect `Track` to `BookingTimelineScreen`. |
| **P1** | **5 Vehicle Tiers** | Expand `CabTierId` in `mobile/shared/types/index.ts` to include `'sedan_prime'` and `'innova_crysta'`. Update `CabSelectScreen.tsx` to render all 5 tiers with real vehicle images and calculated fares. |
| **P1** | **Yellow & White Theme Palette** | Update `mobile/shared/theme/colors.ts` with the premium Golden Yellow (`#F59E0B`/`#EAB308`) and White color system while preserving `BrandLogo.tsx`. |
| **P2** | **Map-Based Location Selection** | Upgrade `AddressSelectScreen.tsx` with an attractive map interface with visual pickup & destination pins and current location detection. |
| **P2** | **Home Screen Header & Recent Rides** | Add user greeting/profile card and "Recent Bookings" quick-access cards to `HomeScreen.tsx`. |
| **P2** | **Splash Screen Styling** | Update `SplashScreen.tsx` to feature the premium yellow background with the official logo and smooth loading animation. |
| **P3** | **Verification & Tests** | Execute `npx tsc --noEmit` and run the full test suite to guarantee 0 regressions against existing APIs and database contracts. |

---
**Report generated and verified by Explorer 1.**
