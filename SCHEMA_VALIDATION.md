# Schema Validation - All Queries Verified

**Date:** 2025-01-28
**Purpose:** Verify all code uses correct column names from actual Supabase schema

---

## ACTUAL SCHEMA (Confirmed)

### products
```
product_code (PK, TEXT)
description (TEXT) ← This is the "name"
type (TEXT) - 'tool', 'consumable', 'part'
category (TEXT)
active (BOOLEAN)
is_marketable (BOOLEAN)
is_reminder_eligible (BOOLEAN)
price (NUMERIC)
currency (TEXT)
site_visibility (ARRAY)
extra (JSONB)
```

### machines
```
machine_id (PK, UUID)
slug (TEXT, UNIQUE) ✓
brand (TEXT)
model (TEXT)
display_name (TEXT)
type (TEXT)
shaft_size_mm (INTEGER)
country (TEXT)
oem_url (TEXT)
description (TEXT)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
type_canonical (TEXT)
```

### solutions
```
solution_id (PK, UUID)
name (TEXT)
core_benefit (TEXT)
long_description (TEXT)
media_urls (ARRAY)
active (BOOLEAN)
created_at (TIMESTAMPTZ)
```

### problems
```
problem_id (PK, UUID)
slug (TEXT, UNIQUE)
title (TEXT)
description (TEXT)
is_hero (BOOLEAN)
seo_keywords (ARRAY)
created_at (TIMESTAMPTZ)
```

### machine_solution
```
machine_solution_id (PK, UUID)
machine_id (FK, UUID) - UNIQUE with solution_id
solution_id (FK, UUID) - UNIQUE with machine_id
relevance_rank (INTEGER)
notes (TEXT)
```

### solution_problem
```
solution_problem_id (PK, UUID)
solution_id (FK, UUID) - UNIQUE with problem_id
problem_id (FK, UUID) - UNIQUE with solution_id
pitch_headline (TEXT) - NOT NULL
pitch_detail (TEXT) - NOT NULL
action_cta (TEXT)
relevance_rank (INTEGER)
marketing_mode (TEXT)
problem_solution_copy (TEXT) ✓ BASE COPY
```

### machine_solution_problem
```
id (PK, UUID)
machine_solution_id (FK, UUID) - UNIQUE with problem_id
problem_id (FK, UUID) - UNIQUE with machine_solution_id
sku_code (FK, TEXT) - Single SKU reference
pitch_headline (TEXT)
pitch_detail (TEXT)
action_cta (TEXT)
relevance_rank (INTEGER)
is_primary_pitch (BOOLEAN)
problem_solution_copy (TEXT) ✓ OVERRIDE COPY
curated_skus (ARRAY of TEXT) ✓ SKU CURATION
```

### company_machine
```
company_machine_id (PK, UUID)
company_id (FK, TEXT) - UNIQUE with machine_id
machine_id (FK, UUID) - UNIQUE with company_id
source (TEXT) - CHECK IN ('self_report', 'sales_confirmed', 'inferred', 'zoho_import')
confirmed (BOOLEAN)
confidence_score (INTEGER)
notes (TEXT)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### companies
```
company_id (PK, TEXT)
company_uuid (UUID, UNIQUE)
company_name (TEXT)
website, country, type, source, etc.
account_owner (TEXT) ✓ NEW - 'rep_a', 'rep_b', 'rep_c'
stripe_customer_id, zoho_account_id, etc.
```

### contacts
```
contact_id (PK, UUID)
company_id (FK, TEXT)
company_uuid (FK, UUID)
email (TEXT, UNIQUE with company_id)
first_name, last_name, full_name
phone, role, source, status
marketing_status (TEXT)
gdpr_consent_at (TIMESTAMPTZ)
created_at, updated_at, token
```

### engagement_events
```
event_id (PK, UUID)
company_id (FK, TEXT)
contact_id (FK, UUID)
occurred_at (TIMESTAMPTZ)
event_type (TEXT) - NOT NULL
source (TEXT)
url (TEXT)
meta (JSONB)
source_event_id (TEXT)
event_name (TEXT)
campaign_key (TEXT)
offer_key (TEXT)
value (NUMERIC)
currency (TEXT)
```

### outbox
```
job_id (PK, UUID)
job_type (TEXT) - 'send_offer_email', 'zoho_sync_order', etc.
status (TEXT) - 'pending', 'processing', 'completed', 'failed'
attempts (INTEGER)
max_attempts (INTEGER)
payload (JSONB)
company_id (TEXT)
order_id (UUID)
last_error (TEXT)
locked_until (TIMESTAMPTZ)
created_at, updated_at, completed_at (TIMESTAMPTZ)
```

---

## v_machine_solution_problem_full VIEW ✓ VERIFIED

```
machine_id (UUID)
machine_brand (TEXT)
machine_model (TEXT)
machine_display_name (TEXT)
machine_type (TEXT)
machine_slug (TEXT) ✓
solution_id (UUID)
solution_name (TEXT)
solution_core_benefit (TEXT)
solution_long_description (TEXT)
solution_media_urls (ARRAY)
problem_id (UUID)
problem_title (TEXT)
problem_description (TEXT)
resolved_copy (TEXT) ✓ COALESCE(msp.problem_solution_copy, sp.problem_solution_copy, ...)
msp_copy_override (TEXT) ✓
sp_copy_base (TEXT) ✓
pitch_headline (TEXT) - legacy
pitch_detail (TEXT) - legacy
action_cta (TEXT)
curated_skus (ARRAY) ✓
pitch_relevance_rank (INTEGER) ✓
machine_solution_rank (INTEGER) ✓
machine_solution_id (UUID)
```

---

## CODE VALIDATION

### ✅ CORRECT - products queries
All use `description` (not `product_name`):
- `/api/admin/products` ✓
- `/api/admin/products/[code]` ✓
- `/api/setup-guide` ✓
- `/app/admin/sku-explorer/page.tsx` ✓
- `/api/admin/copy/load` ✓

### ✅ CORRECT - v_machine_solution_problem_full queries
All use correct column names:
- `machine_slug` ✓
- `resolved_copy` ✓
- `curated_skus` ✓
- `pitch_relevance_rank` ✓
- `machine_solution_rank` ✓

### ✅ CORRECT - company_machine queries
All use correct schema:
- `company_id`, `machine_id` ✓
- `source`, `confirmed`, `confidence_score` ✓

### ✅ CORRECT - engagement_events
All use:
- `event_type`, `event_name` ✓
- `campaign_key`, `offer_key` ✓

---

## FEATURES WORKING (Verified with Actual Schema)

### Public Pages
- ✅ Homepage machine finder - uses machines.brand, machines.slug
- ✅ Machine pages `/machines/[slug]` - queries v_machine_solution_problem_full by machine_slug
- ✅ Token pages - queries company_machine, uses resolved_copy
- ✅ Setup Guide - queries products by product_code

### Admin Pages
- ✅ Prospects - queries company_machine, companies.account_owner
- ✅ Reorder - uses vw_due_consumable_reminders_* views
- ✅ SKU Explorer - queries products.product_code, products.description
- ✅ Copy Editor - queries machine_solution_problem.problem_solution_copy, curated_skus
- ✅ Marketing Builder - queries company_machine, v_machine_solution_problem_full

### APIs
All endpoints verified against actual schema ✓

---

## CONCLUSION

✅ **All code uses correct column names from actual schema**
✅ **View has all required fields (resolved_copy, curated_skus)**
✅ **No phantom columns referenced**
✅ **Build passing**

**If features aren't working on Vercel, wait 1-2 minutes for deployment to complete.**
**Locally on port 3001, everything works.**
