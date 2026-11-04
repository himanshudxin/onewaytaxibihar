# Oneway Taxi Platform: Three Separate Mobile Apps (iOS & Android)

An enterprise outstation taxi booking platform for **onewaytaxi.com** (OneWayTaxiBihar Mobility Pvt Ltd), engineered with **React Native**, **Expo SDK 58** (`react-native@0.88.0`), and **TypeScript**, powered by a high-throughput **MongoDB Atlas** cloud backend.

This repository delivers **THREE COMPLETELY SEPARATE MOBILE APPLICATIONS**:
1. **Oneway Taxi** — Dedicated Passenger Application (`com.onewaytaxibihar.passenger`)
2. **Oneway Taxi Driver** — Dedicated Chauffeur Partner Application (`com.onewaytaxibihar.driver`)
3. **Oneway Taxi Admin** — Dedicated Fleet Operations & Dispatch Console (`com.onewaytaxibihar.admin`)

---

## 🏛️ Architecture Overview

The mobile workspace is structured into three autonomous mobile applications and a shared core engine:

```
mobile/
├── apps/
│   ├── passenger/                    # Oneway Taxi (Passenger App)
│   │   ├── src/
│   │   │   ├── screens/              # Splash, Auth, Home, AddressSelect, CabSelect,
│   │   │   │                         # Checkout, BookingConfirm, BookingTimeline,
│   │   │   │                         # MyTrips, Profile
│   │   │   ├── navigation/           # PassengerNavigator (Stack + Tabs)
│   │   │   ├── App.tsx
│   │   │   └── index.js
│   │   ├── app.json                  # ID: com.onewaytaxibihar.passenger
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── driver/                       # Oneway Taxi Driver (Driver Partner App)
│   │   ├── src/
│   │   │   ├── screens/              # DriverSplash, DriverAuth, DriverApplication,
│   │   │   │                         # DriverVerificationStatus, DriverHome,
│   │   │   │                         # TripOfferModal, TripExecutionScreen,
│   │   │   │                         # DriverEarnings, DriverProfile
│   │   │   ├── navigation/           # DriverNavigator (Stack + Tabs)
│   │   │   ├── App.tsx
│   │   │   └── index.js
│   │   ├── app.json                  # ID: com.onewaytaxibihar.driver
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin/                        # Oneway Taxi Admin (Fleet Operations & Dispatch)
│       ├── src/
│       │   ├── screens/              # AdminLogin, AdminDashboard, AdminBookings,
│       │   │                         # AdminDrivers, AdminDispatch, AdminSettings
│       │   ├── navigation/           # AdminNavigator (Stack + Tabs)
│       │   ├── App.tsx
│       │   └── index.js
│       ├── app.json                  # ID: com.onewaytaxibihar.admin
│       ├── package.json
│       └── tsconfig.json
│
├── shared/                           # Shared Domain Engine (No UI cross-contamination)
│   ├── theme/                        # Voyago Emerald (#059669) & Midnight Dark tokens
│   ├── types/                        # Strict domain models (Trip, Driver, Vehicle, Fare)
│   ├── services/                     # Typed REST API Client & Persistent Storage
│   └── utils/                        # Currency, Distance, Idempotency & Phone Formatters
│
├── .env.example                      # Safe mobile environment template
├── package.json                      # Workspace root scripts & SDK 58 dependencies
└── tsconfig.json                     # Root TypeScript configuration
```

---

## 📱 The Two Mobile Applications

### 1. Passenger App: Oneway Taxi (`com.onewaytaxibihar.passenger`)
- **Splash & Onboarding**: Dynamic brand presentation with zero-return-fare guarantee badges.
- **Phone OTP Authentication**: 10-digit mobile login with SMS verification, resend countdown, and session persistence.
- **Outstation Route Discovery**: One-Way vs Round-Trip selection, 108 Bihar corridor quick-chips (Patna, Gaya, Muzaffarpur, Darbhanga, Bhagalpur, Begusarai, etc.), transit hubs (Patna Airport, Patna Junction, Rajendra Nagar), date & time picker, and passenger count.
- **Doorstep Address Search**: Real-time GPS location detection and doorstep pickup/destination validation (prevents identical pickup & destination).
- **Fleet Category Comparison**: Go Hatchback (WagonR/Tiago), Prime Sedan (Dzire/Etios), and Family SUV (Innova/Ertiga) with luggage and passenger capacity breakdowns.
- **Transparent Fare Breakdown Modal**: Itemized base fare, driver allowance, GST (5%), state taxes, toll estimation, and transparent ₹0 return fare disclosure.
- **Zero Advance Checkout**: India's trusted outstation payment model — **₹0 Advance Cash/UPI to Driver upon dropoff** or optional advance token, with strict cancellation disclosure.
- **Booking Reference & Ride Start OTP**: Instant `OTB-XXXXXX` reference generation with a 4-digit security OTP required before the chauffeur can start the vehicle.
- **Real-Time Booking Timeline**: 8-stage visual lifecycle (`pending` ➔ `confirmed` ➔ `driver_assigned` ➔ `driver_en_route` ➔ `arrived` ➔ `started` ➔ `completed`). Driver contact and vehicle registration number are kept private until chauffeur assignment. Includes GPS vehicle movement simulation.
- **My Trips**: Categorized tabs for Upcoming, Completed, and Cancelled rides with direct support dialer.
- **Profile & Statutory Privacy**: Emergency helplines, WhatsApp support, Fare Chart link, Terms of Service, Privacy Policy, and **DPDP Act 2023 one-tap account deletion**.

### 2. Driver App: Oneway Taxi Driver (`com.onewaytaxibihar.driver`)
- **Driver Chauffeur Identity**: High-contrast, dark-mode cockpit designed for high visibility in bright sunlight and safe one-handed mobile usage.
- **Driver Onboarding & Verification**: Multi-step commercial onboarding capturing Full Name, Driving Licence (DL), Vehicle Registration Certificate (RC), Commercial State Permit, and Bank Account / UPI ID.
- **Strict Verification Gate**: Application audit state machine (`pending`, `approved`, `needs_changes`). Unapproved drivers cannot access duty toggle or accept rides. Fleet desk support hotline (`6206494214`) for manual document clearance.
- **Chauffeur Cockpit**: Real-time Online/Offline duty toggle, GPS status indicator, Today's Earnings KPI, Active Ride Banner, and incoming ride queue.
- **30-Second Trip Dispatch Alert**: High-priority modal with route origin, destination, distance, customer pickup landmark, net driver earnings, and countdown timer with haptics.
- **4-Stage Trip Execution State Machine**:
  - *Stage 1 (Navigate)*: Turn-by-turn navigation to passenger doorstep via Google Maps.
  - *Stage 2 (Arrived)*: Notifies passenger that the chauffeur is at the doorstep.
  - *Stage 3 (Start Trip)*: Mandatory 4-digit Ride Start OTP entry (prevents unauthorized ride starts).
  - *Stage 4 (Complete Trip)*: Calculates total fare, driver net payout (85%), and generates collection receipt.
- **Earnings Ledger & Daily Settlements**: Today, weekly, and all-time revenue tracker with trip-by-trip breakdown and linked UPI payout settlement.
- **Safety, SOS & Compliance**: 24x7 Fleet Desk dispatch dialer, **Emergency Police SOS (112)** 1-tap dialer, commercial vehicle credentials, and DPDP account erasure hook.

### 3. Admin App: Oneway Taxi Admin (`com.onewaytaxibihar.admin`)
- **Operator Authentication**: Protected dispatcher/owner sign-in with brute-force lockouts and cryptographically signed session tokens.
- **Command Center Dashboard**: Live KPIs (Active intercity rides, Pending driver audits, Total bookings, and Today's Gross Revenue with 15% platform margin breakdown).
- **Outstation Bookings Ledger**: Real-time searchable feed of trips with customer contacts, pickup/drop coordinates, assigned chauffeur details, and Ride Start OTPs.
- **Chauffeur Fleet Verification Queue**: Review driver applications (DL, RC, Permit, bank account) with 1-tap **Approve Chauffeur**, **Flag for Changes**, or **Deactivate**.
- **Central Dispatch Console**: 2-step visual matching interface — select any unassigned trip and any available on-duty driver to instantly transmit a dispatch order.
- **Control Room Helplines & Health**: Real-time connection status to MongoDB Atlas and 24x7 escalation dialers.

---

## 🚀 Running the Apps Locally

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- Physical iPhone or Android device with **Expo Go** installed (Expo Go SDK 58)

### Step 1: Install Mobile Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
```

### Step 2: Configure Environment
Copy `mobile/.env.example` to `mobile/.env`:
```bash
cp .env.example .env
```
*(Defaults automatically connect to the live MongoDB Atlas cloud API at `https://onewaytaxibihar.com/api`)*.

### Step 3: Launch Passenger App
From the `mobile/` directory:
```bash
npm run start:passenger
```
Scan the terminal QR code using **Expo Go** (Android) or the **Camera App** (iPhone).

### Step 4: Launch Driver App
In a separate terminal, from the `mobile/` directory:
```bash
npm run start:driver
```
Scan the terminal QR code using **Expo Go** on your driver test device.

### Step 5: Launch Admin & Dispatch App
In a separate terminal, from the `mobile/` directory:
```bash
npm run start:admin
```
Scan the terminal QR code using **Expo Go** on your operations test device (Sign in with `admin` / `harharmahadev@1`).

---

## ⚡ Connected Cloud Backend & API Contracts

All three mobile applications communicate with the central production REST API engine (`api/index.js`) powered by MongoDB Atlas.

### Core Endpoints

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Gateway health check & DB ping | Public |
| `GET` | `/api/rates` | Master fares for 108 Bihar outstation corridors | Public |
| `POST` | `/api/calculate-fare` | Server-calculated quote with vehicle rules | Public |
| `POST` | `/api/leads` | Create booking with idempotency key (`Idempotency-Key`) | Passenger |
| `POST` | `/api/driver/signup` | Register driver partner & upload credentials | Driver |
| `POST` | `/api/driver/duty` | Toggle online/offline availability | Driver (Session) |
| `POST` | `/api/driver/accept-trip` | Chauffeur trip acceptance | Driver (Session) |
| `POST` | `/api/driver/status` | Advance trip status (`ACCEPTED`, `ARRIVED`, `STARTED` with OTP, `COMPLETED`) | Driver (Session) |
| `GET` | `/api/driver/earnings` | Ledger of today, weekly, and total driver earnings | Driver (Session) |
| `POST` | `/api/admin/login` | Secure operator authentication | Admin (RBAC) |
| `GET` | `/api/admin/bookings` | Retrieve all intercity bookings across Bihar | Admin (Session) |
| `POST` | `/api/admin/bookings/assign` | Allot driver to booking with concurrency protection | Admin (Session) |
| `GET` | `/api/admin/drivers` | View all drivers & pending application documents | Admin (Session) |
| `POST` | `/api/admin/drivers/verify` | Approve / flag driver verification status | Admin (Session) |
| `POST` | `/api/user/delete-account` | Statutory user data deletion (DPDP Act 2023) | Passenger |
| `POST` | `/api/driver/delete-account`| Statutory driver data deletion (DPDP Act 2023) | Driver |

### Trip State Machine

```
[Passenger Books]
       │
       ▼
    PENDING ──────────────┐
       │ (Auto-assign)    │ (No drivers)
       ▼                  ▼
   CONFIRMED            FAILED
       │
       ▼
DRIVER_ASSIGNED (Passenger receives Driver & Vehicle details)
       │
       ▼
DRIVER_EN_ROUTE (Chauffeur navigating to doorstep)
       │
       ▼
    ARRIVED     (Chauffeur waiting at doorstep)
       │
       ▼ (Passenger shares 4-digit OTP)
    STARTED     (Trip in progress)
       │
       ▼
   COMPLETED   (Fare collected, driver earnings credited)
```

---

## 🔍 Integration & Simulation Audit Report

In accordance with our strict transparency policy, the following report distinguishes between live production integrations and development sandbox simulations:

| System / Service | Status | Implementation Details | Production Activation Requirement |
| :--- | :--- | :--- | :--- |
| **Database & Persistence** | 🟢 **LIVE** | MongoDB Atlas Cloud connected with compound indexes, TTL sessions, and document schemas. | Already fully live in production. |
| **Corridor Fare Engine** | 🟢 **LIVE** | 108 Bihar corridor rates dynamically calculated with toll, allowance, and tax itemization. | Already fully live in production. |
| **Booking & Idempotency** | 🟢 **LIVE** | Bookings created with unique `OTB-XXXXXX` references and cryptographic idempotency protection. | Already fully live in production. |
| **Driver Application & Verification**| 🟢 **LIVE** | Driver records created with `DRV-APP-` IDs; approval gates strictly enforced on backend. | Document review dashboard for ops team. |
| **Driver Earnings Ledger** | 🟢 **LIVE** | 85% chauffeur settlement model calculated on completion of verified bookings. | Integrated; connects to bank payout API in production. |
| **DPDP Act 2023 Erasure** | 🟢 **LIVE** | Statutory erasure endpoints delete personal identifiers and log audit records. | Fully compliant with Indian data protection laws. |
| **SMS OTP Verification** | 🟡 **HYBRID** | Backend supports Fast2SMS / MSG91 DLT gateway. In mobile sandbox, verified test OTP (`1234`) is also accepted for instant QA. | Insert live telecom DLT credentials into production `.env`. |
| **Maps & Routing** | 🟡 **HYBRID** | OpenStreetMap Nominatim reverse geocoding & native Google Maps navigation intents enabled. | Restrict Google Maps Mobile SDK API key in Google Cloud Console. |
| **Payment Gateway** | 🟡 **HYBRID** | Outstation default: ₹0 Advance Cash/UPI to Driver upon dropoff. Razorpay/Cashfree endpoints ready on server. | Add live Razorpay Key Secret in backend `.env` for online advance tokens. |
| **Push Notifications** | 🟡 **HYBRID** | Expo Push Notifications client tokens captured; mobile app includes high-priority simulated dispatch fallback. | Configure Apple APNs Auth Key (.p8) and Firebase Cloud Messaging (FCM) v1 server keys in EAS. |

---

## 📋 App Store & Google Play Launch Checklist

### 1. Android (Google Play Store)
- [ ] **Package Name**: `com.onewaytaxibihar.passenger` & `com.onewaytaxibihar.driver`
- [ ] **Target SDK**: Target Android 15 (API level 35) / Minimum Android 8.0 (API level 26).
- [ ] **Location Permissions**:
  - Passenger App: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` (Foreground only).
  - Driver App: `ACCESS_BACKGROUND_LOCATION` (Required for live trip tracking while screen is off; requires Play Console Location Declaration form with video demonstration).
- [ ] **Hardware Features**: `android.hardware.telephony` (`CALL_PHONE` permission declaration for direct chauffeur-passenger dialing).
- [ ] **Keystore & Signatures**: Generate release upload keystores via EAS Credentials (`eas credentials -p android`).
- [ ] **Google Play Data Safety**: Complete declaration covering location collection, personal contact details, and account deletion URL (`https://onewaytaxibihar.com/data-deletion.html`).

### 2. iOS (Apple App Store)
- [ ] **Bundle Identifiers**: `com.onewaytaxibihar.passenger` & `com.onewaytaxibihar.driver`
- [ ] **App Store Provisioning**: Set up Apple Developer Team, App IDs, and Distribution Certificates via `eas credentials -p ios`.
- [ ] **Info.plist Privacy Strings**:
  - `NSLocationWhenInUseUsageDescription`: *"Oneway Taxi uses your location to discover pickup points and calculate accurate route distances."*
  - `NSLocationAlwaysAndWhenInUseUsageDescription`: *(Driver App only)* *"Oneway Taxi Driver needs background location access to provide route navigation and safety tracking during active passenger trips."*
- [ ] **Apple Guidelines 5.1.1 (Data Retention & Deletion)**: Account deletion buttons directly accessible within both apps under Profile.
- [ ] **TestFlight Internal/External Groups**: Submit staging builds for beta fleet driver testing.

### 3. Transport Regulatory & Security Compliance
- [ ] **Motor Vehicle Aggregator Guidelines (MoRTH 2020)**:
  - Driver document retention (Commercial Driving Licence, Police Clearance, Vehicle Fitness Certificate, Commercial Insurance, Pollution Under Control).
  - Prominent 1-tap **112 Emergency SOS button** present on both Passenger and Driver mobile screens.
- [ ] **24x7 Customer Control Room**: Helpline (`+91 80021 41816`) displayed across both apps with working dialer intents.
- [ ] **Secret Key Protection**: Zero payment secrets, telecom passwords, or database admin credentials packaged inside client binaries.
