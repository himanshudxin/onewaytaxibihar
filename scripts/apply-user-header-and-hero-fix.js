const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// ============================================================================
// 1. REMOVE CALL BAR FROM HEADER
// ============================================================================
// Find the hotline pill in .nav-actions
const hotlinePillStart = html.indexOf('<!-- Unified 24x7 Priority Hotline Call Pill -->');
const partnerBtnStart = html.indexOf('<!-- Drive With Us Partner Pill -->');

if (hotlinePillStart > -1 && partnerBtnStart > -1) {
  html = html.substring(0, hotlinePillStart) + html.substring(partnerBtnStart);
  console.log('✓ Removed Unified Call Pill from header');
} else {
  console.warn('Unified Call Pill comment marker not found, trying direct class lookup');
  const unifiedPillIdx = html.indexOf('class="navbar-call-unified-pill"');
  if (unifiedPillIdx > -1) {
    const aStart = html.lastIndexOf('<a ', unifiedPillIdx);
    const aEnd = html.indexOf('</a>', unifiedPillIdx) + 4;
    html = html.substring(0, aStart) + html.substring(aEnd);
    console.log('✓ Removed navbar-call-unified-pill from header via direct link lookup');
  }
}

// Also remove stray mobile-nav-call-pill from header
const mobileCallPillIdx = html.indexOf('class="mobile-nav-call-pill"');
if (mobileCallPillIdx > -1) {
  const aStart = html.lastIndexOf('<a ', mobileCallPillIdx);
  const aEnd = html.indexOf('</a>', mobileCallPillIdx) + 4;
  html = html.substring(0, aStart) + html.substring(aEnd);
  console.log('✓ Removed mobile-nav-call-pill from header');
}

// Remove call bar in cabs.html and booking.html as well for consistency
['cabs.html', 'booking.html'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let pageHtml = fs.readFileSync(f, 'utf8');
  const pillIdx = pageHtml.indexOf('class="navbar-call-unified-pill"');
  if (pillIdx > -1) {
    const aStart = pageHtml.lastIndexOf('<a ', pillIdx);
    const aEnd = pageHtml.indexOf('</a>', pillIdx) + 4;
    pageHtml = pageHtml.substring(0, aStart) + pageHtml.substring(aEnd);
    fs.writeFileSync(f, pageHtml, 'utf8');
    console.log('✓ Removed call pill from ' + f);
  }
});

// ============================================================================
// 2. MOVE 2ND IMAGE (TITLE & PRIDE BADGE & VALUE PROPS) BELOW BOOKING WINDOW
// ============================================================================
const headerStartMarker = '<div class="hero-center-header">';
const headerEndMarker = '<!-- Main Booking Widget Card -->';

const sIdx = html.indexOf(headerStartMarker);
const eIdx = html.indexOf(headerEndMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('Could not find hero-center-header or Main Booking Widget Card marker');
  process.exit(1);
}

// Extract the entire hero-center-header block
let heroHeaderBlock = html.substring(sIdx, eIdx).trim();

// Add class .below-booking-window for enhanced spacing
heroHeaderBlock = heroHeaderBlock.replace(
  '<div class="hero-center-header">',
  '<div class="hero-center-header below-booking-window">'
);

// Remove it from above the booking card
html = html.substring(0, sIdx) + html.substring(eIdx);

// Now locate the end of the booking card: right before <!-- Popular Routes Quick Bar -->
const popularRoutesMarker = '<!-- Popular Routes Quick Bar -->';
const popIdx = html.indexOf(popularRoutesMarker);

if (popIdx === -1) {
  console.error('Could not find Popular Routes Quick Bar marker');
  process.exit(1);
}

// Insert the hero-center-header block right before popular routes (below the booking window!)
html = html.substring(0, popIdx) + '\n\n        ' + heroHeaderBlock + '\n\n        ' + html.substring(popIdx);
console.log('✓ Moved hero title block below booking window');

// Update cache buster
html = html.replace(/v=20261116_v42_pro_header/g, 'v=20261116_v45_desk_otp');

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Saved updated index.html');


// ============================================================================
// 3. ADD CSS FOR .below-booking-window in css/components.css
// ============================================================================
let compCss = fs.readFileSync('css/components.css', 'utf8');

if (!compCss.includes('.hero-center-header.below-booking-window')) {
  const cssAdditions = `
/* Hero Header Positioned Below Booking Window */
.hero-center-header.below-booking-window {
  margin: 36px auto 20px auto;
  text-align: center;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-center-header.below-booking-window .hero-pride-badge-wrap {
  margin-bottom: 12px;
}

.hero-center-header.below-booking-window .hero-main-title {
  font-size: clamp(22px, 3.2vw, 30px);
  font-weight: 850;
  color: var(--owc-text);
  line-height: 1.25;
  margin-bottom: 14px;
  letter-spacing: -0.4px;
}

@media (max-width: 768px) {
  .hero-center-header.below-booking-window {
    margin: 24px auto 16px auto;
  }
  .hero-center-header.below-booking-window .hero-main-title {
    font-size: 20px;
  }
}
`;
  compCss += cssAdditions;
  fs.writeFileSync('css/components.css', compCss, 'utf8');
  console.log('✓ Added .below-booking-window styles to css/components.css');
}

console.log('ALL UPDATES COMPLETE!');
