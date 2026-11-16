const fs = require('fs');

let prd = fs.readFileSync('PRD.md', 'utf8');

const phase72Content = `### Phase 72: Website Visual Remediation, Navbar Pill Styling & Executive Deal Banner Modernization
- [x] 72.1 Navbar Priority Hotline Pill CSS Integration: Defined comprehensive styling for \`.navbar-call-unified-pill\` and \`.call-pulse-dot\` in \`css/style.css\`, eliminating unstyled purple default hyperlinks across \`index.html\`, \`cabs.html\`, and \`booking.html\`.
- [x] 72.2 Executive Deal Card Redesign: Replaced the overpowering bright green banner with an executive midnight obsidian glass card (\`linear-gradient(135deg, #090e17 0%, #0f172a 65%, #064e3b 100%)\`) with glowing emerald border (\`1.5px solid rgba(16, 185, 129, 0.35)\`), high-contrast typography, and a prominent CTA button that never clips.
- [x] 72.3 Image Proportions & Aspect Ratio Stabilization: Enforced strict 320x180px dimensions (\`aspect-ratio: 16 / 9; object-fit: cover;\`) for \`.voyago-deal-img\` on desktop and responsive max-width 340px on mobile viewports, permanently eliminating the 700x160px distorted ribbon slit.
- [x] 72.4 Mobile Apps Nav Link Theme Harmony: Replaced hardcoded inline \`style="color:#34D399; font-weight:800;"\` with class \`.nav-link-apps\`, providing refined emerald contrast in light mode and vibrant neon pop in dark mode.
- [x] 72.5 Live CDP Visual Verification: Re-captured \`preview-hero-light.png\`, \`preview-deal-light.png\`, \`preview-mobile-light-hero.png\`, and \`preview-mobile-light-deal.png\` with Chrome CDP confirming flawless rendering across all viewport tiers.
- [x] 72.6 Master Automated Test Verification: Validated 138 JS files, 40 inline HTML scripts, and 9/9 test suites passing 100% with TypeScript 0 errors.

## 3. Ralph Loop Acceptance Criteria`;

prd = prd.replace('## 3. Ralph Loop Acceptance Criteria', phase72Content);
fs.writeFileSync('PRD.md', prd, 'utf8');
console.log('Successfully updated PRD.md');
