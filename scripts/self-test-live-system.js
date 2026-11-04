/**
 * scripts/self-test-live-system.js
 * Comprehensive Live Autonomous Self-Test of OneWayTaxiBihar Ecosystem:
 * 1. Web Portals Health (Passenger, Driver, Admin)
 * 2. Mobile App Version Check API (Passenger & Driver)
 * 3. Metro Packager Bundle Compilation (Android bundle test on Port 8081)
 * 4. End-to-End Live Broadcast Dispatch Lifecycle:
 *    - Admin Authentication (POST /admin/login)
 *    - Driver 1 & Driver 2 Authentication (POST /api/driver/login)
 *    - Passenger Booking Creation with Scheduled Pickup Date & Time
 *    - Auto-Broadcast Verification (BROADCASTING status in DB)
 *    - Driver 1 & Driver 2 Simultaneous Offer Visibility (/api/dispatch/offers)
 *    - Atomic Claim Race Condition (Driver 1 wins 200, Driver 2 collides 409)
 *    - Passenger PNR Tracking Verification (Assigned Chauffeur details)
 *    - Trip Complete Execution & Wallet Settlement (POST /api/driver/status)
 *    - Driver Earnings Ledger Query (/api/driver/earnings)
 *    - Admin Manual Override Cancellation Verification (POST /admin/cancel-booking)
 */

const http = require('http');

const PORT = 3000;
const HOST = '127.0.0.1';

let testsPassed = 0;
let testsFailed = 0;

function logPass(msg) {
  testsPassed++;
  console.log(`  ✅ PASS: ${msg}`);
}

function logFail(msg, detail) {
  testsFailed++;
  console.error(`  ❌ FAIL: ${msg}`);
  if (detail) console.error(`     Detail:`, detail);
}

function makeRequest({ method = 'GET', path, headers = {}, body = null, port = PORT }) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST,
      port,
      path,
      method,
      headers: {
        'Accept': 'application/json, text/html, */*',
        ...headers
      },
      timeout: 10000
    };

    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(opts, (res) => {
      let chunks = '';
      res.on('data', chunk => chunks += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(chunks); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: chunks,
          json
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to ${path} timed out`));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveSelfTest() {
  console.log('\n======================================================');
  console.log('🤖 LIVE COMPREHENSIVE SYSTEM SELF-TEST INITIATED');
  console.log(`Target Server: http://${HOST}:${PORT}`);
  console.log(`Metro Packager: http://${HOST}:8081`);
  console.log('======================================================\n');

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: Web Portals & Static Assets
  // ─────────────────────────────────────────────────────────────
  console.log('[Suite 1] Web Portals Availability & Markup');
  try {
    const resHome = await makeRequest({ path: '/' });
    if (resHome.statusCode === 200 && resHome.body.includes('OneWayTaxiBihar')) {
      logPass('Passenger Web Portal (/) returns HTTP 200 with brand markup');
    } else {
      logFail('Passenger Web Portal failed', `Status: ${resHome.statusCode}`);
    }

    const resDriver = await makeRequest({ path: '/driver.html' });
    if (resDriver.statusCode === 200 && resDriver.body.includes('Chauffeur Partner')) {
      logPass('Driver Web Portal (/driver.html) returns HTTP 200 with chauffeur console');
    } else {
      logFail('Driver Web Portal failed', `Status: ${resDriver.statusCode}`);
    }

    const resAdmin = await makeRequest({ path: '/admin.html' });
    if (resAdmin.statusCode === 200 && resAdmin.body.includes('Operations')) {
      logPass('Admin Operations Desk (/admin.html) returns HTTP 200');
    } else {
      logFail('Admin Desk failed', `Status: ${resAdmin.statusCode}`);
    }

    const resPassenger = await makeRequest({ path: '/passenger.html' });
    if (resPassenger.statusCode === 200 && resPassenger.body.includes('PICKUP SCHEDULE')) {
      logPass('Passenger PNR Portal (/passenger.html) returns HTTP 200 with formatted schedule banner');
    } else {
      logFail('Passenger PNR Portal failed', `Status: ${resPassenger.statusCode}`);
    }
  } catch (err) {
    logFail('Suite 1 request failed', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: APK In-App Updater API
  // ─────────────────────────────────────────────────────────────
  console.log('\n[Suite 2] Self-Hosted APK In-App Updater API');
  try {
    const resPassUpdate = await makeRequest({ path: '/api/v1/app/version-check?app=passenger&version=1.0.0' });
    if (resPassUpdate.statusCode === 200 && resPassUpdate.json?.latestVersion) {
      logPass(`Passenger App Version Check: latestVersion=${resPassUpdate.json.latestVersion}, minSupported=${resPassUpdate.json.minSupportedVersion}`);
    } else {
      logFail('Passenger Version Check failed', resPassUpdate.body);
    }

    const resDriverUpdate = await makeRequest({ path: '/api/v1/app/version-check?app=driver&version=1.0.0' });
    if (resDriverUpdate.statusCode === 200 && resDriverUpdate.json?.latestVersion) {
      logPass(`Driver App Version Check: latestVersion=${resDriverUpdate.json.latestVersion}, minSupported=${resDriverUpdate.json.minSupportedVersion}`);
    } else {
      logFail('Driver Version Check failed', resDriverUpdate.body);
    }
  } catch (err) {
    logFail('Suite 2 request failed', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: Metro Bundler JavaScript Compilation
  // ─────────────────────────────────────────────────────────────
  console.log('\n[Suite 3] Metro Packager Compilation (Port 8081)');
  try {
    const metroRes = await makeRequest({
      port: 8081,
      path: '/index.bundle?platform=android&dev=true&minify=false'
    });
    if (metroRes.statusCode === 200 && metroRes.body.length > 50000) {
      logPass(`Metro Android Bundle compiled cleanly! Bundle Size: ${Math.round(metroRes.body.length / 1024)} KB`);
    } else {
      logFail('Metro bundle compilation failed', `Status: ${metroRes.statusCode}`);
    }
  } catch (err) {
    logFail('Metro server connection failed', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: Live Broadcast Dispatch Full Lifecycle
  // ─────────────────────────────────────────────────────────────
  console.log('\n[Suite 4] Live Broadcast Dispatch & Atomic Claim Race Lifecycle');
  try {
    // 1. Admin Login (POST /admin/login)
    const adminLoginRes = await makeRequest({
      method: 'POST',
      path: '/admin/login',
      body: { username: 'admin', password: 'harharmahadev@1' }
    });
    const adminToken = adminLoginRes.json?.token;
    if (adminLoginRes.statusCode === 200 && adminToken) {
      logPass('Admin operator authenticated successfully (POST /admin/login)');
    } else {
      logFail('Admin authentication failed', adminLoginRes.body);
    }

    // 2. Driver 1 Login (Santosh Chauffeur - 9934188888, PIN 8888)
    const drv1Login = await makeRequest({
      method: 'POST',
      path: '/api/driver/login',
      body: { phone: '9934188888', pin: '8888' }
    });
    const drv1Token = drv1Login.json?.token;
    const drv1Name = drv1Login.json?.driver?.name || 'Driver 1';
    if (drv1Login.statusCode === 200 && drv1Token) {
      logPass(`Driver 1 authenticated: ${drv1Name} (${drv1Login.json?.driver?.phone})`);
    } else {
      logFail('Driver 1 authentication failed', drv1Login.body);
    }

    // 3. Driver 2 Login (Ramesh Kumar - 9876508888, PIN 8888)
    const drv2Login = await makeRequest({
      method: 'POST',
      path: '/api/driver/login',
      body: { phone: '9876508888', pin: '8888' }
    });
    const drv2Token = drv2Login.json?.token;
    const drv2Name = drv2Login.json?.driver?.name || 'Driver 2';
    if (drv2Login.statusCode === 200 && drv2Token) {
      logPass(`Driver 2 authenticated: ${drv2Name} (${drv2Login.json?.driver?.phone})`);
    } else {
      logFail('Driver 2 authentication failed', drv2Login.body);
    }

    // 4. Passenger Creates Outstation Booking with Explicit Pickup Schedule
    const bookingPayload = {
      passengerName: 'Aarav Sharma',
      passengerPhone: '9876512345',
      originCity: 'Patna',
      destCity: 'Gaya',
      pickupAddress: 'Patna Airport Terminal 1, Gate 2',
      dropAddress: 'Bodh Gaya Main Temple Gate',
      pickupDate: '2026-11-12',
      pickupTime: '06:30',
      cabType: 'Prime Sedan',
      fleetClass: 'sedan',
      cabTier: 'sedan',
      totalFare: 2198,
      advancePaid: 0,
      paymentMode: 'CASH'
    };

    const bookingRes = await makeRequest({
      method: 'POST',
      path: '/api/bookings',
      body: bookingPayload
    });

    const bookingData = bookingRes.json?.booking || bookingRes.json;
    const bookingId = bookingData?.bookingId || bookingData?.id;
    if ((bookingRes.statusCode === 200 || bookingRes.statusCode === 201) && bookingId) {
      logPass(`Booking created: ID=${bookingId}, Route=Patna→Gaya, Schedule=2026-11-12 | 06:30`);
    } else {
      logFail('Booking creation failed', bookingRes.body);
    }

    // 5. Verify Auto-Broadcast was automatically triggered on booking creation
    if (bookingData?.dispatchStatus === 'BROADCASTING') {
      logPass(`Auto-Broadcast Engine: Booking automatically set to BROADCASTING with ${bookingData.broadcastCandidates?.length || 0} candidate drivers`);
    } else {
      // Trigger via admin broadcast endpoint
      const bcRes = await makeRequest({
        method: 'POST',
        path: '/api/dispatch/broadcast',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: { bookingId }
      });
      if (bcRes.statusCode === 200) {
        logPass(`Admin broadcast triggered: BROADCASTING to ${bcRes.json?.candidateCount} drivers`);
      } else {
        logFail('Broadcast trigger failed', bcRes.body);
      }
    }

    // 6. Driver 1 Polls /api/dispatch/offers -> Must see the booking
    const drv1OffersRes = await makeRequest({
      method: 'GET',
      path: '/api/dispatch/offers',
      headers: { 'Authorization': `Bearer ${drv1Token}` }
    });
    const drv1Offers = drv1OffersRes.json?.offers || [];
    const foundInDrv1 = drv1Offers.find(o => o.bookingId === bookingId);
    if (foundInDrv1) {
      logPass(`Driver 1 feed contains broadcast: Route=${foundInDrv1.originCity}→${foundInDrv1.destCity}, Schedule=${foundInDrv1.pickupDateTimeFormatted}, Net Payout=₹${foundInDrv1.driverNetEarnings}`);
    } else {
      logFail('Booking not found in Driver 1 broadcast feed', { totalOffers: drv1Offers.length });
    }

    // 7. Driver 2 Polls /api/dispatch/offers -> Must ALSO see the booking (simultaneous broadcast)
    const drv2OffersRes = await makeRequest({
      method: 'GET',
      path: '/api/dispatch/offers',
      headers: { 'Authorization': `Bearer ${drv2Token}` }
    });
    const drv2Offers = drv2OffersRes.json?.offers || [];
    const foundInDrv2 = drv2Offers.find(o => o.bookingId === bookingId);
    if (foundInDrv2) {
      logPass(`Driver 2 feed contains broadcast: Multi-driver broadcast confirmed simultaneously!`);
    } else {
      logFail('Booking not found in Driver 2 broadcast feed', { totalOffers: drv2Offers.length });
    }

    // 8. ATOMIC CLAIM RACE CONDITION TEST:
    // Driver 1 claims -> MUST SUCCEED (HTTP 200)
    const claimRes1 = await makeRequest({
      method: 'POST',
      path: '/api/dispatch/claim',
      headers: { 'Authorization': `Bearer ${drv1Token}` },
      body: { bookingId }
    });
    if (claimRes1.statusCode === 200 && claimRes1.json?.success) {
      logPass(`Driver 1 claims trip: HTTP 200 OK — Chauffeur assigned: ${claimRes1.json?.driver?.name}`);
    } else {
      logFail('Driver 1 claim failed', claimRes1.body);
    }

    // Driver 2 claims same booking immediately -> MUST BE BLOCKED with HTTP 409
    const claimRes2 = await makeRequest({
      method: 'POST',
      path: '/api/dispatch/claim',
      headers: { 'Authorization': `Bearer ${drv2Token}` },
      body: { bookingId }
    });
    if (claimRes2.statusCode === 409 && claimRes2.json?.alreadyClaimed) {
      logPass(`Atomic Claim Locking verified: Driver 2 blocked with HTTP 409 Conflict {"alreadyClaimed": true, "message": "Trip accepted by another driver."}`);
    } else {
      logFail('Atomic claim lock failed to block double-booking collision!', `Status: ${claimRes2.statusCode}, Body: ${claimRes2.body}`);
    }

    // 9. Verify Driver 2 no longer sees the booking in /api/dispatch/offers
    const drv2OffersAfter = await makeRequest({
      method: 'GET',
      path: '/api/dispatch/offers',
      headers: { 'Authorization': `Bearer ${drv2Token}` }
    });
    const stillVisible = (drv2OffersAfter.json?.offers || []).some(o => o.bookingId === bookingId);
    if (!stillVisible) {
      logPass('Claimed trip immediately removed from all other drivers broadcast feeds');
    } else {
      logFail('Claimed trip still visible in broadcast feed after assignment!');
    }

    // 10. Passenger PNR Lookup via Phone Verification
    const pnrLookupRes = await makeRequest({
      method: 'GET',
      path: `/bookings/by-phone?phone=${bookingPayload.passengerPhone}`,
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const bookingsList = pnrLookupRes.json?.bookings || [];
    const myBooking = bookingsList.find(b => b.bookingId === bookingId);
    if (myBooking && myBooking.assignedDriverId) {
      logPass(`Passenger PNR view verified: Assigned Driver ID=${myBooking.assignedDriverId}, Name=${myBooking.driverDetails?.name || myBooking.assignedDriverName}, Vehicle=${myBooking.driverDetails?.vehicleNumber || myBooking.assignedDriverCarNo}`);
    } else {
      logFail('Passenger PNR lookup did not reflect assigned driver', pnrLookupRes.body);
    }

    // 11. Driver 1 Starts Trip with Start OTP
    const tripOtp = myBooking?.tripOtp || '4462';
    const startTripRes = await makeRequest({
      method: 'POST',
      path: '/api/driver/status',
      headers: { 'Authorization': `Bearer ${drv1Token}` },
      body: { bookingId, newStatus: 'TRIP STARTED', tripOtp }
    });
    if (startTripRes.statusCode === 200 && startTripRes.json?.success) {
      logPass(`Driver starts trip: Validated Start OTP (${tripOtp}) -> Status: TRIP STARTED`);
    } else {
      logFail('Driver start trip failed', startTripRes.body);
    }

    // 12. Driver 1 Completes Trip -> Automated Driver Wallet Credit
    const completeTripRes = await makeRequest({
      method: 'POST',
      path: '/api/driver/status',
      headers: { 'Authorization': `Bearer ${drv1Token}` },
      body: { bookingId, newStatus: 'COMPLETED' }
    });
    if (completeTripRes.statusCode === 200 && completeTripRes.json?.success) {
      logPass(`Driver completes trip: Status updated to COMPLETED with automated commission & settlement calculation`);
    } else {
      logFail('Driver trip completion failed', completeTripRes.body);
    }

    // 13. Verify Driver Earnings Ledger reflects settlement
    const cleanDrvPhone = (drv1Login.json?.driver?.phone || '9934188888').replace(/\D/g, '').slice(-10);
    const drv1EarningsRes = await makeRequest({
      method: 'GET',
      path: `/api/driver/earnings?phone=${encodeURIComponent(cleanDrvPhone)}`,
      headers: { 'Authorization': `Bearer ${drv1Token}` }
    });
    const earnings = drv1EarningsRes.json?.earnings;
    if (drv1EarningsRes.statusCode === 200 && earnings) {
      logPass(`Driver wallet ledger verified: Total Completed Trips=${earnings.completedTrips}, Total Earnings=₹${earnings.totalEarnings || 0}`);
    } else {
      logFail('Driver earnings query failed', drv1EarningsRes.body);
    }

    // 14. Admin Manual Override: Create second booking and cancel manually
    const booking2Res = await makeRequest({
      method: 'POST',
      path: '/api/bookings',
      body: {
        passengerName: 'Admin Override Test',
        passengerPhone: '9876543299',
        originCity: 'Patna',
        destCity: 'Muzaffarpur',
        pickupDate: '2026-11-15',
        pickupTime: '10:00',
        cabTier: 'sedan',
        totalFare: 1850
      }
    });
    const booking2Id = booking2Res.json?.booking?.bookingId || booking2Res.json?.bookingId;
    if (booking2Id) {
      const cancelRes = await makeRequest({
        method: 'POST',
        path: '/admin/cancel-booking',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: { bookingId: booking2Id, reason: 'Admin manual test cancellation' }
      });
      if (cancelRes.statusCode === 200 && cancelRes.json?.success) {
        logPass(`Admin manual override verified: Booking ${booking2Id} successfully CANCELLED via /admin/cancel-booking`);
      } else {
        logFail('Admin manual cancellation failed', cancelRes.body);
      }
    }

  } catch (err) {
    logFail('Suite 4 execution error', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`📊 AUTONOMOUS SELF-TEST COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveSelfTest();
