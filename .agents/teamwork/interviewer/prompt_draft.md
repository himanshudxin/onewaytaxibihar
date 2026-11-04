Redesign the existing OneWayTaxiBihar passenger mobile application with a modern, premium yellow-and-white visual interface inspired by reference styling, strictly preserving existing branding, APIs, and business operations for [OPEN: Purpose of redesign: production, showcase, or exploration?].

Working directory: c:\Users\himan\onewaycabs
Integrity mode: [OPEN: Integrity mode based on restrictions]

## Requirements

### R1. Audit & Technology Verification
Inspect the existing passenger mobile application in the repository to identify its framework, architecture, existing screens, navigation, and API integrations before making changes. If the repository does not contain a separate mobile app, halt and report before attempting to create or replace an application.

### R2. Brand Identity & Visual Design Direction
Preserve the existing OneWayTaxiBihar brand name, typography, and original logo assets without recreation, recoloring, or resizing. Adapt the visual language to a premium yellow/golden and white color palette with clean, minimal, rounded mobile cards, modern typography, smooth animations, and professional ride-hailing UX [OPEN: Use written design guidelines or external screenshot files?].

### R3. Passenger App Screens Redesign
Redesign all passenger application screens:
- Splash Screen: Existing logo, yellow background, loading animation.
- Login & Registration: Clean phone/OTP/password authentication preserving existing auth APIs.
- Home Screen: Compact ride-hailing dashboard with profile, pickup, destination, trip type, travel date/time, vehicle search, popular destinations, and recent bookings.
- Location Selection: Map-based interface with pickup/destination search, markers, and suggestions.
- Vehicle Selection: Premium cards for Hatchback, Sedan, XUV, Executive Sedan, and Luxury XUV displaying actual vehicle images, capacity, journey info, and fares calculated via existing APIs (never hardcoded).
- Booking Confirmation: Summary with pickup, destination, date/time, vehicle, and actual fare connected to existing booking APIs.
- Driver Assignment: Driver status progression (received, searching, assigned, accepted, started, completed) retaining manual dispatch fallback without fake states.
- Live Trip Tracking: Map with driver location, driver contact, vehicle info, and ETA where supported by existing APIs without simulating fake live data.
- My Bookings: Filterable history (upcoming, active, completed, cancelled) and details.
- Profile & Support: Customer profile, saved locations, contact/WhatsApp support, T&C, privacy policy, and logout.

### R4. Bottom Navigation & Motion Experience
Provide a 5-item bottom navigation (Home, My Bookings, Track, Support, Profile) connected to functional screens. Implement subtle, performant transitions, button feedback, loading indicators, and card selection animations.

### R5. System Preservation & Architecture Protection
Keep existing backend, booking APIs, fare calculation logic, payment integrations, customer database, admin dispatch console, driver assignment, tourism APIs, and security/authorization intact without breaking changes or duplicate systems.

### R6. Git Workflow, Verification & Deliverables
Work on a dedicated Git branch `feature/passenger-app-redesign` without modifying production directly. Verify changes through automated checks, TypeScript compilation, and functional testing [OPEN: Specific verification test suites and build requirements?]. Provide screen previews, changed file list, test results, and rollback instructions.

## Acceptance Criteria

### Technology Audit & Setup
- [ ] Existing mobile application directory and framework are identified and documented prior to modifications.
- [ ] Redesign work is performed on branch `feature/passenger-app-redesign`.

### Brand & Visual Identity
- [ ] Original OneWayTaxiBihar logo file and name are retained with unaltered dimensions, proportions, and colors.
- [ ] App theme applies premium yellow/golden and white styling with rounded mobile cards and modern typography.

### Screen Redesign & Navigation
- [ ] All 10 passenger views (Splash, Login/Register, Home, Location Selection, Vehicle Selection, Booking Confirmation, Driver Assignment, Live Trip Tracking, My Bookings, Profile/Support) render with the redesigned UI.
- [ ] Five-tab bottom navigation switches correctly between Home, My Bookings, Track, Support, and Profile views.
- [ ] Vehicle selection renders actual calculated fares from existing pricing logic without hardcoded values.
- [ ] Driver assignment and trip tracking display authentic states from backend APIs without simulated data.

### System Compatibility & Backend Protection
- [ ] Existing backend endpoints, authentication flows, and booking submission APIs continue to function without schema or contract breaks.
- [ ] Admin panel, driver console, and tourism features remain unaffected.

### Verification & Deliverables
- [ ] TypeScript compilation (`tsc --noEmit` or equivalent project check) passes with 0 errors.
- [ ] UI screen previews for all major passenger flows are generated and documented.
- [ ] List of modified files, test execution results, and rollback documentation are delivered.
