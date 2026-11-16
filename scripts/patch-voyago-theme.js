const fs = require('fs');

let css = fs.readFileSync('css/voyago-theme.css', 'utf8');

const startMarker = '/* =============================================================================\r\n   8. SPECIAL TRAVEL DEALS BANNER';
const altStartMarker = '/* =============================================================================\n   8. SPECIAL TRAVEL DEALS BANNER';
const endMarker = '/* =============================================================================\r\n   9. BIHAR TOUR PACKAGES SECTION';
const altEndMarker = '/* =============================================================================\n   9. BIHAR TOUR PACKAGES SECTION';

let startIdx = css.indexOf(startMarker);
if (startIdx === -1) startIdx = css.indexOf(altStartMarker);

let endIdx = css.indexOf(endMarker);
if (endIdx === -1) endIdx = css.indexOf(altEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found! start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

const replacement = `/* =============================================================================
   8. SPECIAL TRAVEL DEALS BANNER (EXECUTIVE SLEEK DESIGN)
   ============================================================================= */
.voyago-deal-card {
  position: relative;
  background: linear-gradient(135deg, #090e17 0%, #0f172a 65%, #064e3b 100%);
  border-radius: 20px;
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  padding: 28px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
  margin-bottom: 24px;
  color: #ffffff;
}
[data-theme="light"] .voyago-deal-card {
  background: linear-gradient(135deg, #090e17 0%, #0f172a 65%, #064e3b 100%);
  border: 1.5px solid rgba(16, 185, 129, 0.4);
  color: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}
.voyago-deal-content {
  flex: 1 1 auto;
  min-width: 260px;
  z-index: 2;
}
.voyago-deal-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f97316;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: var(--v-radius-pill);
  margin-bottom: 10px;
  letter-spacing: 0.4px;
}
.voyago-deal-title {
  font-size: clamp(20px, 3.5vw, 26px);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.25;
  margin-bottom: 8px;
}
.voyago-deal-desc {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.55;
  max-width: 560px;
  margin-bottom: 18px;
}
.voyago-deal-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 800;
  padding: 11px 24px;
  border-radius: var(--v-radius-pill);
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 2px;
}
.voyago-deal-btn:hover {
  background: #f8fafc;
  color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}
.voyago-deal-img {
  width: 320px !important;
  max-width: 320px !important;
  min-width: 260px !important;
  height: 180px !important;
  aspect-ratio: 16 / 9;
  object-fit: cover !important;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0 !important;
  z-index: 2;
}
@media (max-width: 860px) {
  .voyago-deal-card {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 20px;
  }
  .voyago-deal-content {
    min-width: 0;
  }
  .voyago-deal-desc {
    margin-left: auto;
    margin-right: auto;
  }
  .voyago-deal-btn {
    margin-left: auto;
    margin-right: auto;
  }
  .voyago-deal-img {
    width: 100% !important;
    max-width: 340px !important;
    min-width: 0 !important;
    height: 190px !important;
    aspect-ratio: 16 / 9;
    margin: 0 auto;
  }
}

`;

css = css.substring(0, startIdx) + replacement + css.substring(endIdx);
fs.writeFileSync('css/voyago-theme.css', css, 'utf8');
console.log('Successfully updated css/voyago-theme.css');
