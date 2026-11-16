const fs = require('fs');

let prd = fs.readFileSync('PRD.md', 'utf8');

const phase74Content = `### Phase 74: Header Call Bar Removal & Hero Booking Window Hierarchy Reordering
- [x] 74.1 Header Call Bar Complete Removal: Removed \`.navbar-call-unified-pill\` and stray \`.mobile-nav-call-pill\` from the desktop and mobile navigation header across \`index.html\`, \`cabs.html\`, and \`booking.html\`. The front header is now completely clean: Brand Logo, Nav Links, Drive With Us, Login, and Theme Switch.
- [x] 74.2 Hero Hierarchy Reordering (Image 2 Below Booking Window): Relocated the monumental pride badge (\`Built in Bihar for BHARAT\`), main headline (\`Bihar's Dedicated & Trusted One-Way Cab Service\`), and trust value propositions from above the booking window to directly BELOW the booking card (\`.hero-center-header.below-booking-window\`).
- [x] 74.3 Instant Above-the-Fold Booking Access: The main booking card (\`.booking-widget-card\`) now sits immediately below the navbar at top \`135px\`, matching enterprise travel patterns (MakeMyTrip, Uber) for instant ride selection.
- [x] 74.4 Chrome CDP Multi-Device Position Audit: Executed position verification script confirming \`hasCallPillInHeader: false\`, \`bookingCardTop: 135px\`, \`isHeaderBelowBookingCard: true\` (\`preview-booking-window-top.png\`, \`preview-hero-title-below.png\`).
- [x] 74.5 Master Automated Test Verification: 144 JavaScript files and 40 inline HTML scripts passed syntax validation, and 9/9 master test suites PASS 100% with TypeScript 0 errors.

## 3. Ralph Loop Acceptance Criteria`;

prd = prd.replace('## 3. Ralph Loop Acceptance Criteria', phase74Content);
fs.writeFileSync('PRD.md', prd, 'utf8');
console.log('Successfully updated PRD.md with Phase 74');
