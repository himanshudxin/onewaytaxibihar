/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Enterprise Smart Driver Dispatch & Matching Engine
 * 
 * Implements intelligent dispatch matching:
 * 1. Eligibility Filtering (duty status, category match, document verification, busy state)
 * 2. Multi-factor Driver Ranking (Proximity, ETA, Rating, Acceptance Rate, Workload)
 * 3. Explainable Dispatch Selection for Admin Operations
 * 4. Automated Cascading Offer Lifecycle (Accept / Reject / Fallback to Next Best)
 */

// Coordinates of Bihar District HQs and Transit Hubs for Proximity Calculation
const BIHAR_COORDS = {
  "patna": [25.5941, 85.1376],
  "nalanda": [25.1978, 85.5186],
  "biharsharif": [25.1978, 85.5186],
  "rajgir": [25.0300, 85.4200],
  "bhojpur": [25.5541, 84.6644],
  "ara": [25.5541, 84.6644],
  "buxar": [25.5647, 83.9777],
  "rohtas": [24.9536, 84.0159],
  "sasaram": [24.9536, 84.0159],
  "gaya": [24.7914, 85.0002],
  "bodhgaya": [24.6961, 84.9869],
  "jehanabad": [25.2132, 84.9863],
  "arwal": [25.2436, 84.6713],
  "aurangabad": [24.7539, 84.3736],
  "nawada": [24.8872, 85.5432],
  "saran": [25.7796, 84.7499],
  "chhapra": [25.7796, 84.7499],
  "siwan": [26.2196, 84.3567],
  "gopalganj": [26.4678, 84.4447],
  "vaishali": [25.6833, 85.2167],
  "hajipur": [25.6833, 85.2167],
  "muzaffarpur": [26.1209, 85.3647],
  "sitamarhi": [26.5978, 85.4897],
  "sheohar": [26.5167, 85.2833],
  "eastchamparan": [26.6467, 84.9089],
  "motihari": [26.6467, 84.9089],
  "westchamparan": [26.8025, 84.5028],
  "bettiah": [26.8025, 84.5028],
  "darbhanga": [26.1542, 85.8918],
  "madhubani": [26.3533, 86.0718],
  "samastipur": [25.8628, 85.7811],
  "begusarai": [25.4182, 86.1272],
  "munger": [25.3757, 86.4744],
  "jamui": [24.9211, 86.2239],
  "khagaria": [25.5036, 86.4828],
  "lakhisarai": [25.1764, 86.0944],
  "sheikhpura": [25.1389, 85.8589],
  "bhagalpur": [25.2425, 86.9842],
  "banka": [24.8856, 86.9239],
  "saharsa": [25.8833, 86.6000],
  "supaul": [26.1264, 86.6067],
  "madhepura": [25.9228, 86.7911],
  "purnia": [25.7771, 87.4753],
  "kishanganj": [26.0989, 87.9408],
  "araria": [26.1494, 87.5156],
  "katihar": [25.5394, 87.5703],
  "varanasi": [25.3176, 82.9739],
  "deoghar": [24.4826, 86.7001],
  "ranchi": [23.3441, 85.3096],
  "siliguri": [26.7271, 88.3953]
};

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25); // Road network tortuosity
}

function resolveCityCoords(cityName) {
  if (!cityName) return BIHAR_COORDS.patna;
  const clean = String(cityName).toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, coords] of Object.entries(BIHAR_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) return coords;
  }
  return BIHAR_COORDS.patna;
}

/**
 * Filter drivers eligible for this specific booking
 */
function findEligibleDrivers(db, booking) {
  const allDrivers = db.drivers || [];
  const reqTier = String(booking.cabTier || booking.fleetClass || 'sedan').toLowerCase();
  const pickupDate = booking.pickupDate;

  return allDrivers.filter(driver => {
    // 1. Status Check: Must be Online or Available (not suspended/banned)
    const status = String(driver.status || '').toLowerCase();
    const dutyStatus = String(driver.dutyStatus || '').toUpperCase();
    const isOnline = (dutyStatus === 'ONLINE' || dutyStatus === 'ON_DUTY' || status === 'available' || status === 'active' || status === 'approved' || driver.isAvailable === true);
    if (!isOnline && status !== 'active' && status !== 'approved') return false;
    if (status === 'suspended' || status === 'banned') return false;

    // 2. Document Verification Check (if flagged, reject unverified/expired)
    if (driver.verificationStatus && (driver.verificationStatus === 'REJECTED' || driver.verificationStatus === 'DOCUMENT_EXPIRED')) {
      return false;
    }

    // 3. Vehicle Category Compatibility
    const dTier = String(driver.fleetTier || 'sedan').toLowerCase();
    const tierMatches = (
      dTier === reqTier ||
      (reqTier.includes('hatchback') && ['hatchback', 'sedan'].includes(dTier)) ||
      (reqTier.includes('sedan') && ['sedan', 'sedan_prime', 'suv'].includes(dTier)) ||
      (reqTier.includes('suv') && ['suv', 'innova_crysta'].includes(dTier)) ||
      (reqTier.includes('innova') && ['innova_crysta', 'suv'].includes(dTier))
    );
    if (!tierMatches) return false;

    // 4. Conflicting Active Trip Check
    const hasConflict = (db.bookings || []).some(b => {
      if (b.bookingId === booking.bookingId) return false;
      if (b.assignedDriverId !== driver.id) return false;
      if (b.pickupDate && pickupDate && b.pickupDate === pickupDate) {
        const activeStates = ['DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'ACCEPTED', 'ON THE WAY', 'ARRIVED', 'TRIP STARTED'];
        return activeStates.includes(b.bookingStatus || b.status);
      }
      return false;
    });
    if (hasConflict) return false;

    return true;
  });
}

/**
 * Rank eligible drivers using a weighted multi-factor scoring model
 */
function rankDrivers(eligibleDrivers, booking) {
  const pickupCoords = resolveCityCoords(booking.originCity);
  const reqTier = String(booking.cabTier || booking.fleetClass || 'sedan').toLowerCase();

  return eligibleDrivers.map(driver => {
    const reasons = [];
    let score = 50; // Base score

    // 1. Proximity & ETA Calculation
    let driverLat = driver.currentLat;
    let driverLng = driver.currentLng;
    if (!driverLat || !driverLng) {
      // Fallback to driver's home base city
      const baseCoords = resolveCityCoords(driver.city || driver.operatingArea || 'Patna');
      driverLat = baseCoords[0];
      driverLng = baseCoords[1];
    }

    const distToPickupKm = getHaversineDistanceKm(driverLat, driverLng, pickupCoords[0], pickupCoords[1]);
    const etaMins = Math.max(5, Math.round(distToPickupKm * 2.2)); // Approx 27 km/h urban/suburban average

    if (distToPickupKm <= 5) {
      score += 25;
      reasons.push(`Super-close proximity: ~${distToPickupKm} km (ETA: ${etaMins}m)`);
    } else if (distToPickupKm <= 15) {
      score += 18;
      reasons.push(`Close proximity: ~${distToPickupKm} km (ETA: ${etaMins}m)`);
    } else if (distToPickupKm <= 35) {
      score += 10;
      reasons.push(`Regional range: ~${distToPickupKm} km (ETA: ${etaMins}m)`);
    } else {
      score += 2;
      reasons.push(`Intercity deadhead: ~${distToPickupKm} km (ETA: ${etaMins}m)`);
    }

    // 2. Chauffeur Rating (0-20 pts)
    const rating = Number(driver.rating) || 4.8;
    if (rating >= 4.9) {
      score += 20;
      reasons.push(`Top-tier Chauffeur Rating (${rating.toFixed(1)}★)`);
    } else if (rating >= 4.7) {
      score += 15;
      reasons.push(`High Chauffeur Rating (${rating.toFixed(1)}★)`);
    } else {
      score += 8;
      reasons.push(`Standard Chauffeur Rating (${rating.toFixed(1)}★)`);
    }

    // 3. Acceptance & Completion Track Record (0-15 pts)
    const acceptanceRate = Number(driver.acceptanceRate) || 96;
    if (acceptanceRate >= 95) {
      score += 15;
      reasons.push(`High Acceptance Rate (${acceptanceRate}%)`);
    } else if (acceptanceRate >= 85) {
      score += 10;
      reasons.push(`Solid Acceptance Rate (${acceptanceRate}%)`);
    } else {
      score += 3;
    }

    // 4. Vehicle Category Match (0-15 pts)
    const dTier = String(driver.fleetTier || 'sedan').toLowerCase();
    if (dTier === reqTier) {
      score += 15;
      reasons.push(`Exact Vehicle Tier Match (${driver.vehicleModel})`);
    } else {
      score += 8;
      reasons.push(`Compatible Fleet Upgrade (${driver.vehicleModel})`);
    }

    // 5. Workload Fairness (0-10 pts: prefer drivers with fewer trips today)
    const tripsToday = Number(driver.tripsToday || 0);
    if (tripsToday === 0) {
      score += 10;
      reasons.push('Chauffeur fresh on shift (0 trips completed today)');
    } else if (tripsToday <= 2) {
      score += 6;
      reasons.push(`Balanced workload (${tripsToday} trips today)`);
    } else {
      score += 2;
    }

    const finalScore = Math.max(30, Math.min(99, score));

    return {
      driverId: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleModel: driver.vehicleModel,
      vehicleNumber: driver.vehicleNumber,
      fleetTier: driver.fleetTier,
      rating,
      acceptanceRate,
      distanceKm: distToPickupKm,
      etaMinutes: etaMins,
      suitabilityScore: finalScore,
      badge: finalScore >= 88 ? 'Prime Match' : (finalScore >= 75 ? 'Recommended' : 'Available'),
      reasons,
      rawDriver: driver
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Smart Auto-Dispatch: Evaluates booking and assigns the optimal chauffeur
 */
function autoDispatchBooking(db, bookingId, { actor = 'AutoDispatchEngine', timeoutSec = 60 } = {}) {
  const booking = (db.bookings || []).find(b => b.bookingId === bookingId || b.id === bookingId);
  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found.` };
  }

  const eligibleDrivers = findEligibleDrivers(db, booking);
  if (!eligibleDrivers.length) {
    return {
      success: false,
      noDrivers: true,
      error: `No online/available chauffeurs found for category ${booking.fleetClass || booking.cabTier || 'sedan'} in ${booking.originCity}.`
    };
  }

  const ranked = rankDrivers(eligibleDrivers, booking);
  const bestMatch = ranked[0];

  // Record dispatch offer details
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSec * 1000).toISOString();

  booking.assignedDriverId = bestMatch.driverId;
  booking.driverDetails = {
    id: bestMatch.driverId,
    name: bestMatch.name,
    phone: bestMatch.phone,
    vehicleNumber: bestMatch.vehicleNumber,
    vehicleModel: bestMatch.vehicleModel,
    rating: bestMatch.rating
  };
  booking.dispatchOffer = {
    driverId: bestMatch.driverId,
    offeredAt: now.toISOString(),
    expiresAt,
    suitabilityScore: bestMatch.suitabilityScore,
    etaMinutes: bestMatch.etaMinutes,
    status: 'OFFERED',
    reasons: bestMatch.reasons
  };
  booking.dispatchRanking = ranked.map(r => ({
    driverId: r.driverId,
    name: r.name,
    score: r.suitabilityScore,
    etaMinutes: r.etaMinutes,
    reasons: r.reasons
  }));

  // Update status history
  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    status: 'DRIVER_ASSIGNED',
    timestamp: now.toISOString(),
    actor: String(actor),
    note: `Smart Dispatch matched Chauffeur ${bestMatch.name} (${bestMatch.vehicleNumber}) with score ${bestMatch.suitabilityScore}%: ${bestMatch.reasons.join(', ')}`
  });

  booking.bookingStatus = 'DRIVER_ASSIGNED';
  booking.status = 'DRIVER_ASSIGNED';
  booking.updatedAt = now.toISOString();

  return {
    success: true,
    matchedDriver: bestMatch,
    rankedCandidates: ranked,
    booking
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BROADCAST DISPATCH ENGINE
// First-Come, First-Served with atomic claim locking
// ─────────────────────────────────────────────────────────────────────────────

const BROADCAST_TIMEOUT_SEC = 120; // 2 minutes before escalation

/**
 * Format a pickup date/time string into DD-MMM-YYYY | hh:mm A
 */
function formatPickupDateTime(pickupDate, pickupTime) {
  try {
    let dateObj;
    if (pickupDate && pickupTime) {
      const normalised = String(pickupDate).length === 10 ? pickupDate : new Date(pickupDate).toISOString().slice(0, 10);
      dateObj = new Date(normalised + 'T' + pickupTime + ':00');
    } else if (pickupDate) {
      dateObj = new Date(pickupDate);
    } else {
      return '';
    }
    if (isNaN(dateObj.getTime())) return String(pickupDate || '');
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const dd   = String(dateObj.getDate()).padStart(2, '0');
    const mon  = MONTHS[dateObj.getMonth()];
    const yyyy = dateObj.getFullYear();
    const hh   = dateObj.getHours() % 12 || 12;
    const mm   = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = dateObj.getHours() < 12 ? 'AM' : 'PM';
    return dd + '-' + mon + '-' + yyyy + ' | ' + hh + ':' + mm + ' ' + ampm;
  } catch (e) {
    return String(pickupDate || '');
  }
}

/**
 * Build a rich trip card object for Driver offer displays
 */
function buildTripOfferCard(booking, driverId) {
  const formattedPickup = formatPickupDateTime(booking.pickupDate, booking.pickupTime);
  const fare = Number(booking.totalFare || booking.fare || 0);
  const commission = Number(booking.platformCommission || 0);
  const driverNet = commission > 0 ? fare - commission : Math.round(fare * 0.85);

  return {
    bookingId: booking.bookingId || booking.id,
    pnr: booking.pnrCode || booking.pnr || booking.bookingId,
    pickupDateTimeFormatted: formattedPickup,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    pickupLocation: booking.pickupAddress || booking.originCity || 'Origin',
    dropLocation: booking.dropAddress || booking.destCity || 'Destination',
    originCity: booking.originCity,
    destCity: booking.destCity,
    totalFare: fare,
    driverNetEarnings: driverNet,
    platformCommission: fare - driverNet,
    tripType: booking.tripType || 'oneway',
    cabTier: booking.cabTier || booking.fleetClass || 'sedan',
    passengerName: booking.passengerName || booking.customerName || '',
    dispatchStatus: booking.dispatchStatus,
    broadcastStartedAt: booking.broadcastStartedAt,
    broadcastTimeoutSec: booking.broadcastTimeoutSec || BROADCAST_TIMEOUT_SEC,
    candidateCount: (booking.broadcastCandidates || []).length,
    alreadyRejected: (booking.rejectedDrivers || []).includes(driverId),
    source: booking.source || booking.bookingSource || (booking.isApp ? 'Mobile App' : 'Website'),
    channel: booking.channel || (booking.isApp || (booking.source && String(booking.source).toLowerCase().includes('app')) ? 'Mobile App' : 'Website Portal'),
    isApp: Boolean(booking.isApp || (booking.source && String(booking.source).toLowerCase().includes('app')) || (booking.channel && String(booking.channel).toLowerCase().includes('app')))
  };
}

/**
 * broadcastBooking() — Mark booking as BROADCASTING and record all eligible driver IDs.
 * Does NOT mutate DB directly — caller must saveDb() after this returns.
 */
function broadcastBooking(db, bookingOrId) {
  const booking = typeof bookingOrId === 'string'
    ? (db.bookings || []).find(function(b) { return b.bookingId === bookingOrId || b.id === bookingOrId; })
    : bookingOrId;

  if (!booking) {
    return { success: false, error: 'Booking not found for broadcast.' };
  }

  if (booking.dispatchStatus === 'ASSIGNED' || booking.bookingStatus === 'DRIVER_ASSIGNED' || booking.bookingStatus === 'DRIVER ASSIGNED') {
    return { success: false, error: 'Booking already assigned; broadcast skipped.' };
  }

  const eligible = findEligibleDrivers(db, booking);
  const candidateIds = eligible.map(function(d) { return d.id; });

  booking.dispatchStatus = 'BROADCASTING';
  booking.broadcastCandidates = candidateIds;
  booking.broadcastStartedAt = new Date().toISOString();
  booking.broadcastTimeoutSec = BROADCAST_TIMEOUT_SEC;
  booking.broadcastClaimedBy = null;
  if (!booking.rejectedDrivers) booking.rejectedDrivers = [];

  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    status: 'BROADCASTING',
    timestamp: booking.broadcastStartedAt,
    actor: 'BroadcastEngine',
    note: 'Broadcast sent to ' + candidateIds.length + ' eligible chauffeur(s).'
  });

  return {
    success: true,
    candidateCount: candidateIds.length,
    candidateIds: candidateIds,
    booking: booking
  };
}

/**
 * claimBookingAtomic() — Attempt atomic claim of a BROADCASTING booking.
 * Only the first caller succeeds. Caller must saveDb() after this.
 */
function claimBookingAtomic(db, bookingId, driverId) {
  const booking = (db.bookings || []).find(function(b) { return b.bookingId === bookingId || b.id === bookingId; });
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  if (booking.dispatchStatus === 'ASSIGNED' || booking.broadcastClaimedBy) {
    return {
      success: false,
      alreadyClaimed: true,
      claimedBy: booking.broadcastClaimedBy,
      message: 'Trip accepted by another driver.'
    };
  }

  if (booking.dispatchStatus !== 'BROADCASTING') {
    return {
      success: false,
      error: 'Booking is not in BROADCASTING state (current: ' + booking.dispatchStatus + ').'
    };
  }

  if (booking.broadcastCandidates && booking.broadcastCandidates.length > 0) {
    if (!booking.broadcastCandidates.includes(driverId)) {
      return { success: false, error: 'You are not in the broadcast list for this booking.' };
    }
  }

  const driver = (db.drivers || []).find(function(d) { return d.id === driverId || d.phone === driverId; });
  if (!driver) {
    return { success: false, error: 'Driver record not found.' };
  }

  const now = new Date().toISOString();

  booking.dispatchStatus = 'ASSIGNED';
  booking.broadcastClaimedBy = driverId;
  booking.assignedDriverId = driver.id;
  booking.assignedDriverName = driver.name;
  booking.assignedDriverPhone = driver.phone;
  booking.assignedDriverCarNo = driver.vehicleNumber || driver.carNumber || '';
  booking.driverDetails = {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    vehicleNumber: driver.vehicleNumber || driver.carNumber || '',
    vehicleModel: driver.vehicleModel || '',
    rating: driver.rating || 4.8,
    photo: driver.photo || driver.photoUrl || ''
  };
  booking.bookingStatus = 'DRIVER ASSIGNED';
  booking.status = 'DRIVER ASSIGNED';
  booking.dispatchOffer = {
    driverId: driverId,
    offeredAt: booking.broadcastStartedAt,
    acceptedAt: now,
    status: 'ACCEPTED'
  };
  booking.updatedAt = now;

  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    status: 'DRIVER ASSIGNED',
    timestamp: now,
    actor: driver.name || driverId,
    note: 'Driver ' + (driver.name || driverId) + ' (' + (driver.vehicleNumber || '') + ') claimed via broadcast.'
  });

  return {
    success: true,
    booking: booking,
    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleNumber: driver.vehicleNumber || '',
      vehicleModel: driver.vehicleModel || '',
      rating: driver.rating || 4.8
    }
  };
}

/**
 * checkBroadcastTimeouts() — Scans BROADCASTING bookings and escalates timed-out ones.
 */
function checkBroadcastTimeouts(db) {
  var escalated = [];
  var now = Date.now();
  (db.bookings || []).forEach(function(booking) {
    if (booking.dispatchStatus !== 'BROADCASTING') return;
    if (!booking.broadcastStartedAt) return;
    var timeoutMs = (booking.broadcastTimeoutSec || BROADCAST_TIMEOUT_SEC) * 1000;
    var startedMs = new Date(booking.broadcastStartedAt).getTime();
    if (now - startedMs >= timeoutMs) {
      booking.dispatchStatus = 'ESCALATED_TO_ADMIN';
      booking.bookingStatus = 'PENDING_ADMIN_DISPATCH';
      booking.escalatedAt = new Date().toISOString();
      booking.escalationReason = 'Broadcast timed out after ' + (booking.broadcastTimeoutSec || BROADCAST_TIMEOUT_SEC) + 's with no driver claiming.';

      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: 'ESCALATED_TO_ADMIN',
        timestamp: booking.escalatedAt,
        actor: 'BroadcastTimeoutWatcher',
        note: booking.escalationReason
      });

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: 'NOTIF_ESC_' + Date.now() + '_' + booking.bookingId,
        type: 'BROADCAST_TIMEOUT_ESCALATION',
        priority: 'URGENT',
        title: 'BROADCAST TIMEOUT: Booking ' + booking.bookingId,
        message: 'Booking ' + booking.originCity + ' to ' + booking.destCity + ' broadcast expired. No driver accepted. Immediate manual dispatch required.',
        bookingId: booking.bookingId,
        createdAt: booking.escalatedAt
      });

      escalated.push(booking.bookingId);
    }
  });
  return escalated;
}

module.exports = {
  BIHAR_COORDS,
  resolveCityCoords,
  getHaversineDistanceKm,
  findEligibleDrivers,
  rankDrivers,
  autoDispatchBooking,
  broadcastBooking,
  claimBookingAtomic,
  checkBroadcastTimeouts,
  buildTripOfferCard,
  formatPickupDateTime,
  BROADCAST_TIMEOUT_SEC
};
