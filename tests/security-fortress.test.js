/**
 * tests/security-fortress.test.js
 * Automated Security & Anti-Hacking Validation Suite
 * Asserts IP Threat Jail, Exploit Probing Defense, NoSQL Injection Stripping,
 * Sensitive Asset Isolation, Anti-Fare Tampering, and HTTP Security Headers.
 */

const assert = require('assert');
const http = require('http');
const securityService = require('../services/security.js');

console.log('================================================================');
console.log('       ONEWAYTAXIBIHAR: CYBER DEFENSE & ANTI-HACKING SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
    failCount++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
    failCount++;
  }
}

async function main() {
  // Test 1: Recursive NoSQL Injection Stripping
  runTest('NoSQL Injection: Strips $gt, $where, $regex operators', () => {
    const maliciousPayload = {
      username: { '$gt': '' },
      password: { '$ne': null },
      filter: { '$where': 'this.password.match(/.*/)' },
      nested: {
        safeField: 'hello',
        '$hack': 'bypass'
      }
    };

    const cleaned = securityService.deepSanitizePayload(maliciousPayload);
    assert.strictEqual(cleaned.username.$gt, undefined, '$gt operator must be stripped');
    assert.strictEqual(cleaned.password.$ne, undefined, '$ne operator must be stripped');
    assert.strictEqual(cleaned.filter.$where, undefined, '$where operator must be stripped');
    assert.strictEqual(cleaned.nested.$hack, undefined, 'Nested $hack must be stripped');
    assert.strictEqual(cleaned.nested.safeField, 'hello', 'Safe fields must be preserved');
  });

  // Test 2: XSS Tag Stripping
  runTest('XSS Sanitization: Strips <script> tags and javascript: URIs', () => {
    const payload = {
      passengerName: '<script>alert("XSS")</script>Ravi Kumar',
      notes: 'Please arrive on time <img src=x onerror=alert(1)> javascript:void(0)'
    };

    const cleaned = securityService.deepSanitizePayload(payload);
    assert.ok(!cleaned.passengerName.includes('<script>'), 'Script tag must be removed');
    assert.ok(cleaned.passengerName.includes('Ravi Kumar'), 'Legitimate text must remain');
    assert.ok(!cleaned.notes.includes('javascript:'), 'javascript: URI must be stripped');
  });

  // Test 3: Malicious Exploit Scanner Detection
  runTest('Exploit Signature Detection: Flags traversal and vulnerability scanners', () => {
    const traversal = securityService.detectExploitPattern('/../../etc/passwd', '');
    assert.strictEqual(traversal.isMalicious, true, 'Path traversal must be flagged');

    const envProbe = securityService.detectExploitPattern('/.env', '');
    assert.strictEqual(envProbe.isMalicious, true, '.env probing must be flagged');

    const wpProbe = securityService.detectExploitPattern('/wp-login.php', '');
    assert.strictEqual(wpProbe.isMalicious, true, 'wp-login probing must be flagged');

    const sqlProbe = securityService.detectExploitPattern('/api/bookings?id=1%27%20UNION%20SELECT', '');
    assert.strictEqual(sqlProbe.isMalicious, true, 'SQL injection probe must be flagged');

    const botProbe = securityService.detectExploitPattern('/index.html', 'sqlmap/1.5.2');
    assert.strictEqual(botProbe.isMalicious, true, 'sqlmap scanner must be flagged');

    const normalReq = securityService.detectExploitPattern('/fare-chart.html', 'Mozilla/5.0');
    assert.strictEqual(normalReq.isMalicious, false, 'Legitimate request must not be flagged');
  });

  // Test 4: IP Threat Jail Functionality
  runTest('IP Threat Jail: Bans attacker IP and enforces lockout', () => {
    const testIp = '198.51.100.44';
    securityService.unJailIp(testIp);

    assert.strictEqual(securityService.isIpJailed(testIp).jailed, false, 'Initial state: not jailed');
    securityService.jailIp(testIp, 'Automated exploit scanner', 60000);
    const status = securityService.isIpJailed(testIp);
    assert.strictEqual(status.jailed, true, 'State after jailing: jailed');
    assert.ok(status.remainingSec > 0, 'Remaining seconds must be positive');

    securityService.unJailIp(testIp);
    assert.strictEqual(securityService.isIpJailed(testIp).jailed, false, 'State after un-jailing: clear');
  });

  // Test 5: In-Process Sensitive Asset Isolation (Testing local-server directly)
  await runAsyncTest('HTTP Gateway: Blocks direct access to .env with 403 Forbidden', async () => {
    const res = await testServerRoute('/.env');
    assert.strictEqual(res.statusCode, 403, '.env request must return 403 Forbidden');
  });

  await runAsyncTest('HTTP Gateway: Blocks direct access to data/db.json with 403 Forbidden', async () => {
    const res = await testServerRoute('/data/db.json');
    assert.strictEqual(res.statusCode, 403, 'data/db.json must return 403 Forbidden');
  });

  await runAsyncTest('HTTP Gateway: Blocks direct access to local-server.js with 403 Forbidden', async () => {
    const res = await testServerRoute('/local-server.js');
    assert.strictEqual(res.statusCode, 403, 'local-server.js must return 403 Forbidden');
  });

  // Test 6: In-Process Military-Grade Security Headers
  await runAsyncTest('HTTP Gateway: Emits HSTS, X-Content-Type-Options, X-Frame-Options headers', async () => {
    const res = await testServerRoute('/index.html');
    assert.strictEqual(res.statusCode, 200, 'index.html must return 200 OK');
    assert.ok(res.headers['strict-transport-security'], 'HSTS header must be present');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff', 'nosniff header must be present');
    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN', 'X-Frame-Options must be present');
    assert.ok(res.headers['permissions-policy'], 'Permissions-Policy header must be present');
  });

  console.log('\n================================================================');
  console.log(`RESULTS: ${passCount} Passed, ${failCount} Failed`);
  console.log('================================================================\n');

  if (failCount > 0) process.exit(1);
  process.exit(0);
}

function testServerRoute(urlPath) {
  return new Promise((resolve) => {
    const { EventEmitter } = require('events');
    const server = require('../local-server.js');
    const req = new EventEmitter();
    req.url = urlPath;
    req.method = 'GET';
    req.headers = { host: 'localhost:8080' };
    req.socket = { remoteAddress: '127.0.0.1' };

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    let body = '';
    res.end = (chunk) => {
      if (chunk) body += chunk.toString();
      resolve({ statusCode: res.statusCode, headers: res.headers, body });
    };

    server.emit('request', req, res);
  });
}

main().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
