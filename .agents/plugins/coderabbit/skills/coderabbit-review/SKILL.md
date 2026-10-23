---
name: coderabbit-review
description: CodeRabbit Code Review - Automated real-time review of git diffs, checking for logic bugs, security vulnerabilities, and code quality before committing.
---

# CodeRabbit Code Review Skill

This skill allows the agent to conduct automated, thorough code reviews matching senior developer standards before code changes are committed or merged.

## Capabilities

1. **Pre-Commit Diffs**: Review staged/unstaged changes via `coderabbit review --diff` or through the CodeRabbit MCP server.
2. **Security & Vulnerabilities**: Identify SQL injections, exposed secrets/tokens, insecure regexes, or XSS vectors.
3. **Downstream Dependency Check**: Verify if modified APIs or utility functions break calling code in other files.
4. **Style & Performance**: Flag excessive DOM manipulation, memory leaks, unhandled promises, or missing error boundaries.

## Usage Commands

```bash
# Review current working tree diff
npx -y coderabbit review --diff

# Review against main branch
npx -y coderabbit review --base main
```
