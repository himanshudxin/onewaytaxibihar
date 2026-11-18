process.env.USE_LOCAL_DB = 'true';
process.env.NODE_ENV = 'test';
/**
 * OneWayTaxiBihar Milestone M1 Backend Security & Lifecycle Verification Test Suite
 * Tests:
 * 1. Sliding-window rate limiting on /auth/login, /auth/verify-otp, /driver/login, /driver/signup, /auth/send-otp, /bookings (HTTP 429)
 * 2. Row-Level Security on /passenger/trips and /driver/earnings (HTTP 403 for cross-access / unauthenticated, elimination of x-driver-phone)
 * 3. Auth Lifecycle: forgot-password, reset-password, send-email-verification, verify-email, driver logout, DPDP delete-account receipt
 * 4. Notification service email verification
 * 5. Backend route proxy /api/routes/toll-estimate and hardcoded secret purge
 * 6. Backup DB --verify automated restore verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const EventEmitter = require('events');

const apiHandler = require('../api/index.js');
const securityService = require('../services/security.js');
const notificationService = require('../services/notification.js');
const dbService = require('../services/db.js');
const { verifyBackup } = require('../scripts/backup-db.js');

let passedTests = 0;
let totalTests = 0;

function report(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    console.error(`  ❌ FAIL: ${name} ${details ? '- ' + details : ''}`);
  }
}

// Helper to simulate HTTP requests against apiHandler
function mockRequest({ method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = {
      host: 'localhost:8080',
      'content-type': 'application/json',
      ...headers
    };
    req.socket = { remoteAddress: '127.0.0.1' };

    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    req.body = body || {};

    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      getHeader(k) { return this.headers[k.toLowerCase()]; },
      end(data) {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ statusCode: this.statusCode, headers: this.headers, data: parsed });
      }
    };

    apiHandler(req, res).catch(err => {
      resolve({ statusCode: 500, data: { error: err.message } });
    });

    if (bodyStr) {
      req.emit('data', Buffer.from(bodyStr));
    }
    req.emit('end');
  });
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 Running Milestone M1 Backend Security & Lifecycle Tests');
  console.log('======================================================\n');

  await dbService.initDatabase();
  const db = await dbService.getDbAsync();

  // Test 1: Secret Purge in services/security.js:66
  console.log('[Suite 1] Secret Audit & Cryptographic Hardening');
  const secContent = fs.readFileSync(path.join(__dirname, '..', 'services', 'security.js'), 'utf8');
  const hasHarHarInSec = secContent.includes("'harharmahadev@1'");
  report('services/security.js has purged hardcoded plaintext password', !hasHarHarInSec);

  // Test 2: Notification Service Email Verification Dispatch
  console.log('\n[Suite 2] Email Verification Dispatch (services/notification.js)');
  const emailRes = await notificationService.sendEmailVerification('test.passenger@example.com', 'emv_test_token_12345', { name: 'Test Passenger' });
  report('sendEmailVerification generates verification link & token', emailRes.success && emailRes.verificationToken === 'emv_test_token_12345');
  report('sendEmailVerification provides simulation fallback when keys absent', emailRes.provider === 'console_simulation' || emailRes.provider === 'resend' || emailRes.provider === 'sendgrid');

  // Test 3: Automated Database Backup Verification
  console.log('\n[Suite 3] Automated Database Backup Verification (scripts/backup-db.js)');
  try {
    const backupVerifyRes = await verifyBackup();
    report('Automated restore verification passes with 100% integrity', backupVerifyRes.verified && backupVerifyRes.collectionsValidated >= 8);
  } catch (err) {
    report('Automated restore verification passes with 100% integrity', false, err.message);
  }

  // Test 4: Sliding-Window Rate Limiting (HTTP 429)
  console.log('\n[Suite 4] Sliding-Window Rate Limiting (R3 AC 1)');
  securityService.resetRateLimit();

  // 4a. /auth/send-otp rate limiting (Max 3 per min per phone)
  const otpPhone = '9811122233';
  let otp429Hit = false;
  let otpRetryAfter = 0;
  for (let i = 0; i < 7; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/auth/send-otp',
      body: { phone: otpPhone, name: 'Rate Test User' }
    });
    if (res.statusCode === 429) {
      otp429Hit = true;
      otpRetryAfter = res.data.retryAfter || Number(res.headers['retry-after']);
      break;
    }
  }
  report('POST /auth/send-otp returns HTTP 429 when threshold exceeded', otp429Hit && otpRetryAfter > 0);

  // 4b. /auth/login rate limiting (Max 10 per min)
  const loginPhone = '9822233344';
  let login429Hit = false;
  for (let i = 0; i < 12; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/auth/login',
      body: { phone: loginPhone, name: 'Login Test User' }
    });
    if (res.statusCode === 429) {
      login429Hit = true;
      break;
    }
  }
  report('POST /auth/login returns HTTP 429 when threshold exceeded', login429Hit);

  // 4c. /auth/verify-otp rate limiting
  const verifyPhone = '9833344455';
  let verify429Hit = false;
  for (let i = 0; i < 12; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/auth/verify-otp',
      body: { phone: verifyPhone, otp: '123456' }
    });
    if (res.statusCode === 429) {
      verify429Hit = true;
      break;
    }
  }
  report('POST /auth/verify-otp returns HTTP 429 when threshold exceeded', verify429Hit);

  // 4d. /driver/login rate limiting
  const drvPhone = '9844455566';
  let drvLogin429Hit = false;
  for (let i = 0; i < 12; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/driver/login',
      body: { phone: drvPhone, pin: '1234' }
    });
    if (res.statusCode === 429) {
      drvLogin429Hit = true;
      break;
    }
  }
  report('POST /driver/login returns HTTP 429 when threshold exceeded', drvLogin429Hit);

  // 4e. /driver/signup rate limiting
  const drvSignupPhone = '9855566677';
  let drvSignup429Hit = false;
  for (let i = 0; i < 12; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/driver/signup',
      body: { phone: drvSignupPhone, name: 'Chauffeur Test', city: 'Patna' }
    });
    if (res.statusCode === 429) {
      drvSignup429Hit = true;
      break;
    }
  }
  report('POST /driver/signup returns HTTP 429 when threshold exceeded', drvSignup429Hit);

  // 4f. POST /bookings rate limiting
  const bookPhone = '9866677788';
  let book429Hit = false;
  for (let i = 0; i < 12; i++) {
    const res = await mockRequest({
      method: 'POST',
      url: '/api/bookings',
      body: {
        passengerPhone: bookPhone,
        passengerName: 'Booking Rate Tester',
        originCity: 'Patna',
        destCity: 'Gaya',
        pickupDate: '2026-11-01',
        pickupTime: '10:00 AM',
        cabTier: 'sedan'
      }
    });
    if (res.statusCode === 429) {
      book429Hit = true;
      break;
    }
  }
  report('POST /bookings returns HTTP 429 when threshold exceeded', book429Hit);

  // Test 5: Row-Level Security & IDOR Elimination (R3 AC 3)
  console.log('\n[Suite 5] Row-Level Security & Access Scoping (R3 AC 3)');
  securityService.resetRateLimit();

  // Create two distinct users and their session tokens
  const userA_Phone = '9870000001';
  const userB_Phone = '9870000002';
  const tokenA = 'otb_sess_test_user_a_' + Date.now();
  const tokenB = 'otb_sess_test_user_b_' + Date.now();

  if (!db.users) db.users = [];
  db.users.push({ id: 'usr_A', name: 'User A', phone: `+91 ${userA_Phone}`, walletBalance: 100 });
  db.users.push({ id: 'usr_B', name: 'User B', phone: `+91 ${userB_Phone}`, walletBalance: 100 });

  if (!db.sessions) db.sessions = [];
  db.sessions.push({ token: tokenA, userId: 'usr_A', phone: `+91 ${userA_Phone}`, role: 'customer' });
  db.sessions.push({ token: tokenB, userId: 'usr_B', phone: `+91 ${userB_Phone}`, role: 'customer' });

  if (!db.bookings) db.bookings = [];
  db.bookings.push({
    bookingId: 'BK_TEST_USER_A',
    passengerPhone: `+91 ${userA_Phone}`,
    passengerName: 'User A',
    totalFare: 2198,
    bookingStatus: 'CONFIRMED'
  });
  await dbService.saveDbAsync(db);

  // 5a. Unauthenticated GET /passenger/trips -> 403
  const tripsAnon = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${userA_Phone}`
  });
  report('GET /passenger/trips rejects unauthenticated caller with HTTP 403', tripsAnon.statusCode === 403);

  // 5b. Cross-user GET /passenger/trips (User B requests User A) -> 403
  const tripsCross = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${userA_Phone}`,
    headers: { authorization: `Bearer ${tokenB}` }
  });
  report('GET /passenger/trips rejects cross-user access with HTTP 403', tripsCross.statusCode === 403);

  // 5c. Authorized GET /passenger/trips (User A requests User A) -> 200
  const tripsAuthorized = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${userA_Phone}`,
    headers: { authorization: `Bearer ${tokenA}` }
  });
  report('GET /passenger/trips returns own trips for authenticated user with HTTP 200', tripsAuthorized.statusCode === 200 && tripsAuthorized.data.success);

  // 5d. Elimination of x-driver-phone bypass in /driver/earnings
  const drvA_Phone = '9870000003';
  const drvB_Phone = '9870000004';
  const driverJwtA = securityService.createJwt({ driverId: 'drv_test_A', phone: `+91 ${drvA_Phone}`, name: 'Driver A', role: 'driver' });
  const driverJwtB = securityService.createJwt({ driverId: 'drv_test_B', phone: `+91 ${drvB_Phone}`, name: 'Driver B', role: 'driver' });

  db.drivers.push({ id: 'drv_test_A', name: 'Driver A', phone: `+91 ${drvA_Phone}`, earningsToday: 2500 });
  db.drivers.push({ id: 'drv_test_B', name: 'Driver B', phone: `+91 ${drvB_Phone}`, earningsToday: 4800 });
  await dbService.saveDbAsync(db);

  // Unauthenticated /driver/earnings with header x-driver-phone -> 403
  const earnBypass = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${drvA_Phone}`,
    headers: { 'x-driver-phone': drvA_Phone }
  });
  report('GET /driver/earnings blocks x-driver-phone impersonation with HTTP 403', earnBypass.statusCode === 403);

  // Cross-driver earnings request (Driver A token requests Driver B earnings) -> 403
  const earnCross = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${drvB_Phone}`,
    headers: { authorization: `Bearer ${driverJwtA}` }
  });
  report('GET /driver/earnings blocks cross-driver query with HTTP 403', earnCross.statusCode === 403);

  // Authorized driver earnings request -> 200
  const earnOwn = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${drvA_Phone}`,
    headers: { authorization: `Bearer ${driverJwtA}` }
  });
  report('GET /driver/earnings allows authenticated driver to view own earnings with HTTP 200', earnOwn.statusCode === 200 && earnOwn.data.success);

  // Test 6: Authentication & Account Lifecycle Endpoints (R1 AC 1-5)
  console.log('\n[Suite 6] Auth & Account Lifecycle Workflows (R1 AC 1-5)');
  securityService.resetRateLimit();

  // 6a. Forgot Password & Reset Password Workflow
  const resetPhone = '98799' + Math.floor(10000 + Math.random() * 90000);
  const curDb = await dbService.getDbAsync();
  curDb.users.push({ id: `usr_reset_${Date.now()}`, name: 'Reset User', phone: `+91 ${resetPhone}` });
  await dbService.saveDbAsync(curDb);

  const forgotRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/forgot-password',
    body: { phone: resetPhone, role: 'passenger' }
  });
  report('POST /api/auth/forgot-password issues reset token', forgotRes.statusCode === 200 && forgotRes.data.resetToken);
  const resetToken = forgotRes.data.resetToken;

  // Retrieve generated OTP from DB
  const freshDb = await dbService.getDbAsync();
  const resetRecord = (freshDb.password_resets || []).find(r => r.resetToken === resetToken);
  const resetOtp = resetRecord?.otp;

  const resetRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken, otp: resetOtp, newPassword: 'securePassword2026!' }
  });
  report('POST /api/auth/reset-password successfully updates credentials', resetRes.statusCode === 200 && resetRes.data.success);

  // 6b. Email Verification Workflow
  const verifyEmailAddr = 'test.verify.user@example.com';
  const sendEmailRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/send-email-verification',
    body: { email: verifyEmailAddr, phone: '9879988111', name: 'Email Verifier' }
  });
  report('POST /api/auth/send-email-verification dispatches token', sendEmailRes.statusCode === 200 && sendEmailRes.data.verificationToken);
  const emailToken = sendEmailRes.data.verificationToken;

  const confirmEmailRes = await mockRequest({
    method: 'GET',
    url: `/api/auth/verify-email?token=${emailToken}`
  });
  report('GET /api/auth/verify-email verifies email address', confirmEmailRes.statusCode === 200 && confirmEmailRes.data.verified);

  // 6c. Driver Logout & Revoked Token Check
  const testDrvToken = securityService.createJwt({ driverId: 'drv_logout_test', role: 'driver', phone: '+91 9888877777' });
  const logoutRes = await mockRequest({
    method: 'POST',
    url: '/api/driver/logout',
    headers: { authorization: `Bearer ${testDrvToken}` }
  });
  report('POST /api/driver/logout successfully executes session invalidation', logoutRes.statusCode === 200 && logoutRes.data.success);
  const postLogoutDb = await dbService.getDbAsync();
  report('Driver token added to revoked_tokens registry', (postLogoutDb.revoked_tokens || []).includes(testDrvToken));

  // 6d. DPDP Act Account Deletion & Statutory Erasure Receipt
  const delUserPhone = '9876541234';
  const delToken = 'otb_sess_del_' + Date.now();
  db.users.push({ id: 'usr_del_test', name: 'To Be Deleted', phone: `+91 ${delUserPhone}` });
  db.sessions.push({ token: delToken, userId: 'usr_del_test', phone: `+91 ${delUserPhone}`, role: 'customer' });
  await dbService.saveDbAsync(db);

  // Request without { confirm: true } -> 400
  const delNoConfirm = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${delToken}` },
    body: { phone: delUserPhone, reason: 'Testing' }
  });
  report('POST /api/user/delete-account requires { confirm: true }', delNoConfirm.statusCode === 400);

  // Request unauthenticated -> 403
  const delUnauth = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    body: { phone: delUserPhone, confirm: true }
  });
  report('POST /api/user/delete-account blocks unauthenticated call with HTTP 401/403', delUnauth.statusCode === 401 || delUnauth.statusCode === 403);

  // Valid authenticated request with confirm: true -> 200 returning DPDP receipt
  const delSuccess = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${delToken}` },
    body: { phone: delUserPhone, confirm: true, reason: 'User requested DPDP data erasure' }
  });
  report('POST /api/user/delete-account returns DPDP Act statutory data erasure receipt', 
    delSuccess.statusCode === 200 &&
    delSuccess.data.erasureReceipt &&
    delSuccess.data.erasureReceipt.standard === 'DPDP_ACT_2023' &&
    delSuccess.data.erasureReceipt.id
  );

  // Test 7: Backend Route Proxy (POST /api/routes/toll-estimate)
  console.log('\n[Suite 7] Backend Route Proxy & Client Secret Elimination (R3 AC 4)');
  const tollRes = await mockRequest({
    method: 'POST',
    url: '/api/routes/toll-estimate',
    body: { origin: 'Patna', destination: 'Gaya', distanceKm: 108 }
  });
  report('POST /api/routes/toll-estimate calculates toll securely on backend', tollRes.statusCode === 200 && tollRes.data.tollAmount > 0 && tollRes.data.higherPriceTollApplied);

  console.log('\n======================================================');
  console.log(`📊 Final Results: ${passedTests} / ${totalTests} checks passed cleanly!`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
