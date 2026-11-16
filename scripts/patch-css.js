const fs = require('fs');

let styleCss = fs.readFileSync('css/style.css', 'utf8');

const target = '/* Executive Drive With Us Partner Pill */';
if (!styleCss.includes(target)) {
  console.error('Target not found in style.css');
  process.exit(1);
}

const additions = `/* Unified 24x7 Priority Hotline Call Pill */
.navbar-call-unified-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: #047857;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  box-sizing: border-box;
}

[data-theme="dark"] .navbar-call-unified-pill {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.navbar-call-unified-pill strong {
  font-weight: 700;
  letter-spacing: -0.2px;
}

.navbar-call-unified-pill:hover {
  background: rgba(16, 185, 129, 0.16);
  border-color: #10b981;
  color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.18);
}

[data-theme="dark"] .navbar-call-unified-pill:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: #34d399;
  color: #6ee7b7;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.call-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: callPulse 1.8s infinite;
  flex-shrink: 0;
}

@keyframes callPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Mobile Apps Nav Capsule Link */
.nav-link-apps {
  color: #059669 !important;
  font-weight: 700 !important;
  transition: all 0.2s ease;
}

[data-theme="dark"] .nav-link-apps {
  color: #34d399 !important;
}

.nav-link-apps:hover {
  color: #047857 !important;
}

[data-theme="dark"] .nav-link-apps:hover {
  color: #6ee7b7 !important;
}

`;

styleCss = styleCss.replace(target, additions + target);

// Responsive hiding on mobile < 992px
styleCss = styleCss.replace(
  '.btn-nav-outline,\r\n  .btn-nav-partner,',
  '.btn-nav-outline,\r\n  .btn-nav-partner,\r\n  .navbar-call-unified-pill,'
);
styleCss = styleCss.replace(
  '.btn-nav-outline,\n  .btn-nav-partner,',
  '.btn-nav-outline,\n  .btn-nav-partner,\n  .navbar-call-unified-pill,'
);

fs.writeFileSync('css/style.css', styleCss, 'utf8');
console.log('Successfully updated css/style.css');
