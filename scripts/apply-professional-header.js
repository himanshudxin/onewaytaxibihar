const fs = require('fs');

// ============================================================================
// 1. UPDATE index.html
// ============================================================================
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace Mobile Apps link with clean SVG icon (eliminate 📲 emoji)
indexHtml = indexHtml.replace(
  '<li><a href="/app-download.html" class="nav-link-apps" role="menuitem">📲 Mobile Apps</a></li>',
  `<li><a href="/app-download.html" class="nav-link-apps" role="menuitem" title="Download iOS & Android Apps">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 2px;"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          <span>Mobile Apps</span>
        </a></li>`
);

// Update Hotline text with class hotline-prefix for responsive condensing
indexHtml = indexHtml.replace(
  '<span>24×7: <strong>+91 80021 41816</strong></span>',
  '<span class="hotline-text"><span class="hotline-prefix">24×7: </span><strong>+91 80021 41816</strong></span>'
);

// Clean Login button text to "Login"
indexHtml = indexHtml.replace(
  '<span>Login with OTP</span>',
  '<span>Login</span>'
);

// Cache bust stylesheet links
indexHtml = indexHtml.replace(
  /v=20261116_v41_header_fix/g,
  'v=20261116_v42_pro_header'
);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✓ Updated index.html');


// ============================================================================
// 2. UPDATE js/app.js (renderNavAuth)
// ============================================================================
let appJs = fs.readFileSync('js/app.js', 'utf8');

appJs = appJs.replace(
  `      <button type="button" class="btn-nav-outline" onclick="window.openAuthModal()">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login with OTP\n      </button>`,
  `      <button type="button" class="btn-nav-outline btn-nav-auth" onclick="window.openAuthModal()">\n        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login\n      </button>`
);

appJs = appJs.replace(
  `      <button type="button" class="btn-nav-outline" onclick="window.openAuthModal()">\r\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login with OTP\r\n      </button>`,
  `      <button type="button" class="btn-nav-outline btn-nav-auth" onclick="window.openAuthModal()">\r\n        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login\r\n      </button>`
);

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('✓ Updated js/app.js');


// ============================================================================
// 3. UPDATE cabs.html & booking.html
// ============================================================================
['cabs.html', 'booking.html'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');
  html = html.replace('<span>24×7: <strong>+91 80021 41816</strong></span>', '<span class="hotline-text"><span class="hotline-prefix">24×7: </span><strong>+91 80021 41816</strong></span>');
  html = html.replace(/v=20261116_v41_header_fix/g, 'v=20261116_v42_pro_header');
  fs.writeFileSync(f, html, 'utf8');
  console.log('✓ Updated ' + f);
});


// ============================================================================
// 4. UPDATE css/style.css
// ============================================================================
let styleCss = fs.readFileSync('css/style.css', 'utf8');

// Find start of navbar section and end before /* Universal compatibility aliases */
const startNavbar = styleCss.indexOf('/* Fixed Header Navbar');
const endNavbar = styleCss.indexOf('/* Universal compatibility aliases */');

if (startNavbar === -1 || endNavbar === -1) {
  console.error('Navbar section markers not found in style.css');
  process.exit(1);
}

const newNavbarSection = `/* Fixed Header Navbar - Enterprise Executive Architecture */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 64px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

[data-theme="dark"] .navbar {
  background: rgba(11, 15, 25, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  width: 100%;
}

.brand-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  transition: opacity 0.15s ease;
}

.brand-wrapper:hover {
  opacity: 0.9;
}

.brand-badge-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-badge-icon .brand-logo-img,
.brand-logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  display: block;
  border-radius: 8px;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text-logo {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
}

[data-theme="dark"] .brand-text-logo {
  color: #ffffff;
}

.brand-text-logo .brand-highlight {
  color: #059669;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 1px;
}

.brand-subtag {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}

.brand-subtag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  display: inline-block;
  animation: logoDotPulse 1.8s ease-in-out infinite;
}

@keyframes logoDotPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.4); opacity: 1; }
}

`;

styleCss = styleCss.substring(0, startNavbar) + newNavbarSection + styleCss.substring(endNavbar);

// Next, replace the .nav-links and .nav-actions section
const startNavLinks = styleCss.indexOf('/* Nav Menu Links');
const endNavActions = styleCss.indexOf('/* Executive Drive With Us Partner Pill */');

if (startNavLinks === -1 || endNavActions === -1) {
  console.error('Nav links / actions markers not found in style.css');
  process.exit(1);
}

const newNavLinksAndActions = `/* Nav Menu Links - Clean Professional Typography (No Clunky Bubble) */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  list-style: none;
  margin: 0;
  padding: 0;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  flex-shrink: 0;
}

.nav-links li {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #475569;
  transition: all 0.15s ease;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 34px;
  padding: 0 11px;
  border-radius: 7px;
  white-space: nowrap !important;
  line-height: 1;
}

[data-theme="dark"] .nav-links li a {
  color: #94a3b8;
}

.nav-links li a:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

[data-theme="dark"] .nav-links li a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-links li a:active,
.nav-links li a.active {
  color: #059669;
  font-weight: 600;
  background: rgba(5, 150, 105, 0.08);
}

[data-theme="dark"] .nav-links li a.active {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
}

/* Nav Link for Mobile Apps */
.nav-link-apps {
  color: #059669 !important;
  font-weight: 600 !important;
}

[data-theme="dark"] .nav-link-apps {
  color: #34d399 !important;
}

/* Nav Actions Cluster */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 1. Subtle 24x7 Priority Support Link */
.navbar-call-unified-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 11px;
  border-radius: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: all 0.15s ease;
  white-space: nowrap;
  box-sizing: border-box;
}

[data-theme="dark"] .navbar-call-unified-pill {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.navbar-call-unified-pill strong {
  font-weight: 700;
}

.navbar-call-unified-pill:hover {
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
  border-color: rgba(5, 150, 105, 0.25);
}

[data-theme="dark"] .navbar-call-unified-pill:hover {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.call-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: callPulse 1.8s infinite;
  flex-shrink: 0;
}

@keyframes callPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

`;

styleCss = styleCss.substring(0, startNavLinks) + newNavLinksAndActions + styleCss.substring(endNavActions);

// Update .btn-nav-partner definition
const startPartner = styleCss.indexOf('/* Executive Drive With Us Partner Pill */');
const endPartner = styleCss.indexOf('/* ==========================================================================\r\n   ONEWAY.CAB STYLE TOP');
const altEndPartner = styleCss.indexOf('/* ==========================================================================\n   ONEWAY.CAB STYLE TOP');
const partnerEnd = endPartner > -1 ? endPartner : altEndPartner;

if (startPartner > -1 && partnerEnd > -1) {
  const newPartnerSection = `/* 2. Secondary Ghost Action: Drive With Us */
.btn-nav-partner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: #334155;
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.15);
  transition: all 0.15s ease;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
}

[data-theme="dark"] .btn-nav-partner {
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.16);
}

.btn-nav-partner:hover {
  border-color: #059669;
  color: #059669;
  background: rgba(5, 150, 105, 0.05);
}

[data-theme="dark"] .btn-nav-partner:hover {
  border-color: #34d399;
  color: #34d399;
  background: rgba(16, 185, 129, 0.08);
}

`;
  styleCss = styleCss.substring(0, startPartner) + newPartnerSection + styleCss.substring(partnerEnd);
}

// Update .btn-nav-outline and #nav-auth-slot in styleCss
const authSlotStart = styleCss.indexOf('/* Executive Login / Auth Primary Action Pill */');
const authSlotEnd = styleCss.indexOf('/* Executive User Profile Nav Chip */');

if (authSlotStart > -1 && authSlotEnd > -1) {
  const newAuthSlotSection = `/* 3. Primary CTA: Login Button */
#nav-auth-slot .btn-nav-outline,
.btn-nav-outline.btn-nav-auth,
.btn-nav-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  background: #059669 !important;
  color: #ffffff !important;
  border: none !important;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(5, 150, 105, 0.3);
  transition: all 0.15s ease;
  box-sizing: border-box;
}

#nav-auth-slot .btn-nav-outline:hover,
.btn-nav-outline.btn-nav-auth:hover,
.btn-nav-login:hover {
  background: #047857 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

`;
  styleCss = styleCss.substring(0, authSlotStart) + newAuthSlotSection + styleCss.substring(authSlotEnd);
}

// Add intermediate responsive query for tablets and laptops (993px - 1200px)
const responsiveMarker = '@media (max-width: 992px) {';
if (styleCss.includes(responsiveMarker)) {
  const intermediateResponsive = `@media (min-width: 993px) and (max-width: 1200px) {
  .nav-content {
    padding: 0 14px;
    gap: 8px;
  }
  .nav-links li a {
    padding: 0 7px;
    font-size: 13px;
  }
  .navbar-call-unified-pill {
    padding: 0 8px;
    font-size: 12px;
  }
  .navbar-call-unified-pill .hotline-prefix {
    display: none;
  }
  .btn-nav-partner {
    padding: 0 9px;
    font-size: 12px;
  }
  #nav-auth-slot .btn-nav-outline {
    padding: 0 12px;
    font-size: 13px;
  }
}

`;
  styleCss = styleCss.replace(responsiveMarker, intermediateResponsive + responsiveMarker);
}

fs.writeFileSync('css/style.css', styleCss, 'utf8');
console.log('✓ Updated css/style.css with Executive Header styling');
