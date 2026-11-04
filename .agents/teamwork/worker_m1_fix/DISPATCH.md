# Dispatch: Remediation Worker for M1/Challenger Defects

## Mission
Remediate the 2 defects identified by Challenger 2 (`challenger_m1_2`):
1. Fix `scripts/backup-db.js` so it strictly rejects snapshots missing any collection in `REQUIRED_COLLECTIONS`.
2. Purge hardcoded master passwords (`harharmahadev@1`, `admin123`) from client files:
   - `mobile/apps/admin/src/context/AdminContext.tsx`
   - `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`
   - `mobile/shared/services/api.ts`

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Challenger 2 Report: `c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2\handoff.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## File Ownership
You exclusively own:
- `scripts/backup-db.js`
- `mobile/apps/admin/src/context/AdminContext.tsx`
- `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`
- `mobile/shared/services/api.ts`

## Specific Tasks
1. In `scripts/backup-db.js` lines 145-152:
   Replace the loose normalization that creates empty arrays with strict validation:
   ```javascript
   const missingCollections = REQUIRED_COLLECTIONS.filter(col => !parsedDb.hasOwnProperty(col) || !Array.isArray(parsedDb[col]));
   if (missingCollections.length > 0) {
     throw new Error(`[Backup Verification] ❌ PAYLOAD INTEGRITY FAILURE: Missing required collections: ${missingCollections.join(', ')}`);
   }
   ```
2. In `mobile/apps/admin/src/screens/AdminLoginScreen.tsx`:
   - Initialize `password` state to `''` instead of `'harharmahadev@1'`.
   - Remove hardcoded credentials from quick demo login (prompt for actual credentials or use sanitized test stub).
3. In `mobile/apps/admin/src/context/AdminContext.tsx`:
   - Remove automatic login block that uses `'harharmahadev@1'`.
4. In `mobile/shared/services/api.ts`:
   - Remove hardcoded `'harharmahadev@1'` and `'admin123'` fallback authentication checks.
5. Run verification commands:
   - `node tests/adversarial-m1-challenger.js` (must pass 20/20 with exit code 0)
   - `node tests/test-m1-backend-security.js` (must pass 26/26 with exit code 0)
   - `npm test` (must pass with exit code 0)
   - `cd mobile; npx tsc --noEmit` (must pass with 0 errors)
6. Write handoff to `c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_fix\handoff.md` and message orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).


## 2026-10-31T14:57:42Z
You are the Remediation Worker (teamwork_worker) for Milestone M1 Challenger Defects.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_fix
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_fix\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master plan: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md
Read Challenger 2's defect report: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2\handoff.md
