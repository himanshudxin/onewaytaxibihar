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
- [ ] Verify booking flow and fare calculator responsive design
- [ ] Test API endpoints and payment gateway simulation

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

---

## 3. Ralph Loop Acceptance Criteria
- Code must pass validation tests without syntax errors.
- Commits must be atomic and verified.
- Status log must be recorded in `progress.txt`.


