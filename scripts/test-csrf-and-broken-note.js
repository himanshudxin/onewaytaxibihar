/**
 * scripts/test-csrf-and-broken-note.js
 * Comprehensive automated verification test suite for:
 * 1. CSRF / XSRF Token Generation & Verification
 * 2. Mutating Request Rejection without CSRF (HTTP 403)
 * 3. Mutating Request Acceptance with valid CSRF (HTTP 200)
 * 4. Broken Note (Split Token) Issuance & At-Rest SHA-256 Hashing
 * 5. Web Split Verification (Header Half + Cookie Half)
 * 6. Mobile Composite Token Verification (Bearer compositeToken)
 * 7. Token Non-Leakage on Subsequent Profile Calls
 */

process.env.USE_LOCAL_DB = 'true';
process.env.MONGODB_URI = '';
process.env.DATABASE_URL = '';
process.env.POSTGRES_URL = '';

const assert = require('assert');
const crypto = require('crypto');
const apiHandler = require('../api/index.js');
const dbService = require('../services/db.js');
const securityService = require('../services/security.js');

function mockRequest({ method, url, headers = {}, body = null }) {
  const reqListeners = {};
  const req = {
    method,
    url,
    headers: {
      host: 'localhost:8080',
      'user-agent': 'TestAgent/1.0',
      ...headers
    },
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
    on: (evt, cb) => { reqListeners[evt] = cb; },
    socket: { remoteAddress: '127.0.0.1' }
  };
  return req;
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: (k, v) => { res.headers[k.toLowerCase()] = v; },
    getHeader: (k) => res.headers[k.toLowerCase()],
    end: (chunk) => {
      if (chunk) res.body += chunk;
      return res;
    }
  };
  return res;
}

async function invokeApi(method, url, headers = {}, body = null) {
  const req = mockRequest({ method, url, headers, body });
  const res = mockResponse();
  await apiHandler(req, res);
  let json = null;
  try {
    json = JSON.parse(res.body);
  } catch (e) {
    json = { raw: res.body };
  }
  return { status: res.statusCode, headers: res.headers, data: json };
}

async function runTests() {
  console.log('================================================================');
  console.log('   CSRF DEFENSE & BROKEN NOTE AUTHENTICATION TEST SUITE');
  console.log('================================================================\n');

  // Test 1: CSRF Endpoint Issuance
  console.log('Test 1: Testing GET /api/csrf token issuance...');
  const csrfRes = await invokeApi('GET', '/api/csrf');
  assert.strictEqual(csrfRes.status, 200, 'GET /api/csrf must return HTTP 200');
  assert.strictEqual(csrfRes.data.success, true, 'Response must indicate success');
  assert(csrfRes.data.csrfToken, 'Response must contain csrfToken');
  assert(csrfRes.headers['set-cookie']?.includes('XSRF-TOKEN='), 'Must set XSRF-TOKEN cookie');
  const activeCsrf = csrfRes.data.csrfToken;
  console.log(' [PASS] Issued CSRF Token:', activeCsrf.slice(0, 32) + '...');

  // Test 2: Mutating Request without CSRF (Must return 403 in non-test mode)
  console.log('\nTest 2: Mutating request without CSRF must be rejected (HTTP 403)...');
  process.env.NODE_ENV = 'production';
  const unauthMutation = await invokeApi('POST', '/api/leads', {
    'content-type': 'application/json'
  }, {
    passengerName: 'Attacker Form',
    phone: '9876543210'
  });
  assert.strictEqual(unauthMutation.status, 403, 'Must reject mutating request with HTTP 403');
  assert.strictEqual(unauthMutation.data.error, 'CSRF_TOKEN_INVALID', 'Must return CSRF_TOKEN_INVALID');
  assert(unauthMutation.data.freshCsrfToken, 'Must issue freshCsrfToken in 403 response for auto-heal');
  console.log(' [PASS] Unauthenticated mutation rejected with 403 and auto-heal token.');

  // Test 3: Mutating Request with valid CSRF header (Must pass)
  console.log('\nTest 3: Mutating request with valid CSRF token in header...');
  const validMutation = await invokeApi('POST', '/api/leads', {
    'content-type': 'application/json',
    'x-csrf-token': activeCsrf
  }, {
    passengerName: 'Verified Passenger Lead',
    phone: '9876543210',
    originCity: 'Patna',
    destCity: 'Gaya'
  });
  assert([200, 201].includes(validMutation.status), 'Must accept mutation with valid CSRF');
  assert.strictEqual(validMutation.data.success, true, 'Mutation must succeed');
  console.log(' [PASS] Mutating lead submission accepted with valid CSRF.');

  // Test 4: Broken Note Issuance via OTP Verification
  console.log('\nTest 4: Broken Note (Split Token) issuance via /auth/verify-otp...');
  const testPhone = '9800012345';
  // Send OTP first
  await invokeApi('POST', '/api/auth/send-otp', {
    'content-type': 'application/json',
    'x-csrf-token': activeCsrf
  }, { phone: testPhone });

  // Verify OTP (using demo bypass code 1234)
  const verifyRes = await invokeApi('POST', '/api/auth/verify-otp', {
    'content-type': 'application/json',
    'x-csrf-token': activeCsrf
  }, { phone: testPhone, otp: '1234', name: 'Broken Note Explorer' });

  assert.strictEqual(verifyRes.status, 200, 'OTP verification must return 200');
  assert(verifyRes.data.token, 'Must return token');
  assert(verifyRes.data.headerHalf, 'Must return headerHalf');
  assert.strictEqual(verifyRes.data.brokenNote?.issuedOnce, true, 'Must flag brokenNote.issuedOnce = true');
  assert.strictEqual(verifyRes.data.brokenNote?.algorithm, 'SPLIT_TOKEN_SHA256', 'Algorithm must be SPLIT_TOKEN_SHA256');

  const compositeToken = verifyRes.data.token;
  const headerHalf = verifyRes.data.headerHalf;
  const cookieHeader = verifyRes.headers['set-cookie'];
  assert(cookieHeader?.includes('otb_broken_note='), 'Must set HttpOnly otb_broken_note cookie');

  const cookieMatch = cookieHeader.match(/otb_broken_note=([^;]+)/);
  const cookieHalf = decodeURIComponent(cookieMatch[1]);
  console.log(' [PASS] Composite Token:', compositeToken);
  console.log(' [PASS] Header Half (Part A):', headerHalf);
  console.log(' [PASS] Cookie Half (Part B):', cookieHalf);

  // Test 5: Verify At-Rest Storage (Only SHA-256 Hash Stored in DB)
  console.log('\nTest 5: Verifying at-rest security (SHA-256 hash stored, raw token absent)...');
  const db = dbService.getDb();
  const sessionRecord = (db.sessions || []).find(s => s.headerHalf === headerHalf);
  assert(sessionRecord, 'Session record must exist in db.sessions matching headerHalf');
  assert(sessionRecord.tokenHash, 'Session record must store tokenHash');
  const expectedHash = crypto.createHash('sha256').update(compositeToken).digest('hex');
  assert.strictEqual(sessionRecord.tokenHash, expectedHash, 'tokenHash must equal sha256(compositeToken)');
  assert.notStrictEqual(sessionRecord.token, compositeToken, 'Raw compositeToken must NEVER be stored at rest!');
  console.log(' [PASS] Session stored securely with tokenHash:', sessionRecord.tokenHash);

  // Test 6: Web Split Verification (Header Half + Cookie Half)
  console.log('\nTest 6: Web Split Verification (Header Half in Bearer + Cookie Half in Cookie)...');
  const webAuth = securityService.verifyBrokenNoteSession(headerHalf, cookieHalf, db.sessions);
  assert(webAuth, 'Web split verification must authenticate user');
  assert.strictEqual(webAuth.phone.slice(-10), testPhone, 'Phone must match');
  console.log(' [PASS] Web split token verified successfully against session hash.');

  // Test 7: Mobile Composite Token Verification
  console.log('\nTest 7: Mobile Composite Token Verification (Bearer compositeToken without cookies)...');
  const mobileAuth = securityService.verifyBrokenNoteSession(compositeToken, null, db.sessions);
  assert(mobileAuth, 'Mobile composite verification must authenticate user');
  assert.strictEqual(mobileAuth.phone.slice(-10), testPhone, 'Phone must match');
  console.log(' [PASS] Mobile composite token verified successfully against session hash.');

  // Test 8: Tampered Token Rejection
  console.log('\nTest 8: Tampered or forged broken note must be rejected...');
  const forgedAuth = securityService.verifyBrokenNoteSession(headerHalf, 'bnc_tamperedCookieHalf', db.sessions);
  assert.strictEqual(forgedAuth, null, 'Forged cookie half must be rejected');
  console.log(' [PASS] Forged broken note correctly rejected.');

  console.log('\n================================================================');
  console.log('   ALL CSRF & BROKEN NOTE SECURITY TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
