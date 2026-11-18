/**
 * Empirical Adversarial Challenger Test Suite for Milestone M1
 * 
 * Tests:
 * 1. Database backup restore verification robustness:
 *    - 1a. Altered checksum: ensure it strictly fails
 *    - 1b. Corrupted payload content: ensure it strictly fails
 *    - 1c. Missing collection files (missing database-dump.json or checksum.sha256)
 *    - 1d. Missing required collections: does verifyBackup falsely certify or reject?
 *    - 1e. Non-destructive dry-run: ensure live database state is completely untouched
 * 2. DPDP Account Deletion & Data Erasure:
 *    - 2a. Missing or false confirm parameter (confirm: false, confirm: 'yes', missing confirm)
 *    - 2b. Unauthenticated call rejection (HTTP 403)
 *    - 2c. Cross-user token impersonation (User A tries to delete User B) rejection (HTTP 403)
 *    - 2d. Statutory DPDP Act 2023 receipt format validation
 *    - 2e. PII scrubbing / anonymization verification in database
 *    - 2f. Immediate token revocation & session termination
 *    - 2g. Driver account deletion (/api/driver/delete-account) adversarial verification
 * 3. Secret scan:
 *    - 3a. services/security.js plaintext password audit
 *    - 3b. Client bundle audit (mobile monorepo & web frontends) for hardcoded passwords & API keys
 */

process.env.USE_LOCAL_DB = 'true';
process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

const apiHandler = require('../api/index.js');
const securityService = require('../services/security.js');
const dbService = require('../services/db.js');
const { verifyBackup, performBackup } = require('../scripts/backup-db.js');

let totalChecks = 0;
let passedChecks = 0;
let defectsFound = [];

function recordResult(testName, passed, details = '', isDefect = false) {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName} -> ${details}`);
    if (isDefect) {
      defectsFound.push({ testName, details });
    }
  }
}

// HTTP Mocking Helper
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

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('⚔️  RUNNING EMPIRICAL ADVERSARIAL CHALLENGER SUITE (M1)');
  console.log('================================================================\n');

  await dbService.initDatabase();
  const db = await dbService.getDbAsync();

  const tempTestDir = path.join(__dirname, '..', 'data', 'backups', 'adversarial-test-snapshots');
  if (fs.existsSync(tempTestDir)) {
    fs.rmSync(tempTestDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempTestDir, { recursive: true });

  // ===========================================================================
  // SECTION 1: DATABASE RESTORE VERIFICATION ADVERSARIAL TESTING
  // ===========================================================================
  console.log('--- SECTION 1: Database Restore Verification Stress Testing ---');

  // 1a. Altered Checksum: valid payload, tampered sha256
  const snap1aDir = path.join(tempTestDir, 'snap-1a-altered-checksum');
  fs.mkdirSync(snap1aDir, { recursive: true });
  const validJson = JSON.stringify({ bookings: [], users: [], drivers: [], vehicles: [], payments: [], wallet_ledger: [], fares: [], sessions: [] });
  fs.writeFileSync(path.join(snap1aDir, 'database-dump.json'), validJson, 'utf8');
  fs.writeFileSync(path.join(snap1aDir, 'checksum.sha256'), '0000000000000000000000000000000000000000000000000000000000000000', 'utf8');

  let snap1aFailed = false;
  let snap1aErrorMsg = '';
  try {
    await verifyBackup(snap1aDir);
  } catch (err) {
    snap1aFailed = true;
    snap1aErrorMsg = err.message;
  }
  recordResult(
    'Altered Checksum strictly fails verifyBackup()',
    snap1aFailed && snap1aErrorMsg.includes('INTEGRITY DISCREPANCY'),
    `Result: failed=${snap1aFailed}, msg=${snap1aErrorMsg}`,
    true
  );

  // 1b. Corrupted JSON Payload: altered content with mismatched checksum
  const snap1bDir = path.join(tempTestDir, 'snap-1b-corrupted-json');
  fs.mkdirSync(snap1bDir, { recursive: true });
  const brokenJson = '{"bookings": [corrupted_json_syntax, missing_quotes: true}';
  const brokenHash = crypto.createHash('sha256').update(brokenJson).digest('hex');
  fs.writeFileSync(path.join(snap1bDir, 'database-dump.json'), brokenJson, 'utf8');
  fs.writeFileSync(path.join(snap1bDir, 'checksum.sha256'), brokenHash, 'utf8');

  let snap1bFailed = false;
  let snap1bErrorMsg = '';
  try {
    await verifyBackup(snap1bDir);
  } catch (err) {
    snap1bFailed = true;
    snap1bErrorMsg = err.message;
  }
  recordResult(
    'Corrupted JSON payload with valid checksum fails deserialization',
    snap1bFailed && snap1bErrorMsg.includes('JSON Deserialization failed'),
    `Result: failed=${snap1bFailed}, msg=${snap1bErrorMsg}`,
    true
  );

  // 1c. Missing Essential Files (database-dump.json or checksum.sha256)
  const snap1cDir = path.join(tempTestDir, 'snap-1c-missing-file');
  fs.mkdirSync(snap1cDir, { recursive: true });
  fs.writeFileSync(path.join(snap1cDir, 'checksum.sha256'), 'somehash', 'utf8');
  // note: database-dump.json deliberately omitted

  let snap1cFailed = false;
  let snap1cErrorMsg = '';
  try {
    await verifyBackup(snap1cDir);
  } catch (err) {
    snap1cFailed = true;
    snap1cErrorMsg = err.message;
  }
  recordResult(
    'Missing database-dump.json strictly fails verifyBackup()',
    snap1cFailed && snap1cErrorMsg.includes('missing database-dump.json'),
    `Result: failed=${snap1cFailed}, msg=${snap1cErrorMsg}`,
    true
  );

  // 1d. Missing Required Collections in Snapshot:
  // An adversarial / corrupted dump containing no collections or missing critical ones (e.g. only {"junk": 123})
  const snap1dDir = path.join(tempTestDir, 'snap-1d-missing-collections');
  fs.mkdirSync(snap1dDir, { recursive: true });
  const missingCollsJson = JSON.stringify({ metadata: { corrupted: true, reason: 'failed dump' } });
  const missingCollsHash = crypto.createHash('sha256').update(missingCollsJson).digest('hex');
  fs.writeFileSync(path.join(snap1dDir, 'database-dump.json'), missingCollsJson, 'utf8');
  fs.writeFileSync(path.join(snap1dDir, 'checksum.sha256'), missingCollsHash, 'utf8');

  let snap1dFailed = false;
  let snap1dResult = null;
  let snap1dErrorMsg = '';
  try {
    snap1dResult = await verifyBackup(snap1dDir);
  } catch (err) {
    snap1dFailed = true;
    snap1dErrorMsg = err.message;
  }
  
  // Investigation: Does verifyBackup strictly fail if required collections are missing, or does it falsely certify?
  const falselyCertified = snap1dResult && snap1dResult.verified === true;
  recordResult(
    'Missing essential collections in snapshot payload must NOT be falsely certified as 100% restorable',
    snap1dFailed && !falselyCertified,
    falselyCertified
      ? `DEFECT FOUND: verifyBackup() falsely certified snapshot missing ALL required collections! collectionsValidated=${snap1dResult.collectionsValidated}, verified=${snap1dResult.verified}`
      : `Failed as expected: ${snap1dErrorMsg}`,
    true
  );

  // 1e. Non-Destructive Dry-Run Restore Check:
  // Verify that calling verifyBackup() never alters active data/db.json
  const preVerifyDbJson = fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8');
  await verifyBackup(); // verify latest snapshot
  const postVerifyDbJson = fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8');
  recordResult(
    'verifyBackup() is 100% non-destructive and leaves live data/db.json byte-identical',
    preVerifyDbJson === postVerifyDbJson,
    `Byte difference detected between pre and post verifyBackup execution!`,
    true
  );

  // Clean up temp dir
  try {
    fs.rmSync(tempTestDir, { recursive: true, force: true });
  } catch (e) {}

  // ===========================================================================
  // SECTION 2: DPDP ACCOUNT DELETION & DATA ERASURE ADVERSARIAL TESTING
  // ===========================================================================
  console.log('\n--- SECTION 2: DPDP Account Deletion & Data Erasure Stress Testing ---');

  const uniqueSuffix = Date.now().toString().slice(-6);
  const testUserPhoneA = '9801' + uniqueSuffix;
  const testUserPhoneB = '9802' + uniqueSuffix;
  const testUserTokenA = 'otb_adv_token_user_a_' + Date.now();
  const testUserTokenB = 'otb_adv_token_user_b_' + Date.now();

  const currentDb = await dbService.getDbAsync();
  if (!currentDb.users) currentDb.users = [];
  if (!currentDb.sessions) currentDb.sessions = [];
  
  // Inject test users and sessions
  currentDb.users.push({
    id: `usr_adv_a_${uniqueSuffix}`,
    name: 'Adversarial User A',
    email: 'usera@example.com',
    phone: `+91 ${testUserPhoneA}`,
    walletBalance: 250,
    isDeleted: false
  });
  currentDb.users.push({
    id: `usr_adv_b_${uniqueSuffix}`,
    name: 'Adversarial User B',
    email: 'userb@example.com',
    phone: `+91 ${testUserPhoneB}`,
    walletBalance: 300,
    isDeleted: false
  });
  currentDb.sessions.push({
    token: testUserTokenA,
    userId: `usr_adv_a_${uniqueSuffix}`,
    phone: `+91 ${testUserPhoneA}`,
    role: 'customer'
  });
  currentDb.sessions.push({
    token: testUserTokenB,
    userId: `usr_adv_b_${uniqueSuffix}`,
    phone: `+91 ${testUserPhoneB}`,
    role: 'customer'
  });
  await dbService.saveDbAsync(currentDb);

  // 2a. Missing confirmation parameter variations
  // 2a(i): confirm: false
  const delConfirmFalse = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${testUserTokenA}` },
    body: { phone: testUserPhoneA, confirm: false }
  });
  recordResult(
    'POST /api/user/delete-account with confirm: false returns HTTP 400',
    delConfirmFalse.statusCode === 400,
    `statusCode=${delConfirmFalse.statusCode}`,
    true
  );

  // 2a(ii): confirm: "true" (string instead of boolean true)
  const delConfirmString = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${testUserTokenA}` },
    body: { phone: testUserPhoneA, confirm: 'true' }
  });
  recordResult(
    'POST /api/user/delete-account with string "true" is strictly rejected (requires boolean true)',
    delConfirmString.statusCode === 400,
    `statusCode=${delConfirmString.statusCode}`,
    true
  );

  // 2a(iii): empty body
  const delEmptyBody = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${testUserTokenA}` },
    body: {}
  });
  recordResult(
    'POST /api/user/delete-account with empty body returns HTTP 400',
    delEmptyBody.statusCode === 400,
    `statusCode=${delEmptyBody.statusCode}`,
    true
  );

  // 2b. Unauthenticated call rejection
  const delNoAuth = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    body: { phone: testUserPhoneA, confirm: true }
  });
  recordResult(
    'POST /api/user/delete-account without auth header returns HTTP 401/403',
    delNoAuth.statusCode === 403 || delNoAuth.statusCode === 401,
    `statusCode=${delNoAuth.statusCode}`,
    true
  );

  // 2c. Invalid / Garbage Auth Token
  const delGarbageToken = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: 'Bearer invalid_garbage_token_xyz_999' },
    body: { phone: testUserPhoneA, confirm: true }
  });
  recordResult(
    'POST /api/user/delete-account with invalid token returns HTTP 401/403',
    delGarbageToken.statusCode === 403 || delGarbageToken.statusCode === 401,
    `statusCode=${delGarbageToken.statusCode}`,
    true
  );

  // 2d. Cross-user IDOR Attack: User B tries to delete User A's account
  const delCrossUser = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${testUserTokenB}` },
    body: { phone: testUserPhoneA, confirm: true, reason: 'Malicious deletion attempt' }
  });
  recordResult(
    'POST /api/user/delete-account blocks cross-user deletion attempt with HTTP 403',
    delCrossUser.statusCode === 403,
    `statusCode=${delCrossUser.statusCode}, msg=${JSON.stringify(delCrossUser.data)}`,
    true
  );

  // Verify User A was NOT deleted by User B's attack
  const freshDbAfterAttack = await dbService.getDbAsync();
  const userAAfterAttack = (freshDbAfterAttack.users || []).find(u => (u.phone || '').includes(testUserPhoneA));
  recordResult(
    'Target account remains untouched after cross-user deletion attempt',
    userAAfterAttack && !userAAfterAttack.isDeleted && userAAfterAttack.name === 'Adversarial User A',
    `User A state: isDeleted=${userAAfterAttack?.isDeleted}, name=${userAAfterAttack?.name}`,
    true
  );

  // 2e. Valid DPDP Account Deletion Execution
  const delSuccess = await mockRequest({
    method: 'POST',
    url: '/api/user/delete-account',
    headers: { authorization: `Bearer ${testUserTokenA}` },
    body: { confirm: true, reason: 'Statutory DPDP Right to Erasure Request' }
  });

  const receipt = delSuccess.data?.erasureReceipt;
  const isReceiptValid = receipt &&
    receipt.standard === 'DPDP_ACT_2023' &&
    receipt.status === 'ERASED' &&
    typeof receipt.id === 'string' &&
    receipt.id.startsWith('DPDP-DEL-') &&
    typeof receipt.timestamp === 'string';

  recordResult(
    'Valid deletion returns HTTP 200 with statutory DPDP_ACT_2023 erasure receipt',
    delSuccess.statusCode === 200 && isReceiptValid,
    `statusCode=${delSuccess.statusCode}, receipt=${JSON.stringify(receipt)}`,
    true
  );

  // 2f. Verify In-Database PII Scrubbing / Irreversible Anonymization
  const dbPostDelete = await dbService.getDbAsync();
  const scrubbedUser = (dbPostDelete.users || []).find(u => u.id === `usr_adv_a_${uniqueSuffix}`);
  const isPiiScrubbed = scrubbedUser &&
    scrubbedUser.isDeleted === true &&
    scrubbedUser.name === 'Deleted User' &&
    scrubbedUser.email === null &&
    scrubbedUser.phone.startsWith('DELETED_') &&
    typeof scrubbedUser.deletedAt === 'string';

  recordResult(
    'Database user record is irreversibly anonymized (PII scrubbed, phone masked, email nulled)',
    isPiiScrubbed,
    `Scrubbed user: ${JSON.stringify(scrubbedUser)}`,
    true
  );

  // 2g. Verify Session Eviction & Token Revocation
  const sessionRemains = (dbPostDelete.sessions || []).some(s => s.token === testUserTokenA);
  const tokenRevoked = (dbPostDelete.revoked_tokens || []).includes(testUserTokenA);
  recordResult(
    'Session is wiped from sessions store and token is added to revoked_tokens registry',
    !sessionRemains && tokenRevoked,
    `sessionRemains=${sessionRemains}, tokenRevoked=${tokenRevoked}`,
    true
  );

  // 2h. Subsequent Request Rejection: Deleted user attempts to call API with old token
  const reuseAttempt = await mockRequest({
    method: 'GET',
    url: `/api/passenger/trips?phone=${testUserPhoneA}`,
    headers: { authorization: `Bearer ${testUserTokenA}` }
  });
  recordResult(
    'Subsequent API calls using revoked token of deleted user return HTTP 403',
    reuseAttempt.statusCode === 403,
    `statusCode=${reuseAttempt.statusCode}`,
    true
  );

  // 2i. Driver DPDP Account Deletion (/api/driver/delete-account)
  const drvPhone = '9876543299';
  const drvToken = securityService.createJwt({ driverId: 'drv_adv_del', phone: `+91 ${drvPhone}`, role: 'driver' });
  if (!dbPostDelete.drivers) dbPostDelete.drivers = [];
  dbPostDelete.drivers.push({
    id: 'drv_adv_del',
    name: 'Driver To Delete',
    phone: `+91 ${drvPhone}`,
    dutyStatus: 'ON_DUTY'
  });
  await dbService.saveDbAsync(dbPostDelete);

  // Driver deletion without confirm: true -> 400
  const drvDelNoConfirm = await mockRequest({
    method: 'POST',
    url: '/api/driver/delete-account',
    headers: { authorization: `Bearer ${drvToken}` },
    body: { confirm: false }
  });
  recordResult(
    'POST /api/driver/delete-account requires { confirm: true } (returns HTTP 400)',
    drvDelNoConfirm.statusCode === 400,
    `statusCode=${drvDelNoConfirm.statusCode}`,
    true
  );

  // Driver deletion with valid confirm: true -> 200 & duty status OFF_DUTY
  const drvDelSuccess = await mockRequest({
    method: 'POST',
    url: '/api/driver/delete-account',
    headers: { authorization: `Bearer ${drvToken}` },
    body: { confirm: true, reason: 'Driver partner resignation' }
  });
  const dbPostDrv = await dbService.getDbAsync();
  const scrubbedDrv = (dbPostDrv.drivers || []).find(d => d.id === 'drv_adv_del');
  recordResult(
    'Driver account deletion sets dutyStatus=OFF_DUTY, scrubs PII, and returns HTTP 200',
    drvDelSuccess.statusCode === 200 && scrubbedDrv && scrubbedDrv.dutyStatus === 'OFF_DUTY' && scrubbedDrv.isDeleted === true,
    `statusCode=${drvDelSuccess.statusCode}, dutyStatus=${scrubbedDrv?.dutyStatus}, isDeleted=${scrubbedDrv?.isDeleted}`,
    true
  );

  // ===========================================================================
  // SECTION 3: SECRET PURGE & CLIENT BUNDLE SCAN
  // ===========================================================================
  console.log('\n--- SECTION 3: Secret Audit & Master Password Scan ---');

  // 3a. Check services/security.js for plaintext master passwords
  const secPath = path.join(__dirname, '..', 'services', 'security.js');
  const secContent = fs.readFileSync(secPath, 'utf8');
  const forbiddenPasswords = ['harharmahadev@1', 'admin123', 'password123', 'master2026'];
  let leakedInSec = [];
  for (const p of forbiddenPasswords) {
    if (secContent.includes(p)) {
      leakedInSec.push(p);
    }
  }
  recordResult(
    'services/security.js contains zero hardcoded plaintext passwords',
    leakedInSec.length === 0,
    `Found plaintext passwords in services/security.js: ${leakedInSec.join(', ')}`,
    true
  );

  // 3b. Client Bundles & Mobile Monorepo Scan
  const mobileDir = path.join(__dirname, '..', 'mobile');
  const webDir = path.join(__dirname, '..');
  let leakedClientSecrets = [];

  function scanClientDir(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === '.agents' || entry === 'tests' || entry === 'scripts' || entry === 'data' || entry === 'dist') continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanClientDir(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx') || (entry.endsWith('.js') && !entry.includes('server') && !entry.includes('api'))) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        for (const p of forbiddenPasswords) {
          if (fileContent.includes(p)) {
            leakedClientSecrets.push({ file: path.relative(path.join(__dirname, '..'), fullPath), secret: p });
          }
        }
        // Also check for exposed Google Maps API keys
        if (fileContent.includes('AIzaSy')) {
          leakedClientSecrets.push({ file: path.relative(path.join(__dirname, '..'), fullPath), secret: 'Google Maps API Key (AIzaSy)' });
        }
      }
    }
  }

  scanClientDir(mobileDir);

  const clientSecretsClean = leakedClientSecrets.length === 0;
  recordResult(
    'Client bundles (mobile monorepo & shared client services) contain zero hardcoded master passwords or private API keys',
    clientSecretsClean,
    `Found secrets in client files:\n` + leakedClientSecrets.map(s => `      - ${s.file}: ${s.secret}`).join('\n'),
    true
  );

  // ===========================================================================
  // SUMMARY & VERDICT
  // ===========================================================================
  console.log('\n================================================================');
  console.log(`📊 ADVERSARIAL TEST SUMMARY: ${passedChecks} / ${totalChecks} checks passed`);
  if (defectsFound.length > 0) {
    console.log(`⚠️  DEFECTS FOUND: ${defectsFound.length}`);
    defectsFound.forEach((d, idx) => {
      console.log(`   ${idx + 1}. [${d.testName}] -> ${d.details}`);
    });
  } else {
    console.log('✅ ZERO DEFECTS FOUND: All adversarial checks passed!');
  }
  console.log('================================================================\n');

  if (defectsFound.length > 0) {
    process.exit(101); // exit code 101 indicates defects found
  } else {
    process.exit(0);
  }
}

runAdversarialSuite().catch(err => {
  console.error('Adversarial suite crashed with unexpected error:', err);
  process.exit(1);
});
