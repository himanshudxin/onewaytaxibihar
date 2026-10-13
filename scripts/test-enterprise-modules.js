/**
 * Test Enterprise Platform Upgrades:
 * - Smart Dispatch Engine
 * - Driver Realtime GPS Location Telemetry
 * - Driver Wallet & Settlements
 * - Driver Document Verification
 * - Trip PIN Mandatory Enforcement
 * - Emergency SOS System
 * - Book for Someone Else
 */

const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('Testing Enterprise Modules (Smart Dispatch, Wallet, SOS, Telemetry)');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  // 1. Admin Login to get session
  console.log('[1] Authenticating Admin Dispatcher...');
  total++;
  const adminLogin = await request('POST', '/api/admin/login', {
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASSWORD || 'OWT#Bihar@2026!SecOps'
  });
  const adminCookie = (adminLogin.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  if (adminLogin.status === 200) {
    console.log('  ✅ Admin logged in successfully.');
    passed++;
  } else {
    console.error('  ❌ Admin login failed:', adminLogin.body);
  }

  // 2. Book for Someone Else (Phase 9)
  console.log('[2] Creating Booking for Someone Else (Phase 9)...');
  total++;
  const bookingRes = await request('POST', '/api/bookings', {
    originCity: 'Patna',
    destCity: 'Gaya',
    cabTier: 'sedan',
    passengerName: 'Anjali Sharma',
    passengerPhone: '9835012345',
    isForOther: true,
    bookerName: 'Himanshu Dubey',
    bookerPhone: '8002141816',
    specialInstructions: 'Senior citizen passenger, please assist with luggage at pickup point.'
  });
  let testBookingId = '';
  let tripOtp = '';
  if (bookingRes.status === 201 && bookingRes.body.booking?.isForOther) {
    testBookingId = bookingRes.body.booking.bookingId;
    tripOtp = bookingRes.body.booking.tripOtp;
    console.log(`  ✅ Booking created for other passenger: ${testBookingId}, PIN: ${tripOtp}`);
    passed++;
  } else {
    console.error('  ❌ Booking creation failed:', bookingRes.body);
  }

  // 3. Smart Driver Dispatch (Phase 3)
  console.log('[3] Testing Smart Driver Auto-Dispatch...');
  total++;
  const dispatchRes = await request('POST', '/api/admin/auto-dispatch', {
    bookingId: testBookingId
  }, { Cookie: adminCookie });
  if (dispatchRes.status === 200 && dispatchRes.body.matchedDriver) {
    console.log(`  ✅ Smart Dispatch matched chauffeur: ${dispatchRes.body.matchedDriver.name} (Score: ${dispatchRes.body.matchedDriver.suitabilityScore}%)`);
    console.log(`     Reasons: ${dispatchRes.body.matchedDriver.reasons.join(', ')}`);
    passed++;
  } else {
    console.error('  ❌ Smart Dispatch failed:', dispatchRes.body);
  }

  // 4. Driver Login to get driver session
  console.log('[4] Authenticating Driver Partner...');
  total++;
  const driverLogin = await request('POST', '/api/driver/login', {
    phone: '9431012345',
    pin: '1234'
  });
  const driverToken = driverLogin.body?.token || '';
  const driverHeaders = {
    'Authorization': `Bearer ${driverToken}`
  };
  if (driverLogin.status === 200 && driverToken) {
    console.log('  ✅ Driver logged in successfully.');
    passed++;
  } else {
    console.error('  ❌ Driver login failed:', driverLogin.body);
  }

  // 5. Driver GPS Location Telemetry (Phase 4)
  console.log('[5] Testing Driver GPS Location Telemetry...');
  total++;
  const locRes = await request('POST', '/api/driver/location', {
    lat: 25.5941,
    lng: 85.1376,
    heading: 90,
    speed: 35
  }, driverHeaders);
  if (locRes.status === 200 && locRes.body.success) {
    console.log('  ✅ Driver GPS coordinates updated in central telemetry.');
    passed++;
  } else {
    console.error('  ❌ Driver location telemetry failed:', locRes.body);
  }

  // 6. Mandatory Trip PIN Enforcement (Phase 10 Safety)
  console.log('[6] Testing Trip PIN Security (Reject wrong PIN)...');
  total++;
  const wrongPinRes = await request('POST', '/api/driver/status', {
    bookingId: testBookingId,
    newStatus: 'TRIP STARTED',
    tripOtp: '0000' // Incorrect PIN
  }, driverHeaders);
  if (wrongPinRes.status === 400) {
    console.log('  ✅ Successfully rejected invalid Trip PIN (400 as expected).');
    passed++;
  } else {
    console.error('  ❌ Trip PIN security failure, did not reject:', wrongPinRes.body);
  }

  // 7. Verify correct Trip PIN and start trip
  console.log('[7] Testing Trip PIN Security (Accept valid PIN)...');
  total++;
  const validPinRes = await request('POST', '/api/driver/status', {
    bookingId: testBookingId,
    newStatus: 'TRIP STARTED',
    tripOtp: tripOtp
  }, driverHeaders);
  if (validPinRes.status === 200) {
    console.log('  ✅ Correct Trip PIN verified, ride started.');
    passed++;
  } else {
    console.error('  ❌ Valid Trip PIN rejected:', validPinRes.body);
  }

  // 8. Emergency SOS Alert (Phase 10)
  console.log('[8] Testing Emergency SOS Incident Trigger...');
  total++;
  const sosRes = await request('POST', '/api/safety/sos', {
    bookingId: testBookingId,
    phone: '9835012345',
    lat: 25.5941,
    lng: 85.1376,
    reason: 'Emergency route deviation check'
  });
  if (sosRes.status === 200 && sosRes.body.incidentId && sosRes.body.emergencyContacts?.length > 0) {
    console.log(`  ✅ Emergency SOS registered: ${sosRes.body.incidentId}, helplines provided: ${sosRes.body.emergencyContacts.length}`);
    passed++;
  } else {
    console.error('  ❌ SOS trigger failed:', sosRes.body);
  }

  // 9. Driver Wallet & Earnings (Phase 7)
  console.log('[9] Testing Driver Wallet & Earnings Ledger...');
  total++;
  const walletRes = await request('GET', '/api/driver/wallet', null, driverHeaders);
  if (walletRes.status === 200 && walletRes.body.wallet) {
    console.log(`  ✅ Driver wallet loaded: Total Earnings: ₹${walletRes.body.wallet.totalEarnings}, Pending: ₹${walletRes.body.wallet.pendingSettlement}`);
    passed++;
  } else {
    console.error('  ❌ Driver wallet failed:', walletRes.body);
  }

  // 10. Admin Driver Document Verification (Phase 6)
  console.log('[10] Testing Admin Driver Verification...');
  total++;
  const verifyRes = await request('POST', '/api/admin/drivers/verify', {
    driverId: 'drv_101',
    verificationStatus: 'VERIFIED',
    note: 'RC, Driving License, Commercial Permit verified by Patna RTO desk'
  }, { Cookie: adminCookie });
  if (verifyRes.status === 200 && verifyRes.body.driver?.verificationStatus === 'VERIFIED') {
    console.log('  ✅ Admin driver document verification successfully updated.');
    passed++;
  } else {
    console.error('  ❌ Admin driver verification failed:', verifyRes.body);
  }

  // 11. Admin Driver Settlement Payout (Phase 7)
  console.log('[11] Testing Admin Driver Settlement Payout...');
  total++;
  const settleRes = await request('POST', '/api/admin/driver-settlement', {
    driverId: 'drv_101',
    amount: 1500,
    paymentMethod: 'Bank IMPS',
    referenceId: 'IMPS_982348234723',
    note: 'Weekly trip payout'
  }, { Cookie: adminCookie });
  if (settleRes.status === 200 && settleRes.body.settlement) {
    console.log(`  ✅ Driver settlement recorded: Ref ${settleRes.body.settlement.referenceId}, Amount: ₹${settleRes.body.settlement.amount}`);
    passed++;
  } else {
    console.error('  ❌ Driver settlement failed:', settleRes.body);
  }

  console.log('\n======================================================');
  console.log(`ENTERPRISE MODULE AUDIT SCORE: ${passed} / ${total} PASSED (${Math.round(passed/total * 100)}%)`);
  console.log('======================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
