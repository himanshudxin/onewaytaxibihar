# Phase 1 Design, Assets & Safety Audit Report
**Project**: OneWayTaxiBihar Passenger Mobile App Redesign  
**Auditor**: Explorer 3 (Design & Assets Specialist)  
**Date**: 2026-11-02  
**Target Branch**: `feature/passenger-app-redesign`

---

## 1. Executive Summary & Problem Scope

The authoritative request (`c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`) mandates a full visual and user experience redesign of the existing OneWayTaxiBihar Passenger Mobile Application (`mobile/apps/passenger`), transitioning it into a **premium ride-hailing interface** inspired by modern Instagram ride-hailing references.

The core guidelines and constraints dictate:
1. **Visual Direction**: Premium golden/yellow (`#EAB308` / `#F59E0B` / `#D97706`) + clean white (`#FFFFFF` / `#F9FAFB`) palette, modern rounded cards (`borderRadius: 16–20`), subtle elevation shadows, clear typography hierarchy, and smooth micro-animations.
2. **Brand Preservation**: Strict non-negotiable preservation of the authentic OneWayTaxiBihar brand identity, name typography, and green car-badge logo (`logo-reframed.png`) without recoloring or distortion.
3. **Vehicle Fleet Cards**: Real vehicle studio photography for all 5 passenger categories (Hatchback, Sedan, XUV, Executive Sedan, Luxury XUV).
4. **Architecture & Framework**: Preserve existing Expo SDK 58 React Native monorepo, Navigation architecture, Lucide icons, and zero-invalidation backend API contracts.
5. **Safety & Branching**: Clean branching on `feature/passenger-app-redesign` with automated pre-implementation backup snapshots.

---

## 2. Visual Reference & UI Design Direction Audit

### 2.1 Current Visual Baseline vs. Target Design Language
| Dimension | Current Passenger App State | Target Redesign Language |
|---|---|---|
| **Color Theme** | Dark obsidian (`#090D16`), surface (`#111827`), emerald green (`#059669`) | Bright, clean, premium golden yellow (`#EAB308` / `#F59E0B`) + pure white (`#FFFFFF`) with warm cream accents |
| **Card Styling** | Dark cards with sharp/medium borders (`#1F2937`) | Clean white floating cards, soft multi-layer shadow (`elevation: 3-5`), rounded corners (`borderRadius: 16-20`) |
| **Vehicle Selection** | Text-only rows with Lucide glyphs; no real vehicle images | High-resolution studio photographs of white cars on clean backdrops with fare badges and capacity pills |
| **Splash Screen** | Dark obsidian screen (`#090D16`) with static text and activity indicator | Vibrant golden yellow background (`#EAB308` / `#F59E0B`), centered authentic brand badge, smooth entry scale animation |
| **Map Experience** | Simple text/city list dropdowns (`AddressSelectScreen.tsx`) | Attractive map-based visual container with pickup/destination location pins, route markers, and quick search pills |
| **Micro-Animations** | Instant transitions, no animated card selection | Native 60fps `Animated` spring/scale on card tap, pulsing driver radar on assignment, smooth tab transitions |

### 2.2 Golden Yellow & White Theme Tokens
To achieve the requested premium ride-hailing visual language without conflicting with the existing driver and admin apps, the following color tokens are audited and established:

```typescript
export const PassengerThemeColors = {
  // Primary Golden Yellow Accent Spectrum
  primaryYellow: '#EAB308',      // Vivid Golden Amber (Primary Accent)
  primaryGold: '#F59E0B',        // Warm Amber Gold (Badges & Highlights)
  primaryDarkGold: '#D97706',    // Deep Gold (Buttons, CTAs, Active States)
  primaryLightYellow: '#FEF3C7', // Soft Butter/Cream (Card fills & icon badges)
  primaryGlow: 'rgba(234, 179, 8, 0.18)',

  // Pure Clean Modern Base
  white: '#FFFFFF',
  backgroundLight: '#F8FAFC',    // Soft Slate Gray-White for screen background
  cardSurface: '#FFFFFF',        // Pure white cards
  cardBorder: '#F1F5F9',         // Minimalist border separation
  cardBorderSelected: '#EAB308', // 2px Highlight border when selected

  // Modern High-Contrast Typography
  textPrimary: '#0F172A',        // Slate 900 (High contrast headers, fares)
  textSecondary: '#475569',      // Slate 600 (Labels, vehicle specs)
  textMuted: '#94A3B8',          // Slate 400 (Placeholders, inactive indicators)

  // Status & Brand Integrity
  brandGreen: '#059669',         // Preserved for authentic Logo Badge & "AC Included" badges
  accentRed: '#EF4444',          // Errors, cancellation, urgent notice
  accentBlue: '#2563EB',         // Live navigation & location indicators
};
```

---

## 3. Brand Identity Preservation Audit (Strict Non-Negotiable)

The user request strictly mandates:
> *"My existing brand identity must remain unchanged. Keep the exact existing OneWayTaxiBihar name. Keep my original logo exactly as it currently appears. Do not redesign, recreate, replace or recolour the logo. Preserve existing logo dimensions, proportions and assets."*

### 3.1 Inventory of Brand Assets Across the Repository
| File Path | Format | Dimensions | File Size | Description & Usage |
|---|---|---|---|---|
| `mobile/shared/assets/logo-reframed.png` | PNG | 512 × 512 | 93,473 bytes | **Authoritative Mobile Brand Mark**: Green rounded badge (`#059669`) with white moving car and 3 speed lines. Used by `BrandLogo.tsx`. |
| `img/logo.png` | PNG | 512 × 512 | 93,473 bytes | Web root brand logo (identical SHA to `logo-reframed.png`). |
| `img/logo-reframed.png` | PNG | 512 × 512 | 93,473 bytes | Web reframed logo (identical SHA). |
| `img/logo-192.png` | PNG | 192 × 192 | 19,955 bytes | PWA / Mobile web icon. |
| `img/logo-512.png` | PNG | 512 × 512 | 93,473 bytes | PWA / Mobile web splash icon. |
| `img/car-icon-white.png` | PNG | 250 × 103 | 15,129 bytes | White silhouette car with 3 speed lines on transparent background. |
| `img/car-icon-green.png` | PNG | 338 × 140 | 20,745 bytes | Green silhouette car with 3 speed lines on transparent background. |
| `mobile/apps/passenger/passenger-icon.png` | JPEG (named .png) | 1024 × 1024 | 635,104 bytes | App launcher icon: Obsidian badge with green illuminated taxi and GPS pin. |
| `mobile/apps/passenger/assets/passenger-icon.png` | JPEG (named .png) | 1024 × 1024 | 635,104 bytes | Expo assets launcher copy. |

### 3.2 Preservation Rules & Component Reuse
1. **Component Reuse**: The existing `BrandLogo` component in `mobile/shared/components/BrandLogo.tsx` already encapsulates:
   - The authentic green badge icon (`mobile/shared/assets/logo-reframed.png`) at exact square proportions (`size="hero" | "header" | "sm"`).
   - The authentic typography: `OneWay` (bold slate) + `TaxiBihar` (bold golden accent).
   - Subtitle: `BIHAR INTERCITY CAB NETWORK`.
2. **Zero Modification**:
   - Do **NOT** recolor the green badge to yellow.
   - Do **NOT** change the silhouette car graphics or speed trail vectors.
   - Do **NOT** alter the font weighting or casing (`OneWayTaxiBihar`).
3. **Application on Redesigned Screens**:
   - **Splash Screen**: Display `BrandLogo` with `size="hero"` centered on the vibrant yellow background (`#EAB308`), with the original green badge creating a vivid, premium high-contrast focal point.
   - **Home Screen Header**: Display `BrandLogo` with `size="header"` on a clean white surface with notification/profile icons on the right.
   - **Booking / Checkout / Timeline**: Render `BrandLogo` or clean brand mark at the top to reassure passengers of authentic OneWayTaxiBihar commercial dispatch.

---

## 4. Vehicle Assets & Media Audit

### 4.1 Repository Vehicle Image Audit
The repository contains high-resolution studio photography of vehicles in `images/voyago/`:

| Vehicle Image Path | Subject / Vehicle Model | Dimensions | Quality & Format | Recommended Screen Category Mapping |
|---|---|---|---|---|
| `images/voyago/car-sedan.jpg` | White Maruti Dzire Sedan (Studio shot, isolated white background) | 1000 × 750 | Crisp JPEG (57.4 KB) | **Category 2: Sedan** (Prime Sedan - Dzire, Etios, Aura) |
| `images/voyago/car-ertiga.jpg` | White Maruti Ertiga MPV (Studio shot, isolated white background) | 1000 × 750 | Crisp JPEG (68.8 KB) | **Category 3: XUV** (Ertiga 6+1, Carens, Scorpio) |
| `images/voyago/car-suv.jpg` | White Toyota Innova Crysta (Studio shot, isolated white background) | 1000 × 750 | Crisp JPEG (61.2 KB) | **Category 5: Luxury XUV** (Innova Crysta VIP Recliner) |
| `images/voyago/deal-car.jpg` | White Mahindra XUV700 (Action road shot) | 1000 × 563 | High-res JPEG (92.3 KB) | Promotional / Hero banner asset |

### 4.2 Handling Missing Studio Cuts for Hatchback & Executive Sedan
The user prompt mandates cards for:
1. **Hatchback** (WagonR, Tiago, Celerio)
2. **Sedan** (Dzire, Etios, Aura)
3. **XUV** (Ertiga, Scorpio, Carens)
4. **Executive Sedan** (Honda City, Ciaz)
5. **Luxury XUV** (Toyota Innova Crysta, XUV700)

**Implementation Strategy**:
- `images/voyago/car-sedan.jpg` is used for **Sedan**.
- `images/voyago/car-ertiga.jpg` is used for **XUV**.
- `images/voyago/car-suv.jpg` is used for **Luxury XUV**.
- For **Hatchback** and **Executive Sedan**:
  - We can place clean, dedicated, optimized vehicle studio photography in `mobile/apps/passenger/assets/vehicles/` matching the exact white-background studio style of `car-sedan.jpg`, `car-ertiga.jpg`, and `car-suv.jpg`.
  - Alternatively, the executive trim of `car-sedan.jpg` with an "Executive Comfort / Extra Legroom" badge can serve Executive Sedan, while a crisp Hatchback studio shot completes the 5-fleet suite.

### 4.3 Vehicle Selection Card Architecture
Each vehicle selection card in `CabSelectScreen.tsx` must display:
```
┌─────────────────────────────────────────────────────────────┐
│ [MOST POPULAR]                                       ₹2,198 │
│                                         (All-Inclusive Fare)│
│  [ Studio Vehicle Photo ]    Prime Sedan                    │
│   (Maruti Dzire / Etios)     Maruti Dzire, Etios, Aura      │
│                              ─────────────────────────────  │
│                              👥 4 Pax   🧳 3-4 Bags   ❄️ AC │
│                              ⏱️ 2h 30m • 104 km             │
│                                                             │
│  [  ✓ Selected Category  /  Select & Book Taxi  ]           │
└─────────────────────────────────────────────────────────────┘
```
Key Card Elements:
- Floating white card with `borderRadius: 18`, `borderWidth: 1.5`, border `#F1F5F9` (unselected) vs `#EAB308` (selected).
- Studio vehicle photo: `width: 130`, `height: 80`, `resizeMode: 'contain'`, aligned with card details.
- Fare display: Bold high-contrast text (`fontSize: 20`, `fontWeight: '900'`, `color: '#0F172A'`).
- Inclusions pill: "All-Inclusive • No Toll Extra • Zero Return Fee".
- Capacity indicators: `Users` (4 / 6 / 7 Seats) and `Briefcase` (2 / 4 / 6 Bags) icons from `lucide-react-native`.

---

## 5. UI Framework, Theme & Styling System Audit

### 5.1 Tech Stack Identification
- **Framework**: Expo SDK 58.0.0 (`mobile/package.json`)
- **React Core**: React 19.3.0, React Native 0.88.0
- **Navigation**:
  - `@react-navigation/native` (v7.0.14)
  - `@react-navigation/native-stack` (v7.2.0)
  - `@react-navigation/bottom-tabs` (v7.2.0)
- **Styling Paradigm**: React Native `StyleSheet.create`. No Tailwind / NativeWind dependencies.
- **Icon Library**: `lucide-react-native` (v0.475.0) — provides icons for all UI components (`Home`, `Calendar`, `MapPin`, `Car`, `ShieldCheck`, `Phone`, `Users`, `Briefcase`, `Clock`, etc.).
- **Animation Engine**: React Native built-in `Animated` and `LayoutAnimation`.
  - Fully native, zero additional dependencies needed.
  - Supports micro-interactions: card scale `transform: [{ scale }]`, button press spring, opacity fade-ins, and loading progress bars.

### 5.2 Navigation Architecture Audit
File: `mobile/apps/passenger/src/navigation/PassengerNavigator.tsx`
- **Current Bottom Navigation**: 4 tabs (`Home`, `MyTrips`, `Support`, `Profile`).
- **Required Bottom Navigation**: 5 tabs per ORIGINAL_REQUEST.md Section 4:
  1. **Home**: `HomeScreen.tsx` (Booking dashboard)
  2. **My Bookings**: `MyTripsScreen.tsx` (Upcoming, active, completed, cancelled)
  3. **Track**: `BookingTimelineScreen.tsx` (Live driver assignment & tracking)
  4. **Support**: `SupportScreen.tsx` (24x7 call & WhatsApp direct desk)
  5. **Profile**: `ProfileScreen.tsx` (Account, DPDP deletion, saved locations)

---

## 6. Safety, Branching & Backup Audit

### 6.1 Current Git Repository State
- **Root Repository**: `c:\Users\himan\onewaycabs\.git`
- **Current HEAD**: `refs/heads/main`
- **Current HEAD Commit**: `01a46b48b30ce949722e96e4a48f99012db29036` ("docs: log Phase 11 admin master credentials rotation")
- **Existing Branches**: `main`, `feat/*`, `fix/*`, `seo-bot/*`, `redesign-backup`, `single-page-backup`.
- **Target Branch**: `feature/passenger-app-redesign` (does not exist yet).
- **TypeScript Integrity**: `cd mobile; npx tsc --noEmit` exits with **0 errors**.
- **JavaScript & HTML Syntax**: `npm test` passed on all 79 JS files and 40 inline HTML scripts.

### 6.2 Exact Steps to Create and Switch to Target Branch
The implementing worker must execute the following branch creation command before modifying any mobile files:

```powershell
# In c:\Users\himan\onewaycabs
git checkout -b feature/passenger-app-redesign
```

*Note for environments without git CLI in PATH*:  
If `git` CLI is not mapped in the PowerShell environment PATH, create the branch ref directly via Node/PowerShell:
```powershell
# Create branch ref file
Set-Content -Path ".git/refs/heads/feature/passenger-app-redesign" -Value "01a46b48b30ce949722e96e4a48f99012db29036"
# Switch HEAD to new branch
Set-Content -Path ".git/HEAD" -Value "ref: refs/heads/feature/passenger-app-redesign"
```

### 6.3 Automated Pre-Implementation Backup Snapshot Procedure
Before writing any redesigned components, create a complete pre-redesign snapshot:

```powershell
# Create timestamped snapshot directory
$ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
$backupDir = "data/backups/passenger-app-redesign-pre-$ts"
New-Item -ItemType Directory -Path $backupDir -Force

# Snapshot passenger app and shared themes
Copy-Item -Path "mobile/apps/passenger" -Destination "$backupDir/passenger" -Recurse -Force
Copy-Item -Path "mobile/shared" -Destination "$backupDir/shared" -Recurse -Force
```

### 6.4 Rollback Procedure
If any unexpected defect or test regression occurs during the redesign:
```powershell
# Immediate rollback from snapshot
Copy-Item -Path "$backupDir/passenger/*" -Destination "mobile/apps/passenger" -Recurse -Force
Copy-Item -Path "$backupDir/shared/*" -Destination "mobile/shared" -Recurse -Force
# Switch back to main
git checkout main
```

---

## 7. Recommendations & Downstream Specifications for Phase 2 & 3

1. **Theme Extension**:
   - Create a dedicated passenger theme module `mobile/shared/theme/passengerTheme.ts` or add `yellowPalette` to `colors.ts` so Driver and Admin apps remain intact with their existing emerald/dark palette while Passenger app embraces the yellow-white design.
2. **Vehicle Assets**:
   - Export and copy `car-sedan.jpg`, `car-ertiga.jpg`, `car-suv.jpg` into `mobile/apps/passenger/assets/vehicles/` and bundle clean studio images for Hatchback and Executive Sedan.
3. **Screen Redesigns Priority**:
   - **P0**: `SplashScreen.tsx` (Yellow background + authentic BrandLogo + smooth scale animation).
   - **P0**: `PassengerNavigator.tsx` (5-tab bottom navigation with 'Track' tab).
   - **P0**: `CabSelectScreen.tsx` (All 5 vehicle cards with studio images, capacities, fares).
   - **P1**: `HomeScreen.tsx` (Modern ride dashboard, quick destination search, floating cards).
   - **P1**: `AddressSelectScreen.tsx` (Map-styled location search with pins and suggestions).
   - **P1**: `BookingTimelineScreen.tsx` & `BookingConfirmScreen.tsx` (Clean status tracking & summaries).
   - **P2**: `AuthScreen.tsx`, `MyTripsScreen.tsx`, `ProfileScreen.tsx`, `SupportScreen.tsx`.
4. **Verification Gate**:
   - Every redesigned screen must verify cleanly via `cd mobile; npx tsc --noEmit`.
   - Run `npm test` for backend syntax safety.
