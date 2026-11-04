/**
 * tests/broadcast-dispatch.test.js
 * Broadcast Dispatch System Test Suite
 * Tests: atomic claim, offer list, timeout escalation, reject-broadcast, format helpers
 * Run: node --test tests/broadcast-dispatch.test.js
 */
const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');

// ── Load dispatch service ──────────────────────────────────────────────────────
const dispatch = require('../services/dispatch.js');

// ── Mock DB factory ────────────────────────────────────────────────────────────
function makeMockDb() {
  return {
    bookings: [],
    drivers: [
      {
        id: 'drv_001',
        name: 'Ravi Kumar',
        phone: '9123456780',
        status: 'active',
        dutyStatus: 'ONLINE',
        isAvailable: true,
        fleetTier: 'sedan',
        vehicleNumber: 'BR01AB1234',
        vehicleModel: 'Dzire',
        rating: 4.9,
        acceptanceRate: 97,
        city: 'Patna',
        verificationStatus: 'VERIFIED',
        isDeleted: false
      },
      {
        id: 'drv_002',
        name: 'Suresh Singh',
        phone: '9123456781',
        status: 'active',
        dutyStatus: 'ONLINE',
        isAvailable: true,
        fleetTier: 'sedan',
        vehicleNumber: 'BR01CD5678',
        vehicleModel: 'Etios',
        rating: 4.7,
        acceptanceRate: 90,
        city: 'Patna',
        verificationStatus: 'VERIFIED',
        isDeleted: false
      },
      {
        id: 'drv_003',
        name: 'Amit Gupta',
        phone: '9123456782',
        status: 'suspended',
        dutyStatus: 'OFFLINE',
        fleetTier: 'sedan',
        vehicleNumber: 'BR01EF9012',
        isDeleted: false
      }
    ],
    notifications: [],
    wallet_ledger: []
  };
}

function makeMockBooking(overrides = {}) {
  return {
    bookingId: 'BK_TEST_' + Date.now(),
    passengerName: 'Test Passenger',
    passengerPhone: '9876543210',
    originCity: 'Patna',
    destCity: 'Gaya',
    pickupDate: '2026-11-12',
    pickupTime: '06:30',
    cabTier: 'sedan',
    fleetClass: 'sedan',
    totalFare: 2200,
    bookingStatus: 'BOOKING_CREATED',
    dispatchStatus: null,
    statusHistory: [],
    rejectedDrivers: [],
    ...overrides
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — formatPickupDateTime', () => {
  test('formats valid date and time correctly', () => {
    const result = dispatch.formatPickupDateTime('2026-11-12', '06:30');
    assert.ok(result.includes('12-NOV-2026'), 'Should contain 12-NOV-2026');
    assert.ok(result.includes('6:30 AM'), 'Should contain 6:30 AM');
  });

  test('handles missing time gracefully', () => {
    const result = dispatch.formatPickupDateTime('2026-11-12', undefined);
    assert.ok(typeof result === 'string');
  });

  test('returns empty string for null date', () => {
    const result = dispatch.formatPickupDateTime(null, null);
    assert.equal(result, '');
  });

  test('handles PM times correctly', () => {
    const result = dispatch.formatPickupDateTime('2026-11-12', '18:00');
    assert.ok(result.includes('PM'), 'Should contain PM for 6:00 PM');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — broadcastBooking()', () => {
  test('marks booking as BROADCASTING with eligible drivers', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    db.bookings.push(booking);

    const result = dispatch.broadcastBooking(db, booking);
    assert.ok(result.success, 'broadcastBooking should succeed');
    assert.equal(booking.dispatchStatus, 'BROADCASTING');
    assert.ok(Array.isArray(booking.broadcastCandidates));
    // drv_001 and drv_002 are online+sedan, drv_003 is suspended
    assert.ok(booking.broadcastCandidates.length >= 1, 'Should have at least 1 candidate');
    assert.ok(!booking.broadcastCandidates.includes('drv_003'), 'Suspended driver should not be candidate');
    assert.ok(booking.broadcastStartedAt, 'broadcastStartedAt should be set');
  });

  test('skips broadcasting for already-assigned bookings', () => {
    const db = makeMockDb();
    const booking = makeMockBooking({ dispatchStatus: 'ASSIGNED', bookingStatus: 'DRIVER ASSIGNED' });
    db.bookings.push(booking);

    const result = dispatch.broadcastBooking(db, booking);
    assert.ok(!result.success, 'Should fail for already-assigned booking');
    assert.ok(result.error.includes('already assigned'));
  });

  test('returns candidate count and IDs', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    const result = dispatch.broadcastBooking(db, booking);
    assert.ok(result.success);
    assert.equal(result.candidateCount, result.candidateIds.length);
  });

  test('adds status history entry', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    dispatch.broadcastBooking(db, booking);
    const broadcastEntry = booking.statusHistory.find(h => h.status === 'BROADCASTING');
    assert.ok(broadcastEntry, 'Should add BROADCASTING to statusHistory');
    assert.equal(broadcastEntry.actor, 'BroadcastEngine');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — claimBookingAtomic()', () => {
  test('first driver to claim succeeds', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    db.bookings.push(booking);
    dispatch.broadcastBooking(db, booking);

    const result = dispatch.claimBookingAtomic(db, booking.bookingId, 'drv_001');
    assert.ok(result.success, 'First claim should succeed');
    assert.equal(booking.dispatchStatus, 'ASSIGNED');
    assert.equal(booking.assignedDriverId, 'drv_001');
    assert.equal(booking.broadcastClaimedBy, 'drv_001');
    assert.equal(booking.bookingStatus, 'DRIVER ASSIGNED');
  });

  test('second driver claim returns 409-equivalent alreadyClaimed', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    db.bookings.push(booking);
    dispatch.broadcastBooking(db, booking);

    const first = dispatch.claimBookingAtomic(db, booking.bookingId, 'drv_001');
    assert.ok(first.success, 'First claim should succeed');

    const second = dispatch.claimBookingAtomic(db, booking.bookingId, 'drv_002');
    assert.ok(!second.success, 'Second claim should fail');
    assert.ok(second.alreadyClaimed, 'alreadyClaimed flag should be true');
    assert.equal(second.message, 'Trip accepted by another driver.');
  });

  test('claim fails for non-candidate driver', () => {
    const db = makeMockDb();
    const booking = makeMockBooking({ broadcastCandidates: ['drv_001'] });
    booking.dispatchStatus = 'BROADCASTING';
    db.bookings.push(booking);

    const result = dispatch.claimBookingAtomic(db, booking.bookingId, 'drv_002');
    assert.ok(!result.success, 'Non-candidate should be rejected');
  });

  test('sets driverDetails correctly on claim', () => {
    const db = makeMockDb();
    const booking = makeMockBooking();
    db.bookings.push(booking);
    dispatch.broadcastBooking(db, booking);

    dispatch.claimBookingAtomic(db, booking.bookingId, 'drv_001');
    assert.ok(booking.driverDetails, 'driverDetails should be set');
    assert.equal(booking.driverDetails.name, 'Ravi Kumar');
    assert.equal(booking.driverDetails.vehicleNumber, 'BR01AB1234');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — checkBroadcastTimeouts()', () => {
  test('escalates timed-out BROADCASTING bookings', () => {
    const db = makeMockDb();
    const booking = makeMockBooking({
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 200000).toISOString(), // 200s ago
      broadcastTimeoutSec: 120
    });
    db.bookings.push(booking);

    const escalated = dispatch.checkBroadcastTimeouts(db);
    assert.ok(escalated.includes(booking.bookingId), 'Should escalate timed-out booking');
    assert.equal(booking.dispatchStatus, 'ESCALATED_TO_ADMIN');
    assert.equal(booking.bookingStatus, 'PENDING_ADMIN_DISPATCH');
    assert.ok(booking.escalationReason.includes('timed out'));
  });

  test('does NOT escalate recently started broadcasts', () => {
    const db = makeMockDb();
    const booking = makeMockBooking({
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date().toISOString(), // just now
      broadcastTimeoutSec: 120
    });
    db.bookings.push(booking);

    const escalated = dispatch.checkBroadcastTimeouts(db);
    assert.ok(!escalated.includes(booking.bookingId), 'Should NOT escalate fresh broadcast');
    assert.equal(booking.dispatchStatus, 'BROADCASTING', 'Status should remain BROADCASTING');
  });

  test('creates admin notification on escalation', () => {
    const db = makeMockDb();
    const booking = makeMockBooking({
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 200000).toISOString(),
      broadcastTimeoutSec: 120
    });
    db.bookings.push(booking);

    dispatch.checkBroadcastTimeouts(db);
    assert.ok(db.notifications.length > 0, 'Should create admin notification');
    assert.equal(db.notifications[0].type, 'BROADCAST_TIMEOUT_ESCALATION');
    assert.equal(db.notifications[0].priority, 'URGENT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — buildTripOfferCard()', () => {
  test('builds correct offer card structure', () => {
    const booking = makeMockBooking();
    const card = dispatch.buildTripOfferCard(booking, 'drv_001');
    assert.ok(card.bookingId, 'Should have bookingId');
    assert.ok(typeof card.totalFare === 'number');
    assert.ok(typeof card.driverNetEarnings === 'number');
    assert.ok(card.driverNetEarnings <= card.totalFare, 'Net earnings <= total fare');
    assert.ok(typeof card.pickupDateTimeFormatted === 'string');
  });

  test('correctly identifies rejected status for driver', () => {
    const booking = makeMockBooking({ rejectedDrivers: ['drv_001'] });
    const card = dispatch.buildTripOfferCard(booking, 'drv_001');
    assert.ok(card.alreadyRejected, 'alreadyRejected should be true');
  });

  test('includes formatted pickup datetime', () => {
    const booking = makeMockBooking({ pickupDate: '2026-11-12', pickupTime: '06:30' });
    const card = dispatch.buildTripOfferCard(booking, 'drv_001');
    assert.ok(card.pickupDateTimeFormatted.includes('NOV'), 'Should contain month abbreviation');
    assert.ok(card.pickupDateTimeFormatted.includes('2026'), 'Should contain year');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Broadcast Dispatch — BROADCAST_TIMEOUT_SEC export', () => {
  test('exports BROADCAST_TIMEOUT_SEC constant', () => {
    assert.ok(typeof dispatch.BROADCAST_TIMEOUT_SEC === 'number');
    assert.ok(dispatch.BROADCAST_TIMEOUT_SEC > 0);
  });
});

