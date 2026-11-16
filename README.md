# Edgelink SEO Automation Dashboard

Starter implementation for the supplied Edgelink Technology assessment. It follows the required Next.js 14 App Router + Tailwind, BullMQ/Redis, Fetch + Cheerio, Claude, Postgres, Puppeteer and mocked PageSpeed/GSC/DataForSEO/Twilio architecture.

## Important architecture note
BullMQ workers are long-running Node processes. Run `npm run worker` separately from the Next.js web process (local machine or a persistent worker host/VPS). Do not rely on a short-lived Vercel serverless function to host a BullMQ Worker. The assessment's worker-on-VPS architecture is the reliable pattern.

## Requirements
- Node.js 20+
- Postgres database (Neon or Supabase)
- Redis TLS connection that supports BullMQ (Upstash Redis database connection URL, not REST URL)
- Anthropic API key for live Claude. If `USE_MOCKS=true` and no Anthropic key is present, the app returns a clearly-labelled deterministic local fallback so you can run the whole pipeline without spending API credits.

## Setup
1. Copy `.env.example` to `.env.local` (Next.js) and `.env` (worker) or load the same environment in both processes.
2. Set `DATABASE_URL`, `REDIS_URL`, and `CRON_SECRET`. Add `ANTHROPIC_API_KEY` if you want real Claude analysis.
3. Run `npm install`.
4. Execute `db/schema.sql` against your Postgres database.
5. Start web: `npm run dev`.
6. In another terminal start worker: `npm run worker`.
7. Open http://localhost:3000, go to Admin portal, submit the sample dental clinic URL, then refresh the audit list. Client dashboard displays saved results.

## Environment
`USE_MOCKS=true` is required for the assessment mock PageSpeed, GSC, DataForSEO and WhatsApp integrations. The provided sample data has been copied into `src/mocks/`. `USE_MOCKS=false` intentionally does not implement GSC/DataForSEO/Twilio real APIs because the assessment explicitly says to mock these.

## Worker implementation
The worker uses the same TS source as the app. Run it with `node --import tsx worker/index.ts` after installing `tsx`, or compile the project. This repository includes `tsx` as a dev dependency in the worker setup instructions below.

## Worker command (recommended)
The package already includes `tsx` and the worker script.

## Security and limitations
- The demo portals are not authenticated. Do not expose them publicly with real client data until authentication, authorization, tenant isolation, CSRF protections, rate limiting, and secure report storage are added.
- URL validation blocks obvious local hosts, but production crawling needs robust DNS/IP checks on every redirect to prevent SSRF.
- Reports are stored locally in `reports/`; use object storage for deployment. Local disk on Vercel is ephemeral.
- Puppeteer may need a compatible deployment target/runtime. For a persistent worker, install Chrome dependencies or use a supported headless-browser service.
- Email delivery is mentioned in the assessment output but no email provider credentials or required mock file are specified. Add a provider or a console-log email adapter if the evaluator expects it.
- This is a functional assessment starter, not a production-ready multi-tenant SaaS.

## Assessment demonstration video (3–5 minutes)
Show: audit created in admin → job appears in BullMQ/worker logs → progress updates in Postgres/admin → AI JSON saved → PDF downloaded. Explain which integrations are mocked.

## Submission
Create a GitHub repository containing source, README and `.env.example`. Never commit `.env` or API keys. Send repo and 3–5 minute video link to hr@edgelinktechnology.com with subject `Technical Assessment — AI Developer — [Your Full Name]`.
