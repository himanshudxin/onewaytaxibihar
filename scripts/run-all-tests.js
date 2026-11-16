/**
 * run-all-tests.js
 * Master test runner executing the complete testing pipeline across the entire platform.
 */

const { execSync } = require('child_process');

const testSuites = [
  { name: 'Unicode Emoji Audit', cmd: 'node scripts/scan-emojis.js' },
  { name: 'Mobile TypeScript Compilation', cmd: 'node mobile/node_modules/typescript/bin/tsc --noEmit --project mobile/tsconfig.json' },
  { name: '2D Map Integration & Multi-Provider Architecture', cmd: 'node tests/test-map-integration.js' },
  { name: 'Inline HTML Scripts Syntax Validation', cmd: 'node scripts/check-html-scripts.js' },
  { name: 'Broadcast Dispatch & Atomic Claim Engine', cmd: 'node tests/broadcast-dispatch.test.js' },
  { name: 'Hidden Autonomous Sentinel Engine', cmd: 'node tests/autonomous-engine.test.js' },
  { name: 'Autonomous 3-Way Booking Lifecycle Simulation', cmd: 'node scripts/verify-autonomous-flow.js' },
  { name: 'Cyber Defense, Anti-Hacking & Threat Jail Suite', cmd: 'node tests/security-fortress.test.js' },
  { name: 'Full Production Readiness (19 Criteria, 4 Tiers)', cmd: 'node tests/e2e-readiness.test.js' }
];

console.log('================================================================');
console.log('     ONEWAYTAXIBIHAR: MASTER PRODUCTION TEST RUNNER');
console.log('================================================================\n');

let allPassed = true;
const results = [];

for (const suite of testSuites) {
  process.stdout.write(`Executing: ${suite.name}... `);
  const start = Date.now();
  try {
    execSync(suite.cmd, { stdio: 'pipe' });
    const elapsed = Date.now() - start;
    console.log(`[PASS] (${elapsed}ms)`);
    results.push({ name: suite.name, status: 'PASS', time: elapsed });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`[FAIL] (${elapsed}ms)`);
    console.error(err.stdout ? err.stdout.toString() : err.message);
    results.push({ name: suite.name, status: 'FAIL', time: elapsed });
    allPassed = false;
  }
}

console.log('\n================================================================');
console.log('                     TEST SUMMARY REPORT');
console.log('================================================================');
results.forEach(r => {
  const badge = r.status === 'PASS' ? '  PASS  ' : '  FAIL  ';
  console.log(`[${badge}] ${r.name.padEnd(52)} (${r.time}ms)`);
});
console.log('================================================================');

if (allPassed) {
  console.log('\nALL PROCESSES TESTED & VERIFIED 100% PRODUCTION READY!\n');
  process.exit(0);
} else {
  console.error('\nSOME SUITES FAILED! Please inspect errors above.\n');
  process.exit(1);
}

