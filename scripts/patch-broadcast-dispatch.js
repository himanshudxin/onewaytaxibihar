/**
 * patch-broadcast-dispatch.js  v2
 * Uses separate addon files to avoid template-literal escaping issues.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dispatchPath = path.join(ROOT, 'services', 'dispatch.js');
const apiPath      = path.join(ROOT, 'api', 'index.js');
const addonPath    = path.join(__dirname, 'broadcast-dispatch-addon.txt');

// ─────────────────────────────────────────────────────────────────────────────
// 1.  Patch services/dispatch.js
// ─────────────────────────────────────────────────────────────────────────────
let dispatchContent = fs.readFileSync(dispatchPath, 'utf8');
const addonText     = fs.readFileSync(addonPath, 'utf8');

if (dispatchContent.includes('broadcastBooking')) {
  console.log('ℹ️  services/dispatch.js: Broadcast already present, skipping.');
} else {
  // Remove old module.exports block
  const oldExports = `module.exports = {
  BIHAR_COORDS,
  resolveCityCoords,
  getHaversineDistanceKm,
  findEligibleDrivers,
  rankDrivers,
  autoDispatchBooking
};`;
  dispatchContent = dispatchContent.replace(oldExports, '').trimEnd() + '\n\n' + addonText;
  fs.writeFileSync(dispatchPath, dispatchContent, 'utf8');
  console.log('✅ services/dispatch.js patched with broadcast functions.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  Patch api/index.js — inject broadcast endpoints
// ─────────────────────────────────────────────────────────────────────────────
let apiContent = fs.readFileSync(apiPath, 'utf8');

if (apiContent.includes("'/dispatch/broadcast'") || apiContent.includes('"/dispatch/broadcast"')) {
  console.log('ℹ️  api/index.js: Broadcast endpoints already present, skipping.');
} else {
  const ANCHOR = "    if ((pathname === '/dispatch/auto-assign' || pathname === '/api/dispatch/auto-assign') && method === 'POST') {";
  if (!apiContent.includes(ANCHOR)) {
    console.error('❌ Cannot find auto-assign anchor in api/index.js. Aborting.');
    process.exit(1);
  }

  const broadcastBlock = fs.readFileSync(path.join(__dirname, 'broadcast-api-block.txt'), 'utf8');
  apiContent = apiContent.replace(ANCHOR, broadcastBlock + '\n' + ANCHOR);
  fs.writeFileSync(apiPath, apiContent, 'utf8');
  console.log('✅ api/index.js patched with broadcast API endpoints.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  Auto-trigger broadcast on booking creation
// ─────────────────────────────────────────────────────────────────────────────
apiContent = fs.readFileSync(apiPath, 'utf8');

if (apiContent.includes('AUTO-BROADCAST-TRIGGER')) {
  console.log('ℹ️  api/index.js: Auto-broadcast trigger already present, skipping.');
} else {
  // Pattern: after db.bookings.push(newBooking); before await saveDb in booking creation
  const PUSH_ANCHOR = "      db.bookings.push(newBooking);";
  const idx = apiContent.indexOf(PUSH_ANCHOR);
  if (idx === -1) {
    console.warn('⚠️  Cannot find db.bookings.push(newBooking) anchor. Auto-broadcast not injected.');
  } else {
    const insertAfter = idx + PUSH_ANCHOR.length;
    const trigger = "\n      // AUTO-BROADCAST-TRIGGER: Notify all eligible drivers\n      require('../services/dispatch.js').broadcastBooking(db, newBooking);";
    apiContent = apiContent.slice(0, insertAfter) + trigger + apiContent.slice(insertAfter);
    fs.writeFileSync(apiPath, apiContent, 'utf8');
    console.log('✅ api/index.js: Auto-broadcast trigger injected after booking push.');
  }
}

console.log('\n🎉 Broadcast dispatch patch complete!');
