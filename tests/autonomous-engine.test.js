/**
 * autonomous-engine.test.js
 * Comprehensive unit test suite for the 6 hidden autonomous backend features.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const autoEngine = require('../services/autonomousEngine.js');
const dispatch = require('../services/dispatch.js');

function createMockDb() {
  return {
    bookings: [],
    drivers: [
      {
        id: 'drv_patna_1',
        name: 'Ramesh Singh',
        phone: '9876500001',
        vehicleModel: 'Maruti Dzire',
        vehicleNumber: 'BR01AB1111',
        fleetTier: 'sedan',
        city: 'Patna',
        operatingArea: 'Patna',
        currentLat: 25.5941,
        currentLng: 85.1376,
        dutyStatus: 'ON_DUTY',
        status: 'approved',
        isAvailable: true,
        rating: 4.9,
        acceptanceRate: 98,
        walletBalance: 500,
        tripsToday: 1
      },
      {
        id: 'drv_jehanabad_1',
        name: 'Sunil Kumar',
        phone: '9876500002',
        vehicleModel: 'Hyundai Aura',
        vehicleNumber: 'BR02CD2222',
        fleetTier: 'sedan',
        city: 'Jehanabad',
        operatingArea: 'Jehanabad',
        currentLat: 25.2132,
        currentLng: 84.9863,
        dutyStatus: 'ON_DUTY',
        status: 'approved',
        isAvailable: true,
        rating: 4.85,
        acceptanceRate: 95,
        walletBalance: 300,
        tripsToday: 0
      },
      {
        id: 'drv_gaya_1',
        name: 'Mahesh Yadav',
        phone: '9876500003',
        vehicleModel: 'Honda Amaze',
        vehicleNumber: 'BR03EF3333',
        fleetTier: 'sedan',
        city: 'Gaya',
        operatingArea: 'Gaya',
        currentLat: 24.7914,
        currentLng: 85.0002,
        dutyStatus: 'ON_DUTY',
        status: 'approved',
        isAvailable: true,
        rating: 4.8,
        acceptanceRate: 94,
        walletBalance: 400,
        tripsToday: 0
      }
    ],
    notifications: [],
    audit_logs: []
  };
}

describe('Autonomous Engine — Feature 1: Adaptive Broadcast Radius Expansion', () => {
  test('does not expand radius if broadcast is recent (< 45s)', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-1',
      originCity: 'Gaya',
      destCity: 'Patna',
      cabTier: 'sedan',
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 20 * 1000).toISOString(), // 20s ago
      broadcastCandidates: ['drv_gaya_1'],
      radiusExpanded: false
    };
    db.bookings.push(booking);

    const expanded = autoEngine.expandBroadcastRadius(db, booking);
    assert.equal(expanded, false);
    assert.equal(booking.radiusExpanded, false);
  });

  test('autonomously expands radius to adjacent districts (Jehanabad/Patna) after 45s', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-2',
      originCity: 'Gaya',
      destCity: 'Patna',
      cabTier: 'sedan',
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 55 * 1000).toISOString(), // 55s ago
      broadcastCandidates: ['drv_gaya_1'],
      radiusExpanded: false
    };
    db.bookings.push(booking);

    const expanded = autoEngine.expandBroadcastRadius(db, booking);
    assert.equal(expanded, true);
    assert.equal(booking.radiusExpanded, true);
    // Should now include Jehanabad and Patna drivers
    assert.ok(booking.broadcastCandidates.includes('drv_jehanabad_1'));
    assert.ok(booking.broadcastCandidates.includes('drv_patna_1'));
    assert.ok(booking.broadcastTimeoutSec >= 180, 'Timeout extended for regional drivers');
  });
});

describe('Autonomous Engine — Feature 2: Guaranteed Auto-Allotment Fallback', () => {
  test('does not auto-allot before threshold (< 90s)', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-3',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 70 * 1000).toISOString(), // 70s ago
      broadcastCandidates: ['drv_patna_1']
    };
    db.bookings.push(booking);

    const allotted = autoEngine.autoAllotFallback(db, booking);
    assert.equal(allotted, false);
    assert.equal(booking.assignedDriverId, undefined);
  });

  test('autonomously matches & assigns #1 scored driver after 90s without manual click', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-4',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 95 * 1000).toISOString(), // 95s ago
      broadcastCandidates: ['drv_patna_1']
    };
    db.bookings.push(booking);

    const allotted = autoEngine.autoAllotFallback(db, booking);
    assert.equal(allotted, true);
    assert.equal(booking.dispatchStatus, 'ASSIGNED');
    assert.equal(booking.bookingStatus, 'DRIVER ASSIGNED');
    assert.equal(booking.assignedDriverId, 'drv_patna_1');
    assert.equal(booking.autoDispatched, true);
    assert.ok(booking.driverDetails);
    assert.equal(booking.driverDetails.name, 'Ramesh Singh');
  });
});

describe('Autonomous Engine — Feature 3: Driver Ghosting Sentinel', () => {
  test('detects inactive ghost chauffeur after 15m and auto-rebroadcasts', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-5',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      bookingStatus: 'DRIVER ASSIGNED',
      status: 'DRIVER ASSIGNED',
      assignedDriverId: 'drv_patna_1',
      assignedDriverName: 'Ramesh Singh',
      autoDispatchedAt: new Date(Date.now() - 1000 * 1000).toISOString(), // ~16.6m ago
      broadcastCandidates: ['drv_patna_1'],
      rejectedDrivers: []
    };
    db.bookings.push(booking);

    const ghosted = autoEngine.checkDriverGhosting(db, booking);
    assert.equal(ghosted, true);
    // Ghost driver must be unassigned
    assert.equal(booking.assignedDriverId, null);
    // Booking must be restored to BROADCASTING
    assert.equal(booking.dispatchStatus, 'BROADCASTING');
    assert.equal(booking.priority, 'HIGH_URGENT_REASSIGNMENT');
    // Ghost driver must be added to rejectedDrivers and marked OFFLINE
    assert.ok(booking.rejectedDrivers.includes('drv_patna_1'));
    const ghostDrv = db.drivers.find(d => d.id === 'drv_patna_1');
    assert.equal(ghostDrv.dutyStatus, 'OFFLINE');
  });
});

describe('Autonomous Engine — Feature 4: Driver Cancellation Self-Healing', () => {
  test('when chauffeur cancels, autonomously heals booking and immediately re-broadcasts to remaining fleet', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-6',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      bookingStatus: 'DRIVER ASSIGNED',
      status: 'DRIVER ASSIGNED',
      assignedDriverId: 'drv_patna_1',
      assignedDriverName: 'Ramesh Singh',
      broadcastCandidates: ['drv_patna_1'],
      rejectedDrivers: []
    };
    db.bookings.push(booking);

    const result = autoEngine.handleAutonomousDriverCancellation(db, booking.bookingId, 'drv_patna_1', 'Punctured tire');
    assert.equal(result.success, true);
    assert.equal(booking.assignedDriverId, null);
    assert.equal(booking.dispatchStatus, 'BROADCASTING');
    assert.equal(booking.bookingStatus, 'SEARCHING_DRIVER');
    assert.ok(booking.rejectedDrivers.includes('drv_patna_1'));
  });
});

describe('Autonomous Engine — Feature 5: Drop Arrival Geofence Auto-Settlement Safeguard', () => {
  test('autonomously completes trip & credits driver wallet if transit finished and idle > 20m', () => {
    const db = createMockDb();
    const booking = {
      bookingId: 'OTB-TEST-7',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      bookingStatus: 'IN_TRANSIT',
      status: 'IN_TRANSIT',
      assignedDriverId: 'drv_gaya_1',
      totalFare: 2000,
      estimatedDurationMinutes: 100, // 100m
      tripStartedAt: new Date(Date.now() - (100 * 60 + 1300) * 1000).toISOString() // 100m + 21.6m ago
    };
    db.bookings.push(booking);

    const initialWallet = db.drivers.find(d => d.id === 'drv_gaya_1').walletBalance; // 400
    const settled = autoEngine.autoSettleCompletedTransit(db, booking);
    assert.equal(settled, true);
    assert.equal(booking.bookingStatus, 'COMPLETED');
    assert.equal(booking.autoCompleted, true);
    assert.equal(booking.payoutSettlement.netDriverPayout, 1700); // 85% of 2000
    // Driver wallet must be credited
    const driver = db.drivers.find(d => d.id === 'drv_gaya_1');
    assert.equal(driver.walletBalance, initialWallet + 1700);
    assert.equal(driver.totalTrips, 1);
  });
});

describe('Autonomous Engine — Feature 6: Autonomous System Cycle Runner (Auto-Sweeper)', () => {
  test('single sweep pass executes all checks without manual triggers', () => {
    const db = createMockDb();
    // 1. Stale broadcast (should expand radius)
    db.bookings.push({
      bookingId: 'OTB-SWEEP-1',
      originCity: 'Gaya',
      destCity: 'Patna',
      cabTier: 'sedan',
      dispatchStatus: 'BROADCASTING',
      broadcastStartedAt: new Date(Date.now() - 50 * 1000).toISOString(),
      broadcastCandidates: ['drv_gaya_1'],
      radiusExpanded: false
    });

    const result = autoEngine.runAutonomousSweep(db);
    assert.ok(result.mutations >= 1, 'Should reconcile mutated bookings');
  });
});

