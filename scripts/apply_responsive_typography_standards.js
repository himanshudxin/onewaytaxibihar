const fs = require('fs');
const path = require('path');

console.log('=== APPLYING RESPONSIVE DISPLAY & TYPOGRAPHY STANDARDS ===');

// 1. UPDATE index.html
const indexPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Google Fonts: Load Inter exclusively (no Montserrat)
indexHtml = indexHtml.replace(
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@[^"]+" rel="stylesheet">/,
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">'
);

// B. English-only typography for default locations & labels
indexHtml = indexHtml.replace('value="Patna (पटना), Bihar"', 'value="Patna, Bihar"');
indexHtml = indexHtml.replace('value="Gaya (Bodh Gaya) (गया), Bihar"', 'value="Gaya (Bodh Gaya), Bihar"');
indexHtml = indexHtml.replace('<span class="pride-bihar-hindi">बिहार</span>', '<span class="pride-bihar-hindi">Bihar</span>');
indexHtml = indexHtml.replace(
  "if (pInput) pInput.value = fromCity + (fromCity.includes('Patna') ? ' (पटना), Bihar' : ', Bihar');",
  "if (pInput) pInput.value = fromCity + ', Bihar';"
);
indexHtml = indexHtml.replace(
  "if (dInput) dInput.value = toCity + (toCity.includes('Gaya') ? ' (गया), Bihar' : ', Bihar');",
  "if (dInput) dInput.value = toCity + ', Bihar';"
);

// C. Remove inline style="display: none !important;" from #cab-selection-section
indexHtml = indexHtml.replace(
  '<section class="app-section fare-section-closed" id="cab-selection-section" style="display: none !important;">',
  '<section class="app-section fare-section-closed" id="cab-selection-section">'
);

// D. Floating WhatsApp Optimization: Collapse to circular icon button on mobile, auto-hide on form focus
const oldWaStyle = `    @media (max-width: 480px) {
      .otb-floating-wa {
        bottom: calc(72px + env(safe-area-inset-bottom, 0px));
        right: 12px;
      }
    }`;

const newWaStyle = `    @media (max-width: 768px) {
      .otb-floating-wa {
        bottom: calc(74px + env(safe-area-inset-bottom, 8px));
        right: 12px;
        width: 44px;
        height: 44px;
        padding: 0;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45);
      }
      .otb-floating-wa .otb-wa-label {
        display: none !important;
      }
      .otb-floating-wa .otb-wa-icon-wrap svg {
        width: 22px;
        height: 22px;
      }
    }
    @media (max-width: 360px) {
      .otb-floating-wa {
        bottom: calc(70px + env(safe-area-inset-bottom, 6px));
        right: 8px;
        width: 40px;
        height: 40px;
      }
    }
    /* Auto-hide or fade floating widget when any form input is active so it NEVER covers fields */
    body:has(input:focus) .otb-floating-wa,
    body:has(select:focus) .otb-floating-wa,
    body:has(.location-autocomplete-dropdown[style*="display: block"]) .otb-floating-wa {
      opacity: 0.08 !important;
      pointer-events: none !important;
      transform: scale(0.85);
    }`;

if (indexHtml.includes(oldWaStyle)) {
  indexHtml = indexHtml.replace(oldWaStyle, newWaStyle);
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✓ index.html updated (Inter exclusively, English typography, mobile WhatsApp collision protection, cab section display).');


// 2. UPDATE cabs.html
const cabsPath = path.join(__dirname, '../cabs.html');
if (fs.existsSync(cabsPath)) {
  let cabsHtml = fs.readFileSync(cabsPath, 'utf8');
  // Load Inter exclusively (replace Mukta)
  cabsHtml = cabsHtml.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]+" rel="stylesheet">/,
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">'
  );
  fs.writeFileSync(cabsPath, cabsHtml, 'utf8');
  console.log('✓ cabs.html updated (Inter exclusively).');
}


// 3. UPDATE css/style.css
const stylePath = path.join(__dirname, '../css/style.css');
let styleCss = fs.readFileSync(stylePath, 'utf8');

// Replace Montserrat with Inter
styleCss = styleCss.replace(
  /font-family:\s*'Inter',\s*'Montserrat',\s*-apple-system,\s*sans-serif;/g,
  "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;"
);

// Add Strict Viewport Containment & Global Inter Typography Enforcement at top
const responsiveReset = `/* ==========================================================================
   STRICT RESPONSIVE DISPLAY & INTER TYPOGRAPHY ENFORCEMENT
   ========================================================================== */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
}

html {
  overflow-x: hidden !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
}

body {
  overflow-x: hidden !important;
  max-width: 100vw !important;
  width: 100% !important;
  position: relative !important;
  font-family: var(--font-sans) !important;
}

*, *::before, *::after {
  box-sizing: border-box !important;
  font-family: inherit;
}

img, svg, video, canvas, audio, iframe, embed, object {
  max-width: 100% !important;
  height: auto;
}

input, select, textarea, button {
  max-width: 100% !important;
  box-sizing: border-box !important;
}
`;

if (!styleCss.includes('STRICT RESPONSIVE DISPLAY & INTER TYPOGRAPHY ENFORCEMENT')) {
  styleCss = responsiveReset + '\n' + styleCss;
}

fs.writeFileSync(stylePath, styleCss, 'utf8');
console.log('✓ css/style.css updated with strict responsive rules & Inter enforcement.');


// 4. UPDATE css/components.css
const componentsPath = path.join(__dirname, '../css/components.css');
let compCss = fs.readFileSync(componentsPath, 'utf8');

// Replace Mukta, Montserrat, and Georgia with Inter
compCss = compCss.replace(
  "font-family: 'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif;",
  "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;"
);
compCss = compCss.replace(
  "font-family: 'Inter', Georgia, serif;",
  "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;"
);
compCss = compCss.replace(
  "font-family: 'Montserrat', 'Inter', sans-serif;",
  "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;"
);

// Add Micro-Viewport Mobile Hardening (320px - 430px)
const microViewportCss = `
/* ==========================================================================
   ONEWAYTAXIBIHAR MICRO-VIEWPORT RESPONSIVE HARDENING (320px - 430px)
   ========================================================================== */
@media (max-width: 480px) {
  /* Prevent any horizontal overflow */
  .container {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
    box-sizing: border-box !important;
  }

  /* Booking widget card fit */
  .voyago-booking-card {
    padding: 12px 10px !important;
    border-radius: 16px !important;
    margin: 0 auto 16px auto !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* 3 Vehicle Cards in Booking Card fit 320px screens */
  .voyago-vehicle-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 4px !important;
    margin-bottom: 12px !important;
    width: 100% !important;
  }

  .voyago-vehicle-card {
    padding: 7px 2px !important;
    border-radius: 12px !important;
    min-width: 0 !important;
  }

  .voyago-vehicle-img {
    max-width: 58px !important;
    height: 32px !important;
  }

  .voyago-vehicle-name {
    font-size: 11px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .voyago-vehicle-rate {
    font-size: 10.5px !important;
  }

  .voyago-vehicle-seats {
    font-size: 8.5px !important;
  }

  /* Date & Time Picker Cards */
  .schedule-row {
    grid-template-columns: 1fr 1fr !important;
    gap: 6px !important;
    margin-bottom: 12px !important;
  }

  .exec-picker-card {
    padding: 8px 8px !important;
    border-radius: 12px !important;
    min-width: 0 !important;
  }

  .picker-card-label {
    font-size: 8.5px !important;
    letter-spacing: 0.3px !important;
  }

  .picker-rel-tag {
    font-size: 7.5px !important;
    padding: 1px 4px !important;
  }

  .picker-primary-val {
    font-size: 13px !important;
  }

  .picker-icon-badge {
    width: 24px !important;
    height: 24px !important;
  }

  .picker-icon-badge svg {
    width: 13px !important;
    height: 13px !important;
  }

  /* Route Inputs Grid */
  .route-inputs-grid-2.voyago-stacked-route {
    width: 100% !important;
    gap: 8px !important;
  }

  .input-field-group {
    padding: 8px 10px !important;
    border-radius: 12px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .input-field-group label {
    font-size: 9.5px !important;
    letter-spacing: 0.4px !important;
  }

  .input-field-group input {
    font-size: 14.5px !important;
    line-height: 1.25 !important;
  }

  /* Outstation Fleet Cards */
  .cab-cards-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .cab-tier-card {
    padding: 14px 12px !important;
    border-radius: 16px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* 3D Map viewport fit */
  .route-overview-card {
    border-radius: 16px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .route-overview-header {
    padding: 12px !important;
    flex-direction: column !important;
    gap: 10px !important;
    align-items: flex-start !important;
  }

  .route-metrics-bar {
    width: 100% !important;
    justify-content: space-between !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
  }

  .route-metric-pill {
    padding: 5px 8px !important;
    font-size: 10.5px !important;
  }

  #oneway-route-map {
    height: 260px !important;
    width: 100% !important;
  }

  /* Places Grid */
  .voyago-places-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }

  .voyago-place-info {
    padding: 8px 10px !important;
  }

  .voyago-place-name {
    font-size: 13px !important;
  }

  /* Compact section spacing */
  .app-section {
    padding: 24px 0 !important;
  }
}

@media (max-width: 340px) {
  /* Extra compact styling for 320px devices */
  .voyago-vehicle-grid {
    gap: 3px !important;
  }
  .voyago-vehicle-card {
    padding: 5px 1px !important;
  }
  .voyago-vehicle-name {
    font-size: 10px !important;
  }
  .voyago-vehicle-rate {
    font-size: 9.5px !important;
  }
  .voyago-booking-card .trip-tab-btn {
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  .voyago-places-grid {
    grid-template-columns: 1fr !important;
  }
}
`;

if (!compCss.includes('ONEWAYTAXIBIHAR MICRO-VIEWPORT RESPONSIVE HARDENING')) {
  compCss += '\n' + microViewportCss;
}

fs.writeFileSync(componentsPath, compCss, 'utf8');
console.log('✓ css/components.css updated with micro-viewport hardening & Inter typography.');

console.log('=== ALL RESPONSIVE & TYPOGRAPHY ENHANCEMENTS APPLIED CLEANLY ===');

