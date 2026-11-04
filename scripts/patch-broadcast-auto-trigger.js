/**
 * patch-broadcast-auto-trigger.js
 * Injects auto-broadcast trigger after db.bookings.unshift(newBooking) in api/index.js
 */
const fs = require('fs');
const path = require('path');
const apiPath = path.join(__dirname, '..', 'api', 'index.js');

// Read with CRLF normalisation
let rawContent = fs.readFileSync(apiPath);
let content = rawContent.toString('utf8');
const hasCRLF = content.includes('\r\n');

if (content.includes('AUTO-BROADCAST-TRIGGER')) {
  console.log('ℹ️  Auto-broadcast trigger already present.');
  process.exit(0);
}

// Normalise to LF for matching
const normalised = content.replace(/\r\n/g, '\n');

const OLD = `      if (!db.bookings) db.bookings = [];\n      db.bookings.unshift(newBooking);\n\n      // Push Notification Alert for Admin Central Dispatch`;

const NEW = `      if (!db.bookings) db.bookings = [];\n      db.bookings.unshift(newBooking);\n\n      // AUTO-BROADCAST-TRIGGER: Instantly notify all eligible online drivers\n      try {\n        const _dispSvc = require('../services/dispatch.js');\n        _dispSvc.broadcastBooking(db, newBooking);\n      } catch (broadcastErr) {\n        console.error('[BroadcastEngine] Auto-broadcast failed:', broadcastErr.message);\n      }\n\n      // Push Notification Alert for Admin Central Dispatch`;

if (!normalised.includes(OLD)) {
  console.error('❌ Anchor not found. Check api/index.js around line 2790.');
  process.exit(1);
}

let result = normalised.replace(OLD, NEW);
// Restore CRLF if original had it
if (hasCRLF) result = result.replace(/\n/g, '\r\n');
fs.writeFileSync(apiPath, result, 'utf8');
console.log('✅ Auto-broadcast trigger injected into api/index.js.');
