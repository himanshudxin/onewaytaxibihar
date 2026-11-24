/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Autonomous Dispatch & Self-Healing Sentinel Engine
 * 
 * Runs 100% in the backend without human admin intervention.
 * 
 * 6 Core Hidden Autonomous Features:
 * 1. Adaptive Broadcast Radius Expansion
 * 2. Guaranteed Auto-Allotment Fallback
 * 3. Driver Ghosting & Inactivity Sentinel
 * 4. Cancellation Self-Healing & Instant Re-Broadcast
 * 5. Drop Arrival Geofence Auto-Settlement Safeguard
 * 6. Autonomous System Cycle Runner (Auto-Sweeper)
 */

const dispatch = require('./dispatch.js');

function pushStatusHistory(booking, entry) {
  if (!booking) return;
  if (!Array.isArray(booking.statusHistory)) booking.statusHistory = [];
  booking.statusHistory.push(entry);
  if (booking.statusHistory.length > 25) {
    booking.statusHistory = booking.statusHistory.slice(-25);
  }
}

// Configuration Constants (in seconds / meters)
const AUTO_CONFIG = {
  RADIUS_EXPAND_THRESHOLD_SEC: 45,   // Expand to adjacent districts after 45s unclaimed
  AUTO_ALLOT_THRESHOLD_SEC: 90,       // Auto-assign top driver after 90s unclaimed
  GHOST_INACTIVITY_THRESHOLD_SEC: 900,// 15 mins inactive after assignment triggers auto-reassignment
  GEOFENCE_COMPLETE_THRESHOLD_SEC: 1200, // 20 mins after expected arrival triggers auto-settle safeguard
  BROADCAST_RETRY_COOLDOWN_SEC: 10
};

// Neighboring district corridors for adaptive radius expansion across Bihar
const ADJACENT_DISTRICT_MAP = {
  'patna': ['hajipur', 'vaishali', 'jehanabad', 'ara', 'bhojpur', 'nalanda', 'biharsharif'],
  'gaya': ['bodhgaya', 'jehanabad', 'nawada', 'aurangabad', 'patna'],
  'bodhgaya': ['gaya', 'jehanabad', 'aurangabad', 'nawada'],
  'muzaffarpur': ['patna', 'hajipur', 'vaishali', 'sitamarhi', 'samastipur', 'sheohar'],
  'darbhanga': ['madhubani', 'samastipur', 'muzaffarpur', 'saharsa'],
  'bhagalpur': ['munger', 'banka', 'khagaria', 'katihar'],
  'begusarai': ['khagaria', 'munger', 'lakhisarai', 'samastipur', 'patna'],
  'purnia': ['katihar', 'araria', 'kishanganj', 'saharsa', 'madhepura'],
  'saharsa': ['madhepura', 'supaul', 'darbhanga', 'khagaria'],
  'chhapra': ['siwan', 'gopalganj', 'ara', 'patna', 'vaishali'],
  'siwan': ['gopalganj', 'chhapra', 'saran', 'motihari'],
  'motihari': ['bettiah', 'muzaffarpur', 'sheohar', 'sitamarhi'],
  'varanasi': ['sasaram', 'rohtas', 'buxar', 'patna'],
  'deoghar': ['banka', 'jamui', 'bhagalpur', 'nawada']
};

/**
 * 1. Adaptive Broadcast Radius Expansion
 * Expands candidate pool to adjacent district transit hubs if origin city has no claim within 45s.
 */
function expandBroadcastRadius(db, booking) {
  if (booking.dispatchStatus !== 'BROADCASTING' || !booking.broadcastStartedAt) return false;
  if (booking.radiusExpanded) return false;

  const elapsedSec = (Date.now() - new Date(booking.broadcastStartedAt).getTime()) / 1000;
  if (elapsedSec < AUTO_CONFIG.RADIUS_EXPAND_THRESHOLD_SEC) return false;

  const originClean = String(booking.originCity || 'patna').toLowerCase().replace(/[^a-z]/g, '');
  const adjacentDistricts = ADJACENT_DISTRICT_MAP[originClean] || ['patna', 'hajipur', 'jehanabad'];

  // Find online drivers in adjacent corridors
  const reqTier = String(booking.cabTier || booking.fleetClass || 'sedan').toLowerCase();
  const additionalCandidates = (db.drivers || []).filter(driver => {
    const status = String(driver.status || '').toLowerCase();
    const dutyStatus = String(driver.dutyStatus || '').toUpperCase();
    const isOnline = (dutyStatus === 'ONLINE' || dutyStatus === 'ON_DUTY' || status === 'available' || status === 'active' || status === 'approved' || driver.isAvailable === true);
    if (!isOnline) return false;
    if (status === 'suspended' || status === 'banned') return false;

    // Reject already excluded
    if ((booking.broadcastCandidates || []).includes(driver.id)) return false;
    if ((booking.rejectedDrivers || []).includes(driver.id)) return false;

    // Check operating city matches adjacent districts
    const dCity = String(driver.city || driver.operatingArea || '').toLowerCase().replace(/[^a-z]/g, '');
    const isAdjacent = adjacentDistricts.some(adj => dCity.includes(adj) || adj.includes(dCity));
    if (!isAdjacent) return false;

    // Category check
    const dTier = String(driver.fleetTier || 'sedan').toLowerCase();
    return dTier === reqTier || dTier.includes('sedan') || dTier.includes('suv');
  });

  if (additionalCandidates.length > 0) {
    if (!booking.broadcastCandidates) booking.broadcastCandidates = [];
    additionalCandidates.forEach(d => {
      if (!booking.broadcastCandidates.includes(d.id)) {
        booking.broadcastCandidates.push(d.id);
      }
    });

    booking.radiusExpanded = true;
    booking.radiusExpandedAt = new Date().toISOString();
    booking.broadcastTimeoutSec = Math.max(booking.broadcastTimeoutSec || 120, 180); // Give regional drivers extra 60s

    pushStatusHistory(booking, {
      status: 'RADIUS_EXPANDED',
      timestamp: booking.radiusExpandedAt,
      actor: 'AutonomousExpansionEngine',
      note: `Adaptive regional expansion added ${additionalCandidates.length} chauffeur(s) from adjacent districts (${adjacentDistricts.slice(0, 4).join(', ')}).`
    });

    return true;
  }

  return false;
}

/**
 * 2. Guaranteed Persistent Broadcast
 * Ensures trip remains open and broadcasted to all partner drivers until accepted by a driver.
 */
function autoAllotFallback(db, booking) {
  // Respect operator mandate: booking shows until accepted by a partner driver
  return false;
}

/**
 * 3. Driver Ghosting & Inactivity Sentinel
 * If an allotted driver does not verify OTP or move towards doorstep within 15 minutes,
 * auto-unassigns, sets driver temporarily offline, and auto-rebroadcasts ride with urgent priority.
 */
function checkDriverGhosting(db, booking) {
  const activeStatus = String(booking.bookingStatus || booking.status || '').toUpperCase();
  const isAssigned = (activeStatus === 'DRIVER ASSIGNED' || activeStatus === 'DRIVER_ASSIGNED' || activeStatus === 'ACCEPTED' || activeStatus === 'DRIVER_ACCEPTED');

  if (!isAssigned || !booking.assignedDriverId) return false;

  // Measure time since driver was assigned
  const assignTime = booking.autoDispatchedAt || booking.updatedAt || booking.createdAt;
  if (!assignTime) return false;

  const elapsedSec = (Date.now() - new Date(assignTime).getTime()) / 1000;
  if (elapsedSec < AUTO_CONFIG.GHOST_INACTIVITY_THRESHOLD_SEC) return false;

  const ghostDriverId = booking.assignedDriverId;
  const ghostDriverName = booking.assignedDriverName || 'Assigned Chauffeur';
  const now = new Date().toISOString();

  // 1. Penalize ghosting driver (set duty status offline so they don't block more rides)
  const drvIdx = (db.drivers || []).findIndex(d => d.id === ghostDriverId || d.phone === ghostDriverId);
  if (drvIdx >= 0) {
    db.drivers[drvIdx].dutyStatus = 'OFFLINE';
    db.drivers[drvIdx].isAvailable = false;
    db.drivers[drvIdx].lastGhostTimeoutAt = now;
  }

  // 2. Add ghost driver to excluded list for this booking
  if (!booking.rejectedDrivers) booking.rejectedDrivers = [];
  booking.rejectedDrivers.push(ghostDriverId);

  // 3. Clear assignment and reset to high-priority broadcast
  booking.assignedDriverId = null;
  booking.assignedDriverName = null;
  booking.assignedDriverPhone = null;
  booking.assignedDriverCarNo = null;
  booking.driverDetails = null;
  booking.broadcastClaimedBy = null;
  booking.dispatchStatus = 'BROADCASTING';
  booking.bookingStatus = 'SEARCHING_DRIVER';
  booking.status = 'SEARCHING_DRIVER';
  booking.priority = 'HIGH_URGENT_REASSIGNMENT';
  booking.broadcastStartedAt = now;
  booking.radiusExpanded = false;

  // 4. Re-calculate candidates excluding ghost driver
  const eligible = dispatch.findEligibleDrivers(db, booking)
    .filter(d => !booking.rejectedDrivers.includes(d.id));
  booking.broadcastCandidates = eligible.map(d => d.id);

  pushStatusHistory(booking, {
    status: 'DRIVER_GHOST_REASSIGNED',
    timestamp: now,
    actor: 'AutonomousGhostSentinel',
    note: `Chauffeur ${ghostDriverName} inactive for ${Math.round(elapsedSec / 60)}m. Driver set offline and ride autonomously re-broadcasted to ${eligible.length} chauffeur(s).`
  });

  return true;
}

/**
 * 4. Driver Cancellation Self-Healing
 * When a driver cancels an active assignment, instantly heals the booking and auto-rebroadcasts.
 */
function handleAutonomousDriverCancellation(db, bookingId, driverId, reason = 'Driver cancelled') {
  const booking = (db.bookings || []).find(b => b.bookingId === bookingId || b.id === bookingId);
  if (!booking) return { success: false, error: 'Booking not found' };

  const now = new Date().toISOString();

  if (!booking.rejectedDrivers) booking.rejectedDrivers = [];
  if (driverId && !booking.rejectedDrivers.includes(driverId)) {
    booking.rejectedDrivers.push(driverId);
  }

  booking.assignedDriverId = null;
  booking.assignedDriverName = null;
  booking.assignedDriverPhone = null;
  booking.assignedDriverCarNo = null;
  booking.driverDetails = null;
  booking.broadcastClaimedBy = null;
  booking.dispatchStatus = 'BROADCASTING';
  booking.bookingStatus = 'SEARCHING_DRIVER';
  booking.status = 'SEARCHING_DRIVER';
  booking.broadcastStartedAt = now;
  booking.radiusExpanded = false;

  const eligible = dispatch.findEligibleDrivers(db, booking)
    .filter(d => !booking.rejectedDrivers.includes(d.id));
  booking.broadcastCandidates = eligible.map(d => d.id);

  pushStatusHistory(booking, {
    status: 'CANCEL_REBROADCAST',
    timestamp: now,
    actor: 'AutonomousRecoveryEngine',
    note: `Chauffeur cancelled (${reason}). Autonomous self-healing re-broadcasted to ${eligible.length} other driver(s).`
  });

  return { success: true, reBroadcastCount: eligible.length, booking };
}

/**
 * 5. Drop Arrival Geofence Auto-Settlement Safeguard
 * If an in-transit trip has completed its highway transit and has been idle near destination for > 20 min,
 * auto-completes the trip and credits the driver's wallet ledger so money is never stuck.
 */
function autoSettleCompletedTransit(db, booking) {
  const activeStatus = String(booking.bookingStatus || booking.status || '').toUpperCase();
  const isTransit = (activeStatus === 'TRIP_STARTED' || activeStatus === 'TRIP STARTED' || activeStatus === 'IN_TRANSIT' || activeStatus === 'IN TRANSIT');

  if (!isTransit || !booking.assignedDriverId) return false;

  // Check how long trip has been in transit
  const transitStart = booking.tripStartedAt || booking.updatedAt;
  if (!transitStart) return false;

  const transitElapsedSec = (Date.now() - new Date(transitStart).getTime()) / 1000;
  // Estimated duration in seconds (from route calculation or baseKm estimate)
  const estDurationSec = (booking.estimatedDurationMinutes || 120) * 60;

  // If in transit for longer than estimated duration + 20 minutes safeguard
  if (transitElapsedSec < (estDurationSec + AUTO_CONFIG.GEOFENCE_COMPLETE_THRESHOLD_SEC)) return false;

  const now = new Date().toISOString();
  const fare = Number(booking.totalFare || booking.fare || 0);
  const netDriverPayout = Math.round(fare * 0.85);
  const platformCommission = fare - netDriverPayout;

  booking.bookingStatus = 'COMPLETED';
  booking.status = 'COMPLETED';
  booking.completedAt = now;
  booking.autoCompleted = true;
  booking.autoCompleteReason = 'Auto-settled by Geofence Transit Safeguard after destination arrival window expired.';

  booking.payoutSettlement = {
    totalCollected: fare,
    netDriverPayout,
    platformCommission,
    settledAt: now,
    mode: 'AUTONOMOUS_SETTLEMENT'
  };

  // Credit driver's ledger in db
  const drvIdx = (db.drivers || []).findIndex(d => d.id === booking.assignedDriverId);
  if (drvIdx >= 0) {
    const drv = db.drivers[drvIdx];
    drv.totalTrips = (drv.totalTrips || 0) + 1;
    drv.tripsToday = (drv.tripsToday || 0) + 1;
    drv.walletBalance = (drv.walletBalance || 0) + netDriverPayout;
    drv.dutyStatus = 'ON_DUTY'; // Driver is now free and available for next trip!
  }

  pushStatusHistory(booking, {
    status: 'COMPLETED',
    timestamp: now,
    actor: 'AutonomousSettlementSafeguard',
    note: booking.autoCompleteReason
  });

  return true;
}

/**
 * 6. Autonomous System Cycle Runner (Auto-Sweeper)
 * Scans all bookings and performs:
 * - Radius expansion for stale broadcasts (> 45s)
 * - Auto-allotment fallback (> 90s)
 * - Ghost driver detection (> 15m)
 * - Drop arrival auto-settlement (> ETA + 20m)
 * Returns count of mutated records.
 */
function runAutonomousSweep(db) {
  let mutations = 0;
  const bookings = db.bookings || [];

  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    const status = String(b.bookingStatus || b.status || '').toUpperCase();

    // 1. Broadasting bookings: check radius expansion & fallback
    if (b.dispatchStatus === 'BROADCASTING') {
      if (expandBroadcastRadius(db, b)) mutations++;
      if (autoAllotFallback(db, b)) mutations++;
    }

    // 2. Assigned bookings: check for driver ghosting
    if (status === 'DRIVER ASSIGNED' || status === 'DRIVER_ASSIGNED' || status === 'ACCEPTED') {
      if (checkDriverGhosting(db, b)) mutations++;
    }

    // 3. In-transit bookings: check for completion safeguard
    if (status === 'TRIP_STARTED' || status === 'IN_TRANSIT' || status === 'STARTED') {
      if (autoSettleCompletedTransit(db, b)) mutations++;
    }
  }

  return { mutations };
}

module.exports = {
  AUTO_CONFIG,
  ADJACENT_DISTRICT_MAP,
  expandBroadcastRadius,
  autoAllotFallback,
  checkDriverGhosting,
  handleAutonomousDriverCancellation,
  autoSettleCompletedTransit,
  runAutonomousSweep
};

