# Dispatch for Explorer 3: Web Platform, Testing Infrastructure, Telemetry & Legal Survey

## Objective
Investigate the web platform, testing infrastructure, telemetry (analytics & error tracking), and legal compliance across the codebase to assess the current state and exact requirements for R4 (Web 404), R5 (Telemetry & Legal), and the E2E verification test suite.

## Source of Truth
- Authoritative User Request: `c:\Users\himan\onewaycabs\.agents\teamwork\ORIGINAL_REQUEST.md`
- Working Directory: `c:\Users\himan\onewaycabs`

## Specific Areas to Investigate
1. Web portal architecture (framework, routes, entry points, client vs server components).
2. R4 Web: Custom 404 page for the web portal.
3. R5 Telemetry:
   - Analytics integration tracking key application events and user milestones with an external provider (e.g. Google Analytics / mock/adapter).
   - Error tracking integration capturing client exceptions and breadcrumbs with an external provider (e.g. Sentry / adapter).
4. R5 Legal Compliance:
   - Dedicated Privacy Policy and Terms of Service pages on web (reachable via footer/navigation) and mobile.
5. Testing Infrastructure & E2E Acceptance Suite:
   - Existing test runners (Jest, Vitest, Playwright, etc.), test scripts, tsconfig configurations.
   - Status of `npx tsc --noEmit` across all packages / workspaces.
   - Architecture and design for an automated end-to-end test runner verifying all 19 production-readiness criteria.
6. Identify exact file paths, missing implementations, gaps, and concrete recommendations.

## Output Requirements
Write your detailed technical report to:
`c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_3/survey_web_tests.md`
And write your completion handoff to:
`c:\Users\himan\onewaycabs\.agents\teamwork\teamwork_explorer_survey_3/handoff.md`
