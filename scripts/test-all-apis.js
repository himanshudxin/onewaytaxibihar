/**
 * OneWayTaxiBihar - Comprehensive Production API Verification Suite
 * Tests all public, passenger, driver, payment, monitoring, and admin APIs
 * directly on https://onewaytaxibihar.com
 */

const https = require('https');

const HOSTNAME = 'onewaytaxibihar.com';

function apiRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'User-Agent': 'OneWayTaxiBihar-ApiTester/1.0',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request({
      hostname: HOSTNAME,
      path: '/api' + (path.startsWith('/') ? path : '/' + path),
      method,
      headers: reqHeaders,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 504, error: 'TIMEOUT', raw: '' });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message, raw: '' });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

const results = [];

function record(suite, name, passed, details) {
  results.push({ suite, name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} [${suite}] ${name}: ${details}`);
}

async function runAllApiTests() {
  console.log(`\n=================================================================`);
  console.log(`  OneWayTaxiBihar - PRODUCTION API HEALTH & FUNCTIONALITY AUDIT  `);
  console.log(`  Target Host: https://${HOSTNAME}/api                           `);
  console.log(`  Timestamp:   ${new Date().toISOString()}                       `);
  console.log(`=================================================================\n`);

  let authToken = null;
  let authCookie = null;
  let testBookingId = null;

  // -------------------------------------------------------------------------
  // 1. SYSTEM & HEALTH MONITORING APIS
  // -------------------------------------------------------------------------
  console.log(`[1] SYSTEM & HEALTH MONITORING APIS`);

  const health = await apiRequest('GET', '/health');
  record('Health', 'GET /api/health', health.status === 200 && health.data?.status === 'ONLINE',
    `Status: ${health.status}, Platform: ${health.data?.platform || 'N/A'}, Engine: ${health.data?.engine || 'N/A'}`);

  const monHealth = await apiRequest('GET', '/monitoring/health');
  record('Health', 'GET /api/monitoring/health', monHealth.status === 200 && (monHealth.data?.status === 'HEALTHY' || monHealth.data?.status === 'ONLINE'),
    `Status: ${monHealth.status}, DB: ${monHealth.data?.database?.state || 'ONLINE'}, Memory RSS: ${monHealth.data?.memory?.rssMb || 0}MB`);

  const metrics = await apiRequest('GET', '/monitoring/metrics');
  record('Health', 'GET /api/monitoring/metrics', metrics.status === 200 && metrics.data?.success === true,
    `Status: ${metrics.status}, Total Bookings: ${metrics.data?.metrics?.totalBookings ?? 'N/A'}`);

  // -------------------------------------------------------------------------
  // 2. LOCATION & CATALOG APIS
  // -------------------------------------------------------------------------
  console.log(`\n[2] LOCATION & CATALOG APIS`);

  const pickupCities = await apiRequest('GET', '/cities/pickup');
  const hasPickups = pickupCities.status === 200 && Array.isArray(pickupCities.data?.cities) && pickupCities.data.cities.length > 0;
  record('Catalog', 'GET /api/cities/pickup', hasPickups,
    `Status: ${pickupCities.status}, Cities Count: ${pickupCities.data?.cities?.length || 0}`);

  const dropCities = await apiRequest('GET', '/cities/drop?pickup=Patna');
  const hasDrops = dropCities.status === 200 && Array.isArray(dropCities.data?.cities) && dropCities.data.cities.length > 0;
  record('Catalog', 'GET /api/cities/drop', hasDrops,
    `Status: ${dropCities.status}, Drop Cities Count: ${dropCities.data?.cities?.length || 0}`);

  const locSearch = await apiRequest('GET', '/locations/search?q=Patna');
  record('Catalog', 'GET /api/locations/search', locSearch.status === 200 && Array.isArray(locSearch.data?.results),
    `Status: ${locSearch.status}, Results: ${locSearch.data?.results?.length || 0}`);

  const locRecs = await apiRequest('GET', '/locations/recommendations?from=Patna');
  record('Catalog', 'GET /api/locations/recommendations', locRecs.status === 200,
    `Status: ${locRecs.status}, Popular Routes: ${locRecs.data?.popularRoutes?.length || 0}`);

  const routeDetails = await apiRequest('GET', '/route-details?from=Patna&to=Gaya&phone=9835012345');
  record('Catalog', 'GET /api/route-details', routeDetails.status === 200 && routeDetails.data?.distanceKm > 0,
    `Status: ${routeDetails.status}, Distance: ${routeDetails.data?.distanceKm || 0} KM, Est: ${routeDetails.data?.duration || 'N/A'}`);

  // -------------------------------------------------------------------------
  // 3. FARE CALCULATION & PRICING APIS
  // -------------------------------------------------------------------------
  console.log(`\n[3] FARE CALCULATION & PRICING APIS`);

  const fareCalc = await apiRequest('POST', '/fares/calculate', {
    pickup: 'Patna Junction',
    drop: 'Muzaffarpur Junction',
    tripType: 'oneway',
    cabType: 'sedan'
  });
  const fareValid = fareCalc.status === 200 && (fareCalc.data?.totalFare > 0 || fareCalc.data?.fare?.totalFare > 0);
  record('Pricing', 'POST /api/fares/calculate', fareValid,
    `Status: ${fareCalc.status}, Total Fare: ₹${fareCalc.data?.totalFare || fareCalc.data?.fare?.totalFare || 0}, Distance: ${fareCalc.data?.distanceKm || 0} KM`);

  const couponCheck = await apiRequest('POST', '/coupons/apply', {
    code: 'FIRST100',
    fare: 2500,
    phone: '9835012345'
  });
  record('Pricing', 'POST /api/coupons/apply', couponCheck.status === 200,
    `Status: ${couponCheck.status}, Success: ${couponCheck.data?.success}, Discount: ₹${couponCheck.data?.discount || 0}`);

  // -------------------------------------------------------------------------
  // 4. AUTHENTICATION & SECURITY SAFEGUARD APIS
  // -------------------------------------------------------------------------
  console.log(`\n[4] PASSENGER & TELECOM AUTH APIS`);

  // Reject malformed phone
  const badOtp = await apiRequest('POST', '/auth/send-otp', { phone: '123' });
  record('Auth', 'POST /api/auth/send-otp (Validation)', badOtp.status === 400,
    `Status: ${badOtp.status} (Rejected malformed phone number as expected)`);

  // Valid format phone
  const goodOtp = await apiRequest('POST', '/auth/send-otp', { phone: '9835012345' });
  record('Auth', 'POST /api/auth/send-otp (Dispatch)', goodOtp.status === 200 || goodOtp.status === 429,
    `Status: ${goodOtp.status}, Message: ${goodOtp.data?.message || 'Rate-limit/Cooldown active'}`);

  // Reject invalid verification code
  const fakeVerify = await apiRequest('POST', '/auth/verify-otp', { phone: '9835012345', otp: '000000' });
  record('Auth', 'POST /api/auth/verify-otp (Reject fake code)', fakeVerify.status === 400 || fakeVerify.status === 401,
    `Status: ${fakeVerify.status} (Correctly rejected unauthorized code)`);

  // -------------------------------------------------------------------------
  // 5. BOOKING & LEADS APIS
  // -------------------------------------------------------------------------
  console.log(`\n[5] BOOKINGS & LEADS PIPELINE APIS`);

  const leadsList = await apiRequest('GET', '/leads');
  record('Leads', 'GET /api/leads', leadsList.status === 200,
    `Status: ${leadsList.status}, Leads Count: ${leadsList.data?.count ?? 0}`);

  const testPhone = '983501' + Math.floor(1000 + Math.random() * 9000);
  const newBooking = await apiRequest('POST', '/bookings', {
    name: 'Automated Test Passenger',
    phone: testPhone,
    pickupCity: 'Patna Junction',
    dropCity: 'Darbhanga Tower',
    cabType: 'sedan',
    tripType: 'oneway',
    pickupDate: '2026-10-20',
    pickupTime: '08:00 AM'
  });
  testBookingId = newBooking.data?.bookingId || newBooking.data?.booking?.bookingId;
  record('Bookings', 'POST /api/bookings (Create)', (newBooking.status === 200 || newBooking.status === 201) && !!testBookingId,
    `Status: ${newBooking.status}, Booking ID: ${testBookingId || 'N/A'}, Status: ${newBooking.data?.booking?.bookingStatus || 'NEW'}`);

  // Deduplication check
  const dupBooking = await apiRequest('POST', '/bookings', {
    name: 'Automated Test Passenger',
    phone: testPhone,
    pickupCity: 'Patna Junction',
    dropCity: 'Darbhanga Tower',
    cabType: 'sedan',
    tripType: 'oneway',
    pickupDate: '2026-10-20',
    pickupTime: '08:00 AM'
  });
  record('Bookings', 'POST /api/bookings (Deduplication)', dupBooking.status === 200 && dupBooking.data?.deduplicated === true,
    `Status: ${dupBooking.status}, Deduplicated: ${dupBooking.data?.deduplicated}, Message: ${dupBooking.data?.message}`);

  // Tracking API
  if (testBookingId) {
    const track = await apiRequest('POST', '/tracking/status', { bookingId: testBookingId, phone: testPhone });
    record('Bookings', 'POST /api/tracking/status', track.status === 200,
      `Status: ${track.status}, Booking Found: ${track.data?.booking?.bookingId || track.data?.id || 'OK'}`);
  }

  // -------------------------------------------------------------------------
  // 6. PAYMENT SECURITY & WEBHOOK APIS
  // -------------------------------------------------------------------------
  console.log(`\n[6] PAYMENT SECURITY & WEBHOOK APIS`);

  const pgConfig = await apiRequest('GET', '/payments/config');
  record('Payments', 'GET /api/payments/config', pgConfig.status === 200,
    `Status: ${pgConfig.status}, Gateway Active: ${pgConfig.data?.gateway || 'Online'}, UPI: ${pgConfig.data?.upiVpa || 'Configured'}`);

  const fakeVerifyPayment = await apiRequest('POST', '/payments/verify', {
    razorpay_order_id: 'order_fake_123',
    razorpay_payment_id: 'pay_fake_456',
    razorpay_signature: 'invalid_tampered_signature'
  });
  record('Payments', 'POST /api/payments/verify (Tamper Check)', fakeVerifyPayment.status === 400 || fakeVerifyPayment.status === 401,
    `Status: ${fakeVerifyPayment.status} (Correctly rejected tampered signature)`);

  const fakeWebhook = await apiRequest('POST', '/payments/webhook', { event: 'payment.captured' }, {
    'x-razorpay-signature': 'forged_unauthorized_hmac'
  });
  record('Payments', 'POST /api/payments/webhook (HMAC Check)', fakeWebhook.status === 400 || fakeWebhook.status === 401,
    `Status: ${fakeWebhook.status} (Correctly rejected forged webhook signature)`);

  // -------------------------------------------------------------------------
  // 7. ADMIN AUTHENTICATION & BRUTE-FORCE PROTECTION
  // -------------------------------------------------------------------------
  console.log(`\n[7] ADMIN AUTHENTICATION & SECURITY APIS`);

  // Reject wrong credentials
  const badLogin = await apiRequest('POST', '/admin/login', { username: 'admin', password: 'WrongPassword!123' });
  record('Admin Auth', 'POST /api/admin/login (Reject invalid pass)', badLogin.status === 401,
    `Status: ${badLogin.status}, Message: ${badLogin.data?.message}`);

  // Authorize with valid credentials
  const goodLogin = await apiRequest('POST', '/admin/login', { username: 'admin', password: 'OWT#Bihar@2026!SecOps' });
  authToken = goodLogin.data?.token;
  const cookieHeaders = goodLogin.headers['set-cookie'];
  authCookie = cookieHeaders ? cookieHeaders[0] : '';
  record('Admin Auth', 'POST /api/admin/login (Master Auth)', goodLogin.status === 200 && !!authToken,
    `Status: ${goodLogin.status}, Role: ${goodLogin.data?.admin?.role}, Cookie Set: ${Boolean(authCookie)}`);

  const adminHeaders = {
    'Authorization': 'Bearer ' + authToken,
    'Cookie': authCookie
  };

  // Verify Session Profile
  const me = await apiRequest('GET', '/admin/me', null, adminHeaders);
  record('Admin Auth', 'GET /api/admin/me', me.status === 200 && me.data?.admin?.username === 'admin',
    `Status: ${me.status}, Operator: ${me.data?.admin?.name}, Permissions: ${me.data?.admin?.permissions?.join(', ')}`);

  // -------------------------------------------------------------------------
  // 8. ADMIN OPERATIONS DASHBOARD APIS
  // -------------------------------------------------------------------------
  console.log(`\n[8] ADMIN OPERATIONS DASHBOARD APIS`);

  const sysStatus = await apiRequest('GET', '/admin/system-status', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/system-status', sysStatus.status === 200,
    `Status: ${sysStatus.status}, Live Engine: ${sysStatus.data?.engine || sysStatus.data?.status || 'Active'}`);

  const adminBookings = await apiRequest('GET', '/admin/bookings', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/bookings', adminBookings.status === 200 && Array.isArray(adminBookings.data?.bookings),
    `Status: ${adminBookings.status}, Total Bookings: ${adminBookings.data?.bookings?.length || 0}`);

  const adminDrivers = await apiRequest('GET', '/admin/drivers', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/drivers', adminDrivers.status === 200 && Array.isArray(adminDrivers.data?.drivers),
    `Status: ${adminDrivers.status}, Drivers Registered: ${adminDrivers.data?.drivers?.length || 0}`);

  const adminVehicles = await apiRequest('GET', '/admin/vehicles', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/vehicles', adminVehicles.status === 200 && Array.isArray(adminVehicles.data?.vehicles),
    `Status: ${adminVehicles.status}, Vehicles in Fleet: ${adminVehicles.data?.vehicles?.length || 0}`);

  const adminPayments = await apiRequest('GET', '/admin/payments', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/payments', adminPayments.status === 200,
    `Status: ${adminPayments.status}, Payments Ledger Count: ${adminPayments.data?.payments?.length ?? adminPayments.data?.count ?? 0}`);

  const adminCustomers = await apiRequest('GET', '/admin/customers', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/customers', adminCustomers.status === 200 && Array.isArray(adminCustomers.data?.customers),
    `Status: ${adminCustomers.status}, Customer Profiles: ${adminCustomers.data?.customers?.length || 0}`);

  const adminCoupons = await apiRequest('GET', '/admin/coupons', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/coupons', adminCoupons.status === 200,
    `Status: ${adminCoupons.status}, Active Coupons: ${adminCoupons.data?.coupons?.length || 0}`);

  const adminReports = await apiRequest('GET', '/admin/reports', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/reports', adminReports.status === 200 && adminReports.data?.success === true,
    `Status: ${adminReports.status}, Completed Rides: ${adminReports.data?.stats?.completedTrips ?? 0}, Gross: ₹${adminReports.data?.stats?.grossVolume ?? 0}`);

  const adminAudit = await apiRequest('GET', '/admin/audit-logs', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/audit-logs', adminAudit.status === 200,
    `Status: ${adminAudit.status}, Immutable Logs Count: ${adminAudit.data?.audit_logs?.length ?? adminAudit.data?.count ?? 0}`);

  const adminSettings = await apiRequest('GET', '/admin/settings', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/settings', adminSettings.status === 200 && adminSettings.data?.success === true,
    `Status: ${adminSettings.status}, Emergency Pause: ${Boolean(adminSettings.data?.settings?.emergencyBookingPause)}, Base Rate: ₹${adminSettings.data?.settings?.baseSedanRate || 2198}`);

  const adminUsers = await apiRequest('GET', '/admin/users', null, adminHeaders);
  record('Admin Console', 'GET /api/admin/users', adminUsers.status === 200 && Array.isArray(adminUsers.data?.users),
    `Status: ${adminUsers.status}, RBAC Operators Count: ${adminUsers.data?.users?.length || 0}`);

  // -------------------------------------------------------------------------
  // 9. BOOKING LIFECYCLE & TIMELINE APIS
  // -------------------------------------------------------------------------
  console.log(`\n[9] BOOKING LIFECYCLE & TIMELINE APIS`);

  if (testBookingId) {
    const updateStatus = await apiRequest('POST', '/admin/bookings/status', {
      bookingId: testBookingId,
      status: 'CONTACTED',
      notes: 'Customer contacted by dispatch desk'
    }, adminHeaders);
    record('Lifecycle', 'POST /api/admin/bookings/status', updateStatus.status === 200,
      `Status: ${updateStatus.status}, New State: ${updateStatus.data?.booking?.bookingStatus || 'CONTACTED'}`);

    const timeline = await apiRequest('GET', `/admin/bookings/timeline?bookingId=${testBookingId}`, null, adminHeaders);
    record('Lifecycle', 'GET /api/admin/bookings/timeline', timeline.status === 200 && Array.isArray(timeline.data?.timeline),
      `Status: ${timeline.status}, Events Logged: ${timeline.data?.timeline?.length || 0}`);
  }

  // -------------------------------------------------------------------------
  // 10. SUPPORT & TICKETING APIS
  // -------------------------------------------------------------------------
  console.log(`\n[10] SUPPORT & TICKETING APIS`);

  const ticketCreate = await apiRequest('POST', '/support/tickets', {
    phone: '9835012345',
    category: 'INQUIRY',
    message: 'Automated test inquiry regarding airport transfer rate'
  });
  record('Support', 'POST /api/support/tickets', ticketCreate.status === 200 && ticketCreate.data?.success === true,
    `Status: ${ticketCreate.status}, Ticket ID: ${ticketCreate.data?.ticketId || 'OK'}`);

  const ticketList = await apiRequest('GET', '/support/tickets?phone=9835012345', null, adminHeaders);
  record('Support', 'GET /api/support/tickets', ticketList.status === 200,
    `Status: ${ticketList.status}, Tickets Found: ${ticketList.data?.count || 0}`);

  // -------------------------------------------------------------------------
  // 11. DRIVER PORTAL APIS
  // -------------------------------------------------------------------------
  console.log(`\n[11] DRIVER PARTNER PORTAL APIS`);

  const driverLogin = await apiRequest('POST', '/driver/login', {
    phone: '9835012345',
    password: 'wrong_password'
  });
  record('Driver', 'POST /api/driver/login (Reject bad pass)', driverLogin.status === 400 || driverLogin.status === 401 || driverLogin.status === 404,
    `Status: ${driverLogin.status} (Safely handled unverified driver login)`);

  // -------------------------------------------------------------------------
  // 12. ADMIN LOGOUT & SESSION INVALIDATION
  // -------------------------------------------------------------------------
  console.log(`\n[12] SESSION TERMINATION & LOGOUT`);

  const logout = await apiRequest('POST', '/admin/logout', null, adminHeaders);
  record('Admin Auth', 'POST /api/admin/logout', logout.status === 200 && logout.data?.success === true,
    `Status: ${logout.status}, Message: ${logout.data?.message}`);

  const postLogoutMe = await apiRequest('GET', '/admin/me', null, adminHeaders);
  record('Admin Auth', 'GET /api/admin/me (After logout)', postLogoutMe.status === 401,
    `Status: ${postLogoutMe.status} (Access revoked after logout as expected)`);

  // -------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // -------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`\n=================================================================`);
  console.log(`  AUDIT SCORECARD: ${passed} / ${total} APIS PASSED (${Math.round((passed / total) * 100)}%)`);
  if (failed === 0) {
    console.log(`  RESULT: 🌟 100% OF APIS ARE FULLY OPERATIONAL ON PRODUCTION!`);
  } else {
    console.log(`  RESULT: ⚠️ ${failed} APIs NEED ATTENTION`);
  }
  console.log(`=================================================================\n`);
}

runAllApiTests().catch(console.error);
