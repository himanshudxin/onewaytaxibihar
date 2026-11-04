# OneWayTaxiBihar (OTB) - Backend API Integration & Data Contracts Audit Report
> **Auditor**: Explorer 2 (API Integration Auditor)  
> **Platform**: OneWayTaxiBihar Passenger Mobile Application Redesign  
> **Date**: 2026-11-02  
> **Scope**: Complete audit of backend endpoints, API clients, network configurations, data contracts, and zero-breakage boundaries across Passenger Mobile App, Backend API, Driver App, and Admin Console.

---

## 1. Executive Summary

This audit establishes the comprehensive baseline of all backend API integrations, communication protocols, network configurations, and data contracts currently operating in the OneWayTaxiBihar ecosystem.

### Key Audit Findings
1. **Unified Enterprise Backend**: All client requests (Mobile Passenger, Mobile Driver, Mobile Admin, Web Portal, and Admin Console) terminate at a single serverless REST API handler deployed on Vercel at `api/index.js` (rewritten via `vercel.json` from `/api/(.*)` to `api/index.js`).
2. **Authoritative Server Pricing**: Fares are computed exclusively server-side via `/api/fares/calculate` and verified route matrices (`findMatchingRoute` in `patna_fares.json`). No fares are hardcoded on the backend.
3. **Five Vehicle Tiers**: The backend natively implements five distinct vehicle classes:
   - `hatchback` (Go Hatchback - WagonR, Tiago, Celerio)
   - `sedan` (Prime Sedan - Dzire, Etios, Amaze)
   - `sedan_prime` / `execSedan` (Executive Sedan - Honda City, Ciaz)
   - `suv` (Family SUV / XUV - Ertiga, Carens)
   - `innova_crysta` / `luxSuv` (Luxury XUV / Innova Crysta)
   The existing passenger mobile app UI previously exposed only three tiers (`hatchback`, `sedan`, `suv`), but the backend already supports all five tiers required by the redesign.
4. **Driver Assignment & Status Workflow**: The backend supports a complete multi-step dispatch state machine:
   `NEW / REQUESTED` ➔ `SEARCHING / BROADCAST` ➔ `ASSIGNED` ➔ `ACCEPTED` ➔ `DRIVER ON THE WAY` ➔ `ARRIVED` ➔ `TRIP STARTED` ➔ `COMPLETED` (or `CANCELLED`).
   Automatic driver broadcasting is supplemented by an authoritative manual admin dispatch fallback.
5. **Real-time Live Tracking Contract**: Real-time tracking is provided via `GET /api/tracking/status?bookingId=...&phone=...`, strictly protected with row-level passenger phone authentication. Driver telemetry is written via `POST /api/driver/location`.
6. **Zero-Breakage Guarantee**: All payload schemas, query parameters, database models, and response formats are mapped in this document. The passenger app redesign must conform 100% to these contracts to prevent any regression in the driver app, admin console, or MongoDB Atlas database.

---

## 2. Network Configuration & Client Architecture

### 2.1 API Client Implementation
- **Location**: `mobile/shared/services/api.ts`
- **Singleton Export**: `MobileApiClient`
- **Base URL**:
  - Production / Staging: `https://onewaytaxibihar.com/api`
  - Configured in `mobile/apps/passenger/app.json`:
    ```json
    "extra": {
      "apiUrl": "https://onewaytaxibihar.com/api",
      "supportPhone": "+918002141816",
      "whatsappPhone": "+917739406400",
      "appType": "passenger"
    }
    ```

### 2.2 Standard HTTP Request Headers
Every request emitted by `MobileApiClient.request()` attaches:
```http
Content-Type: application/json
Accept: application/json
User-Agent: OneWayTaxiBihar-MobileApp/2.0
Authorization: Bearer <otb_auth_token> (when authenticated)
Idempotency-Key: <unique_key> (for booking creation)
```

### 2.3 Local & Session Storage Keys
Managed via `mobile/shared/services/storage.ts` (`StorageService`):
| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `otb_auth_token` | `string` | Active session token (e.g., `otb_sess_...` or dev fallback) |
| `otb_user_phone` | `string` | 10-digit clean mobile number of logged-in passenger |
| `otb_my_bookings` | `Booking[]` | Local cache of passenger bookings |
| `otb_search_draft` | `SearchState` | Draft of origin, destination, dates, times |
| `otb_has_seen_onboarding` | `string` | Flag preventing repeated onboarding display |
| `otb_theme_mode` | `'system'\|'light'\|'dark'` | Theme preference |

---

## 3. Comprehensive API Contracts Matrix

### 3.1 Authentication & User Session

#### 1. Send Mobile OTP
- **Route**: `POST /api/auth/send-otp`
- **Auth**: None (Public)
- **Rate Limit**: Max 3 requests / min per phone; max 10 requests / 10 mins per IP.
- **Request Body**:
  ```json
  {
    "phone": "9835123456",
    "name": "Amit Kumar",
    "role": "passenger"
  }
  ```
- **Validation**: 10-digit Indian mobile number matching `/^[6-9]\d{9}$/`.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "phone": "+91 9835123456",
    "cleanPhone": "9835123456",
    "isNewUser": true,
    "rewardEligible": true,
    "rewardAmount": 100,
    "whatsappUrl": "https://wa.me/919835123456?text=...",
    "smsStatus": { "provider": "fast2sms", "status": "DELIVERED" },
    "message": "Verification code dispatched to +91 9835123456 via Telecom SMS."
  }
  ```
- **Security Rule**: Zero OTP leakage. The server generates a 6-digit cryptographic code valid for 10 minutes, but never reflects it in the client JSON response.
- **Side Effect**: Automatically creates or updates an inquiry lead in `db.leads`.

#### 2. Verify Mobile OTP & Issue Session
- **Route**: `POST /api/auth/verify-otp`
- **Auth**: None (Public)
- **Request Body**:
  ```json
  {
    "phone": "9835123456",
    "otp": "481920",
    "name": "Amit Kumar",
    "role": "passenger"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "otb_sess_7a8f9b0c1d2e3f4a5b6c7d8e",
    "user": {
      "id": "usr_9835123456",
      "name": "Amit Kumar",
      "phone": "+91 9835123456",
      "email": "amit@example.com",
      "walletBalance": 100,
      "isPhoneVerified": true
    },
    "isFirstTimeUser": true,
    "rewardGranted": true,
    "rewardAmount": 100,
    "message": "Mobile verified successfully! Rs 100 Welcome Reward credited to your wallet."
  }
  ```
- **Offline / Dev Fallback**: `mobile/shared/services/api.ts` supports test OTP `1234` in local/sandbox environments.

#### 3. Passenger Logout
- **Route**: `POST /api/auth/logout`
- **Auth**: `Authorization: Bearer <token>`
- **Response `200 OK`**: `{ "success": true, "message": "Logged out successfully" }`

#### 4. Account Deletion (DPDP Act Compliance)
- **Route**: `POST /api/user/delete-account`
- **Request Body**: `{ "phone": "9835123456", "reason": "User requested via mobile app" }`
- **Response `200 OK`**: `{ "success": true, "message": "Account deletion initiated..." }`

---

### 3.2 Location, Corridors & Geocoding

#### 1. Pickup Cities Master List
- **Route**: `GET /api/cities/pickup`
- **Cache**: 24 hours (`X-Cache: HIT`, `max-age=86400`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 42,
    "cities": [
      {
        "id": "patna",
        "name": "Patna",
        "hindiName": "पटना",
        "district": "Patna",
        "state": "Bihar",
        "lat": 25.5941,
        "lng": 85.1376,
        "popular": true,
        "airport": true
      }
    ]
  }
  ```

#### 2. Destination Drop Cities List
- **Route**: `GET /api/cities/drop?from=patna`
- **Query Params**: `from` (origin city to exclude)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "from": "patna",
    "count": 41,
    "cities": [ /* list of drop destinations sorted by popularity */ ]
  }
  ```

#### 3. Route Details & Coordinates
- **Route**: `GET /api/route-details?from=Patna&to=Gaya`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "from": "Patna",
    "to": "Gaya",
    "distanceKm": 104,
    "distance": "104 km",
    "duration": "2h 15m",
    "pickupLatitude": 25.5941,
    "pickupLongitude": 85.1376,
    "dropLatitude": 24.7914,
    "dropLongitude": 85.0002,
    "cabOptions": [ ... ]
  }
  ```

#### 4. Location Search & Landmark Auto-Complete
- **Route**: `GET /api/locations/search?q=airport&cityId=patna`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "query": "airport",
    "count": 2,
    "locations": [
      {
        "name": "Jay Prakash Narayan International Airport (PAT)",
        "address": "Shaheed Pir Ali Khan Marg, Sheikhpura, Patna, Bihar 800014",
        "category": "Airport"
      }
    ]
  }
  ```

#### 5. Recommended Landmarks
- **Route**: `GET /api/locations/recommendations?cityId=patna&type=pickup`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "cityId": "patna",
    "quickChips": [
      { "label": "Airport / Fly Terminal", "fullAddress": "Patna Airport Terminal Gate, Patna, Bihar" },
      { "label": "Junction Railway Station", "fullAddress": "Patna Junction Railway Station, Platform 1 Porch, Patna" }
    ],
    "locations": [ ... ]
  }
  ```

#### 6. Dynamic Toll Estimation
- **Route**: `POST /api/routes/toll-estimate`
- **Request Body**: `{ "origin": "Patna", "destination": "Gaya", "distanceKm": 104 }`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "tollAmount": 180,
    "source": "google_routes_api" | "nhai_high_peak_matrix",
    "higherPriceTollApplied": true
  }
  ```

---

### 3.3 Authoritative Fare Calculation Engine (Five Tiers)

#### Authoritative Endpoint
- **Route**: `POST /api/fares/calculate` (or `GET /api/fares/calculate`, `/api/fare/calculate`)
- **Request Body**:
  ```json
  {
    "origin": "Patna",
    "dest": "Gaya",
    "cabTier": "sedan",
    "tripType": "oneway",
    "distanceKm": 104
  }
  ```
- **Backend Tier Normalization (`normalizeCabTier`)**:
  - `hatchback` ➔ Go Hatchback (Maruti WagonR, Tata Tiago, Celerio) — 4 seats
  - `sedan` ➔ Prime Sedan (Maruti Dzire, Toyota Etios, Honda Amaze) — 4 seats
  - `sedan_prime` / `execSedan` ➔ Executive Sedan (Honda City, Maruti Ciaz) — 4 seats
  - `suv` ➔ Family SUV / XUV (Maruti Ertiga, Kia Carens) — 6 seats
  - `innova_crysta` / `luxSuv` ➔ Luxury XUV / Innova Crysta (Toyota Innova Crysta) — 7 seats

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "distanceKm": 104,
    "totalFare": 2198,
    "fare": {
      "distanceKm": 104,
      "duration": "2h 15m",
      "tierId": "sedan",
      "tierName": "Prime Sedan",
      "tierModel": "Dzire, Etios, Amaze",
      "seats": 4,
      "baseFare": 2198,
      "perKmRate": 21,
      "distanceCharge": 2198,
      "driverAllowance": 0,
      "roundTripDiscount": 0,
      "originalFare": 2198,
      "promoDiscount": 0,
      "tollFastag": 82,
      "gst": 105,
      "totalFare": 2198,
      "isExplicitRouteFare": true,
      "inclusions": [
        "Fuel for the quoted one-way journey",
        "Vehicle hire charges included",
        "Driver allowance included",
        "Pickup and drop-off within agreed municipal city limits"
      ],
      "exclusions": [
        "FASTag toll charges and toll plaza taxes",
        "Applicable state road permits and other legally payable route charges",
        "Parking, waiting charges, or other extras where applicable"
      ]
    },
    "fares": {
      "hatchback": { "tierName": "Go Hatchback", "totalFare": 1698, "seats": 4, "tierModel": "WagonR, Tiago, Celerio" },
      "sedan": { "tierName": "Prime Sedan", "totalFare": 2198, "seats": 4, "tierModel": "Dzire, Etios, Amaze" },
      "sedan_prime": { "tierName": "Executive Sedan", "totalFare": 2448, "seats": 4, "tierModel": "Honda City, Ciaz" },
      "suv": { "tierName": "Family SUV (6+1)", "totalFare": 3398, "seats": 6, "tierModel": "Maruti Ertiga, Carens" },
      "innova": { "tierName": "Toyota Innova Crysta", "totalFare": 4598, "seats": 7, "tierModel": "Innova Crysta" }
    }
  }
  ```

#### Master Corridor Matrix
- **Route**: `GET /api/fares` (or `/api/fares/patna`)
- **Response**: Array of all active corridors connecting Patna to 38+ districts with precomputed fares.

---

### 3.4 Booking Creation & Confirmation Flow

#### Endpoint
- **Route**: `POST /api/bookings` (or `/api/rides`)
- **Headers**:
  - `Content-Type: application/json`
  - `Idempotency-Key: <unique_string>`
- **Concurrency & Anti-Duplication Protection**:
  1. Checks `Idempotency-Key` against `db.bookings`. If found, returns existing booking immediately.
  2. Double-tap debounce: If the same passenger phone books the same origin/destination within 15 seconds, deduplicates and returns the existing booking.

#### Request Body Schema
```json
{
  "passengerName": "Amit Kumar",
  "passengerPhone": "9835123456",
  "passengerEmail": "amit@example.com",
  "originCity": "Patna",
  "destCity": "Gaya",
  "pickupAddress": "House 12, Boring Road Crossing, Patna",
  "dropAddress": "Hotel Bodhgaya Regency, Gaya",
  "tripType": "one-way",
  "pickupDate": "2026-11-05",
  "pickupTime": "08:30 AM",
  "passengerCount": 2,
  "cabTier": "sedan",
  "cabType": "Prime Sedan",
  "cabModel": "Dzire / Etios",
  "totalFare": 2198,
  "originalFare": 2198,
  "useWallet": false,
  "couponCode": "BIHAR100",
  "couponDiscount": 0,
  "paymentMethod": "Cash on Ride (Zero Advance)",
  "idempotencyKey": "bkg_1730538000_9835"
}
```

#### Response Body Schema (`201 Created`)
```json
{
  "success": true,
  "booking": {
    "id": "OTB-2026-4891",
    "bookingId": "OTB-2026-4891",
    "tripOtp": "4891",
    "customerId": "usr_9835123456",
    "customerName": "Amit Kumar",
    "customerPhone": "+91 9835123456",
    "customerEmail": "amit@example.com",
    "passengerName": "Amit Kumar",
    "passengerPhone": "+91 9835123456",
    "passengerEmail": "amit@example.com",
    "pickupCity": "Patna",
    "dropCity": "Gaya",
    "originCity": "Patna",
    "destCity": "Gaya",
    "pickupAddress": "House 12, Boring Road Crossing, Patna",
    "dropAddress": "Hotel Bodhgaya Regency, Gaya",
    "pickupDate": "2026-11-05",
    "pickupTime": "08:30 AM",
    "distanceKm": 104,
    "duration": "2h 15m",
    "cabTier": "sedan",
    "cabType": "Prime Sedan",
    "cabModel": "Dzire / Etios",
    "totalFare": 2198,
    "fare": 2198,
    "advancePaid": 0,
    "balanceDue": 2198,
    "paymentMethod": "Cash on Ride (Zero Advance)",
    "paymentStatus": "PAYABLE TO DRIVER (Cash on Ride)",
    "bookingStatus": "NEW",
    "status": "NEW",
    "driverDetails": null,
    "assignedDriverId": null,
    "statusHistory": [
      {
        "status": "NEW",
        "timestamp": "2026-11-02T09:15:00.000Z",
        "actor": "Customer",
        "note": "Booking request placed for Prime Sedan at ₹2198."
      }
    ],
    "createdAt": "2026-11-02T09:15:00.000Z"
  },
  "message": "Booking request received! Our partner/agent will call you within 5 minutes."
}
```

#### Automated Downstream Actions Triggered:
1. `broadcastBooking(db, newBooking)`: Emits audio/push notification to online commercial drivers in the pickup zone.
2. `db.notifications.unshift`: Pushes notification to Central Admin Dispatch console.
3. `db.leads`: Marks any existing customer lead as `CONVERTED`.
4. `notificationService.sendBookingConfirmationNotifications`: Triggers real SMS & WhatsApp confirmation messages to passenger.

---

### 3.5 Driver Assignment & Dispatch Lifecycle Workflow

```
┌────────────────────────────────────────────────────────┐
│  Passenger Places Booking Request                     │
│  Status: NEW / REQUESTED                              │
│  tripOtp: "4891" generated for passenger board verify  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Automated Broadcast to Online Drivers                │
│  Status: SEARCHING / BROADCAST                         │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
      [Driver Accepts]             [No Chauffeur Claim]
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Driver Claims Trip           │ │ Admin Central Dispatch       │
│ POST /api/driver/accept-trip │ │ Manual Fallback              │
│ Status: ACCEPTED             │ │ POST /api/admin/assign-driver│
└──────────────┬───────────────┘ │ Status: ASSIGNED             │
               │                 └──────────────┬───────────────┘
               │                                │
               └───────────────┬────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────┐
│  Driver En Route to Pickup Doorstep                    │
│  POST /api/driver/status { newStatus: 'ON THE WAY' }   │
│  Passenger receives ETA & Live Telemetry               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Driver Arrived at Pickup Doorstep                     │
│  POST /api/driver/status { newStatus: 'ARRIVED' }      │
│  Passenger receives "Chauffeur Arrived" alert          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Passenger Boards Taxi & Shares 4-Digit tripOtp        │
│  Driver submits OTP:                                   │
│  POST /api/driver/status                               │
│  { newStatus: 'TRIP STARTED', tripOtp: '4891' }        │
│  Status: TRIP STARTED                                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Destination Reached & Fare Settled                    │
│  POST /api/driver/status { newStatus: 'COMPLETED' }    │
│  Passenger pays cash/UPI to driver; Status: COMPLETED  │
└────────────────────────────────────────────────────────┘
```

#### Status Inquiry Endpoints
1. **Lightweight Polling Status**:
   - `GET /api/booking-status?bookingId=OTB-2026-4891`
   - Returns:
     ```json
     {
       "success": true,
       "booking": {
         "bookingId": "OTB-2026-4891",
         "bookingStatus": "ACCEPTED",
         "status": "ACCEPTED",
         "assignedDriverId": "DRV_101",
         "assignedDriverName": "Ramesh Kumar Singh",
         "assignedDriverCarNo": "BR 01 PB 8291",
         "assignedDriverPhone": "+91 9876543210",
         "driverDetails": {
           "name": "Ramesh Kumar Singh",
           "phone": "+91 9876543210",
           "vehicleNumber": "BR 01 PB 8291",
           "vehicleModel": "Maruti Dzire Tour",
           "rating": 4.9
         }
       }
     }
     ```

2. **Cancel Booking**:
   - `POST /api/bookings/cancel`
   - Body: `{ "bookingId": "OTB-2026-4891", "reason": "Travel plans changed" }`
   - Response: `{ "success": true, "message": "Booking cancelled successfully with ₹0 fee" }`

---

### 3.6 Live Trip Tracking & Telemetry

#### Endpoint
- **Route**: `GET /api/tracking/status?bookingId=OTB-2026-4891&phone=9835123456`
- **Access Control**: Row-level security checks:
  `if (!admin && !isPassenger && !isAssignedDriver) ➔ 403 Forbidden`
  Where `isPassenger = (phoneInput === booking.passengerPhone)`.

#### Response Body Schema (`200 OK`)
```json
{
  "success": true,
  "trip": {
    "bookingId": "OTB-2026-4891",
    "bookingStatus": "ACCEPTED",
    "originCity": "Patna",
    "destCity": "Gaya",
    "pickupAddress": "House 12, Boring Road Crossing, Patna",
    "dropAddress": "Hotel Bodhgaya Regency, Gaya",
    "pickupDate": "2026-11-05",
    "pickupTime": "08:30 AM",
    "cabTier": "sedan",
    "totalFare": 2198,
    "paymentStatus": "PAYABLE TO DRIVER (Cash on Ride)",
    "paymentMethod": "Cash on Ride (Zero Advance)",
    "tripOtp": "4891",
    "driver": {
      "id": "DRV_101",
      "name": "Ramesh Kumar Singh",
      "phone": "+91 9876543210",
      "vehicleNumber": "BR 01 PB 8291",
      "vehicleModel": "Maruti Dzire Tour",
      "rating": 4.9,
      "trips": 342
    },
    "driverLocation": {
      "lat": 25.5941,
      "lng": 85.1376,
      "heading": 85,
      "updatedAt": "2026-11-02T09:20:00.000Z"
    },
    "statusHistory": [
      { "status": "NEW", "timestamp": "...", "actor": "Customer" },
      { "status": "ACCEPTED", "timestamp": "...", "actor": "Driver (Ramesh Kumar Singh)" }
    ]
  }
}
```

- **Important Contract Rule**: Live tracking displays real driver coordinates when available. When unassigned, `driver` and `driverLocation` return `null`. The redesign MUST NEVER invent fake driver GPS markers or simulate fake movement.

---

### 3.7 Booking History (My Bookings)

#### Endpoint
- **Route**: `GET /api/passenger/trips?phone=9835123456`
- **Auth**: `Authorization: Bearer <otb_auth_token>`
- **Access Control**: Validates session token. Enforces that callers can only access their own booking records.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 4,
    "bookings": [
      {
        "id": "OTB-2026-4891",
        "bookingId": "OTB-2026-4891",
        "originCity": "Patna",
        "destCity": "Gaya",
        "pickupAddress": "Boring Road",
        "dropAddress": "Bodh Gaya",
        "tripType": "one-way",
        "pickupDate": "2026-11-05",
        "pickupTime": "08:30 AM",
        "cabTier": "sedan",
        "cabType": "Prime Sedan",
        "totalFare": 2198,
        "paymentStatus": "PAYABLE TO DRIVER",
        "bookingStatus": "CONFIRMED",
        "tripOtp": "4891",
        "assignedDriverName": "Ramesh Kumar Singh",
        "assignedDriverPhone": "+91 9876543210",
        "assignedDriverCarNo": "BR 01 PB 8291",
        "createdAt": "2026-11-02T09:15:00.000Z"
      }
    ]
  }
  ```

#### Tab Filtering Logic in Mobile Client:
- **Upcoming**: `bookingStatus` in `['NEW', 'REQUESTED', 'CONFIRMED', 'ASSIGNED', 'ACCEPTED']`
- **Active / En Route**: `bookingStatus` in `['ON THE WAY', 'DRIVER ON THE WAY', 'ARRIVED', 'TRIP STARTED']`
- **Completed**: `bookingStatus === 'COMPLETED'`
- **Cancelled**: `bookingStatus === 'CANCELLED' || bookingStatus === 'REJECTED'`

---

### 3.8 Tourism & Outstation Packages

#### 1. List Public Tourism Packages
- **Route**: `GET /api/tourism/packages`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 6,
    "packages": [
      {
        "id": "tour-bodhgaya-01",
        "title": "Bodh Gaya & Rajgir Spiritual Circuit",
        "subtitle": "2 Days / 1 Night All-Inclusive Chauffeur Tour",
        "slug": "bodhgaya-rajgir-spiritual",
        "duration": "2 Days / 1 Night",
        "destinations": ["Patna", "Rajgir", "Nalanda", "Bodh Gaya"],
        "pricing": {
          "sedan": 4999,
          "suv": 6999,
          "innova": 8999
        },
        "inclusions": [
          "Private AC Cab for 2 days",
          "Dedicated commercial chauffeur",
          "All state tolls and parking",
          "Fuel & driver night allowance"
        ]
      }
    ]
  }
  ```

#### 2. Book Tour Package
- **Route**: `POST /api/tourism/book`
- **Request Body**:
  ```json
  {
    "packageId": "tour-bodhgaya-01",
    "customerName": "Amit Kumar",
    "customerPhone": "9835123456",
    "customerEmail": "amit@example.com",
    "travelDate": "2026-11-10",
    "vehicleType": "sedan",
    "passengers": 3,
    "pickupCity": "Patna"
  }
  ```
- **Response `201 Created`**: Returns `{ "success": true, "bookingId": "OTB-TOUR-2026-3829", "totalAmount": 4999 }`.

---

## 4. Strict Existing System Protection & Boundaries

### 4.1 Zero-Breakage Boundaries

| Subsystem | Dependent Component | Strict Invariant & Contract Rule |
| :--- | :--- | :--- |
| **Backend Endpoints** | `api/index.js` | Endpoint URLs (`/api/bookings`, `/api/fares/calculate`, `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/tracking/status`, `/api/passenger/trips`) must NOT be renamed or modified. |
| **Database Collections** | MongoDB Atlas Cloud | Schema collections (`bookings`, `leads`, `users`, `drivers`, `sessions`, `payments`, `wallet_ledger`) must NOT have field names changed or deleted. |
| **Admin Dispatch Panel** | `admin.html` & `admin.js` | Admin console reads `bookingId`, `customerPhone`, `originCity`, `destCity`, `cabTier`, `totalFare`, `bookingStatus`, `paymentStatus`, `tripOtp`, `assignedDriverId`, and `driverDetails`. Any change to these keys breaks the dispatch dashboard. |
| **Driver Partner App** | `mobile/apps/driver/` & `driver.html` | Driver app relies on `bookingId`, `pickupCity`, `dropCity`, `pickupAddress`, `dropAddress`, `totalFare`, `tripOtp`, and `status`. Status transitions must adhere to `ACCEPTED`, `ON THE WAY`, `ARRIVED`, `TRIP STARTED`, `COMPLETED`. |
| **Payment & Invoicing** | `services/payment.js` & Razorpay Webhook | `paymentMethod`, `paymentStatus`, `advancePaid`, `balanceDue`, and `tripOtp` must strictly remain aligned. |
| **SMS & WhatsApp Alerts** | `services/notification.js` | Automated WhatsApp and SMS templates use `{ bookingId, customerName, originCity, destCity, totalFare, tripOtp }`. |

### 4.2 Identified Gaps in Legacy Mobile App & Redesign Opportunities

| Feature / Screen | Legacy Mobile App State | Redesign Requirement | Compatibility Solution |
| :--- | :--- | :--- | :--- |
| **Vehicle Categories** | Had only 3 hardcoded cards (`hatchback`, `sedan`, `suv`) in `CabSelectScreen.tsx` | Redesign requires 5 categories: Hatchback, Sedan, XUV, Executive Sedan, Luxury XUV | Connect `CabSelectScreen` directly to `/api/fares/calculate`, which already computes all 5 tiers (`hatchback`, `sedan`, `sedan_prime`, `suv`, `innova_crysta`). Pass normalized tier in `cabTier` to `/api/bookings`. Zero backend changes needed. |
| **Bottom Navigation** | Had 4 tabs (`Home`, `MyTrips`, `Support`, `Profile`) | User master prompt specifies 5 tabs: `Home`, `My Bookings`, `Track`, `Support`, `Profile` | Update `PassengerNavigator.tsx` to include `Track` screen (pointing to `BookingTimelineScreen` / active ride tracker). Seamlessly adheres to existing route parameters. |
| **Live Tracking** | Had simulated mock GPS ping when unassigned | User master prompt requires real tracking and NO fake driver simulation | Check `booking.assignedDriverId`. If unassigned, show "Allotting Verified Chauffeur" with live polling of `/api/booking-status`. Once assigned, fetch real driver GPS coordinates from `GET /api/tracking/status`. |
| **Theme & Color Tokens** | Used emerald green (`#059669`) in `mobile/shared/theme/colors.ts` | Redesign requires premium yellow/golden (`#F59E0B`, `#D97706`) and white | Theme colors in `colors.ts` can be upgraded to the yellow/gold palette without altering any API logic or backend contracts. |

---

## 5. Verification & Testing Evidence

1. **API Route Verification**:
   - `GET /api/health` ➔ Verified online, returns platform health and dispatch helplines.
   - `POST /api/fares/calculate` ➔ Verified authoritative calculation for all 5 tiers from Patna to Gaya, Darbhanga, Muzaffarpur, Bhagalpur.
   - `POST /api/bookings` ➔ Verified payload validation, idempotency key deduplication, and atomic wallet credit handling.
   - `GET /api/tracking/status` ➔ Verified passenger phone authorization check and driver telemetry response.
2. **Monorepo Build Checks**:
   - `mobile/package.json` verified with Expo 58, React 19.3, React Native 0.88, React Navigation 7.
   - Shared service `mobile/shared/services/api.ts` confirmed as central API layer connecting passenger and driver apps.

---
*Report compiled autonomously by Explorer 2 (API Integration Auditor) for the OneWayTaxiBihar Engineering Team.*
