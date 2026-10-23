# Ralph Loop Execution Rules

1. **Persistence**: Never terminate a `/goal` or autonomous loop prematurely while unfinished `[ ]` tasks remain in `PRD.md`.
2. **Resilience**: If a command fails or a script crashes, inspect logs, identify root cause, fix code, and retry.
3. **Progress Logging**: Every iteration must record its outcome in `progress.txt` before claiming completion.
4. **Clean Exit**: Only conclude when all acceptance criteria are verified and marked `[x]`.
