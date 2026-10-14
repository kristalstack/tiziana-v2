# Tiziana integrated project — deployment checklist

This repository contains the original website and an integrated implementation of authenticated contextual chat, user-controlled privacy permissions, saved conversations, explicitly approved memories, dashboard navigation, and Stripe checkout/webhook foundations.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `OPENAI_API_KEY` (server only)
- `OPENAI_VECTOR_STORE_ID`
- `TIZIANA_MODEL` (optional; default gpt-4.1)
- `TIZIANA_DAILY_LIMIT` (optional; default 40)
- `STRIPE_SECRET_KEY` (server only)
- `STRIPE_WEBHOOK_SECRET` (server only)
- `STRIPE_BOOK_PRICE_ID`
- `STRIPE_BUNDLE_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL`

## Installation

1. Make a backup of the original project.
2. Apply `supabase/migrations/20261013_tiziana_integrated.sql` in a non-production Supabase environment first. Review existing table definitions and RLS policies, especially the redundant `relationship_reflections` policies.
3. Configure environment variables without placing secrets in the repository.
4. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` in a network-enabled environment. Fix any errors before deployment.
5. Configure Stripe products, prices, and webhook endpoint `/api/stripe/webhook`.
6. Test purchases, webhooks, permissions, ownership, deletions, rate limiting, and conversations using test accounts before publishing.

## Important limitations — do not launch as a paid production service yet

- No live Supabase or Stripe access was available during implementation; no real purchase or RLS tests were performed.
- The PDF/book content is not yet served through a protected purchased-book reader. The existing book page is a marketing page with checkout controls.
- Automatic monthly subscription renewal and cancellation flows are not implemented; bundle grants three months after successful payment.
- The usage counter is not atomic under concurrent requests; it requires a transactional database function or server-side rate limiter before production.
- No load, security penetration, accessibility, or full end-to-end testing has been performed.
- No automatic memory suggestions have been implemented: explicit manual memory saving is available. The approved product vision requires optional memory proposals as a later implementation detail.
- The visual identity has been applied to the dashboard and key controls, not fully redesigned across every public page.
- Dependency installation was interrupted in this environment, so TypeScript and Next.js build validation have NOT passed. Treat this package as unverified code.
- The migration creates user-editable tables and does not audit or repair the existing relationship tables' RLS policies.

These gaps are launch blockers. Do not describe this code as a finished commercial release.
