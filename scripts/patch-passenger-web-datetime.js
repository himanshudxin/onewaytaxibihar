/**
 * patch-passenger-web-datetime.js
 * Upgrades passenger.html PNR screen pickup date/time display
 * to show DD-MMM-YYYY | hh:mm A with high-contrast red styling.
 * Also adds formatPickupDateTime() JS helper.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'passenger.html');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

let changed = false;

// ── 1. Add formatPickupDateTime helper ─────────────────────────────────────────
if (!normalised.includes('formatPickupDateTime')) {
  const JS_ANCHOR = 'const date = b.pickupDate || b.date || \'Today\';';
  const HELPER_BEFORE = `function formatPickupDateTime(pickupDate, pickupTime) {
  try {
    if (!pickupDate) return '';
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    let dateObj;
    if (pickupDate && pickupTime) {
      const norm = String(pickupDate).length === 10 ? pickupDate : new Date(pickupDate).toISOString().slice(0,10);
      dateObj = new Date(norm + 'T' + pickupTime + ':00');
    } else { dateObj = new Date(pickupDate); }
    if (isNaN(dateObj.getTime())) return pickupDate + (pickupTime ? ' | ' + pickupTime : '');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mon = MONTHS[dateObj.getMonth()];
    const yyyy = dateObj.getFullYear();
    const hh = dateObj.getHours() % 12 || 12;
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = dateObj.getHours() < 12 ? 'AM' : 'PM';
    return dd + '-' + mon + '-' + yyyy + ' | ' + hh + ':' + mm + ' ' + ampm;
  } catch(e) { return pickupDate || ''; }
}

`;

  if (normalised.includes(JS_ANCHOR)) {
    normalised = normalised.replace(JS_ANCHOR, HELPER_BEFORE + JS_ANCHOR);
    changed = true;
    console.log('✅ Passenger web: formatPickupDateTime helper added.');
  } else {
    console.log('⚠️  JS anchor not found in passenger.html.');
  }
} else {
  console.log('ℹ️  formatPickupDateTime already in passenger.html.');
}

// ── 2. Upgrade pickup schedule display in PNR card ─────────────────────────────
// Target: <div class="meta-item-val" style="color: #10b981;">${ date} ... ${time}</div>
// The literal in the file: "dY". ${date} ⬝ dY\x07' ${time}"
const PICKUP_DISPLAY_SEARCH = 'class="meta-item-val" style="color: #10b981;">';
if (normalised.includes(PICKUP_DISPLAY_SEARCH)) {
  const startIdx = normalised.indexOf(PICKUP_DISPLAY_SEARCH);
  const endIdx = normalised.indexOf('</div>', startIdx) + 6;
  if (startIdx !== -1 && endIdx !== -1) {
    const oldBlock = normalised.slice(startIdx, endIdx);
    const newBlock = 'class="meta-item-val" style="color: #EF4444; font-size: 18px; font-weight: 900; letter-spacing: 0.3px;">${formatPickupDateTime(date, time) || date + \' | \' + time}</div>';
    normalised = normalised.slice(0, startIdx) + newBlock + normalised.slice(endIdx);
    changed = true;
    console.log('✅ Passenger web: pickup schedule display upgraded to formatted date.');
  }
} else {
  console.log('ℹ️  Pickup schedule anchor not found in passenger.html.');
}

// ── 3. Upgrade REQUIRED PICKUP SCHEDULE label to make it more prominent ────────
const OLD_LABEL = "REQUIRED PICKUP SCHEDULE";
if (normalised.includes(OLD_LABEL) && !normalised.includes('PICKUP SCHEDULE</span>')) {
  // Upgrade the label to be bolder
  normalised = normalised.split(OLD_LABEL).join('📅 PICKUP SCHEDULE');
  changed = true;
  console.log('✅ Passenger web: Pickup schedule label upgraded with icon.');
}

if (changed) {
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ passenger.html saved.');
} else {
  console.log('ℹ️  No changes needed for passenger.html.');
}

