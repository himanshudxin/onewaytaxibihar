/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Enterprise Booking State Machine & Transaction Safety Engine
 * 
 * Implements strict lifecycle state transitions:
 * CREATED
 *  → PAYMENT_PENDING
 *  → PAYMENT_PROCESSING
 *  → PAYMENT_SUCCESS
 *  → CONFIRMED
 *  → DRIVER_ASSIGNED
 *  → DRIVER_ACCEPTED
 *  → DRIVER_ARRIVING
 *  → DRIVER_ARRIVED
 *  → TRIP_STARTED
 *  → TRIP_COMPLETED
 * 
 * Alternative Terminal/Branch States:
 * PAYMENT_FAILED, CANCELLED, EXPIRED, NO_DRIVER_AVAILABLE, REFUNDED
 */

const crypto = require('crypto');

const BOOKING_STATES = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  CONFIRMED: 'CONFIRMED',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',
  DRIVER_ARRIVING: 'DRIVER_ARRIVING',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  TRIP_STARTED: 'TRIP_STARTED',
  TRIP_COMPLETED: 'TRIP_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  NO_DRIVER_AVAILABLE: 'NO_DRIVER_AVAILABLE',
  REFUNDED: 'REFUNDED'
};

// Aliases mapping older database / frontend status strings to standardized state machine tokens
const STATUS_ALIASES = {
  'NEW': BOOKING_STATES.CREATED,
  'REQUESTED': BOOKING_STATES.CREATED,
  'PENDING': BOOKING_STATES.CREATED,
  'CONFIRMED': BOOKING_STATES.CONFIRMED,
  'CONTACTED': BOOKING_STATES.CONFIRMED,
  'DRIVER ASSIGNED': BOOKING_STATES.DRIVER_ASSIGNED,
  'ASSIGNED': BOOKING_STATES.DRIVER_ASSIGNED,
  'ACCEPTED': BOOKING_STATES.DRIVER_ACCEPTED,
  'DRIVER_ACCEPTED': BOOKING_STATES.DRIVER_ACCEPTED,
  'ON THE WAY': BOOKING_STATES.DRIVER_ARRIVING,
  'ON_THE_WAY': BOOKING_STATES.DRIVER_ARRIVING,
  'DRIVER ON THE WAY': BOOKING_STATES.DRIVER_ARRIVING,
  'ARRIVED': BOOKING_STATES.DRIVER_ARRIVED,
  'DRIVER_ARRIVED': BOOKING_STATES.DRIVER_ARRIVED,
  'TRIP STARTED': BOOKING_STATES.TRIP_STARTED,
  'STARTED': BOOKING_STATES.TRIP_STARTED,
  'COMPLETED': BOOKING_STATES.TRIP_COMPLETED,
  'FINISHED': BOOKING_STATES.TRIP_COMPLETED,
  'CANCELLED': BOOKING_STATES.CANCELLED,
  'CANCELED': BOOKING_STATES.CANCELLED,
  'EXPIRED': BOOKING_STATES.EXPIRED,
  'REFUNDED': BOOKING_STATES.REFUNDED,
  'NO_DRIVER': BOOKING_STATES.NO_DRIVER_AVAILABLE,
  'PENDING_REASSIGNMENT': BOOKING_STATES.NO_DRIVER_AVAILABLE
};

function normalizeStatus(status) {
  if (!status) return BOOKING_STATES.CREATED;
  const upper = String(status).trim().toUpperCase();
  return STATUS_ALIASES[upper] || upper;
}

// Strict Valid Transition Table
const ALLOWED_TRANSITIONS = {
  [BOOKING_STATES.CREATED]: [
    BOOKING_STATES.PAYMENT_PENDING,
    BOOKING_STATES.PAYMENT_PROCESSING,
    BOOKING_STATES.PAYMENT_SUCCESS,
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.EXPIRED
  ],
  [BOOKING_STATES.PAYMENT_PENDING]: [
    BOOKING_STATES.PAYMENT_PROCESSING,
    BOOKING_STATES.PAYMENT_SUCCESS,
    BOOKING_STATES.PAYMENT_FAILED,
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.EXPIRED
  ],
  [BOOKING_STATES.PAYMENT_PROCESSING]: [
    BOOKING_STATES.PAYMENT_SUCCESS,
    BOOKING_STATES.PAYMENT_FAILED,
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.PAYMENT_SUCCESS]: [
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.DRIVER_ASSIGNED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.REFUNDED
  ],
  [BOOKING_STATES.CONFIRMED]: [
    BOOKING_STATES.DRIVER_ASSIGNED,
    BOOKING_STATES.NO_DRIVER_AVAILABLE,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.REFUNDED
  ],
  [BOOKING_STATES.DRIVER_ASSIGNED]: [
    BOOKING_STATES.DRIVER_ACCEPTED,
    BOOKING_STATES.CONFIRMED, // When driver rejects/reassigned
    BOOKING_STATES.NO_DRIVER_AVAILABLE,
    BOOKING_STATES.DRIVER_ARRIVING, // Direct advance
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.DRIVER_ACCEPTED]: [
    BOOKING_STATES.DRIVER_ARRIVING,
    BOOKING_STATES.CONFIRMED, // When driver cancels/reassign
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.DRIVER_ARRIVING]: [
    BOOKING_STATES.DRIVER_ARRIVED,
    BOOKING_STATES.CONFIRMED, // Chauffeur breakdown/reassign
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.DRIVER_ARRIVED]: [
    BOOKING_STATES.TRIP_STARTED,
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.TRIP_STARTED]: [
    BOOKING_STATES.TRIP_COMPLETED,
    BOOKING_STATES.CANCELLED // Emergency abort
  ],
  [BOOKING_STATES.TRIP_COMPLETED]: [
    // Terminal state - allows refund in dispute resolution
    BOOKING_STATES.REFUNDED
  ],
  [BOOKING_STATES.PAYMENT_FAILED]: [
    BOOKING_STATES.PAYMENT_PENDING,
    BOOKING_STATES.PAYMENT_PROCESSING,
    BOOKING_STATES.CONFIRMED, // Fallback to Cash on Ride
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.NO_DRIVER_AVAILABLE]: [
    BOOKING_STATES.DRIVER_ASSIGNED, // Later manual/automatic match
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.REFUNDED
  ],
  [BOOKING_STATES.CANCELLED]: [
    BOOKING_STATES.REFUNDED
  ],
  [BOOKING_STATES.EXPIRED]: [
    BOOKING_STATES.CONFIRMED // Resurrected by operator
  ],
  [BOOKING_STATES.REFUNDED]: []
};

function canTransition(currentStatus, nextStatus, isOperatorOverride = false) {
  if (isOperatorOverride) return true;
  const from = normalizeStatus(currentStatus);
  const to = normalizeStatus(nextStatus);
  if (from === to) return true;
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

/**
 * Executes a transaction-safe state transition with complete audit trail
 */
function transitionBookingState(booking, nextStatus, { actor = 'System', note = '', isOperatorOverride = false } = {}) {
  const current = normalizeStatus(booking.bookingStatus || booking.status);
  const target = normalizeStatus(nextStatus);

  if (!canTransition(current, target, isOperatorOverride)) {
    return {
      success: false,
      error: `Invalid lifecycle transition: Cannot transition booking from ${current} to ${target}.`
    };
  }

  const previousStatus = current;
  booking.bookingStatus = target;
  booking.status = target;
  booking.updatedAt = new Date().toISOString();

  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    from: previousStatus,
    status: target,
    timestamp: new Date().toISOString(),
    actor: String(actor || 'System'),
    note: String(note || `Status progressed to ${target}`)
  });

  return {
    success: true,
    previousStatus,
    newStatus: target,
    booking
  };
}

/**
 * Checks for concurrent duplicate booking requests within a sliding time window
 */
function checkDuplicateBooking(db, { cleanPhone, originCity, destCity, pickupDate, windowMs = 120000 }) {
  if (!cleanPhone) return null;
  const now = Date.now();
  const phone = String(cleanPhone).replace(/\D/g, '').slice(-10);

  return (db.bookings || []).find(b => {
    const bPhone = (b.passengerPhone || '').replace(/\D/g, '').slice(-10);
    if (bPhone !== phone) return false;
    if (b.originCity !== originCity || b.destCity !== destCity) return false;
    if (b.pickupDate !== pickupDate) return false;
    const createdAtTime = new Date(b.createdAt || 0).getTime();
    if (now - createdAtTime < windowMs) {
      const activeStates = ['CREATED', 'CONFIRMED', 'NEW', 'PAYMENT_PENDING'];
      return activeStates.includes(b.bookingStatus || b.status);
    }
    return false;
  });
}

module.exports = {
  BOOKING_STATES,
  STATUS_ALIASES,
  normalizeStatus,
  canTransition,
  transitionBookingState,
  checkDuplicateBooking
};
