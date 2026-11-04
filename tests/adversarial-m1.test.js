process.env.USE_LOCAL_DB = 'true';
process.env.NODE_ENV = 'test';

/**
 * OneWayTaxiBihar Milestone M1 Adversarial Verification Suite
 * Authored by: Challenger 1 (critic, specialist)
 *
 * Focus Areas:
 * 1. Rate limit bypass: rapid bursts, header spoofing (X-Forwarded-For, X-Real-IP), phone variations
 * 2. IDOR / RLS bypass: tampered JWTs, alg:none, expired tokens, revoked tokens, cross-user & cross-driver
 * 3. Header spoofing: x-driver-phone, x-user-token impersonation
 * 4. Auth reset edge cases: invalid OTP, expired reset token, used token, missing parameters, brute-force lockout
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const apiHandler = require('../api/index.js');
const securityService = require('../services/security.js');
const dbService = require('../services/db.js');

let passedTests = 0;
let totalTests = 0;
const failureLog = [];

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failureLog.push({ name, details });
    console.error(`  ❌ FAIL: ${name}${details ? ' - ' + details : ''}`);
  }
}

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

// Helper to construct unverified/tampered JWTs
function createTamperedJwt(payload, headerOverride = { alg: 'HS256', typ: 'JWT' }, signatureOverride = null) {
  const encHeader = Buffer.from(JSON.stringify(headerOverride)).toString('base64url');
  const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  if (signatureOverride !== null) {
    return `${encHeader}.${encPayload}.${signatureOverride}`;
  }
  // Compute dummy signature with wrong secret
  const badSig = crypto.createHmac('sha256', 'completely_wrong_secret_12345')
    .update(`${encHeader}.${encPayload}`)
    .digest('base64url');
  return `${encHeader}.${encPayload}.${badSig}`;
}

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('🛡️  STARTING ADVERSARIAL CHALLENGER VERIFICATION (MILESTONE M1)');
  console.log('================================================================\n');

  await dbService.initDatabase();
  const db = await dbService.getDbAsync();

  // -------------------------------------------------------------------------
  // SUITE 1: RATE LIMITING BURST & BYPASS ADVERSARIAL TESTING
  // -------------------------------------------------------------------------
  console.log('--- [Adversarial 1] Rate Limiting: Rapid Bursts & Bypass Resistance ---');
  securityService.resetRateLimit();

  // 1A. Concurrent Rapid Burst on POST /api/auth/login (Limit: 10 per min)
  const burstPhone = '9870100001';
  const burstPromises = [];
  for (let i = 0; i < 20; i++) {
    burstPromises.push(mockRequest({
      method: 'POST',
      url: '/api/auth/login',
      body: { phone: burstPhone, name: `Burst User ${i}` }
    }));
  }
  const burstResults = await Promise.all(burstPromises);
  const statusCodes = burstResults.map(r => r.statusCode);
  const ok200Count = statusCodes.filter(c => c === 200).length;
  const rateLimit429Count = statusCodes.filter(c => c === 429).length;

  assertTest(
    'Rapid concurrent burst (20 req) on /auth/login throttles after 10 requests',
    ok200Count === 10 && rateLimit429Count === 10,
    `Got ${ok200Count} 200s and ${rateLimit429Count} 429s`
  );

  const sample429 = burstResults.find(r => r.statusCode === 429);
  assertTest(
    'HTTP 429 response contains Retry-After header and retryAfter payload',
    sample429 && Number(sample429.headers['retry-after']) > 0 && sample429.data.retryAfter > 0
  );

  // 1B. Header Spoofing Bypass Attempt (X-Forwarded-For rotation on rate-limited phone)
  const spoofResults = [];
  for (let i = 0; i < 5; i++) {
    spoofResults.push(await mockRequest({
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'x-forwarded-for': `198.51.100.${10 + i}`,
        'x-real-ip': `203.0.113.${50 + i}`,
        'client-ip': `192.0.2.${i}`
      },
      body: { phone: burstPhone, name: 'Spoofed User' }
    }));
  }
  const allSpoofsBlocked = spoofResults.every(r => r.statusCode === 429);
  assertTest(
    'Rate limit cannot be bypassed by rotating X-Forwarded-For / X-Real-IP headers',
    allSpoofsBlocked,
    `Spoofed requests status codes: ${spoofResults.map(r => r.statusCode).join(', ')}`
  );

  // 1C. Phone String Variation Bypass Attempt (+91, spaces, leading 0, hyphens)
  securityService.resetRateLimit();
  const formatPhone = '9870100002';
  const phoneVariations = [
    formatPhone,
    `+91 ${formatPhone}`,
    `+91-${formatPhone}`,
    `0${formatPhone}`,
    `+91 ${formatPhone.slice(0, 5)} ${formatPhone.slice(5)}`,
    `91${formatPhone}`,
    `+91-${formatPhone.slice(0, 5)}-${formatPhone.slice(5)}`,
    formatPhone,
    formatPhone,
    formatPhone,
    // 11th request (should be 429)
    `+91 ${formatPhone}`
  ];

  const formatResponses = [];
  for (const pVar of phoneVariations) {
    formatResponses.push(await mockRequest({
      method: 'POST',
      url: '/api/auth/login',
      body: { phone: pVar, name: 'Format Variant User' }
    }));
  }
  const format429Hit = formatResponses[10].statusCode === 429;
  assertTest(
    'Phone formatting variations (+91, dashes, spaces, 0) collapse into same rate limit bucket',
    format429Hit,
    `11th request status code was ${formatResponses[10].statusCode}`
  );

  // 1D. Concurrent Burst on POST /api/auth/verify-otp (Limit: 10 per min)
  securityService.resetRateLimit();
  const verifyPhone = '9870100003';
  const verifyPromises = [];
  for (let i = 0; i < 15; i++) {
    verifyPromises.push(mockRequest({
      method: 'POST',
      url: '/api/auth/verify-otp',
      body: { phone: verifyPhone, otp: '000000' }
    }));
  }
  const verifyResults = await Promise.all(verifyPromises);
  const verify429s = verifyResults.filter(r => r.statusCode === 429).length;
  assertTest(
    'Rapid concurrent burst on /auth/verify-otp throttles after 10 requests',
    verify429s === 5,
    `Expected 5 429s, got ${verify429s}`
  );

  // 1E. Concurrent Burst on POST /api/driver/login (Limit: 10 per min)
  securityService.resetRateLimit();
  const drvBurstPhone = '9870100004';
  const drvLoginPromises = [];
  for (let i = 0; i < 15; i++) {
    drvLoginPromises.push(mockRequest({
      method: 'POST',
      url: '/api/driver/login',
      body: { phone: drvBurstPhone, pin: '9999' }
    }));
  }
  const drvLoginResults = await Promise.all(drvLoginPromises);
  const drvLogin429s = drvLoginResults.filter(r => r.statusCode === 429).length;
  assertTest(
    'Rapid concurrent burst on /driver/login throttles after 10 requests',
    drvLogin429s === 5,
    `Expected 5 429s, got ${drvLogin429s}`
  );

  // 1F. Rapid Burst on POST /api/bookings (Limit: 10 per min)
  securityService.resetRateLimit();
  const bookBurstPhone = '9870100005';
  const bookPromises = [];
  for (let i = 0; i < 15; i++) {
    bookPromises.push(mockRequest({
      method: 'POST',
      url: '/api/bookings',
      body: {
        passengerPhone: bookBurstPhone,
        passengerName: 'Burst Booker',
        originCity: 'Patna',
        destCity: 'Gaya',
        pickupDate: '2026-11-02',
        pickupTime: '10:00 AM',
        cabTier: 'sedan'
      }
    }));
  }
  const bookResults = await Promise.all(bookPromises);
  const book429s = bookResults.filter(r => r.statusCode === 429).length;
  assertTest(
    'Rapid burst on /bookings throttles after 10 requests with HTTP 429',
    book429s === 5,
    `Expected 5 429s, got ${book429s}`
  );


  // -------------------------------------------------------------------------
  // SUITE 2: IDOR, ROW-LEVEL SECURITY & CRYPTOGRAPHIC TOKEN TAMPERING
  // -------------------------------------------------------------------------
  console.log('\n--- [Adversarial 2] IDOR, RLS & Cryptographic Token Tampering ---');
  securityService.resetRateLimit();

  const advUserA_Phone = '9870200001';
  const advUserB_Phone = '9870200002';
  const advUserAToken = 'otb_sess_adv_user_a_' + Date.now();
  const advUserBToken = 'otb_sess_adv_user_b_' + Date.now();

  if (!db.users) db.users = [];
  db.users.push({ id: 'usr_adv_A', name: 'Adv User A', phone: `+91 ${advUserA_Phone}`, walletBalance: 100 });
  db.users.push({ id: 'usr_adv_B', name: 'Adv User B', phone: `+91 ${advUserB_Phone}`, walletBalance: 100 });

  if (!db.sessions) db.sessions = [];
  db.sessions.push({ token: advUserAToken, userId: 'usr_adv_A', phone: `+91 ${advUserA_Phone}`, role: 'customer' });
  db.sessions.push({ token: advUserBToken, userId: 'usr_adv_B', phone: `+91 ${advUserB_Phone}`, role: 'customer' });

  if (!db.bookings) db.bookings = [];
  db.bookings.push({
    bookingId: 'BK_ADV_A_SECRET',
    passengerPhone: `+91 ${advUserA_Phone}`,
    passengerName: 'Adv User A',
    totalFare: 3500,
    bookingStatus: 'CONFIRMED'
  });
  db.bookings.push({
    bookingId: 'BK_ADV_B_SECRET',
    passengerPhone: `+91 ${advUserB_Phone}`,
    passengerName: 'Adv User B',
    totalFare: 4200,
    bookingStatus: 'CONFIRMED'
  });
  await dbService.saveDbAsync(db);

  // 2A. Missing Credentials on /passenger/trips & /driver/earnings
  const unauthTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`
  });
  assertTest('Unauthenticated GET /passenger/trips returns strict HTTP 403', unauthTrips.statusCode === 403);

  const unauthEarnings = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=9870200003`
  });
  assertTest('Unauthenticated GET /driver/earnings returns strict HTTP 403', unauthEarnings.statusCode === 403);

  // 2B. Empty and Malformed Authorization Headers
  const emptyBearerTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`,
    headers: { authorization: 'Bearer ' }
  });
  assertTest('Empty Bearer token returns HTTP 403', emptyBearerTrips.statusCode === 403);

  const garbageTokenTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`,
    headers: { authorization: 'Bearer totally.invalid.garbage.token' }
  });
  assertTest('Malformed JWT token returns HTTP 403', garbageTokenTrips.statusCode === 403);

  const basicAuthTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`,
    headers: { authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' }
  });
  assertTest('Unsupported Basic Auth header returns HTTP 403', basicAuthTrips.statusCode === 403);

  // 2C. alg: none Attack on Driver Endpoint
  const noneAlgJwt = createTamperedJwt(
    { driverId: 'drv_test_A', phone: '+91 9870200003', role: 'driver', exp: Math.floor(Date.now() / 1000) + 3600 },
    { alg: 'none', typ: 'JWT' },
    ''
  );
  const noneAlgRes = await mockRequest({
    method: 'GET',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${noneAlgJwt}` }
  });
  assertTest('alg: none forged JWT is strictly rejected with HTTP 403', noneAlgRes.statusCode === 403);

  // 2D. Tampered Payload (Valid signature swapped with altered payload)
  const validDrvA_Jwt = securityService.createJwt({
    driverId: 'drv_adv_A',
    phone: '+91 9870200003',
    role: 'driver',
    name: 'Adv Driver A'
  });
  const parts = validDrvA_Jwt.split('.');
  // Modify payload to claim driverId = 'drv_adv_B' without recomputing HMAC
  const tamperedPayload = Buffer.from(JSON.stringify({
    driverId: 'drv_adv_B',
    phone: '+91 9870200004',
    role: 'driver',
    name: 'Adv Driver B',
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64url');
  const tamperedJwt = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const tamperedRes = await mockRequest({
    method: 'GET',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${tamperedJwt}` }
  });
  assertTest('Tampered JWT payload with original signature is rejected with HTTP 403', tamperedRes.statusCode === 403);

  // 2E. Forged Signature with Arbitrary Secret
  const forgedSecretJwt = createTamperedJwt({
    driverId: 'drv_adv_A',
    phone: '+91 9870200003',
    role: 'driver',
    exp: Math.floor(Date.now() / 1000) + 3600
  });
  const forgedRes = await mockRequest({
    method: 'GET',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${forgedSecretJwt}` }
  });
  assertTest('JWT signed with forged/unauthorized secret is rejected with HTTP 403', forgedRes.statusCode === 403);

  // 2F. Expired JWT Token
  const expiredJwt = securityService.createJwt(
    { driverId: 'drv_adv_A', phone: '+91 9870200003', role: 'driver', name: 'Adv Driver A' },
    securityService.JWT_SECRET,
    -3600 // Expired 1 hour ago
  );
  const expiredRes = await mockRequest({
    method: 'GET',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${expiredJwt}` }
  });
  assertTest('Expired JWT token is strictly rejected with HTTP 403', expiredRes.statusCode === 403);

  // 2G. Revoked Token in db.revoked_tokens
  const revokedJwt = securityService.createJwt({
    driverId: 'drv_adv_A',
    phone: '+91 9870200003',
    role: 'driver',
    name: 'Adv Driver A'
  });
  if (!db.revoked_tokens) db.revoked_tokens = [];
  db.revoked_tokens.push(revokedJwt);
  await dbService.saveDbAsync(db);

  const revokedRes = await mockRequest({
    method: 'GET',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${revokedJwt}` }
  });
  assertTest('Revoked JWT token in revoked_tokens registry is rejected with HTTP 403', revokedRes.statusCode === 403);

  // 2H. Cross-User IDOR: User B attempts to access User A's trips
  const crossUserTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`,
    headers: { authorization: `Bearer ${advUserBToken}` }
  });
  assertTest('Cross-user trip query (User B -> User A) is blocked with HTTP 403', crossUserTrips.statusCode === 403);

  // 2I. Cross-Driver IDOR: Driver A attempts to access Driver B's earnings
  const advDrvA_Phone = '9870200003';
  const advDrvB_Phone = '9870200004';
  const activeDrvA_Jwt = securityService.createJwt({
    driverId: 'drv_adv_A',
    phone: `+91 ${advDrvA_Phone}`,
    role: 'driver',
    name: 'Driver A'
  });

  if (!db.drivers) db.drivers = [];
  db.drivers.push({ id: 'drv_adv_A', name: 'Adv Driver A', phone: `+91 ${advDrvA_Phone}`, earningsToday: 2198 });
  db.drivers.push({ id: 'drv_adv_B', name: 'Adv Driver B', phone: `+91 ${advDrvB_Phone}`, earningsToday: 8500 });
  await dbService.saveDbAsync(db);

  const crossDriverGet = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${advDrvB_Phone}`,
    headers: { authorization: `Bearer ${activeDrvA_Jwt}` }
  });
  assertTest('Cross-driver query via query param (Driver A -> Driver B) is blocked with HTTP 403', crossDriverGet.statusCode === 403);

  const crossDriverPost = await mockRequest({
    method: 'POST',
    url: '/api/driver/earnings',
    headers: { authorization: `Bearer ${activeDrvA_Jwt}` },
    body: { phone: advDrvB_Phone }
  });
  assertTest('Cross-driver query via POST body (Driver A -> Driver B) is blocked with HTTP 403', crossDriverPost.statusCode === 403);

  // 2J. x-driver-phone Header Impersonation Bypass Rejection
  const headerSpoofEarnings = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${advDrvA_Phone}`,
    headers: { 'x-driver-phone': advDrvA_Phone }
  });
  assertTest('x-driver-phone impersonation header without bearer token is blocked with HTTP 403', headerSpoofEarnings.statusCode === 403);

  // 2K. Cross-Role Isolation: Driver JWT accessing passenger trips
  const driverOnPassengerTrips = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${advUserA_Phone}`,
    headers: { authorization: `Bearer ${activeDrvA_Jwt}` }
  });
  assertTest('Driver JWT cannot access passenger trip history (HTTP 403)', driverOnPassengerTrips.statusCode === 403);

  // 2L. Cross-Role Isolation: Passenger session accessing driver earnings
  const passengerOnDriverEarnings = await mockRequest({
    method: 'GET',
    url: `/api/driver/earnings?phone=${advDrvA_Phone}`,
    headers: { authorization: `Bearer ${advUserAToken}` }
  });
  assertTest('Passenger token cannot access driver earnings ledger (HTTP 403)', passengerOnDriverEarnings.statusCode === 403);


  // -------------------------------------------------------------------------
  // SUITE 3: AUTH RESET WORKFLOW BOUNDARY & NEGATIVE TESTING
  // -------------------------------------------------------------------------
  console.log('\n--- [Adversarial 3] Auth Reset Edge Cases & Boundary Conditions ---');
  securityService.resetRateLimit();

  // 3A. POST /api/auth/forgot-password with empty payload -> 400
  const emptyForgot = await mockRequest({
    method: 'POST',
    url: '/api/auth/forgot-password',
    body: {}
  });
  assertTest('POST /api/auth/forgot-password with empty payload returns HTTP 400', emptyForgot.statusCode === 400);

  // 3B. POST /api/auth/forgot-password with non-numeric phone and no email -> 400
  const malformedForgot = await mockRequest({
    method: 'POST',
    url: '/api/auth/forgot-password',
    body: { phone: 'abcdefghij', email: '' }
  });
  assertTest('POST /api/auth/forgot-password with non-numeric phone returns HTTP 400', malformedForgot.statusCode === 400);

  // 3C. POST /api/auth/reset-password missing resetToken -> 400
  const missingTokenReset = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { otp: '123456', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password missing resetToken returns HTTP 400', missingTokenReset.statusCode === 400);

  // 3D. POST /api/auth/reset-password missing OTP -> 400
  const missingOtpReset = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: 'rst_fake_123', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password missing OTP returns HTTP 400', missingOtpReset.statusCode === 400);

  // 3E. POST /api/auth/reset-password missing new credential -> 400
  const missingCredReset = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: 'rst_fake_123', otp: '123456' }
  });
  assertTest('POST /api/auth/reset-password missing new password/pin returns HTTP 400', missingCredReset.statusCode === 400);

  // 3F. POST /api/auth/reset-password non-existent resetToken -> 400
  const nonExistentReset = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: 'rst_non_existent_token_99999', otp: '123456', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password with non-existent token returns HTTP 400', nonExistentReset.statusCode === 400);

  // 3G. POST /api/auth/reset-password with expired resetToken -> 400
  const expiredResetToken = 'rst_expired_test_' + Date.now();
  if (!db.password_resets) db.password_resets = [];
  db.password_resets.push({
    id: 'rst_exp_test',
    resetToken: expiredResetToken,
    phone: '9870300001',
    otp: '554433',
    expiresAt: Date.now() - 60000, // Expired 1 minute ago
    attempts: 0,
    used: false
  });
  await dbService.saveDbAsync(db);

  const expiredResetRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: expiredResetToken, otp: '554433', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password with expired reset token returns HTTP 400', expiredResetRes.statusCode === 400);

  // 3H. POST /api/auth/reset-password with already used resetToken -> 400
  const usedResetToken = 'rst_used_test_' + Date.now();
  db.password_resets.push({
    id: 'rst_used_test',
    resetToken: usedResetToken,
    phone: '9870300002',
    otp: '112233',
    expiresAt: Date.now() + 600000,
    attempts: 1,
    used: true // Already used
  });
  await dbService.saveDbAsync(db);

  const usedResetRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: usedResetToken, otp: '112233', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password with already used token returns HTTP 400', usedResetRes.statusCode === 400);

  // 3I. POST /api/auth/reset-password with incorrect OTP -> 401
  const bruteResetToken = 'rst_brute_test_' + Date.now();
  db.password_resets.push({
    id: 'rst_brute_test',
    resetToken: bruteResetToken,
    phone: '9870300003',
    otp: '654321',
    expiresAt: Date.now() + 600000,
    attempts: 0,
    used: false
  });
  await dbService.saveDbAsync(db);

  const incorrectOtpRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: bruteResetToken, otp: '999999', newPassword: 'NewPassword2026!' }
  });
  assertTest('POST /api/auth/reset-password with incorrect OTP returns HTTP 401', incorrectOtpRes.statusCode === 401);

  // 3J. Brute-Force OTP lockout (5 failed attempts locks out token with HTTP 429)
  for (let attempt = 1; attempt < 5; attempt++) {
    await mockRequest({
      method: 'POST',
      url: '/api/auth/reset-password',
      body: { resetToken: bruteResetToken, otp: `00000${attempt}`, newPassword: 'NewPassword2026!' }
    });
  }
  // 6th attempt should return HTTP 429 lockout
  const lockedOutRes = await mockRequest({
    method: 'POST',
    url: '/api/auth/reset-password',
    body: { resetToken: bruteResetToken, otp: '654321', newPassword: 'NewPassword2026!' }
  });
  assertTest(
    'OTP brute-force lockout: 5 failed attempts locks out reset token with HTTP 429',
    lockedOutRes.statusCode === 429,
    `Status was ${lockedOutRes.statusCode}: ${JSON.stringify(lockedOutRes.data)}`
  );

  // -------------------------------------------------------------------------
  // FINAL ADVERSARIAL REPORT SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 ADVERSARIAL VERIFICATION SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('================================================================\n');

  if (failureLog.length > 0) {
    console.error('CRITICAL VULNERABILITIES / FAILURES DETECTED:');
    failureLog.forEach((f, idx) => {
      console.error(`  ${idx + 1}. ${f.name} -> ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('🛡️ ALL ADVERSARIAL CHALLENGES CONFIRMED ROBUST.');
    process.exit(0);
  }
}

runAdversarialSuite().catch(err => {
  console.error('Fatal crash in adversarial test runner:', err);
  process.exit(1);
});
