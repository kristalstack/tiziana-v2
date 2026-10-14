# Tiziana — relationship reflection platform

A bilingual Next.js application (Spanish and English) combining six relationship-reflection tools, an AI conversation experience, and a digital book.

## Local development

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Create `.env.local` from the environment variable names required by your Supabase and AI integrations. Do not commit credentials.
4. Run `npm run dev` and open http://localhost:3000/es.

## Routes and content

- `/es` and `/en`: public homepage.
- `/[locale]/tiziana`: product overview.
- `/[locale]/experience`: six-tool overview.
- `/[locale]/book`, `/[locale]/blog`, `/[locale]/dating-psychology`: content and marketing.
- `/[locale]/login`: authentication.

## Access and payments

Authentication and paid entitlement verification depend on Supabase schema, environment variables, RLS policies, and production integrations. The design update does **not** bypass authorization or activate payments. Apply and review database migrations before testing gated features. Never place service-role keys in browser-exposed environment variables.

## Implementation notes

All developer-facing code and documentation is in English; localized UI text is intentionally in Spanish or English. The marketing pages have a new abstract-wave visual system. The personal relationship data flows and payment entitlements require independent end-to-end verification before launch.
