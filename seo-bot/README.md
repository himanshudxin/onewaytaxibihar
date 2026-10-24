# OneWayTaxiBihar SEO Bot — isolated preview MVP

This folder is a separate Vercel project root. It is read-only and does not modify the parent website, its APIs, or its deployment settings.

## Included
- Password-protected dashboard with signed, HttpOnly, Secure, SameSite=Strict sessions that expire after eight hours.
- Read-only checks of a fixed allowlist of public OneWayTaxiBihar pages.
- Basic checks for title, meta description, canonical URL and H1 count.
- JSON report download.
- Noindex/no-store headers. No write API exists.

## Not included yet
Google Search Console OAuth, persistent audit logs, approval queue, automatic changes, or rollback. The findings are heuristics and require manual review.

## Deploy only as a separate Preview project
1. In Vercel, create a **new project** from this repository. Do not change the existing production project.
2. Set **Root Directory** to `seo-bot`.
3. Keep the project on a separate Vercel preview URL; do not add `onewaytaxibihar.com` as a domain.
4. Add environment variables only in the new project:
   - `SEO_BOT_PASSWORD`: a unique random password with at least 16 characters.
   - `SEO_BOT_SESSION_SECRET`: a unique random secret with at least 32 characters.
5. Enable Vercel Deployment Protection for Preview deployments, if available on your plan, before sharing the URL.
6. Deploy to Preview and test login/audit. Do not enable automated writes or connect it to the production project.

Do not put secrets in GitHub, source files, or chat. Do not use the same password as the website admin account.
