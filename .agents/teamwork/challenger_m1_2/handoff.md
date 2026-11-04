# Milestone M1 Adversarial Verification Report: Database Restore, DPDP Erasure & Secret Hygiene

**Challenger**: Challenger 2 (`challenger_m1_2`)  
**Role**: Empirical Challenger (critic, specialist)  
**Date**: October 31, 2026  
**Verdict**: **DEFECT_FOUND**  
**Milestone**: M1 (Backend Hardening, Security, Lifecycle APIs, Rate Limiting & DB Backup Verification)  

---

## 1. Observation

### 1.1 Test Execution & Command Outputs
The empirical adversarial test suite `tests/adversarial-m1-challenger.js` was written and executed directly in the project environment:

- **Command**:
  ```powershell
  node tests/adversarial-m1-challenger.js
  ```
- **Execution Result**: Exited with code `1`. 18 checks passed, 2 defects found.
- **Verbatim Output**:
  ```text
  [Security Boot] 🛡️ Environment validation: NODE_ENV=test, JWT_SECRET=CONFIGURED, MONGO=CONFIGURED
  ================================================================
  ⚔️  RUNNING EMPIRICAL ADVERSARIAL CHALLENGER SUITE (M1)
  ================================================================

  --- SECTION 1: Database Restore Verification Stress Testing ---

  [Backup Verification] 🛡️ Validating snapshot integrity...
    [PASS] Altered Checksum strictly fails verifyBackup()

  [Backup Verification] 🛡️ Validating snapshot integrity...
  [Backup Verification] ✅ Checksum match: SHA-256 verified.
    [PASS] Corrupted JSON payload with valid checksum fails deserialization

  [Backup Verification] 🛡️ Validating snapshot integrity...
    [PASS] Missing database-dump.json strictly fails verifyBackup()

  [Backup Verification] 🛡️ Validating snapshot integrity...
  [Backup Verification] ✅ Checksum match: SHA-256 verified.
  [Backup Verification] Note: Optional/empty collection "bookings" normalized to array.
  [Backup Verification] Note: Optional/empty collection "users" normalized to array.
  [Backup Verification] Note: Optional/empty collection "drivers" normalized to array.
  [Backup Verification] Note: Optional/empty collection "vehicles" normalized to array.
  [Backup Verification] Note: Optional/empty collection "payments" normalized to array.
  [Backup Verification] Note: Optional/empty collection "wallet_ledger" normalized to array.
  [Backup Verification] Note: Optional/empty collection "fares" normalized to array.
  [Backup Verification] Note: Optional/empty collection "sessions" normalized to array.
  [Backup Verification] ✅ Payload integrity: 8 required collections validated (0 records).
  [Backup Verification] ✅ Dry-run restore test: 100% passed without errors.
  [Backup Verification] 🏆 Snapshot [snap-1d-missing-collections] certified 100% restorable.

    [FAIL] Missing essential collections in snapshot payload must NOT be falsely certified as 100% restorable -> DEFECT FOUND: verifyBackup() falsely certified snapshot missing ALL required collections! collectionsValidated=8, verified=true

  [Backup Verification] 🛡️ Validating snapshot integrity...
  [Backup Verification] ✅ Checksum match: SHA-256 verified.
  [Backup Verification] ✅ Payload integrity: 8 required collections validated (375 records).
  [Backup Verification] ✅ Dry-run restore test: 100% passed without errors.
  [Backup Verification] 🏆 Snapshot [snapshot-2026-10-31T14-48-11-075Z] certified 100% restorable.

    [PASS] verifyBackup() is 100% non-destructive and leaves live data/db.json byte-identical

  --- SECTION 2: DPDP Account Deletion & Data Erasure Stress Testing ---
    [PASS] POST /api/user/delete-account with confirm: false returns HTTP 400
    [PASS] POST /api/user/delete-account with string "true" is strictly rejected (requires boolean true)
    [PASS] POST /api/user/delete-account with empty body returns HTTP 400
    [PASS] POST /api/user/delete-account without auth header returns HTTP 403
    [PASS] POST /api/user/delete-account with invalid token returns HTTP 403
    [PASS] POST /api/user/delete-account blocks cross-user deletion attempt with HTTP 403
    [PASS] Target account remains untouched after cross-user deletion attempt
    [PASS] Valid deletion returns HTTP 200 with statutory DPDP_ACT_2023 erasure receipt
    [PASS] Database user record is irreversibly anonymized (PII scrubbed, phone masked, email nulled)
    [PASS] Session is wiped from sessions store and token is added to revoked_tokens registry
    [PASS] Subsequent API calls using revoked token of deleted user return HTTP 403
    [PASS] POST /api/driver/delete-account requires { confirm: true } (returns HTTP 400)
    [PASS] Driver account deletion sets dutyStatus=OFF_DUTY, scrubs PII, and returns HTTP 200

  --- SECTION 3: Secret Audit & Master Password Scan ---
    [PASS] services/security.js contains zero hardcoded plaintext passwords
    [FAIL] Client bundles (mobile monorepo & shared client services) contain zero hardcoded master passwords or private API keys -> Found secrets in client files:
        - mobile\apps\admin\src\context\AdminContext.tsx: harharmahadev@1
        - mobile\apps\admin\src\screens\AdminLoginScreen.tsx: harharmahadev@1
        - mobile\shared\services\api.ts: harharmahadev@1
        - mobile\shared\services\api.ts: admin123

  ================================================================
  📊 ADVERSARIAL TEST SUMMARY: 18 / 20 checks passed
  ⚠️  DEFECTS FOUND: 2
     1. [Missing essential collections in snapshot payload must NOT be falsely certified as 100% restorable] -> DEFECT FOUND: verifyBackup() falsely certified snapshot missing ALL required collections! collectionsValidated=8, verified=true
     2. [Client bundles (mobile monorepo & shared client services) contain zero hardcoded master passwords or private API keys] -> Found secrets in client files:
        - mobile\apps\admin\src\context\AdminContext.tsx: harharmahadev@1
        - mobile\apps\admin\src\screens\AdminLoginScreen.tsx: harharmahadev@1
        - mobile\shared\services\api.ts: harharmahadev@1
        - mobile\shared\services\api.ts: admin123
  ================================================================
  ```

---

### 1.2 Direct Observations of Identified Defects

#### Observation A: False Certification of Defective Snapshots (`scripts/backup-db.js`)
In `scripts/backup-db.js`, lines 17–27 and lines 145–164:
```javascript
// Line 17-27:
// Essential collections that must be present in a valid production backup
const REQUIRED_COLLECTIONS = [
  'bookings',
  'users',
  'drivers',
  'vehicles',
  'payments',
  'wallet_ledger',
  'fares',
  'sessions'
];

// Lines 145-164:
  let collectionsValidated = 0;
  let totalRecords = 0;

  for (const col of REQUIRED_COLLECTIONS) {
    if (!Array.isArray(parsedDb[col])) {
      console.warn(`[Backup Verification] Note: Optional/empty collection "${col}" normalized to array.`);
      parsedDb[col] = [];
    }
    collectionsValidated++;
    totalRecords += parsedDb[col].length;
  }
  console.log(`[Backup Verification] ✅ Payload integrity: ${collectionsValidated} required collections validated (${totalRecords} records).`);

  // 4. Non-Destructive In-Memory Dry-Run Restore Test
  const testDryRunDb = JSON.parse(JSON.stringify(parsedDb));
  const dryRunKeys = Object.keys(testDryRunDb);
  if (dryRunKeys.length === 0) {
    throw new Error('[Backup Verification] ❌ Dry-run restore failed: zero collections hydrated.');
  }

  console.log('[Backup Verification] ✅ Dry-run restore test: 100% passed without errors.');
  console.log(`[Backup Verification] 🏆 Snapshot [${path.basename(targetFolder)}] certified 100% restorable.\n`);
```
When `verifyBackup()` processes a corrupted payload that is completely missing `bookings`, `users`, `drivers`, etc., (e.g. `{ "metadata": { "corrupted": true } }`), it mutates `parsedDb` in-memory by setting `parsedDb[col] = []`, logs a benign warning, increments `collectionsValidated`, and declares:
`🏆 Snapshot [snap-1d-missing-collections] certified 100% restorable.`
The method returns `{ verified: true, collectionsValidated: 8, totalRecords: 0 }` instead of throwing an integrity error.

#### Observation B: Master Plaintext Passwords Hardcoded in Client Bundles
A recursive secret audit of `mobile/` revealed hardcoded administrator credentials:
1. `mobile/apps/admin/src/context/AdminContext.tsx:88`:
   ```typescript
   88: const authRes = await MobileApiClient.adminLogin('admin', 'harharmahadev@1');
   ```
2. `mobile/apps/admin/src/screens/AdminLoginScreen.tsx:24, 52-53`:
   ```typescript
   24: const [password, setPassword] = useState('harharmahadev@1');
   ...
   52: setPassword('harharmahadev@1');
   53: handleLogin('admin', 'harharmahadev@1');
   ```
3. `mobile/shared/services/api.ts:612`:
   ```typescript
   612: if ((username === 'admin' || username === 'dispatcher') && (password === 'harharmahadev@1' || password === 'admin123')) {
   ```

---

### 1.3 Direct Observations of Robust Implementations (Passes)
1. **Checksum Discrepancy Detection (`scripts/backup-db.js:125`)**:
   When `checksum.sha256` does not match the SHA-256 digest of `database-dump.json`, `verifyBackup()` strictly throws:
   `[Backup Verification] ❌ INTEGRITY DISCREPANCY: Expected ..., computed ...`.
2. **Syntax Corruption Detection (`scripts/backup-db.js:135`)**:
   Malformed JSON syntax triggers JSON deserialization failure and strictly throws:
   `[Backup Verification] ❌ JSON Deserialization failed: ...`.
3. **Missing File Detection (`scripts/backup-db.js:112`)**:
   Missing `database-dump.json` or `checksum.sha256` strictly throws:
   `Snapshot at ... is missing database-dump.json or checksum.sha256`.
4. **Non-Destructive Dry-Run Integrity (`scripts/backup-db.js:156-160`)**:
   `verifyBackup()` performs hydration solely against an in-memory duplicate (`JSON.parse(JSON.stringify(parsedDb))`). Comparing `data/db.json` before and after running `verifyBackup()` showed that `data/db.json` remained 100% bit-for-bit identical.
5. **DPDP Account Deletion (`api/index.js:1554-1644`)**:
   - `confirm !== true`: When body has `{ confirm: false }`, `{ confirm: "true" }` (string), or empty body, endpoint returns `HTTP 400 Bad Request` with message: `'Account deletion requires explicit confirmation parameter: { confirm: true }'`.
   - Authentication Enforcement: Unauthenticated requests and invalid/revoked tokens return `HTTP 403 Forbidden`.
   - Row-Level Isolation (IDOR Protection): User B attempting to delete User A's phone number returns `HTTP 403 Forbidden` (`'You can only delete your own account.'`), and User A's record remains unmodified.
   - Statutory Erasure Receipt: Successful deletion returns `HTTP 200` with `erasureReceipt` matching `standard: 'DPDP_ACT_2023'`, `status: 'ERASED'`, unique `id` (`DPDP-DEL-...`), and ISO timestamp.
   - PII Scrubbing: User record in `db.users` is irreversibly scrubbed: `name: 'Deleted User'`, `email: null`, `phone: 'DELETED_...'`, `isDeleted: true`, and `deletedAt` recorded.
   - Session & Token Invalidation: Active session is purged from `db.sessions`, and token is appended to `db.revoked_tokens`. Subsequent API calls with that token fail with `HTTP 403`.
   - Driver Deletion (`api/index.js:6999-7050`): `POST /api/driver/delete-account` requires confirmation, sets `dutyStatus: 'OFF_DUTY'`, irreversibly masks PII, and revokes driver tokens.
6. **Backend Secret Purge (`services/security.js`)**:
   Verified that `'harharmahadev@1'` has been completely purged from `services/security.js`. Password verification relies on PBKDF2 with salted hashes (`DEFAULT_HASH` and `DEFAULT_SALT`).

---

## 2. Logic Chain

1. **Premise 1 (Database Verification Standard)**:
   The user specification and dispatch instructions require that automated backup restore verification (`scripts/backup-db.js --verify` / `npm run db:restore-test`) must validate snapshot integrity and strictly reject corrupted snapshots rather than falsely certifying them.
2. **Inference from Observation A**:
   In `scripts/backup-db.js`, `REQUIRED_COLLECTIONS` defines 8 mandatory collections. However, lines 146–149 normalize any missing collection to an empty array `[]` with a non-fatal warning instead of throwing an error. As demonstrated empirically by test 1d, a corrupted dump with zero required collections was hydrated in memory with fabricated empty arrays and falsely certified with:
   `🏆 Snapshot [snap-1d-missing-collections] certified 100% restorable.`
   Therefore, `scripts/backup-db.js` possesses a critical verification flaw where corrupted or incomplete backups pass verification undetected.

3. **Premise 2 (Client Bundle Secret Hygiene Standard)**:
   Requirements R3 AC 4 and Master Feature 19 dictate: "Client bundles contain zero private secrets or API keys." Dispatch task 3 explicitly demands: "Verify that zero plaintext master passwords remain in services/security.js or client bundles."
4. **Inference from Observation B**:
   While `services/security.js` in the backend was purged of plaintext passwords, `mobile/apps/admin/src/context/AdminContext.tsx`, `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`, and `mobile/shared/services/api.ts` contain hardcoded instances of `'harharmahadev@1'` and `'admin123'`. Specifically, `AdminLoginScreen.tsx` pre-fills this password on screen load, `AdminContext.tsx` invokes auto-login using it, and `api.ts` accepts it for offline bypass.
   Therefore, client bundle secret hygiene is violated.

5. **Inference from Observation C**:
   The DPDP Act 2023 account deletion implementation in `api/index.js` satisfies all statutory requirements: explicit boolean confirmation check, IDOR isolation, unauthenticated access blocking, irreversible database anonymization, session purge, immediate token revocation, and standard-compliant receipt generation.

6. **Synthesis**:
   Because two non-negotiable security and integrity requirements failed empirical challenge (Observation A and Observation B), the appropriate milestone verification verdict must be `DEFECT_FOUND`.

---

## 3. Caveats

- **External Network Dependency**: In local sandbox execution, external network calls (e.g. Fast2SMS HTTP gateways and remote MongoDB Atlas clusters) appropriately fall back to local simulation mode and local data storage (`data/db.json`). All security, isolation, and verification assertions were tested directly against active runtime logic.
- **Scope Boundary**: As an empirical challenger, this agent did not modify any production or client code, strictly adhering to the review-only constraint.

---

## 4. Conclusion

Adversarial Verification Verdict: **DEFECT_FOUND**

### Summary of Findings:
1. **Defect 1 (CRITICAL - Data Integrity)**: `scripts/backup-db.js` falsely certifies corrupted or truncated snapshots missing required collections as `100% restorable` by mutating the payload with empty arrays during verification.
2. **Defect 2 (HIGH - Secret Hygiene)**: Master plaintext passwords (`harharmahadev@1`, `admin123`) remain hardcoded in client bundles (`mobile/apps/admin/src/context/AdminContext.tsx`, `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`, `mobile/shared/services/api.ts`), violating R3 AC 4.
3. **Confirmed Robust (PASS)**:
   - Altered SHA-256 checksum rejection in `scripts/backup-db.js` is 100% functional.
   - Corrupted JSON payload syntax rejection in `scripts/backup-db.js` is 100% functional.
   - Dry-run restore in `scripts/backup-db.js` is 100% non-destructive.
   - DPDP Act account deletion (`POST /api/user/delete-account` and `POST /api/driver/delete-account`) strictly enforces boolean confirmation, blocks unauthorized and cross-user deletion attempts, irreversibly anonymizes database PII, evicts sessions, revokes tokens, and returns valid `DPDP_ACT_2023` erasure receipts.
   - Plaintext master password was successfully purged from backend `services/security.js`.

### Actionable Remediation Steps for Workers:
1. In `scripts/backup-db.js:145-152`: Replace the normalization loop with strict validation that throws if any collection in `REQUIRED_COLLECTIONS` is missing from `parsedDb`:
   ```javascript
   const missingCollections = REQUIRED_COLLECTIONS.filter(col => !parsedDb.hasOwnProperty(col) || !Array.isArray(parsedDb[col]));
   if (missingCollections.length > 0) {
     throw new Error(`[Backup Verification] ❌ PAYLOAD INTEGRITY FAILURE: Missing required collections: ${missingCollections.join(', ')}`);
   }
   ```
2. In `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`:
   - Initialize `password` state to `''` instead of `'harharmahadev@1'`.
   - Remove hardcoded credentials from `handleQuickDemoLogin`.
3. In `mobile/apps/admin/src/context/AdminContext.tsx`:
   - Remove hardcoded credentials from auto-login fallback.
4. In `mobile/shared/services/api.ts`:
   - Remove hardcoded `'harharmahadev@1'` and `'admin123'` fallback checks.

---

## 5. Verification Method

To independently reproduce these findings and verify remediation:

1. **Run the Empirical Adversarial Challenge Suite**:
   ```powershell
   node tests/adversarial-m1-challenger.js
   ```
   *Expected Output*: Displays verbatim test pass/fail breakdown. Currently exits with code `1` highlighting the two defects above. Once fixed, exits with code `0` (`All adversarial checks passed!`).

2. **Inspect Code Locations Directly**:
   - `scripts/backup-db.js` lines 145–152 (check collection normalization loop).
   - `mobile/apps/admin/src/screens/AdminLoginScreen.tsx` lines 24 and 52–53.
   - `mobile/apps/admin/src/context/AdminContext.tsx` line 88.
   - `mobile/shared/services/api.ts` line 612.
