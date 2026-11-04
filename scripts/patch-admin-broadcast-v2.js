/**
 * patch-admin-broadcast-v2.js
 * Uses String() constructor and concat to avoid template literal evaluation issues.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

let changed = false;

// ── 1. broadcastPulse CSS check ───────────────────────────────────────────────
if (!normalised.includes('broadcastPulse')) {
  const firstStyleClose = normalised.indexOf('</style>');
  if (firstStyleClose !== -1) {
    const pulseCss = '\n    @keyframes broadcastPulse {\n      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }\n      50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(245,158,11,0); }\n    }\n  ';
    normalised = normalised.slice(0, firstStyleClose) + pulseCss + normalised.slice(firstStyleClose);
    changed = true;
    console.log('✅ broadcastPulse CSS animation added.');
  }
} else {
  console.log('ℹ️  broadcastPulse already present.');
}

// ── 2. Upgrade pickup date/time in bookings table ─────────────────────────────
// The raw string in admin.html is: ${b.pickupDate || ''} <span...>${b.pickupTime || ''}</span></td>
// We search for the literal JS template literal content
const oldTableDateSearch = "b.pickupDate || ''} <span style=\"color:#64748b; font-size:11.5px;\">${b.pickupTime || ''}</span></td>";
if (!normalised.includes('formatPickupDateTime') || normalised.includes(oldTableDateSearch)) {
  if (normalised.includes(oldTableDateSearch)) {
    // Replace entire <td>...</td> for the pickup date column in the booking table
    const tdStart = normalised.lastIndexOf('<td>', normalised.indexOf(oldTableDateSearch));
    const tdEnd = normalised.indexOf('</td>', normalised.indexOf(oldTableDateSearch)) + 5;
    if (tdStart !== -1 && tdEnd !== -1) {
      const newTd = '<td>\n                  <div style="font-weight:800; font-size:13px; color:#111827;">${formatPickupDateTime(b.pickupDate, b.pickupTime) || b.pickupDate || \'—\'}</div>\n                  ${getDispatchStatusBadge(b)}\n                </td>';
      normalised = normalised.slice(0, tdStart) + newTd + normalised.slice(tdEnd);
      changed = true;
      console.log('✅ Bookings table pickup date/time upgraded.');
    }
  } else {
    console.log('ℹ️  Bookings table date anchor not found (may already be updated).');
  }
}

// ── 3. Upgrade dispatch queue card date line ───────────────────────────────────
// Target: <div style="font-size:11.5px; color:#64748b;">${b.pickupDate} ⬝ ${b.pickupTime} ⬝ ₹${...}</div>
const queueDateSearch = 'font-size:11.5px; color:#64748b;">${b.pickupDate}';
if (normalised.includes(queueDateSearch)) {
  const lineStart = normalised.lastIndexOf('<div', normalised.indexOf(queueDateSearch));
  const lineEnd = normalised.indexOf('</div>', normalised.indexOf(queueDateSearch)) + 6;
  if (lineStart !== -1 && lineEnd !== -1) {
    const newLine = '<div style="font-size:13px; font-weight:800; color:#DC2626; margin:2px 0;">${formatPickupDateTime(b.pickupDate, b.pickupTime) || b.pickupDate || \'—\'}</div>';
    normalised = normalised.slice(0, lineStart) + newLine + normalised.slice(lineEnd);
    changed = true;
    console.log('✅ Dispatch queue card date upgraded.');
  }
} else {
  console.log('ℹ️  Queue date already upgraded or not found.');
}

// ── 4. Add Broadcast button to dispatch queue cards ───────────────────────────
const autoDispatchSearch = "triggerSmartAutoDispatch('${b.bookingId}')\" style=\"background:#f59e0b;";
if (normalised.includes(autoDispatchSearch) && !normalised.includes('triggerBroadcast')) {
  const btnStart = normalised.lastIndexOf('<button', normalised.indexOf(autoDispatchSearch));
  const broadcastBtn = '<button type="button" class="btn btn-sm" onclick="triggerBroadcast(\'${b.bookingId}\')" style="background:#F59E0B;color:#fff;border:none;font-weight:700;width:100%;margin-bottom:3px;font-size:11px;">📡 Broadcast All</button>\n                ';
  normalised = normalised.slice(0, btnStart) + broadcastBtn + normalised.slice(btnStart);
  changed = true;
  console.log('✅ Broadcast button added to dispatch queue cards.');
} else {
  if (!normalised.includes(autoDispatchSearch)) {
    // Try alternate search
    const altSearch = 'triggerSmartAutoDispatch';
    if (normalised.includes(altSearch) && !normalised.includes('triggerBroadcast')) {
      const altIdx = normalised.indexOf(altSearch);
      const btnStart2 = normalised.lastIndexOf('<button', altIdx);
      const broadcastBtn2 = '<button type="button" class="btn btn-sm" onclick="triggerBroadcast(\'${b.bookingId}\')" style="background:#F59E0B;color:#fff;border:none;font-weight:700;width:100%;margin-bottom:3px;font-size:11px;">📡 Broadcast All</button>\n                ';
      normalised = normalised.slice(0, btnStart2) + broadcastBtn2 + normalised.slice(btnStart2);
      changed = true;
      console.log('✅ Broadcast button added (alt method).');
    } else {
      console.log('ℹ️  Dispatch button anchor not found or already has broadcast.');
    }
  } else {
    console.log('ℹ️  Broadcast button already present.');
  }
}

// ── 5. Add Cancel + Mark Completed buttons ────────────────────────────────────
const waSearch = "https://wa.me/91${cleanPhone(b.passengerPhone)}";
if (normalised.includes(waSearch) && !normalised.includes('cancelTripWithReason')) {
  const waIdx = normalised.indexOf(waSearch);
  const aEnd = normalised.indexOf('</a>', waIdx) + 4;
  if (aEnd !== -1) {
    const extraBtns = '\n                <button type="button" class="btn btn-sm" onclick="cancelTripWithReason(\'${b.bookingId}\')" style="background:rgba(239,68,68,0.1);color:#DC2626;border:1px solid #EF4444;font-size:11px;font-weight:700;margin-top:3px;">✗ Cancel</button>\n                <button type="button" class="btn btn-sm" onclick="markTripCompleted(\'${b.bookingId}\')" style="background:rgba(5,150,105,0.1);color:#059669;border:1px solid #10B981;font-size:11px;font-weight:700;margin-top:3px;">✓ Done</button>';
    normalised = normalised.slice(0, aEnd) + extraBtns + normalised.slice(aEnd);
    changed = true;
    console.log('✅ Cancel + Mark Completed buttons added.');
  }
} else {
  console.log('ℹ️  Cancel/Done buttons already present or WA anchor not found.');
}

// ── 6. Add periodic broadcast timeout check ────────────────────────────────────
const domLoadedSearch = "document.addEventListener('DOMContentLoaded', async () => {";
if (normalised.includes(domLoadedSearch) && !normalised.includes('checkBroadcastTimeouts()')) {
  const insertAfter = normalised.indexOf(domLoadedSearch) + domLoadedSearch.length;
  const timeoutSetup = '\n      // Periodic broadcast timeout check every 30 seconds\n      setInterval(checkBroadcastTimeouts, 30000);\n';
  normalised = normalised.slice(0, insertAfter) + timeoutSetup + normalised.slice(insertAfter);
  changed = true;
  console.log('✅ Periodic broadcast timeout check added.');
} else {
  console.log('ℹ️  Broadcast timeout check already present or DOMContentLoaded not found.');
}

if (changed) {
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ admin.html saved.');
} else {
  console.log('ℹ️  No changes needed.');
}

