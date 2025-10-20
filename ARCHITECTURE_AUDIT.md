# Architecture Audit Report
**Date:** 2025-01-20
**Auditor:** Claude Code
**Project:** Technifold Automation Platform

---

## A. Endpoints & Roles

### 1. `/api/stripe/webhook` - Stripe webhook handler
**Status:** ⚠️ PARTIAL PASS - Needs hardening

**Findings:**
- ✅ EXISTS: `src/app/api/stripe/webhook/route.ts`
- ✅ Verifies signatures via `verifyWebhookSignature()`
- ✅ Idempotent: Checks for existing order by `stripe_checkout_session_id`
- ✅ Writes to `engagement_events` with idempotency handling
- ✅ Writes to `orders` table
- ❌ Only handles `checkout.session.completed`, missing:
  - `invoice.paid`
  - `charge.refunded`
  - `payment_intent.payment_failed` (logged but not persisted)

**Fix Required:** Add handlers for missing events

---

### 2. `/api/zoho/webhook` - Zoho CRM/email webhook handler
**Status:** ❌ FAIL - Does not exist

**Findings:**
- ❌ Route does not exist
- ❌ No shared secret verification
- ❌ No engagement event tracking for Zoho events

**Fix Required:** Create `/api/zoho/webhook` route

---

### 3. `/api/checkout` - Stripe checkout session creation
**Status:** ✅ PASS

**Findings:**
- ✅ EXISTS: `src/app/api/checkout/route.ts`
- ✅ Server-side SKU→Price ID resolution via `resolveStripePriceIds()`
- ✅ Client only sends `product_code` + `quantity`
- ✅ No amount fields accepted from client
- ✅ Metadata includes `company_id`, `contact_id`, `offer_key`, `campaign_key`
- ✅ Tracks `checkout_started` engagement event

**No fixes required**

---

### 4. `/x/[token]` - Tokenized offer pages
**Status:** ✅ PASS

**Findings:**
- ✅ EXISTS: `src/app/x/[token]/page.tsx`
- ✅ Verifies HMAC via `verifyToken()` with TTL check
- ✅ Resolves company/contact/offer from token payload
- ✅ Sets httpOnly session cookie
- ✅ Logs `offer_view` engagement event
- ✅ Extracts and stores UTM parameters

**No fixes required**

---

## B. Background Processing

### 5. `public.outbox` table
**Status:** ⚠️ PARTIAL PASS - Missing optimal index

**Findings:**
- ✅ Table exists with all required columns
- ✅ Has status, attempts, last_error columns
- ❌ Missing composite index on `(status, scheduled_for, locked_until)` for optimal worker queries

**Fix Required:** Add composite index for worker performance

---

### 6. `/api/outbox/run` - Outbox worker
**Status:** ❌ FAIL - Multiple issues

**Findings:**
- ✅ EXISTS: `src/app/api/outbox/run/route.ts`
- ❌ Accepts GET, should be POST-only
- ✅ Requires `X-CRON-SECRET` header (via Authorization: Bearer)
- ⚠️ Has locking logic but not using SELECT FOR UPDATE SKIP LOCKED
- ⚠️ Locks after fetch, potential race condition
- ✅ Implements exponential backoff

**Fix Required:** Change to POST-only, use proper transactional locking

---

### 7. Vercel Cron configuration
**Status:** ❌ FAIL - Cron not configured

**Findings:**
- ✅ `vercel.json` exists
- ❌ Crons array is EMPTY - cron job not configured!
- ❌ No scheduled execution

**Fix Required:** Add cron job to `vercel.json` with 5-15 min cadence

---

## C. Idempotency & Data Contracts

### 8. `engagement_events` unique index
**Status:** ✅ PASS

**Findings:**
- ✅ Migration `20250120_03_create_engagement_events.sql` creates unique index:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_events_source_event_id
    ON public.engagement_events(source, source_event_id)
    WHERE source_event_id IS NOT NULL;
  ```

**No fixes required**

---

### 9. `orders` unique constraint
**Status:** ⚠️ PARTIAL PASS - Missing index on payment_intent

**Findings:**
- ✅ Has unique constraint on `stripe_checkout_session_id` (UNIQUE in schema)
- ❌ Missing unique constraint on `stripe_payment_intent_id`
- ⚠️ Current idempotency only checks session_id, not payment_intent_id

**Fix Required:** Add unique index on `stripe_payment_intent_id`

---

### 10. `products` table Stripe fields
**Status:** ✅ PASS

**Findings:**
- ✅ Migration `20250120_02_add_stripe_product_fields.sql` adds:
  - `stripe_product_id`
  - `stripe_price_id_default`
- ✅ Indexed for fast lookups
- ✅ Used by `/api/checkout` for price resolution

**No fixes required**

---

## D. Security & Secrets

### 11. No client-side secrets
**Status:** ⚠️ NEEDS VERIFICATION

**Findings:**
- ✅ All API routes use `process.env.*` server-side
- ✅ Token utilities in `src/lib/tokens.ts` use server-only crypto
- ⚠️ Need to verify no .env leakage in client bundle
- ⚠️ `NEXT_PUBLIC_BASE_URL` is public (acceptable)

**Action Required:** Manual bundle analysis recommended

---

### 12. RLS (Row Level Security)
**Status:** ❌ FAIL - Not implemented

**Findings:**
- ❌ No RLS policies created in migrations
- ❌ Portal views not secured with RLS
- ❌ All data access via service role (bypasses RLS)

**Fix Required:** Create RLS policies for customer/distributor portals

---

### 13. Webhook security & logging
**Status:** ⚠️ PARTIAL PASS

**Findings:**
- ✅ Stripe webhook verifies signatures
- ❌ Zoho webhook doesn't exist
- ⚠️ Logging includes metadata but should sanitize PII
- ❌ No IP allowlist for Zoho webhooks

**Fix Required:** Add logging sanitization, implement Zoho webhook security

---

## E. Consent & Compliance

### 14. Token pages consent checks
**Status:** ❌ FAIL - Not implemented

**Findings:**
- ❌ `/x/[token]` does not check `marketing_status` or `gdpr_consent_at`
- ❌ Personalised content shown regardless of consent

**Fix Required:** Add consent checks before rendering offers

---

### 15. Unsubscribe/preferences management
**Status:** ❌ FAIL - Not implemented

**Findings:**
- ❌ No unsubscribe endpoint
- ❌ No preference management page
- ❌ No suppression checking

**Fix Required:** Add unsubscribe/preferences pages

---

## F. Admin-as-Control-Plane

### 16. Admin actions enqueue outbox jobs
**Status:** ⚠️ PARTIAL PASS

**Findings:**
- ✅ Stripe webhook enqueues `zoho_sync_order` jobs
- ❌ No admin UI actions for:
  - Manual invoice creation
  - Resend offer links
  - Approve custom offers

**Fix Required:** Add admin action buttons that enqueue jobs

---

### 17. Admin audit viewer
**Status:** ✅ PASS

**Findings:**
- ✅ `EngagementTimeline` component exists
- ✅ Displays events from `v_engagement_feed`
- ❌ No outbox job viewer/debugger

**Fix Required:** Add outbox job viewer component

---

### 18. Suggestions from deterministic view
**Status:** ✅ PASS

**Findings:**
- ✅ `SuggestionsPanel` component exists
- ✅ Driven by `v_next_best_actions` SQL view
- ✅ No opaque AI/ML calls
- ✅ Transparent business logic

**No fixes required**

---

## Summary

**Total Items:** 18
**PASS:** 7
**PARTIAL PASS:** 6
**FAIL:** 5

### Critical Fixes Required:
1. ❌ Create `/api/zoho/webhook`
2. ❌ Fix `/api/outbox/run` (POST-only, proper locking)
3. ❌ Configure Vercel cron job
4. ❌ Add RLS policies
5. ❌ Add consent checks to token pages

### High Priority:
6. ⚠️ Harden Stripe webhook (all events)
7. ⚠️ Add unique index on orders.stripe_payment_intent_id
8. ⚠️ Add composite index on outbox table
9. ⚠️ Create outbox job viewer

### Medium Priority:
10. ⚠️ Add unsubscribe/preferences management
11. ⚠️ Add admin action buttons
12. ⚠️ Sanitize webhook logging

---

**Next Steps:** Implement fixes in priority order
