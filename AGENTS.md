# Agent Operating Instructions & Workflow Stack (AGENTS.md)

This repository (`onewaycabs`) is configured with the **4-Plugin Agent Architecture**:

## 1. Active Workspace Plugins
Located in `.agents/plugins/`:
- **`gsd` (Get Shit Done)**: Phased task planning, spec-driven development, and anti-context rot boundaries.
- **`ralph-loop`**: Autonomous goal-seeking loop driven by `PRD.md` and `progress.txt`.
- **`coderabbit`**: Real-time pre-commit code review and security audits via MCP server and CLI.

---

## 2. Model Routing & Quota Auto-Switching Protocol
To ensure development never halts due to rate limits (HTTP 429 or quota caps):

1. **Default / High-Speed Tier**:
   - Primary: `Gemini 3.8 Flash` or equivalent low-latency coding model.
   - Use for: Routine refactors, repetitive edits, file searches, and component styling.

2. **Heavy Reasoning Tier**:
   - Secondary: `Gemini Pro` or `Claude 3.7 Sonnet` (via OpenRouter or model picker).
   - Use for: Architectural design, complex algorithms, multi-system integration.

3. **Quota Exhaustion Fallback Protocol**:
   - If a quota or rate-limit error is encountered on the active model, seamlessly switch model selection in the bottom model picker or use OpenRouter auto-fallback profile.
   - Never wait idle if a fallback model is available.

---

## 3. Autonomous Execution Protocol (Ralph + GSD)
- When given a broad feature request, generate or update `PRD.md` with checklist items `[ ]`.
- Execute one checklist item at a time.
- Verify tests and browser render after each edit.
- Run a CodeRabbit pre-commit scan on diffs.
- Mark item `[x]` in `PRD.md` and update `progress.txt`.
