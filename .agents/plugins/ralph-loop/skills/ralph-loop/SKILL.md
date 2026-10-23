---
name: ralph-loop
description: Ralph Loop - Autonomous iteration loop that continues until user-defined goals are 100% achieved, handling crashes and errors without quitting.
---

# Ralph Loop Autonomous Execution Skill

The Ralph Loop is an autonomous agent execution pattern for long-running, multi-step tasks. It works by decoupling execution iterations from LLM memory, ensuring maximum resilience against context fatigue, rate limits, and unexpected crashes.

## Core Files

1. **`PRD.md`**: The source of truth for requirements, feature requests, and checklist items `[ ]`.
2. **`progress.txt`**: The append-only historical log tracking:
   - What task was completed.
   - Any test results or errors encountered.
   - Next priority task.

## The Ralph Loop Cycle

On each iteration:

1. **Read State**:
   - Inspect `PRD.md` for remaining unchecked tasks `[ ]`.
   - Read the latest entries in `progress.txt` to identify current focus.
2. **Select Single Task**:
   - Pick the highest priority uncompleted item.
3. **Execute & Test**:
   - Implement the code changes.
   - Run verification commands (unit tests, syntax checks, browser validation).
4. **Self-Heal on Error**:
   - If tests fail, do NOT stop or give up. Diagnose the failure, apply fixes, and re-test.
5. **Update State & Commit**:
   - Mark the item `[x]` in `PRD.md`.
   - Append completion summary to `progress.txt`.
6. **Repeat**:
   - Loop back to Step 1 until all checklist items in `PRD.md` are marked `[x]`.

## Antigravity Integration
- Trigger via `/goal` command in Antigravity chat.
- Can be run through the *Ralph Loop for Antigravity* extension or automated script loops.
