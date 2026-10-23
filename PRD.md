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

---

## 3. Ralph Loop Acceptance Criteria
- Code must pass validation tests without syntax errors.
- Commits must be atomic and verified.
- Status log must be recorded in `progress.txt`.

