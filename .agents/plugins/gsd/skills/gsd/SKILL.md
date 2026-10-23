---
name: gsd
description: Get Shit Done (GSD) - Phased planning, spec execution, and context-rot prevention system for autonomous software development.
---

# Get Shit Done (GSD) Agent Skill

GSD is an execution framework designed to eliminate **Context Rot** and keep AI agents fast, precise, and disciplined over complex feature implementations.

## The GSD Lifecycle

Whenever tackling complex features or refactoring:

```text
[DISCUSS & SPEC] -> [PLAN PHASES] -> [ATOMIC EXECUTION] -> [VERIFY] -> [ATOMIC COMMIT]
```

### 1. Phase-Based Task Breakdown
- Break any large feature into discrete, numbered phases (Phase 1, Phase 2, Phase 3).
- Each phase must have a **clear, testable acceptance criterion**.
- Do NOT mix concerns: data modeling, backend logic, and frontend UI should be handled in dedicated phases.

### 2. Context Rot Prevention Rules
- **One Subtask at a Time**: Complete exactly one atomic subtask before beginning the next.
- **Externalize State**: Never rely solely on chat memory. Always write status, plans, and checklist updates to `progress.txt` or markdown specs.
- **Tidy Context**: Avoid dumping massive multi-thousand-line files into context when only a slice or specific function is needed. Use targeted inspection tools.
- **Incremental Verification**: After editing files in a phase, immediately run tests/linters or verify before proceeding. If an error occurs, fix it immediately while the context is fresh.

### 3. GSD Commands & Shortcuts
- `/plan` : Create an atomic, phased implementation plan artifact before writing code.
- `gsd:verify` : Run automated test suite and linter on touched files.
- `gsd:checkpoint` : Commit verified changes with a conventional commit message.
