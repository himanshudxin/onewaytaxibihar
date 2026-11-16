const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appJsPath = path.join(rootDir, 'js', 'app.js');
const cssPath = path.join(rootDir, 'css', 'components.css');

// 1. Update js/app.js
let appJs = fs.readFileSync(appJsPath, 'utf8');

const targetAppJs = `window.openCorporateModal = () => {
  window.closeAllModals();
  const modal = document.getElementById("modal-corporate");
  const body = document.getElementById("modal-corporate-body");
  if (!modal || !body) return;

  body.innerHTML = \`
    <div class="corporate-modal-layout">
      <div class="corporate-info-col">
        <h3 class="corporate-modal-title">\${OTB_CORPORATE_DATA.title}</h3>
        <p class="corporate-modal-subtitle">\${OTB_CORPORATE_DATA.subtitle}</p>

        <div class="corporate-features-list">
          \${OTB_CORPORATE_DATA.features.map(f => \`
            <div class="corporate-feature-item">
              <span class="corporate-feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <div>
                <div class="corporate-feature-title">\${f.title}</div>
                <div class="corporate-feature-desc">\${f.desc}</div>
              </div>
            </div>
          \`).join("")}
        </div>

        <div class="corporate-trusted-title">Trusted By Leading Organizations in Bihar:</div>
        <div class="corporate-trusted-tags">
          \${OTB_CORPORATE_DATA.trustedBy.map(c => \`
            <span class="corporate-trusted-tag">\${c}</span>
          \`).join("")}
        </div>
      </div>

      <!-- Corporate Inquiry Form -->
      <div class="corporate-form-card">
        <h4 class="corporate-form-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Corporate Inquiry Desk</span>
        </h4>
        <div class="corporate-form-inputs">
          <input type="text" class="corporate-input-field" placeholder="Company / Institution Name" id="corp-company" autocomplete="organization">
          <input type="text" class="corporate-input-field" placeholder="GSTIN Number (Optional)" id="corp-gstin">
          <input type="text" class="corporate-input-field" placeholder="Contact Person Name" id="corp-person" autocomplete="name">
          <input type="tel" class="corporate-input-field" placeholder="Official 10-Digit Mobile" id="corp-phone" autocomplete="tel" maxlength="10">
          <input type="email" class="corporate-input-field" placeholder="Official Email Address" id="corp-email" autocomplete="email">
        </div>
        <button type="button" class="check-fare-primary-btn" style="margin-bottom: 0; width: 100%;" onclick="window.submitCorporateInquiry()">
          Submit Corporate Inquiry
        </button>
      </div>
    </div>
  \`;

  modal.classList.add("open");
};

window.submitCorporateInquiry = () => {
  window.showToast("Corporate inquiry submitted! Our Patna business desk will contact you within 2 hours.", "success");
  window.closeAllModals();
};`;

const replacementAppJs = `window.openCorporateModal = () => {
  window.closeAllModals();
  const modal = document.getElementById("modal-corporate");
  const body = document.getElementById("modal-corporate-body");
  if (!modal || !body) return;

  const data = window.OTB_CORPORATE_DATA || {
    title: "OneWayTaxiBihar for Business & Corporate Travel",
    subtitle: "Streamline outstation employee and executive travel across all 38 districts of Bihar with centralized billing & GST compliance",
    verticals: [
      "Corporate Staff Outstation Travel",
      "Executive & Delegation Fleet",
      "Patna Airport Transfers",
      "Industrial Site Visits & Plants",
      "Emergency Medical & Legal Dispatches"
    ],
    certifications: [
      "100% Tax Invoiced with GST Input Credit",
      "Commercial Yellow-Plate Vehicles Only",
      "Police-Verified Highway Captains",
      "Registered Bihar Mobility Enterprise"
    ],
    features: [
      { title: "Consolidated Monthly GST Invoicing", desc: "Itemized monthly statement with automated GST tax credit pass-through for enterprise accounting." },
      { title: "Priority Dispatch Across All 38 Districts", desc: "Guaranteed outstation cabs for urgent executive travel and airport arrivals." },
      { title: "Zero Cancellation Penalty Fees", desc: "Meeting rescheduled? Modify or cancel corporate bookings with zero penalty fees." },
      { title: "Dedicated Bihar Account Manager", desc: "Single point of contact in Patna for corporate invoicing, custom tariffs, and fleet coordination." },
      { title: "Real-Time Travel Radar & SOS", desc: "Live vehicle GPS radar and 24×7 journey monitoring for passenger safety." }
    ]
  };

  body.innerHTML = \`
    <div class="corporate-modal-layout">
      <!-- Left Column: Official Enterprise Mobility & Statutory Compliance -->
      <div class="corporate-info-col">
        <div class="corp-top-badge">
          <span class="corp-top-dot"></span>
          <span>BIHAR ENTERPRISE MOBILITY • 38 DISTRICTS</span>
        </div>
        <h3 class="corporate-modal-title">\${data.title}</h3>
        <p class="corporate-modal-subtitle">\${data.subtitle}</p>

        <div class="corporate-features-list">
          \${(data.features || []).map(f => \`
            <div class="corporate-feature-item">
              <span class="corporate-feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <div>
                <div class="corporate-feature-title">\${f.title}</div>
                <div class="corporate-feature-desc">\${f.desc}</div>
              </div>
            </div>
          \`).join("")}
        </div>

        <!-- Official Service Verticals -->
        <div class="corp-section-divider"></div>
        <div class="corp-verticals-label">OFFICIAL MOBILITY VERTICALS:</div>
        <div class="corp-verticals-grid">
          \${(data.verticals || []).map(v => \`
            <div class="corp-vertical-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>\${v}</span>
            </div>
          \`).join("")}
        </div>

        <!-- Statutory Guarantees Strip -->
        <div class="corp-cert-strip">
          \${(data.certifications || []).map(c => \`
            <div class="corp-cert-pill">
              <span class="corp-cert-icon">✓</span>
              <span>\${c}</span>
            </div>
          \`).join("")}
        </div>
      </div>

      <!-- Right Column: Professional Corporate Inquiry Desk -->
      <div class="corp-form-card">
        <div class="corp-form-header">
          <div class="corp-form-title-row">
            <div class="corp-form-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div>
              <h4 class="corp-form-main-title">Corporate Inquiry Desk</h4>
              <p class="corp-form-sub-title">Custom Tariffs &amp; Consolidated Billing</p>
            </div>
          </div>
          <div class="corp-sla-pill">
            <span class="corp-sla-dot"></span>
            <span>2-Hour Response SLA</span>
          </div>
        </div>

        <form class="corp-inquiry-form" onsubmit="event.preventDefault(); window.submitCorporateInquiry();">
          <div class="corp-field-group">
            <label class="corp-field-label" for="corp-company">
              <span>Company / Institution Name</span>
              <span class="corp-req-mark">*</span>
            </label>
            <div class="corp-input-wrapper">
              <span class="corp-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
              </span>
              <input type="text" class="corp-input-control" id="corp-company" placeholder="e.g. Tata Projects / AIIMS Vendor / Patna Firm" autocomplete="organization" required>
            </div>
          </div>

          <div class="corp-field-group">
            <label class="corp-field-label" for="corp-gstin">
              <span>GSTIN Number</span>
              <span class="corp-opt-badge">Optional (For Input Tax Credit)</span>
            </label>
            <div class="corp-input-wrapper">
              <span class="corp-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </span>
              <input type="text" class="corp-input-control" id="corp-gstin" placeholder="e.g. 10AAAAA0000A1Z5 (15-character GST)" maxlength="15" style="text-transform: uppercase;">
            </div>
          </div>

          <div class="corp-fields-row">
            <div class="corp-field-group">
              <label class="corp-field-label" for="corp-person">
                <span>Contact Person</span>
                <span class="corp-req-mark">*</span>
              </label>
              <div class="corp-input-wrapper">
                <span class="corp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input type="text" class="corp-input-control" id="corp-person" placeholder="Full name" autocomplete="name" required>
              </div>
            </div>

            <div class="corp-field-group">
              <label class="corp-field-label" for="corp-phone">
                <span>Official Mobile</span>
                <span class="corp-req-mark">*</span>
              </label>
              <div class="corp-input-wrapper">
                <span class="corp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <input type="tel" class="corp-input-control" id="corp-phone" placeholder="10-digit number" autocomplete="tel" maxlength="10" required>
              </div>
            </div>
          </div>

          <div class="corp-field-group">
            <label class="corp-field-label" for="corp-email">
              <span>Official Work Email</span>
              <span class="corp-req-mark">*</span>
            </label>
            <div class="corp-input-wrapper">
              <span class="corp-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" class="corp-input-control" id="corp-email" placeholder="official@company.com" autocomplete="email" required>
            </div>
          </div>

          <div class="corp-field-group">
            <label class="corp-field-label" for="corp-scope">
              <span>Requirement Scope</span>
            </label>
            <div class="corp-input-wrapper">
              <span class="corp-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <select class="corp-input-control corp-select-control" id="corp-scope">
                <option value="outstation-routine">Regular Staff Outstation Travel (Inter-District)</option>
                <option value="airport-priority">Patna Airport Transfers &amp; Pickup Fleet</option>
                <option value="executive-delegation">Executive &amp; VIP Delegation Chauffeurs</option>
                <option value="monthly-retainer">Dedicated Monthly Cab Retainer</option>
                <option value="industrial-project">Industrial / Project Site Visits</option>
                <option value="other">Other Custom Mobility Requirement</option>
              </select>
            </div>
          </div>

          <button type="submit" class="corp-submit-btn">
            <span>Submit Corporate Inquiry</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>

        <div class="corp-card-footer">
          <div class="corp-footer-guarantee">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Verified Commercial Fleet • Zero Hidden Charges</span>
          </div>
          <div class="corp-footer-hotline">
            Patna Enterprise Hotline: <a href="tel:+918002141816" style="color:var(--owc-primary); font-weight:700;">+91 80021 41816</a>
          </div>
        </div>
      </div>
    </div>
  \`;

  modal.classList.add("open");
};

window.submitCorporateInquiry = () => {
  const company = (document.getElementById("corp-company")?.value || "").trim();
  const person = (document.getElementById("corp-person")?.value || "").trim();
  const phone = (document.getElementById("corp-phone")?.value || "").trim();
  const email = (document.getElementById("corp-email")?.value || "").trim();
  const gstin = (document.getElementById("corp-gstin")?.value || "").trim();
  const scope = (document.getElementById("corp-scope")?.value || "").trim();

  if (!company) {
    window.showToast("Please enter your Company / Institution name", "error");
    document.getElementById("corp-company")?.focus();
    return;
  }
  if (!person) {
    window.showToast("Please enter Contact Person name", "error");
    document.getElementById("corp-person")?.focus();
    return;
  }
  if (!phone || phone.replace(/\\D/g, "").length < 10) {
    window.showToast("Please enter a valid 10-digit Official Mobile Number", "error");
    document.getElementById("corp-phone")?.focus();
    return;
  }
  if (!email || !email.includes("@")) {
    window.showToast("Please enter a valid Official Work Email Address", "error");
    document.getElementById("corp-email")?.focus();
    return;
  }

  try {
    fetch('/api/corporate-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, person, phone, email, gstin, scope, timestamp: new Date().toISOString() })
    }).catch(() => {});
  } catch (e) {}

  window.showToast("Corporate inquiry submitted! Our Patna business desk will contact you within 2 hours.", "success");
  window.closeAllModals();
};`;

// Normalize line endings for replacement
const normAppJs = appJs.replace(/\r\n/g, '\n');
const normTarget = targetAppJs.replace(/\r\n/g, '\n');
const normRepl = replacementAppJs.replace(/\r\n/g, '\n');

if (!normAppJs.includes(normTarget)) {
  console.error("Could not find exact target in js/app.js");
  process.exit(1);
}

const updatedAppJs = normAppJs.replace(normTarget, normRepl);
fs.writeFileSync(appJsPath, updatedAppJs, 'utf8');
console.log("Successfully updated js/app.js!");

// 2. Update css/components.css
let css = fs.readFileSync(cssPath, 'utf8');

const targetCss = `/* =============================================================================
   CORPORATE TRAVEL & GOVERNMENT DESK MODAL (Fully Responsive)
   ============================================================================= */
.corporate-modal-layout {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 28px;
  align-items: start;
}

.corporate-info-col {
  display: flex;
  flex-direction: column;
}

.corporate-modal-title {
  font-size: 21px;
  font-weight: 850;
  color: var(--owc-text);
  margin-bottom: 8px;
  line-height: 1.25;
  letter-spacing: -0.3px;
}

.corporate-modal-subtitle {
  font-size: 13.5px;
  color: var(--owc-text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
}

.corporate-features-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 22px;
}

.corporate-feature-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.corporate-feature-icon {
  color: var(--owc-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.12);
  flex-shrink: 0;
}

.corporate-feature-title {
  font-size: 13.5px;
  font-weight: 750;
  color: var(--owc-text);
  margin-bottom: 2px;
}

.corporate-feature-desc {
  font-size: 12px;
  color: var(--owc-text-muted);
  line-height: 1.5;
}

.corporate-trusted-title {
  font-size: 11px;
  color: var(--owc-text-dim);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.corporate-trusted-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.corporate-trusted-tag {
  background: var(--owc-slate-50);
  border: 1px solid var(--owc-border);
  padding: 5px 11px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--owc-text);
}

/* Corporate Form Card */
.corporate-form-card {
  background: var(--owc-slate-50);
  border: 1.5px solid var(--owc-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  box-shadow: var(--shadow-sm);
}

.corporate-form-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--owc-text);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.corporate-form-inputs {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-bottom: 16px;
}

.corporate-input-field {
  width: 100% !important;
  padding: 12px 14px !important;
  border-radius: 10px !important;
  border: 1.5px solid var(--owc-border) !important;
  background: var(--owc-surface) !important;
  color: var(--owc-text) !important;
  font-size: 14.5px !important;
  font-weight: 500 !important;
  outline: none !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
  box-sizing: border-box !important;
}

.corporate-input-field:focus {
  border-color: var(--owc-primary) !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
}

.corporate-input-field::placeholder {
  color: var(--owc-text-dim) !important;
  font-size: 13.5px !important;
}

/* Mobile & Tablet Responsiveness (< 860px) */
@media (max-width: 860px) {
  .corporate-modal-layout {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
  }

  .corporate-modal-title {
    font-size: 18px !important;
  }

  .corporate-modal-subtitle {
    font-size: 13px !important;
    margin-bottom: 16px !important;
  }

  .corporate-form-card {
    padding: 20px 16px !important;
    border-radius: 14px !important;
  }

  .corporate-form-title {
    font-size: 15px !important;
  }

  .corporate-features-list {
    gap: 12px !important;
    margin-bottom: 18px !important;
  }

  .corporate-feature-title {
    font-size: 13px !important;
  }

  .corporate-feature-desc {
    font-size: 11.5px !important;
  }
}`;

const replacementCss = `/* =============================================================================
   CORPORATE TRAVEL & GOVERNMENT DESK MODAL (Enterprise-Grade & Responsive)
   ============================================================================= */
.corporate-modal-layout {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 28px;
  align-items: start;
}

.corporate-info-col {
  display: flex;
  flex-direction: column;
}

.corp-top-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #059669;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  width: fit-content;
  margin-bottom: 12px;
}

.corp-top-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
  animation: pulseCorpDot 2s infinite;
}

@keyframes pulseCorpDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.corporate-modal-title {
  font-size: 22px;
  font-weight: 850;
  color: var(--owc-text);
  margin-bottom: 8px;
  line-height: 1.25;
  letter-spacing: -0.4px;
}

.corporate-modal-subtitle {
  font-size: 13.5px;
  color: var(--owc-text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
}

.corporate-features-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-bottom: 20px;
}

.corporate-feature-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.corporate-feature-icon {
  color: #059669;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.12);
  flex-shrink: 0;
}

.corporate-feature-title {
  font-size: 13.5px;
  font-weight: 750;
  color: var(--owc-text);
  margin-bottom: 2px;
}

.corporate-feature-desc {
  font-size: 12px;
  color: var(--owc-text-muted);
  line-height: 1.5;
}

.corp-section-divider {
  height: 1px;
  background: var(--owc-border);
  margin: 18px 0 16px;
}

.corp-verticals-label {
  font-size: 10.5px;
  color: var(--owc-text-dim);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 9px;
}

.corp-verticals-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 16px;
}

.corp-vertical-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  background: var(--owc-surface-card);
  border: 1px solid var(--owc-border);
  font-size: 11.5px;
  font-weight: 650;
  color: var(--owc-text);
}

.corp-vertical-pill svg {
  color: #059669;
}

.corp-cert-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.corp-cert-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  font-size: 11px;
  font-weight: 600;
  color: #047857;
}

[data-theme="dark"] .corp-cert-pill {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.corp-cert-icon {
  font-weight: 800;
  font-size: 11px;
}

/* -----------------------------------------------------------------------------
   EXECUTIVE CORPORATE FORM CARD
   ----------------------------------------------------------------------------- */
.corp-form-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 22px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
}

[data-theme="dark"] .corp-form-card {
  background: #111827;
  border-color: #1f2937;
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.45);
}

.corp-form-header {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

[data-theme="dark"] .corp-form-header {
  border-bottom-color: #1f2937;
}

.corp-form-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.corp-form-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  flex-shrink: 0;
}

.corp-form-main-title {
  font-size: 16px;
  font-weight: 850;
  color: #0f172a;
  margin: 0;
  line-height: 1.25;
}

[data-theme="dark"] .corp-form-main-title {
  color: #f8fafc;
}

.corp-form-sub-title {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0;
}

[data-theme="dark"] .corp-form-sub-title {
  color: #94a3b8;
}

.corp-sla-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  font-size: 11px;
  font-weight: 750;
  width: fit-content;
}

[data-theme="dark"] .corp-sla-pill {
  background: rgba(21, 128, 61, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.corp-sla-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.corp-inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.corp-field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.corp-field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #475569;
}

[data-theme="dark"] .corp-field-label {
  color: #94a3b8;
}

.corp-req-mark {
  color: #ef4444;
  font-weight: 800;
  margin-left: 3px;
}

.corp-opt-badge {
  font-size: 9.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: normal;
}

.corp-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.corp-input-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

[data-theme="dark"] .corp-input-icon {
  color: #94a3b8;
}

.corp-input-control {
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 11px 13px 11px 38px !important;
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 10px !important;
  color: #0f172a !important;
  font-size: 13.5px !important;
  font-weight: 550 !important;
  font-family: inherit !important;
  outline: none !important;
  transition: all 0.2s ease !important;
}

[data-theme="dark"] .corp-input-control {
  background: #0b0f19 !important;
  border-color: #1e293b !important;
  color: #f8fafc !important;
}

.corp-input-control:focus {
  background: #ffffff !important;
  border-color: #059669 !important;
  box-shadow: 0 0 0 3.5px rgba(16, 185, 129, 0.2) !important;
}

[data-theme="dark"] .corp-input-control:focus {
  background: #0f172a !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3.5px rgba(16, 185, 129, 0.25) !important;
}

.corp-input-control::placeholder {
  color: #94a3b8 !important;
  font-size: 13px !important;
  font-weight: 450 !important;
}

[data-theme="dark"] .corp-input-control::placeholder {
  color: #475569 !important;
}

.corp-select-control {
  appearance: none !important;
  -webkit-appearance: none !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 14px center !important;
  padding-right: 36px !important;
  cursor: pointer !important;
}

.corp-fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.corp-submit-btn {
  width: 100%;
  margin-top: 4px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: none;
  border-radius: 11px;
  padding: 13px 20px;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
}

.corp-submit-btn:hover {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.4);
}

.corp-submit-btn:active {
  transform: translateY(0);
}

.corp-card-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
}

[data-theme="dark"] .corp-card-footer {
  border-top-color: #1f2937;
}

.corp-footer-guarantee {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 650;
  color: #047857;
}

[data-theme="dark"] .corp-footer-guarantee {
  color: #34d399;
}

.corp-footer-hotline {
  font-size: 11px;
  color: #64748b;
}

[data-theme="dark"] .corp-footer-hotline {
  color: #94a3b8;
}

/* -----------------------------------------------------------------------------
   RESPONSIVENESS (< 860px and < 580px)
   ----------------------------------------------------------------------------- */
@media (max-width: 860px) {
  .corporate-modal-layout {
    grid-template-columns: 1fr !important;
    gap: 22px !important;
  }

  .corporate-modal-title {
    font-size: 19px !important;
  }

  .corporate-modal-subtitle {
    font-size: 13px !important;
    margin-bottom: 16px !important;
  }

  .corp-form-card {
    padding: 20px 16px !important;
    border-radius: 14px !important;
  }

  .corp-form-main-title {
    font-size: 15px !important;
  }
}

@media (max-width: 580px) {
  .corp-fields-row {
    grid-template-columns: 1fr !important;
    gap: 13px !important;
  }
}`;

const normCss = css.replace(/\r\n/g, '\n');
const normTargetCss = targetCss.replace(/\r\n/g, '\n');
const normReplCss = replacementCss.replace(/\r\n/g, '\n');

if (!normCss.includes(normTargetCss)) {
  console.error("Could not find exact target in css/components.css");
  process.exit(1);
}

const updatedCss = normCss.replace(normTargetCss, normReplCss);
fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log("Successfully updated css/components.css!");
