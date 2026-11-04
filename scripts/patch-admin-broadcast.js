/**
 * patch-admin-broadcast.js
 * Upgrades admin.html dispatch workspace with:
 * 1. formatPickupDateTime() helper added to admin JS
 * 2. Formatted DD-MMM-YYYY | hh:mm A in bookings table and dispatch queue
 * 3. BROADCASTING status badge (pulsing amber)
 * 4. "Trigger Broadcast" button in dispatch queue card
 * 5. Manual override buttons: Force Assign, Cancel Trip (with reason), Mark Completed
 * 6. Admin broadcast trigger via POST /api/dispatch/broadcast
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

let changed = false;

// ── 1. Add formatPickupDateTime() in admin JS ──────────────────────────────────
if (!normalised.includes('formatPickupDateTime')) {
  const JS_ANCHOR = `function escapeHtml(str) {`;
  const HELPER = `function formatPickupDateTime(pickupDate, pickupTime) {
  try {
    if (!pickupDate) return '';
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    let dateObj;
    if (pickupDate && pickupTime) {
      const norm = String(pickupDate).length === 10 ? pickupDate : new Date(pickupDate).toISOString().slice(0,10);
      dateObj = new Date(norm + 'T' + pickupTime + ':00');
    } else {
      dateObj = new Date(pickupDate);
    }
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

function getDispatchStatusBadge(b) {
  const ds = b.dispatchStatus || '';
  if (ds === 'BROADCASTING') {
    return '<span class="pill" style="background:rgba(245,158,11,0.18);color:#D97706;border:1px solid #F59E0B;animation:broadcastPulse 1.5s ease-in-out infinite;">📡 BROADCASTING</span>';
  }
  if (ds === 'ASSIGNED') return '<span class="pill pill-success">✓ ASSIGNED</span>';
  if (ds === 'ESCALATED_TO_ADMIN') return '<span class="pill" style="background:rgba(239,68,68,0.15);color:#DC2626;border:1px solid #EF4444;">🚨 ESCALATED</span>';
  return '';
}

async function triggerBroadcast(bookingId) {
  try {
    const res = await fetch('/api/dispatch/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      showToast('📡 Broadcast sent to ' + data.candidateCount + ' chauffeur(s)!', 'success');
      await loadAllData();
    } else {
      showToast('Broadcast failed: ' + (data.message || 'Unknown error'), 'error');
    }
  } catch(e) {
    showToast('Network error triggering broadcast.', 'error');
  }
}

async function checkBroadcastTimeouts() {
  try {
    await fetch('/api/dispatch/broadcast-timeout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include'
    });
  } catch(e) {}
}

async function cancelTripWithReason(bookingId) {
  const reason = prompt('Cancel Reason (required):\\n\\nOptions: Passenger No-Show, Route Not Available, System Error, Passenger Request, Admin Override', 'Passenger Request');
  if (!reason) return;
  try {
    const res = await fetch('/api/bookings/' + bookingId + '/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason, cancelledBy: 'Admin' }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success || res.ok) {
      showToast('Trip ' + bookingId + ' cancelled.', 'success');
      await loadAllData();
    } else {
      showToast(data.message || 'Cancel failed.', 'error');
    }
  } catch(e) { showToast('Network error.', 'error'); }
}

async function markTripCompleted(bookingId) {
  if (!confirm('Mark trip ' + bookingId + ' as COMPLETED manually?\\nUse this only when the trip is finished but system did not auto-update.')) return;
  try {
    const res = await fetch('/api/trips/' + bookingId + '/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedBy: 'Admin Manual', actor: 'Admin' }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success || res.ok) {
      showToast('Trip ' + bookingId + ' marked completed.', 'success');
      await loadAllData();
    } else {
      showToast(data.message || 'Completion failed. Try again.', 'error');
    }
  } catch(e) { showToast('Network error.', 'error'); }
}

function escapeHtml(str) {`;

  if (normalised.includes(JS_ANCHOR)) {
    normalised = normalised.replace(JS_ANCHOR, HELPER);
    changed = true;
    console.log('✅ Admin JS helpers added (formatPickupDateTime, broadcast controls).');
  } else {
    console.log('⚠️  Could not find JS anchor for helper injection.');
  }
} else {
  console.log('ℹ️  Admin helpers already present.');
}

// ── 2. Add broadcastPulse CSS animation ──────────────────────────────────────
if (!normalised.includes('broadcastPulse')) {
  const CSS_ANCHOR = `</style>`;
  const PULSE_CSS = `
    @keyframes broadcastPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
      50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
    }
  `;
  // Insert before first </style>
  const firstStyleClose = normalised.indexOf(CSS_ANCHOR);
  if (firstStyleClose !== -1) {
    normalised = normalised.slice(0, firstStyleClose) + PULSE_CSS + normalised.slice(firstStyleClose);
    changed = true;
    console.log('✅ broadcastPulse CSS animation added.');
  }
} else {
  console.log('ℹ️  broadcastPulse animation already present.');
}

// ── 3. Upgrade pickup date/time in bookings table ─────────────────────────────
const OLD_TABLE_DATE = `<td>${b.pickupDate || ''} <span style="color:#64748b; font-size:11.5px;">${b.pickupTime || ''}</span></td>`;
const NEW_TABLE_DATE = `<td>
                  <div style="font-weight:800; font-size:13px; color:#111827;">${'${formatPickupDateTime(b.pickupDate, b.pickupTime) || b.pickupDate || \'—\'}'}</div>
                  ${'${getDispatchStatusBadge(b)}'}
                </td>`;

if (normalised.includes(OLD_TABLE_DATE)) {
  normalised = normalised.split(OLD_TABLE_DATE).join(NEW_TABLE_DATE);
  changed = true;
  console.log('✅ Bookings table pickup date/time upgraded.');
} else {
  console.log('⚠️  Bookings table date anchor not found (may already be updated).');
}

// ── 4. Upgrade dispatch queue card date display ────────────────────────────────
const OLD_QUEUE_DATE = `<div style="font-size:11.5px; color:#64748b;">${'${b.pickupDate}'} `;
// Too variable; search for the dispatch queue card date line
const OLD_QUEUE_DATE2 = `<div style="font-size:11.5px; color:#64748b;">\${b.pickupDate} `;
if (normalised.includes(OLD_QUEUE_DATE2)) {
  const newQueueDate = `<div style="font-size:13px; font-weight:800; color:#DC2626; margin:3px 0;">\${formatPickupDateTime(b.pickupDate, b.pickupTime) || b.pickupDate || '—'}</div>`;
  normalised = normalised.split(OLD_QUEUE_DATE2).join(newQueueDate.replace(OLD_QUEUE_DATE2.slice(0, 20), ''));
  // More targeted replacement
}

// Alternative: find and replace within dispatch queue card using context
const OLD_QUEUE_BLOCK = `<div style="font-size:11.5px; color:#64748b;">\${b.pickupDate} \u00B0\u00BF\u00B0 \${b.pickupTime} \u00B0\u00BF\u00B0 \u00B0\u00BF,1\${(b.totalFare||b.fare||0)}</div>`;
const SEARCH_QUEUE = 'font-size:11.5px; color:#64748b;">${b.pickupDate}';
if (normalised.includes(SEARCH_QUEUE)) {
  const lineStart = normalised.lastIndexOf('<div', normalised.indexOf(SEARCH_QUEUE));
  const lineEnd = normalised.indexOf('</div>', normalised.indexOf(SEARCH_QUEUE)) + 6;
  if (lineStart !== -1 && lineEnd !== -1) {
    const oldLine = normalised.slice(lineStart, lineEnd);
    const newLine = `<div style="font-size:13px; font-weight:800; color:#DC2626; margin:2px 0;">\${formatPickupDateTime(b.pickupDate, b.pickupTime) || b.pickupDate || '—'}</div>`;
    normalised = normalised.slice(0, lineStart) + newLine + normalised.slice(lineEnd);
    changed = true;
    console.log('✅ Dispatch queue card date upgraded.');
  }
} else {
  console.log('ℹ️  Queue date already upgraded or not found.');
}

// ── 5. Add Broadcast + Manual Override buttons to dispatch queue card ─────────
const OLD_AUTO_DISPATCH_BTN = `<button type="button" class="btn btn-warning btn-sm" onclick="triggerSmartAutoDispatch('\${b.bookingId}')" style="background:#f59e0b; color:#fff; border:none; font-weight:700;">`;
const NEW_AUTO_DISPATCH_BTN = `<button type="button" class="btn btn-sm" onclick="triggerBroadcast('\${b.bookingId}')" style="background:#F59E0B;color:#fff;border:none;font-weight:700;width:100%;margin-bottom:3px;">📡 Broadcast</button>
                <button type="button" class="btn btn-warning btn-sm" onclick="triggerSmartAutoDispatch('\${b.bookingId}')" style="background:#f59e0b; color:#fff; border:none; font-weight:700;">`;

if (normalised.includes(OLD_AUTO_DISPATCH_BTN)) {
  normalised = normalised.split(OLD_AUTO_DISPATCH_BTN).join(NEW_AUTO_DISPATCH_BTN);
  changed = true;
  console.log('✅ Broadcast button added to dispatch queue cards.');
} else {
  console.log('⚠️  Auto-dispatch button anchor not found in queue card.');
}

// ── 6. Add Cancel + Mark Completed to dispatch queue card ─────────────────────
const OLD_WHATSAPP_BTN = `<a href="https://wa.me/91\${cleanPhone(b.passengerPhone)}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px; text-align:center;">WhatsApp</a>`;
const NEW_WHATSAPP_BTN = `<a href="https://wa.me/91\${cleanPhone(b.passengerPhone)}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px; text-align:center;">WhatsApp</a>
                <button type="button" class="btn btn-sm" onclick="cancelTripWithReason('\${b.bookingId}')" style="background:rgba(239,68,68,0.1);color:#DC2626;border:1px solid #EF4444;font-size:11px;font-weight:700;">✗ Cancel</button>
                <button type="button" class="btn btn-sm" onclick="markTripCompleted('\${b.bookingId}')" style="background:rgba(5,150,105,0.1);color:#059669;border:1px solid #10B981;font-size:11px;font-weight:700;">✓ Done</button>`;

if (normalised.includes(OLD_WHATSAPP_BTN)) {
  normalised = normalised.split(OLD_WHATSAPP_BTN).join(NEW_WHATSAPP_BTN);
  changed = true;
  console.log('✅ Cancel + Mark Completed buttons added to dispatch queue cards.');
} else {
  console.log('⚠️  WhatsApp button anchor not found. Cancel/Done buttons not added.');
}

// ── 7. Periodic broadcast timeout check ───────────────────────────────────────
const OLD_LOAD_CALL = `await loadAllData();`;
if (!normalised.includes('checkBroadcastTimeouts()') && normalised.includes(OLD_LOAD_CALL)) {
  // Add after the first loadAllData() call in DOMContentLoaded or init
  const INIT_ANCHOR = `document.addEventListener('DOMContentLoaded', async () => {`;
  if (normalised.includes(INIT_ANCHOR)) {
    const insertAfter = normalised.indexOf(INIT_ANCHOR) + INIT_ANCHOR.length;
    const autoCheck = `\n      // Periodic broadcast timeout check every 30 seconds\n      setInterval(checkBroadcastTimeouts, 30000);\n`;
    normalised = normalised.slice(0, insertAfter) + autoCheck + normalised.slice(insertAfter);
    changed = true;
    console.log('✅ Periodic broadcast timeout check added.');
  }
}

if (changed) {
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ admin.html updated successfully.');
} else {
  console.log('ℹ️  No changes needed for admin.html.');
}

