const assert = require('assert');
const dispatch = require('../services/dispatch.js');

async function runTest() {
  console.log('--- TESTING PERSISTENT BROADCAST & DRIVER NOTIFICATION SUITE ---');

  const mockDb = {
    bookings: [],
    notifications: [],
    drivers: [
      {
        id: 'drv_partner_1',
        name: 'Ramesh Kumar',
        phone: '9801122334',
        vehicleModel: 'Maruti Suzuki Dzire',
        vehicleNumber: 'BR01AB1234',
        fleetTier: 'sedan',
        dutyStatus: 'ONLINE',
        status: 'active'
      },
      {
        id: 'drv_partner_2',
        name: 'Suresh Singh',
        phone: '9801122335',
        vehicleModel: 'Hyundai Aura',
        vehicleNumber: 'BR01CD5678',
        fleetTier: 'sedan',
        dutyStatus: 'ONLINE',
        status: 'active'
      }
    ]
  };

  // 1. Create a new booking
  const newBooking = {
    bookingId: 'BK_TEST_BROADCAST_99',
    pnr: 'PNR9999',
    passengerName: 'Aman Verma',
    passengerPhone: '9801199999',
    originCity: 'Patna',
    destCity: 'Gaya',
    pickupDate: '2026-11-25',
    pickupTime: '10:00 AM',
    cabTier: 'sedan',
    totalFare: 1549,
    bookingStatus: 'CONFIRMED'
  };
  mockDb.bookings.unshift(newBooking);

  // 2. Broadcast booking
  const bRes = dispatch.broadcastBooking(mockDb, newBooking);
  assert.strictEqual(bRes.success, true, 'Broadcast must succeed');
  assert.strictEqual(newBooking.dispatchStatus, 'BROADCASTING', 'Status must be BROADCASTING');

  // Verify notification created for drivers
  const notif = mockDb.notifications.find(n => n.type === 'DRIVER_BROADCAST_OFFER');
  assert(notif, 'Notification for driver broadcast must be logged');
  assert.strictEqual(notif.bookingId, 'BK_TEST_BROADCAST_99');
  console.log('✅ Driver notification logged successfully:', notif.title);

  // 3. Driver 1 gets offer
  const card1 = dispatch.buildTripOfferCard(newBooking, 'drv_partner_1');
  assert.strictEqual(card1.bookingId, 'BK_TEST_BROADCAST_99');
  assert.strictEqual(card1.totalFare, 1549);
  console.log('✅ Driver 1 sees broadcast offer card:', card1.originCity, '->', card1.destCity, 'Fare:', card1.totalFare);

  // 4. Time passes (10 minutes elapsed)
  newBooking.broadcastStartedAt = new Date(Date.now() - 700 * 1000).toISOString();
  dispatch.checkBroadcastTimeouts(mockDb);
  assert.strictEqual(newBooking.dispatchStatus, 'BROADCASTING', 'Booking must stay BROADCASTING even after 10m until claimed');
  console.log('✅ Booking persists in BROADCASTING status and does not expire away.');

  // 5. Driver 2 also sees offer
  const card2 = dispatch.buildTripOfferCard(newBooking, 'drv_partner_2');
  assert.strictEqual(card2.bookingId, 'BK_TEST_BROADCAST_99');
  console.log('✅ Driver 2 also sees broadcast offer card.');

  // 6. Driver 1 claims the trip
  const claim1 = dispatch.claimBookingAtomic(mockDb, 'BK_TEST_BROADCAST_99', 'drv_partner_1');
  assert.strictEqual(claim1.success, true, 'Driver 1 must claim trip successfully');
  assert.strictEqual(newBooking.assignedDriverId, 'drv_partner_1', 'Booking must be assigned to Driver 1');
  assert.strictEqual(newBooking.bookingStatus, 'DRIVER ASSIGNED');
  console.log('✅ Driver 1 claimed trip successfully. Assigned driver:', newBooking.assignedDriverName);

  // 7. Driver 2 tries to claim the same trip
  const claim2 = dispatch.claimBookingAtomic(mockDb, 'BK_TEST_BROADCAST_99', 'drv_partner_2');
  assert.strictEqual(claim2.success, false, 'Driver 2 claim must fail');
  assert.strictEqual(claim2.alreadyClaimed, true, 'Driver 2 must receive alreadyClaimed: true');
  console.log('✅ Driver 2 correctly rejected with notice:', claim2.message);

  console.log('--- ALL PERSISTENT BROADCAST & DRIVER NOTIFICATION TESTS PASSED 100% ---');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
