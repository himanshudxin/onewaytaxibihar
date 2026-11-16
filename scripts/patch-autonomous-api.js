const fs = require('fs');
let content = fs.readFileSync('api/index.js', 'utf8');

// 1. Patch Driver Reject Endpoint with Autonomous Re-Broadcast
const oldRejectBlock = `      booking.assignedDriverId = null;
      booking.driverDetails = null;
      booking.bookingStatus = 'PENDING_REASSIGNMENT';
      booking.status = 'PENDING_REASSIGNMENT';`;

const newRejectBlock = `      // Autonomous Self-Healing Driver Cancellation & Instant Re-Broadcast
      try {
        const autoEngine = require('../services/autonomousEngine.js');
        autoEngine.handleAutonomousDriverCancellation(db, booking.bookingId, driver.id, rejectReason);
      } catch (autoErr) {
        booking.assignedDriverId = null;
        booking.driverDetails = null;
        booking.bookingStatus = 'SEARCHING_DRIVER';
        booking.status = 'SEARCHING_DRIVER';
        booking.dispatchStatus = 'BROADCASTING';
      }`;

if (content.includes(oldRejectBlock.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldRejectBlock.replace(/\n/g, '\r\n'), newRejectBlock.replace(/\n/g, '\r\n'));
  console.log('Patched reject block with CRLF');
} else if (content.includes(oldRejectBlock)) {
  content = content.replace(oldRejectBlock, newRejectBlock);
  console.log('Patched reject block with LF');
} else {
  console.log('Reject block not found');
}

// 2. Patch /api/dispatch/offers with runAutonomousSweep
const oldOffersBlock = `      const dispatchSvc = require('../services/dispatch.js');
      dispatchSvc.checkBroadcastTimeouts(db);`;

const newOffersBlock = `      const dispatchSvc = require('../services/dispatch.js');
      dispatchSvc.checkBroadcastTimeouts(db);

      // Autonomous Sentinel Cycle: Auto-expands radius, auto-allots timeouts, sweeps ghost drivers & auto-settles completed trips
      try {
        const autoEngine = require('../services/autonomousEngine.js');
        const sweep = autoEngine.runAutonomousSweep(db);
        if (sweep.mutations > 0) {
          await saveDb(db);
        }
      } catch (autoErr) {
        console.error('[AutonomousEngine] Sweep note:', autoErr.message);
      }`;

if (content.includes(oldOffersBlock.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldOffersBlock.replace(/\n/g, '\r\n'), newOffersBlock.replace(/\n/g, '\r\n'));
  console.log('Patched offers block with CRLF');
} else if (content.includes(oldOffersBlock)) {
  content = content.replace(oldOffersBlock, newOffersBlock);
  console.log('Patched offers block with LF');
} else {
  console.log('Offers block not found');
}

fs.writeFileSync('api/index.js', content, 'utf8');
console.log('api/index.js updated successfully!');

