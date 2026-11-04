# Dispatch: Challenger 2 for Milestone M1

## Mission
Adversarially challenge database backup integrity, restore verification robustness, and DPDP Act data erasure validation.

## Mandatory Inputs (MUST READ FIRST)
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Project Specification: `c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md`
- Worker Handoff: `c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md`

## Adversarial Focus
1. Database backup stress: Test `node scripts/backup-db.js --verify` with corrupted snapshot files, altered checksums, or missing collection manifests to ensure it strictly fails rather than falsely certifying.
2. Account deletion & erasure validation: Test `POST /api/user/delete-account` without `{ confirm: true }`, with non-matching auth tokens, and verify that the erasure receipt conforms to `DPDP_ACT_2023`.
3. Secret scan: Verify that zero plaintext master passwords remain in `services/security.js` or client bundles.
4. Render verdict: `CONFIRMED` or `DEFECT_FOUND`.
5. Author handoff to `c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2\handoff.md` and message orchestrator (`caa8f9da-9e6f-46fd-b0de-1d76e287aaba`).


## 2026-10-31T14:45:47Z
Sender: caa8f9da-9e6f-46fd-b0de-1d76e287aaba
Priority: MESSAGE_PRIORITY_HIGH
Content:
You are Challenger 2 (teamwork_challenger) for Milestone M1.
Your working directory is: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2
Read your dispatch instructions at: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master plan: c:\Users\himan\onewaycabs\.agents\teamwork\PROJECT.md
Read the worker handoff: c:\Users\himan\onewaycabs\.agents\teamwork\worker_m1_rep\handoff.md

Your tasks:
1. Adversarially challenge database restore verification (`scripts/backup-db.js --verify`): test altered checksums, missing collections, and non-destructive dry-run restore.
2. Adversarially challenge DPDP account deletion confirmation and secret purge in `services/security.js`.
3. Render your adversarial verification verdict: CONFIRMED or DEFECT_FOUND.
4. Write your handoff to: c:\Users\himan\onewaycabs\.agents\teamwork\challenger_m1_2\handoff.md
5. Message orchestrator (caa8f9da-9e6f-46fd-b0de-1d76e287aaba) when done.
