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

---

## 3. Ralph Loop Acceptance Criteria
- Code must pass validation tests without syntax errors.
- Commits must be atomic and verified.
- Status log must be recorded in `progress.txt`.
