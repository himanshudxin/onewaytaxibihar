# Mobile Applications Technical Survey Report
**Project:** OneWayCabs (OneWayTaxiBihar)  
**Apps Analyzed:** Passenger (`com.onewaytaxibihar.passenger`), Driver (`com.onewaytaxibihar.driver`), Admin (`com.onewaytaxibihar.admin`)  
**Scope:** Requirements R1 (Auth & Lifecycle), R2 (UX, Feedback, Validation, Onboarding), R4 (Safe Areas & Navigation Fallbacks), R5 (In-App Legal Pages)  
**Date:** 2026-10-31  
**Investigator:** Explorer 2 (`teamwork_explorer_survey_2`)  

---

## Executive Summary

The OneWayCabs mobile platform is structured as an Expo SDK 58 (`react-native@0.88.0`, `typescript@~6.0.3`) monorepo workspace delivering **three separate native mobile applications**:
1. **Passenger App** (`apps/passenger`) — Outstation booking, corridor search, doorstep address picker, transparent fare modal, 8-stage visual ride timeline, and account profile.
2. **Driver App** (`apps/driver`) — Chauffeur cockpit, online/offline duty toggle, GPS foreground tracking, 30-second dispatch popup, 4-stage ride execution state machine, and earnings ledger.
3. **Admin App** (`apps/admin`) — Central operations command center, bookings ledger, driver KYC audit, manual and automatic dispatch hub, and fleet configuration.

### Critical Baseline Finding
Running TypeScript compilation across the mobile workspace (`cd mobile; npx tsc --noEmit`) currently passes with **0 compilation errors**.

However, deep technical investigation revealed several high-priority architectural and functional gaps that prevent production readiness:
1. **Session Persistence Failure on Native Devices**: `StorageService` (`mobile/shared/services/storage.ts`) relies on `window.localStorage` (which is `undefined` on native iOS/Android runtime) and falls back to an ephemeral in-memory dictionary. Session tokens and user profiles are completely wiped whenever the app reloads or is restarted on mobile devices.
2. **Hardcoded Credentials & Auto-Login Backdoors**:
   - `AdminContext.tsx` automatically authenticates as `admin` with hardcoded password `'harharmahadev@1'` whenever a cached session is absent, leaking production credentials in the client bundle and breaking logout.
   - `DriverContext.tsx` falls back to `'9876508888'` on refresh, automatically logging in a demo chauffeur even after logout.
3. **Missing Password / Credential Reset Workflows**: Zero reset screens or reset OTP/token flows exist across Passenger, Driver, and Admin apps.
4. **Severe Safe Area Non-Conformity in Admin App**: Not a single screen in `apps/admin` uses `SafeAreaView`. All admin screens hardcode `paddingTop: 54`, causing top content collisions on iPhone Dynamic Island (59pt) and excessive blank space on non-notch devices (20pt).
5. **No Navigation Fallback (404 Screen)**: None of the three React Navigation stacks define a fallback or `NotFound` screen.
6. **No In-App Legal Screens**: Passenger profile delegates Privacy Policy and Terms of Service to external browser links via `Linking.openURL`, while Driver and Admin apps have zero legal navigation.
7. **No First-Time Launch Onboarding Flow**: Passenger and Driver splash screens transition straight to home/auth after a 1.8-second timer without checking first-launch flags or offering onboarding.
8. **UX State Inconsistencies**: Missing loading skeletons and empty states in key data screens (`MyTripsScreen`, `DriverEarningsScreen`, `AdminDriversScreen`).

---

## 1. Mobile Architecture & Codebase Structure

### 1.1 Directory Tree
```
mobile/
├── package.json                         # Expo SDK 58, React 19.3.0, React Native 0.88.0
├── tsconfig.json                        # Path alias @/* -> shared/*
├── app.json                             # Root configuration
├── index.js                             # Universal entry point with APP_TARGET switcher
├── apps/
│   ├── passenger/                       # Passenger Mobile App
│   │   ├── app.json                     # Bundle ID: com.onewaytaxibihar.passenger
│   │   ├── package.json                 # Start script: port 8081
│   │   └── src/
│   │       ├── App.tsx                  # Root wrapper (ErrorBoundary, Theme, PassengerProvider)
│   │       ├── navigation/PassengerNavigator.tsx # Stack (Splash, MainTabs, Auth, Checkout, etc.)
│   │       ├── context/PassengerContext.tsx      # Search state, myTrips, auth state, fares
│   │       └── screens/                 # 11 Screens (Splash, Home, Auth, CabSelect, etc.)
│   │
│   ├── driver/                          # Chauffeur Partner App
│   │   ├── app.json                     # Bundle ID: com.onewaytaxibihar.driver
│   │   ├── package.json                 # Start script: port 8082
│   │   └── src/
│   │       ├── App.tsx                  # Root wrapper (ErrorBoundary, Theme, DriverProvider)
│   │       ├── navigation/DriverNavigator.tsx # Stack (Splash, DriverTabs, DriverAuth, etc.)
│   │       ├── context/DriverContext.tsx      # Driver profile, duty toggle, active offer/trip, ledger
│   │       ├── services/ForegroundTrackingService.ts # GPS foreground location updates
│   │       └── screens/                 # 8 Screens (DriverSplash, DriverAuth, DriverHome, etc.)
│   │
│   └── admin/                           # Fleet Command Console
│       ├── app.json                     # Bundle ID: com.onewaytaxibihar.admin
│       ├── package.json                 # Start script: port 8083
│       └── src/
│           ├── App.tsx                  # Root wrapper (ErrorBoundary, Theme, AdminProvider)
│           ├── navigation/AdminNavigator.tsx # Stack + Tabs (Dashboard, Bookings, Dispatch, Drivers, Settings)
│           ├── context/AdminContext.tsx      # Admin metrics, bookings, drivers, assignDriver
│           └── screens/                 # 6 Screens (AdminLogin, Dashboard, Bookings, Dispatch, Drivers, Settings)
│
└── shared/                              # Shared Domain Core Engine
    ├── assets/                          # App logos & branded icons
    ├── components/                      # BrandLogo.tsx, ErrorBoundary.tsx
    ├── services/                        # api.ts, storage.ts, fleetSync.ts, offlineVault.ts, notifications.ts, gmapTollService.ts
    ├── theme/                           # colors.ts, ThemeContext.tsx (Light/Dark/System)
    ├── types/                           # Strict TypeScript domain interfaces
    └── utils/                           # formatters.ts (currency, phone sanitization, distance)
```

### 1.2 Universal Entry Point (`mobile/index.js`)
```javascript
const target = process.env.APP_TARGET || process.env.EXPO_PUBLIC_APP_TARGET || 'passenger';
function StandaloneEntry() {
  if (target === 'driver') return <DriverApp />;
  if (target === 'admin') return <AdminApp />;
  return <PassengerApp />;
}
registerRootComponent(StandaloneEntry);
```

### 1.3 State Management & React Navigation
- **Passenger**: `PassengerContext` manages search draft, corridor fares, active booking, user phone, and `myTrips`. Navigation: `createNativeStackNavigator` + `createBottomTabNavigator` (Home, MyTrips, Support, Profile).
- **Driver**: `DriverContext` manages duty online/offline state, active trip offer, active booking execution, and earnings ledger. Navigation: `createNativeStackNavigator` + `createBottomTabNavigator` (DutyHome, Earnings, Profile).
- **Admin**: `AdminContext` manages KPI metrics, bookings ledger, fleet KYC verification list, and dispatch assignments. Navigation: `createNativeStackNavigator` with auth-gate + `createBottomTabNavigator` (Dashboard, Bookings, Dispatch, Drivers, Settings).

---

## 2. Requirement R1: Mobile Authentication & Account Lifecycle

### 2.1 Current State Analysis

| Capability | Passenger App | Driver App | Admin App |
|---|---|---|---|
| **Real Login** | Phone OTP (SMS + Dev bypass `1234`) | Phone + 4-digit PIN / OTP | Username + Password (`/admin/login`) |
| **Session Persistence** | Broken on Native (`memoryStore`) | Broken on Native (`memoryStore`) | Broken on Native (`memoryStore`) |
| **Token Storage** | `otb_auth_token` | `otb_auth_token` | `otb_auth_token` + `otb_admin_session` |
| **Logout & Teardown** | Partial (leaves `otb_search_draft`) | Incomplete (resets to demo driver on reload) | Incomplete (auto-logins with master password) |
| **Credential Reset** | None | None | None |
| **Account Deletion** | DPDP Act compliant (`ProfileScreen.tsx`) | DPDP Act compliant (`DriverProfileScreen.tsx`) | N/A (Operator role) |

### 2.2 Deep Dive Findings & Critical Vulnerabilities

#### A. Native Storage Breakdown (`mobile/shared/services/storage.ts`)
Lines 9-25:
```typescript
export const StorageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStore[key] || null;
  },
```
- In React Native / Expo running natively on iOS and Android, `window.localStorage` is undefined.
- Data falls back to `memoryStore: Record<string, string> = {}`.
- Whenever the app reloads, crashes, or is background-killed, the JavaScript context resets and all stored tokens are destroyed.
- **Root Cause**: `@react-native-async-storage/async-storage` or `expo-secure-store` is not installed or configured in `StorageService`.

#### B. Driver Auto-Login Vulnerability (`mobile/apps/driver/src/context/DriverContext.tsx`)
Lines 108-116:
```typescript
const savedPhone = (await StorageService.getItem('otb_driver_phone')) || '9876508888';
if (savedPhone) {
  const prof = await MobileApiClient.getDriverProfile(savedPhone);
  if (prof) {
    setDriver(prof);
    setIsDutyOnline(prof.isDutyOnline);
    setIsLoggedIn(true);
    await checkDriverDispatches(savedPhone);
  }
}
```
- When `otb_driver_phone` is null (such as after explicit logout), it falls back to `'9876508888'` and automatically logs the user back in!

#### C. Admin Master Credential Leak & Auto-Login Backdoor (`mobile/apps/admin/src/context/AdminContext.tsx`)
Lines 82-94:
```typescript
let storedAdmin = await StorageService.getJSON<AdminOperator>('otb_admin_session');
let token = await StorageService.getItem('otb_auth_token');

// Automatically connect to live production dispatcher session if not yet cached
if (!storedAdmin || !token) {
  try {
    const authRes = await MobileApiClient.adminLogin('admin', 'harharmahadev@1');
    if (authRes && authRes.token) {
      token = authRes.token;
      storedAdmin = authRes.admin;
    }
  } catch (e) {}
}
```
- Hardcodes cleartext production password `'harharmahadev@1'` directly inside client bundles, violating R3 data protection.
- Bypasses real login screen and breaks operator logout teardown.
- `AdminLoginScreen.tsx` line 24 also sets default state `useState('harharmahadev@1')`.

#### D. Credential & Password Reset Absence
- **Passenger**: No mechanism to reset credentials or recover account.
- **Driver**: No self-service PIN reset screen. `api/index.js` line 6042 states "Call 6206494214 for PIN reset".
- **Admin**: No "Forgot Password?" prompt, reset token request, or OTP update screen.

#### E. Account Deletion Workflow
- **Passenger**: `ProfileScreen.tsx` (lines 56-74) prompts two-step confirmation with destructive styling, calls `MobileApiClient.requestAccountDeletion(phone, reason)`, clears local cache, logs out, and redirects to Home.
- **Driver**: `DriverProfileScreen.tsx` (lines 50-68) prompts two-step confirmation, calls `requestAccountDeletion`, clears active trip cache, logs out, and navigates to `DriverAuth`.
- **Backend**: `api/index.js` lines 1222 and 6390 support `/user/delete-account` and `/driver/delete-account` with DPDP audit logging and session invalidation.

---

## 3. Requirement R2: User Experience, Feedback & Input Validation

### 3.1 Loading States (Shimmer Skeletons & Activity Spinners)

| Screen | File Path | Current Status | Required Improvement |
|---|---|---|---|
| **Passenger Home** | `apps/passenger/.../HomeScreen.tsx` | Instant static fallback | Add corridor fare loading skeleton/spinner while fetching remote MongoDB fares |
| **Cab Selection** | `apps/passenger/.../CabSelectScreen.tsx` | Static fare calculation | Add loading skeleton if remote fare lookup is pending |
| **Ride Checkout** | `apps/passenger/.../CheckoutScreen.tsx` | ActivityIndicator on Confirm & UTR Submit | Compliant |
| **Passenger My Trips** | `apps/passenger/.../MyTripsScreen.tsx` | **No spinner or skeleton** during trip fetch | Add `refreshing` indicator on FlatList and initial loading skeleton |
| **Driver Console** | `apps/driver/.../DriverHomeScreen.tsx` | Duty switch has instant feedback | Add skeleton on initial cockpit profile load |
| **Driver Earnings** | `apps/driver/.../DriverEarningsScreen.tsx` | Spinner on Instant Payout button | Add loading skeleton/spinner for initial earnings ledger load |
| **Driver KYC Status** | `apps/driver/.../DriverVerificationStatusScreen.tsx` | Local simulated update | Add spinner during live status audit fetch |
| **Admin Command** | `apps/admin/.../AdminDashboardScreen.tsx` | RefreshControl + full-screen initial spinner | Compliant |
| **Admin Bookings** | `apps/admin/.../AdminBookingsScreen.tsx` | `refreshing={isLoading}` on FlatList | Compliant |
| **Admin Fleet KYC** | `apps/admin/.../AdminDriversScreen.tsx` | Spinner on individual Approve button | Add FlatList pull-to-refresh spinner for fleet list |

### 3.2 Empty States (Illustrations & Action Prompts)

| Screen | File Path | Current Empty State | Required Improvement |
|---|---|---|---|
| **My Trips** | `apps/passenger/.../MyTripsScreen.tsx` | `AlertCircle`, "No Rides Found", "Book an Outstation Cab" CTA button | Fully compliant |
| **Address Picker** | `apps/passenger/.../AddressSelectScreen.tsx` | Blank list when search doesn't match | Add `ListEmptyComponent` ("No matching city found in Bihar network") |
| **Driver Earnings** | `apps/driver/.../DriverEarningsScreen.tsx` | **Renders empty view** if history is `[]` | Add Empty State card ("No completed settlements today. Go on-duty to accept rides.") |
| **Admin Bookings** | `apps/admin/.../AdminBookingsScreen.tsx` | `AlertCircle`, "No Matching Trips" text | Add Action button ("Clear Search Filters" / "Refresh Feed") |
| **Admin Drivers** | `apps/admin/.../AdminDriversScreen.tsx` | Blank FlatList if no drivers match filter | Add `ListEmptyComponent` ("No drivers found in this filter category") |
| **Admin Dispatch** | `apps/admin/.../AdminDispatchScreen.tsx` | Step 1 & 2 empty boxes with check and warning icons | Compliant |

### 3.3 Error Handling & Exception Sanitization
- **Current Defect**: Views catch raw errors and display `Alert.alert('Error', e.message)`.
- If `fetch()` fails due to network or server issues, raw technical errors such as `Network request failed`, `JSON Parse error: Unexpected token <`, or `HTTP 500: Internal Server Error` are displayed directly to users.
- **Required Solution**: Create a centralized `formatUserErrorMessage(err: unknown): string` utility in `mobile/shared/utils/formatters.ts` that maps raw exceptions to friendly messages:
  - Network timeout -> "Unable to reach dispatch network. Please check your internet connection."
  - HTTP 429 -> "Too many requests. Please wait a moment before trying again."
  - HTTP 401/403 -> "Session expired. Please sign in again."
  - Server 500 -> "Dispatch server is experiencing brief maintenance. Please retry in 30 seconds."

### 3.4 Strict Form Validation Matrix

| Field | Current Implementation | Status | Required Strict Regex / Rule |
|---|---|---|---|
| **Indian Mobile Number** | `isValidIndianMobile()`: `clean.length === 10 && /^[6-9]/.test(clean)` | Compliant | `/^[6-9]\d{9}$/` with `+91` / leading `0` stripping |
| **Email Address** | None in `formatters.ts` | **Missing** | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| **OTP Code** | Length checked locally (4 or 6) | Partial | `/^\d{4}$/` or `/^\d{6}$/` numeric digits only |
| **UPI Reference (UTR)** | Inlined in `CheckoutScreen.tsx:159`: `/^\d{12}$/` | Partial | Centralize `isValidUtr(utr: string): boolean` (`/^\d{12}$/`) |
| **Vehicle Registration** | Non-empty check in `DriverApplicationScreen.tsx:90` | **Weak** | `/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/` |
| **Driving Licence (DL)** | Length >= 8 check in `DriverApplicationScreen.tsx:84` | **Weak** | `/^[A-Z]{2}[ -]?[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/` |
| **UPI ID (VPA)** | None (accepts arbitrary text) | **Missing** | `/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/` |
| **Trip Origin vs Destination** | `search.origin !== search.destination` in `HomeScreen.tsx:108` | Compliant | Rejects identical city pairs |

### 3.5 First-Launch Onboarding Flow
- **Current State**: Does not exist in any mobile application.
- `apps/passenger/.../SplashScreen.tsx` has an automated 1.8-second timer that calls `navigation.replace('MainTabs')`.
- `apps/driver/.../DriverSplashScreen.tsx` calls `navigation.replace(isLoggedIn ? 'DriverTabs' : 'DriverAuth')`.
- **Required Implementation**:
  1. Add `otb_has_seen_onboarding` flag in `StorageService`.
  2. Implement `PassengerOnboardingModal` or `OnboardingScreen` featuring 3 swipeable slides:
     - Slide 1: **Zero Return Fare Guarantee** — Pay only for the one-way distance across 108 Bihar corridors.
     - Slide 2: **Doorstep Pickup & Zero Advance** — ₹0 advance; pay directly to chauffeur via Cash or UPI at dropoff.
     - Slide 3: **Verified Safety & 24x7 SOS** — Commercial RTO permits, ride-start OTP, and emergency police dialer.
  3. Include **"Get Started"** (completes onboarding, saves flag) and **"Skip"** (dismisses immediately, saves flag).
  4. Provide accessible re-launch link from `ProfileScreen.tsx` under Help & About.

---

## 4. Requirement R4: Mobile Layout, Safe Areas & Navigation Fallbacks

### 4.1 Safe Area Conformity Analysis

#### A. Passenger & Driver Apps
- Most screens correctly import `SafeAreaView` from `react-native-safe-area-context` (`AuthScreen`, `HomeScreen`, `CheckoutScreen`, `DriverHomeScreen`, `DriverEarningsScreen`).
- Tab navigation styles in `PassengerNavigator.tsx` and `DriverNavigator.tsx` correctly adapt for iOS home indicators:
  ```typescript
  height: Platform.OS === 'ios' ? 84 : 64,
  paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  ```

#### B. Severe Safe Area Defects in Admin App (`apps/admin`)
- **Zero screens** in `apps/admin` import or use `SafeAreaView` or `useSafeAreaInsets()`.
- Every screen hardcodes `paddingTop: 54` in its root stylesheet:
  - `AdminDashboardScreen.tsx:904`: `paddingTop: 54`
  - `AdminDriversScreen.tsx:434`: `paddingTop: 54`
  - `AdminDispatchScreen.tsx:235`: `paddingTop: 54`
  - `AdminSettingsScreen.tsx:258`: `paddingTop: 54`
  - `AdminBookingsScreen.tsx:432`: `paddingTop: 54`
- **Impact on Devices**:
  - **iPhone 14 Pro, 15, 16 (Dynamic Island)**: The top inset is **59pt**. A hardcoded `paddingTop: 54` clips 5pt of the header content directly behind the camera cutout.
  - **iPhone SE / iPad / Non-Notch Devices**: The status bar is **20pt**. A hardcoded `paddingTop: 54` leaves 34pt of dead, wasted space.
  - **Android Devices**: Status bar heights vary widely from 24dp to 48dp depending on hole-punch cutouts, creating visual misalignment.
- **Required Fix**: Wrap root admin views in `<SafeAreaView edges={['top', 'left', 'right']}>` from `react-native-safe-area-context` and remove hardcoded `paddingTop: 54`.

### 4.2 Fallback Not-Found Screen (Mobile 404)
- **Current State**: Zero fallback screens exist in any mobile navigator.
  - `PassengerNavigator.tsx` defines only 8 explicit routes.
  - `DriverNavigator.tsx` defines only 7 explicit routes.
  - `AdminNavigator.tsx` defines only 2 stack screens (`AdminLogin` and `AdminMain`).
- **Defect**: When an invalid deep link or unhandled route transition is triggered, React Navigation throws an unhandled error or displays an empty white screen.
- **Required Implementation**:
  1. Build a universal `NotFoundScreen.tsx` in `mobile/shared/components/` or `mobile/shared/screens/` featuring:
     - Clear branding and `Compass` / `MapPinOff` illustration.
     - Title: "Route Not Located" / "404 - Screen Not Found".
     - Description: "The requested outstation navigation link is invalid or has expired."
     - Action Button: "Return to Home" / "Return to Duty Cockpit" / "Return to Dashboard".
  2. Register `NotFoundScreen` in `PassengerNavigator`, `DriverNavigator`, and `AdminNavigator` with wildcard / fallback matching.

---

## 5. Requirement R5: In-App Legal Pages (Privacy Policy & Terms of Service)

### 5.1 Current State Analysis

| Application | In-App Screen Available? | External Browser Delegation | File & Line Reference |
|---|---|---|---|
| **Passenger App** | **No** | Yes (`Linking.openURL`) | `ProfileScreen.tsx:237-251` |
| **Driver App** | **No** | **None** (Links completely missing) | `DriverProfileScreen.tsx` |
| **Admin App** | **No** | **None** (Static footer copyright only) | `AdminSettingsScreen.tsx:242` |

### 5.2 Requirement Comparison
- Requirement R5 specifically states:
  > "Provide dedicated in-app and web Privacy Policy and Terms of Service pages."
  > "Acceptance Criteria: Privacy Policy and Terms of Service screens/pages are reachable via in-app navigation and footer links."
- Kicking the user out of the native mobile app into Safari or Chrome via `Linking.openURL('https://onewaytaxibihar.com/privacy-policy.html')` fails the "dedicated in-app screen" requirement.
- Driver and Admin mobile applications currently provide zero access to statutory legal documents.

### 5.3 Required Implementation
1. Create dedicated in-app legal screens:
   - `mobile/shared/screens/PrivacyPolicyScreen.tsx`: Comprehensive statutory disclosure under **DPDP Act 2023**, specifying data collected (phone, GPS coordinates, vehicle registration), retention period, third-party disclosure bans, and one-tap erasure rights.
   - `mobile/shared/screens/TermsOfServiceScreen.tsx`: Outstation carriage conditions, zero-return-fare guarantee, cancellation policy (free before chauffeur departure), toll and permit inclusion rules, and passenger conduct guidelines.
2. Register these screens in:
   - `PassengerNavigator.tsx`: `<Stack.Screen name="PrivacyPolicy" ... />` and `<Stack.Screen name="TermsOfService" ... />`
   - `DriverNavigator.tsx`: `<Stack.Screen name="PrivacyPolicy" ... />` and `<Stack.Screen name="TermsOfService" ... />`
   - `AdminNavigator.tsx`: `<Stack.Screen name="PrivacyPolicy" ... />` and `<Stack.Screen name="TermsOfService" ... />`
3. Update `ProfileScreen.tsx`, `DriverProfileScreen.tsx`, and `AdminSettingsScreen.tsx` to navigate directly to these in-app screens using `navigation.navigate(...)`.

---

## 6. Concrete Implementation Recommendations & Action Plan

### Action 1: Universal Persistent Storage Migration (`mobile/shared/services/storage.ts`)
- Install and configure `@react-native-async-storage/async-storage` (or `expo-secure-store` for sensitive tokens and AsyncStorage for general state).
- Update `StorageService` to prioritize native storage with web `localStorage` and fallback memory cache.
- Ensure all session keys (`otb_auth_token`, `otb_user_phone`, `otb_driver_phone`, `otb_admin_session`, `otb_search_draft`) survive native reload.

### Action 2: Remove Hardcoded Admin/Driver Credentials & Implement Clean Teardown
- In `AdminContext.tsx`: Remove lines 86-94 auto-login block. Unauthenticated users must remain on `AdminLoginScreen`.
- In `AdminLoginScreen.tsx`: Set default `username = ''` and `password = ''`. Remove prefilled production credentials.
- In `DriverContext.tsx`: Remove fallback `'9876508888'` in `refreshProfile()`. Unauthenticated drivers must see `DriverAuthScreen`.
- Ensure `logout()` clears all stored tokens, session keys, search drafts, and cached trips.

### Action 3: Build Password & Credential Reset Screens
- In `mobile/apps/admin/src/screens/`: Create `AdminResetPasswordScreen.tsx` with OTP / token verification.
- In `mobile/apps/driver/src/screens/`: Create `DriverResetPinScreen.tsx` allowing chauffeurs to reset their 4-digit PIN via SMS OTP.
- Register screens in respective stack navigators and link from login screens.

### Action 4: Centralize Strict Form Validators (`mobile/shared/utils/formatters.ts`)
- Implement:
  - `isValidEmail(email: string): boolean`
  - `isValidOtp(otp: string, length?: 4 | 6): boolean`
  - `isValidUtr(utr: string): boolean`
  - `isValidIndianVehicleNumber(plate: string): boolean`
  - `isValidDrivingLicence(dl: string): boolean`
  - `isValidUpiId(upi: string): boolean`
  - `formatUserErrorMessage(err: unknown): string`
- Update `CheckoutScreen.tsx`, `DriverApplicationScreen.tsx`, `AuthScreen.tsx`, and `AdminLoginScreen.tsx` to use these centralized validators.

### Action 5: Implement First-Time Launch Onboarding Flow
- Create `mobile/shared/components/OnboardingModal.tsx` or `PassengerOnboardingScreen.tsx`.
- Connect to `SplashScreen.tsx` checking `StorageService.getItem('otb_has_seen_onboarding')`.
- Provide complete and dismissible actions ("Get Started", "Skip").

### Action 6: Safe Area Normalization Across All Admin Screens
- Replace `<View style={[styles.container]}>` with `<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>` across:
  - `AdminDashboardScreen.tsx`
  - `AdminBookingsScreen.tsx`
  - `AdminDriversScreen.tsx`
  - `AdminDispatchScreen.tsx`
  - `AdminSettingsScreen.tsx`
- Remove hardcoded `paddingTop: 54` from all headers.
- Update `AdminNavigator.tsx` bottom tab bar height and bottom padding for iOS home indicator.

### Action 7: Implement Fallback 404 Not-Found Screen
- Create `mobile/shared/screens/NotFoundScreen.tsx`.
- Register as fallback route `<Stack.Screen name="NotFound" component={NotFoundScreen} />` across `PassengerNavigator`, `DriverNavigator`, and `AdminNavigator`.

### Action 8: Dedicated In-App Legal Pages
- Create `PrivacyPolicyScreen.tsx` and `TermsOfServiceScreen.tsx` in `mobile/shared/screens/`.
- Replace `Linking.openURL` in `ProfileScreen.tsx` with `navigation.navigate('PrivacyPolicy')`.
- Add legal navigation rows in `DriverProfileScreen.tsx` and `AdminSettingsScreen.tsx`.

### Action 9: Polish Loading & Empty States
- Add FlatList `refreshing` and skeleton loaders in `MyTripsScreen.tsx` and `DriverEarningsScreen.tsx`.
- Add empty state prompts in `AddressSelectScreen.tsx` and `AdminDriversScreen.tsx`.
