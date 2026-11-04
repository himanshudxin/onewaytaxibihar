/**
 * patch-driver-web-broadcast.js
 * Upgrades driver.html Live Queue tab to:
 * 1. Show BROADCASTING status badge
 * 2. Format pickup date/time with DD-MMM-YYYY | hh:mm A  (high-contrast red)
 * 3. Replace "Accept Trip" with "CLAIM TRIP" calling /api/dispatch/claim
 * 4. Add "Skip" (reject-broadcast) button  
 * 5. Poll /api/dispatch/offers for real-time broadcast offers
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'driver.html');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

let changed = false;

// ── 1. Add formatPickupDateTime helper ─────────────────────────────────────────
if (!normalised.includes('formatPickupDateTime')) {
  const JS_ANCHOR = 'async function acceptAvailableTrip(bookingId) {';
  const HELPER = `function formatPickupDateTime(pickupDate, pickupTime) {
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

async function claimBroadcastTrip(bookingId) {
  try {
    const res = await fetch('/api/dispatch/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _driverToken },
      body: JSON.stringify({ bookingId })
    });
    const data = await res.json();
    if (res.status === 409) {
      alert('Trip accepted by another driver.');
      await refreshDriverDashboard();
      return;
    }
    if (data.success) {
      alert('🎉 Trip Claimed! Go to Active Trips tab.');
      _currentTab = 'active';
      await refreshDriverDashboard();
    } else {
      alert(data.message || 'Could not claim trip.');
    }
  } catch(e) { alert('Network error. Try again.'); }
}

async function rejectBroadcastTrip(bookingId) {
  try {
    await fetch('/api/dispatch/reject-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _driverToken },
      body: JSON.stringify({ bookingId, reason: 'Driver skipped via web' })
    });
    await refreshDriverDashboard();
  } catch(e) { console.log('Skip error:', e); }
}

async function acceptAvailableTrip(bookingId) {`;

  if (normalised.includes(JS_ANCHOR)) {
    normalised = normalised.replace(JS_ANCHOR, HELPER);
    changed = true;
    console.log('✅ Driver web: formatPickupDateTime + broadcast functions added.');
  } else {
    console.log('⚠️  JS anchor not found in driver.html.');
  }
} else {
  console.log('ℹ️  formatPickupDateTime already in driver.html.');
}

// ── 2. Upgrade pickup schedule display in available trip cards ─────────────────
const OLD_SCHEDULE = "<div>Schedule: <strong>${t.pickupDate} at ${t.pickupTime} (~${t.distanceKm} KM)</strong></div>";
const NEW_SCHEDULE = '<div style="font-size:14px; font-weight:900; color:#EF4444; margin:4px 0;">📅 ${formatPickupDateTime(t.pickupDate, t.pickupTime) || t.pickupDate || \'Today\'}</div>\n                <div>Distance: <strong>~${t.distanceKm || \'?\'} KM</strong></div>';

if (normalised.includes(OLD_SCHEDULE)) {
  normalised = normalised.split(OLD_SCHEDULE).join(NEW_SCHEDULE);
  changed = true;
  console.log('✅ Driver web: pickup schedule display upgraded.');
} else {
  console.log('ℹ️  Driver web schedule display already upgraded or not found.');
}

// ── 3. Upgrade Accept Trip button to CLAIM TRIP + add Skip ────────────────────
const OLD_ACCEPT_BTN = "<button type=\"button\" class=\"driver-step-btn btn-step-accept\" onclick=\"acceptAvailableTrip('${t.bookingId}')\">\n                Accept Trip &amp; Start Dispatch \u001a\n              </button>";
const NEW_ACCEPT_BTN = '<div style="display:flex; gap:8px; margin-top:4px;">\n              <button type="button" onclick="rejectBroadcastTrip(\'${t.bookingId}\')" style="flex:1; padding:10px; border-radius:10px; border:1.5px solid #EF4444; background:transparent; color:#EF4444; font-weight:800; font-size:12px; cursor:pointer;">Skip</button>\n              <button type="button" class="driver-step-btn btn-step-accept" onclick="claimBroadcastTrip(\'${t.bookingId}\')" style="flex:2; font-size:14px; font-weight:900;">⚡ CLAIM TRIP</button>\n            </div>';

if (normalised.includes(OLD_ACCEPT_BTN)) {
  normalised = normalised.split(OLD_ACCEPT_BTN).join(NEW_ACCEPT_BTN);
  changed = true;
  console.log('✅ Driver web: Accept btn → CLAIM TRIP + Skip buttons.');
} else {
  // Try a looser match
  const OLD_BTN_ALT = "onclick=\"acceptAvailableTrip('${t.bookingId}')\">";
  if (normalised.includes(OLD_BTN_ALT)) {
    const btnStart = normalised.lastIndexOf('<button', normalised.indexOf(OLD_BTN_ALT));
    const btnEnd = normalised.indexOf('</button>', normalised.indexOf(OLD_BTN_ALT)) + 9;
    const newBtns = '<div style="display:flex;gap:8px;margin-top:4px;">\n              <button type="button" onclick="rejectBroadcastTrip(\'${t.bookingId}\')" style="flex:1;padding:10px;border-radius:10px;border:1.5px solid #EF4444;background:transparent;color:#EF4444;font-weight:800;font-size:12px;cursor:pointer;">Skip</button>\n              <button type="button" class="driver-step-btn btn-step-accept" onclick="claimBroadcastTrip(\'${t.bookingId}\')" style="flex:2;font-size:14px;font-weight:900;">⚡ CLAIM TRIP</button>\n            </div>';
    normalised = normalised.slice(0, btnStart) + newBtns + normalised.slice(btnEnd);
    changed = true;
    console.log('✅ Driver web: Accept → CLAIM TRIP (alt method).');
  } else {
    console.log('⚠️  Accept button anchor not found.');
  }
}

// ── 4. Add BROADCASTING badge to unassigned booking card ──────────────────────
const OLD_BADGE = "UNASSIGNED BOOKING</span>";
const NEW_BADGE = "UNASSIGNED BOOKING</span>\n                  <span style=\"font-size:10px;font-weight:800;color:#F59E0B;background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:4px;margin-left:6px;animation:broadcastPulse 1.5s ease-in-out infinite;\">📡 BROADCASTING</span>";
if (normalised.includes(OLD_BADGE)) {
  normalised = normalised.split(OLD_BADGE).join(NEW_BADGE);
  changed = true;
  console.log('✅ BROADCASTING badge added to trip cards.');
} else {
  console.log('ℹ️  BROADCASTING badge already present or badge not found.');
}

if (changed) {
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ driver.html saved.');
} else {
  console.log('ℹ️  No changes needed for driver.html.');
}

