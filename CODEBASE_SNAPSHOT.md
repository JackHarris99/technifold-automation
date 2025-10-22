# Technifold Consumables Portal - Complete Codebase Snapshot

**Generated:** 2025-10-22
**Purpose:** Complete technical documentation for code review without repo access

---

## Repo Map (Concise)

### App Routes (`src/app/`)

**Public Pages:**
- `page.tsx` - Homepage/marketing landing
- `products/page.tsx` - Product catalog browse
- `tri-creaser/page.tsx` - Tri-Creaser product family page
- `spine-creaser/page.tsx` - Spine Creaser product family page
- `tools/[category]/page.tsx` - Dynamic tool category pages
- `contact/page.tsx` - Contact form
- `datasheet/[product_code]/page.tsx` - Technical datasheets (PDF-style)

**Customer Portal:**
- `portal/[token]/page.tsx` - Tokenized customer portal (reorder history + recommendations)
- `x/[token]/page.tsx` - **CANONICAL** tokenized offer landing with progressive machine picker

**Admin Panel:**
- `admin/page.tsx` - Admin dashboard (company list, engagement feed, suggestions)
- `admin/customer/[company_id]/page.tsx` - Customer detail with tabs (Profile, Orders, Outbox, Engagement)
- `admin/campaigns/page.tsx` - Campaign list (CRUD against `public.campaigns`)
- `admin/campaigns/new/page.tsx` - Create new campaign
- `admin/campaigns/[campaignKey]/page.tsx` - Edit campaign, view stats from `v_campaign_interactions`
- `admin/campaigns/confirm/page.tsx` - Machine knowledge confirmation queue (reads `v_knowledge_confirmation_queue`)

**API Routes:**
- `api/checkout/route.ts` - POST: Create Stripe checkout session
- `api/stripe/webhook/route.ts` - POST: Handle Stripe webhooks (checkout.session.completed, payment_intent.*, invoice.*, charge.refunded)
- `api/zoho/webhook/route.ts` - POST: Handle Zoho CRM webhooks (email_opened, email_clicked, email_unsubscribed, etc.)
- `api/offers/machine-selection/route.ts` - POST: Record machine selection, upsert `company_beliefs`, track `engagement_events`
- `api/admin/companies/[companyId]/contacts/route.ts` - GET: Fetch contacts for a company
- `api/admin/engagement-feed/route.ts` - GET: Fetch engagement timeline for admin
- `api/admin/quotes/create/route.ts` - POST: Create quote (sends to outbox for Zoho sync)
- `api/admin/offers/send/route.ts` - POST: Generate tokenized offer link, send to outbox
- `api/admin/suggestions/route.ts` - GET: Fetch AI-driven suggestions from `v_next_best_actions`
- `api/admin/outbox/retry/route.ts` - POST: Retry failed outbox job
- `api/outbox/run/route.ts` - POST: Cron job endpoint to process outbox queue (requires CRON_SECRET)
- `api/[token]/route.ts` - GET: Resolve token to company portal URL (legacy redirect)

### Components (`src/components/`)

**Marketing:**
- `marketing/HeroSection.tsx` - Homepage hero
- `marketing/ProductShowcase.tsx` - Featured products
- `marketing/ToolCategoryCards.tsx` - Tool category grid
- `marketing/CategoryCard.tsx` - Individual category card
- `marketing/ProductCategoriesMenu.tsx` - Navigation menu
- `marketing/MarketingHeader.tsx` - Public site header
- `marketing/MarketingFooter.tsx` - Public site footer

**Admin:**
- `admin/AdminDashboard.tsx` - Main admin dashboard layout
- `admin/AdminHeader.tsx` - Admin navigation header
- `admin/CompanyGrid.tsx` - Company cards grid view
- `admin/CompanyList.tsx` - Company table view
- `admin/CompanyDetailTabs.tsx` - Tabbed interface for customer details
- `admin/CustomerProfilePage.tsx` - Customer profile tab content
- `admin/CustomerProfilePageEnhanced.tsx` - Enhanced profile with engagement
- `admin/CompanyHeader.tsx` - Customer detail page header
- `admin/EngagementTimeline.tsx` - Timeline of customer interactions (reads `v_engagement_feed`)
- `admin/OrdersTable.tsx` - Orders history table
- `admin/OutboxJobsTable.tsx` - Outbox queue status table
- `admin/SuggestionsPanel.tsx` - AI suggestions panel (reads `v_next_best_actions`)
- `admin/CreateQuoteModal.tsx` - Modal for creating quotes
- `admin/SendOfferModal.tsx` - Modal for sending tokenized offers
- `admin/ToolsAndConsumablesSection.tsx` - Product recommendations
- `admin/DatasheetList.tsx` - List of available datasheets
- `admin/DatasheetGrid.tsx` - Grid of datasheet cards

**Customer Portal:**
- `PortalPage.tsx` - Customer portal main page
- `ReorderTab.tsx` - Reorder history tab
- `ToolTab.tsx` - Tools and consumables tab
- `CartBar.tsx` - Shopping cart sidebar
- `QuantityPicker.tsx` - Quantity input with +/- buttons

**Offers:**
- `offers/MachineSelector.tsx` - **Progressive 3-level machine picker** (family → brand → model) with skip options

**Technical:**
- `technical/TechnicalDataSheet.tsx` - PDF-style datasheet component

**Shared:**
- `shared/CopyButton.tsx` - Copy to clipboard button

### Libraries (`src/lib/`)

- `supabase.ts` - Supabase client singleton (service role key)
- `tokens.ts` - HMAC token generation/verification for secure offer links (72h TTL)
- `stripe-client.ts` - Stripe SDK wrapper (checkout, customers, webhooks)
- `zoho-books-client.ts` - Zoho Books API client (invoices, payments, contacts)
- `productImages.ts` - Product image URL resolver

### Migrations (`supabase/migrations/`)

- `20250120_01_add_integration_fields.sql` - Add Stripe/Zoho fields to companies/products
- `20250120_02_add_stripe_product_fields.sql` - Add stripe_product_id, stripe_price_id_default to products
- `20250120_03_create_engagement_events.sql` - Create `engagement_events` table with idempotency index
- `20250120_04_create_outbox_table.sql` - Create `outbox` table for async job queue
- `20250120_05_create_orders_table.sql` - Create `orders` table for Stripe → Zoho sync
- `20250120_06_create_engagement_views.sql` - Create `v_engagement_feed`, `v_next_best_actions` views
- `20250120_07_harden_outbox_and_indexes.sql` - Add concurrency locks, indexes to outbox
- `20250120_08_create_payload_v2_view.sql` - Create `vw_company_consumable_payload` view

---

## Environment & Secrets

### Environment Variables

| Variable | Type | Where Used | Server-Only? | Set In |
|----------|------|------------|--------------|--------|
| `SUPABASE_URL` | Required | All Supabase queries | ✅ | Local + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Server-side Supabase client | ✅ | Local + Vercel |
| `STRIPE_SECRET_KEY` | Required | Stripe API calls | ✅ | Local + Vercel |
| `STRIPE_WEBHOOK_SECRET` | Required | Stripe webhook signature verification | ✅ | Vercel only |
| `TOKEN_HMAC_SECRET` | Required | Token generation/verification for offers | ✅ | Local + Vercel |
| `ZOHO_WEBHOOK_SECRET` | Required | Zoho webhook authentication | ✅ | Vercel only |
| `ZOHO_CLIENT_ID` | Optional | Zoho Books OAuth | ✅ | Local + Vercel |
| `ZOHO_CLIENT_SECRET` | Optional | Zoho Books OAuth | ✅ | Local + Vercel |
| `ZOHO_REFRESH_TOKEN` | Optional | Zoho Books API access | ✅ | Local + Vercel |
| `ZOHO_ORGANIZATION_ID` | Optional | Zoho Books org context | ✅ | Local + Vercel |
| `ZOHO_BOOKS_API_BASE` | Optional | Zoho Books API endpoint | ✅ | Local + Vercel |
| `CRON_SECRET` | Required | Outbox cron job authentication | ✅ | Vercel only |
| `NEXT_PUBLIC_BASE_URL` | Required | Public site URL for links | ❌ | Local + Vercel |
| `NODE_ENV` | Auto | Environment detection | ❌ | Auto-set |

**Notes:**
- Webhook secrets (`STRIPE_WEBHOOK_SECRET`, `ZOHO_WEBHOOK_SECRET`) are **only** set in Vercel (production)
- Local development uses test mode Stripe keys
- Zoho integration is optional; if missing, sync jobs will log warnings but not fail
- `CRON_SECRET` is used to authenticate `/api/outbox/run` cron job

---

## Database Contracts (Authoritative)

### Core Tables (Existing, Not Created by App)

#### `public.companies`
**Columns Read:**
- `company_id` (TEXT, PK)
- `company_name` (TEXT)
- `company_uuid` (UUID)
- `type` (TEXT) - 'customer' | 'prospect'
- `stripe_customer_id` (TEXT)
- `portal_token` (TEXT)
- `last_invoice_at` (TIMESTAMPTZ)
- `first_invoice_at` (TIMESTAMPTZ)
- `zoho_contact_id` (TEXT)

**Columns Written:**
- `stripe_customer_id` - Set by Stripe checkout (first order)

**Foreign Keys:**
- Referenced by: `engagement_events`, `orders`, `contacts`, `company_beliefs`

---

#### `public.contacts`
**Columns Read:**
- `contact_id` (UUID, PK)
- `company_id` (TEXT, FK → companies)
- `company_uuid` (UUID)
- `email` (TEXT)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `full_name` (TEXT)
- `marketing_status` (TEXT) - 'opted_in' | 'pending' | 'opted_out' | 'unsubscribed'
- `gdpr_consent_at` (TIMESTAMPTZ)

**Columns Written:**
- `marketing_status` - Updated to 'unsubscribed' by Zoho webhook on email_unsubscribed

**Foreign Keys:**
- `company_id` → `companies.company_id`
- Referenced by: `engagement_events`, `orders`

**Indexes Used:**
- `email` - For contact lookup by email in Zoho webhook

---

#### `public.products`
**Columns Read:**
- `product_code` (TEXT, PK)
- `description` (TEXT)
- `price` (NUMERIC)
- `currency` (TEXT)
- `stripe_product_id` (TEXT)
- `stripe_price_id_default` (TEXT)
- `is_marketable` (BOOLEAN)
- `category` (TEXT)

**Columns Written:**
- `stripe_product_id` - Created on first checkout if missing
- `stripe_price_id_default` - Created on first checkout if missing

**Foreign Keys:**
- Referenced by: Orders items JSONB

---

#### `public.sales`
**Columns Read:**
- `company_id` (TEXT)
- `invoice_number` (TEXT)
- `txn_date` (DATE)
- `line_total` (NUMERIC)

**Purpose:** Historical sales data for suggestions and reorder predictions

---

#### `public.catalog_products`
**Columns Read:**
- `product_code` (TEXT)
- `description` (TEXT)
- `category` (TEXT)

**Purpose:** Product catalog browsing

---

#### `public.tool_consumable_map`
**Columns Read:**
- Tool-to-consumable relationship mapping

**Purpose:** Product recommendations

---

### Canonical Campaign Tables (Must Exist in Supabase)

#### `public.asset_models`
**Columns Read/Written:**
- `model_id` (TEXT, PK)
- `level` (INTEGER) - 1=family, 2=brand, 3=model
- `parent_id` (TEXT) - FK to parent model_id
- `slug` (TEXT)
- `display_name` (TEXT)
- `brand` (TEXT)
- `model` (TEXT)

**Usage:**
- Read by `/x/[token]` to build progressive picker
- Hierarchical: level 1 → 2 → 3 (family → brand → model)

**Queries:**
```sql
-- Fetch all models ordered by level
SELECT * FROM asset_models ORDER BY level ASC, display_name ASC;

-- Filter families (level 1)
SELECT * FROM asset_models WHERE level = 1;

-- Filter brands by parent family
SELECT * FROM asset_models WHERE level = 2 AND parent_id = 'folding-machines';

-- Filter models by parent brand
SELECT * FROM asset_models WHERE level = 3 AND parent_id = 'heidelberg-stahlfolder';
```

---

#### `public.company_beliefs`
**Columns Read/Written:**
- `belief_id` (UUID, PK)
- `company_id` (TEXT, FK → companies)
- `model_id` (TEXT, FK → asset_models)
- `confidence` (INTEGER) - 1=inferred, 2=clicked, 3=admin_confirm, 4=verified_by_order
- `source` (TEXT) - 'offer_click' | 'admin_confirm' | 'order_verification'
- `contact_id` (UUID, FK → contacts) - Who selected/confirmed
- `evidence` (JSONB) - Click/confirmation history
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Usage:**
- Upserted by `/api/offers/machine-selection` when user selects machine (confidence=2)
- Updated by `/admin/campaigns/confirm` when admin confirms (confidence=3)
- Read by `/x/[token]` to check if machine already known (confidence ≥ 2)

**Queries:**
```sql
-- Check if company's machine is known
SELECT * FROM company_beliefs
WHERE company_id = 'ABC123' AND confidence >= 2
ORDER BY confidence DESC LIMIT 1;

-- Upsert belief on machine selection
INSERT INTO company_beliefs (company_id, model_id, confidence, source, contact_id, evidence)
VALUES ('ABC123', 'heidelberg-ti52', 2, 'offer_click', '...', '{"event_id": "..."}')
ON CONFLICT (company_id, model_id) DO UPDATE
SET confidence = 2, source = 'offer_click', evidence = ..., updated_at = NOW();

-- Admin confirm
UPDATE company_beliefs
SET confidence = 3, source = 'admin_confirm', evidence = jsonb_set(...), updated_at = NOW()
WHERE belief_id = '...';
```

**Evidence Structure:**
```json
{
  "event_id": "uuid",
  "url": "/x/token123",
  "campaign_key": "spring_2025",
  "offer_key": "reorder_reminder",
  "clicked_at": "2025-10-22T10:00:00Z",
  "offer_clicks": [
    {"event_id": "...", "clicked_at": "..."}
  ],
  "admin_confirmations": [
    {"confirmed_at": "...", "previous_confidence": 2}
  ],
  "admin_rejections": [
    {"rejected_at": "...", "previous_confidence": 2}
  ]
}
```

---

#### `public.campaigns`
**Columns Read/Written:**
- `campaign_key` (TEXT, PK)
- `name` (TEXT)
- `status` (TEXT) - 'draft' | 'active' | 'paused' | 'archived'
- `offer_key` (TEXT) - Links to offer content customization
- `target_level` (INTEGER) - Target companies with machines at this level
- `target_model_id` (TEXT) - Target companies with this specific machine
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Usage:**
- CRUD by `/admin/campaigns/*` routes
- Read by campaign stats via `v_campaign_interactions`

**Queries:**
```sql
-- List all campaigns
SELECT * FROM campaigns ORDER BY created_at DESC;

-- Create campaign
INSERT INTO campaigns (campaign_key, name, status, offer_key, target_level, target_model_id)
VALUES ('spring_2025_reorder', 'Spring 2025 Reorder Reminder', 'active', 'reorder_reminder', 3, 'heidelberg-ti52');

-- Update campaign
UPDATE campaigns SET name = '...', status = '...', updated_at = NOW() WHERE campaign_key = '...';

-- Delete campaign
DELETE FROM campaigns WHERE campaign_key = '...';
```

---

### App-Created Tables

#### `public.engagement_events`
**Columns:**
- `event_id` (UUID, PK)
- `occurred_at` (TIMESTAMPTZ) - Event timestamp (defaults to NOW())
- `company_id` (TEXT, FK → companies)
- `company_uuid` (UUID)
- `contact_id` (UUID, FK → contacts)
- `source` (TEXT) - 'zoho' | 'vercel' | 'stripe' | 'admin' | 'other'
- `source_event_id` (TEXT) - External event ID for idempotency
- `event_name` (TEXT) - Event type (see Event Names below)
- `offer_key` (TEXT)
- `campaign_key` (TEXT)
- `session_id` (UUID)
- `url` (TEXT)
- `utm_source` (TEXT)
- `utm_medium` (TEXT)
- `utm_campaign` (TEXT)
- `utm_term` (TEXT)
- `utm_content` (TEXT)
- `value` (NUMERIC) - Monetary value
- `currency` (TEXT) - Default 'GBP'
- `meta` (JSONB) - Flexible event metadata
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `(company_id)`, `(company_uuid)`, `(contact_id)`
- `(occurred_at DESC)`
- `(source)`, `(event_name)`
- `(offer_key)` WHERE NOT NULL
- `(campaign_key)` WHERE NOT NULL
- **UNIQUE** `(source, source_event_id)` WHERE source_event_id NOT NULL - **Idempotency**

**Event Names (Canonical):**
- `offer_view` - User viewed tokenized offer page
- `machine_selected` - User selected machine in picker
- `checkout_started` - User initiated Stripe checkout
- `checkout_completed` - Stripe checkout succeeded
- `payment_failed` - Payment attempt failed
- `invoice_paid` - Stripe invoice paid
- `charge_refunded` - Stripe charge refunded
- `email_sent` - Zoho email sent
- `email_delivered` - Zoho email delivered
- `email_opened` - Zoho email opened
- `email_clicked` - Zoho email link clicked
- `email_bounced` - Zoho email bounced
- `unsubscribe` - User unsubscribed (canonical name, mapped from 'email_unsubscribed')
- `admin_confirm` - Admin confirmed machine knowledge
- `admin_reject` - Admin rejected machine knowledge
- `portal_visit` - User visited customer portal
- `datasheet_view` - User viewed product datasheet

**Idempotency:**
- Insert failures with `code='23505'` or `message LIKE '%duplicate%'` are caught and ignored
- Ensures same event from external source (Zoho, Stripe) isn't duplicated

---

#### `public.orders`
**Columns:**
- `order_id` (UUID, PK)
- `company_id` (TEXT, FK → companies)
- `contact_id` (UUID, FK → contacts)
- `stripe_checkout_session_id` (TEXT, UNIQUE)
- `stripe_payment_intent_id` (TEXT)
- `stripe_customer_id` (TEXT)
- `offer_key` (TEXT)
- `campaign_key` (TEXT)
- `items` (JSONB) - Array of `{product_code, description, quantity, unit_price, total_price}`
- `subtotal` (NUMERIC)
- `tax_amount` (NUMERIC)
- `total_amount` (NUMERIC)
- `currency` (TEXT)
- `status` (TEXT) - 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded'
- `payment_status` (TEXT) - 'unpaid' | 'paid' | 'partially_refunded' | 'refunded'
- `zoho_invoice_id` (TEXT)
- `zoho_payment_id` (TEXT)
- `zoho_synced_at` (TIMESTAMPTZ)
- `zoho_sync_error` (TEXT)
- `meta` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `paid_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

**Indexes:**
- `(company_id)`, `(contact_id)`
- `(stripe_checkout_session_id)` WHERE NOT NULL
- `(stripe_payment_intent_id)` WHERE NOT NULL
- `(status)`, `(payment_status)`
- `(zoho_invoice_id)` WHERE NOT NULL
- `(created_at DESC)`
- `(offer_key)` WHERE NOT NULL

**Idempotency:**
- Orders are created only if `stripe_checkout_session_id` doesn't already exist

---

#### `public.outbox`
**Columns:**
- `job_id` (UUID, PK)
- `job_type` (TEXT) - 'zoho_sync_order' | 'zoho_create_quote' | 'send_offer_email'
- `status` (TEXT) - 'pending' | 'processing' | 'completed' | 'failed'
- `attempts` (INTEGER)
- `max_attempts` (INTEGER) - Default 3
- `payload` (JSONB)
- `company_id` (TEXT)
- `order_id` (UUID)
- `error` (TEXT)
- `locked_until` (TIMESTAMPTZ) - Concurrency lock
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

**Indexes:**
- `(status, locked_until, attempts)` - For job queue processing
- `(company_id)`, `(order_id)`
- `(created_at DESC)`

**Purpose:**
- Async job queue for Zoho sync, email sending, etc.
- Processed by `/api/outbox/run` cron job (every 5 minutes)

---

### Views

#### `public.v_engagement_feed`
**Columns:**
- `event_id`, `occurred_at`, `company_id`, `company_uuid`, `company_name`
- `contact_id`, `contact_name`
- `source`, `event_name`, `offer_key`, `campaign_key`, `url`
- `value`, `currency`, `meta`
- `event_description` (TEXT) - Human-readable description
- `event_category` (TEXT) - 'purchase' | 'email' | 'view' | 'click' | 'event'

**Purpose:** Admin engagement timeline

**Usage:**
```sql
SELECT * FROM v_engagement_feed
WHERE company_id = 'ABC123'
ORDER BY occurred_at DESC LIMIT 50;
```

---

#### `public.v_next_best_actions`
**Columns:**
- `company_id`, `action_type`, `action_label`, `reason`, `priority_score`, `action_meta`

**Action Types:**
- `reorder_reminder` - Customer typically reorders but hasn't recently
- `engagement_needed` - High-value customer hasn't engaged in 180+ days
- `portal_invite` - Customer has orders but hasn't used portal

**Purpose:** AI-driven suggestions for admin

**Usage:**
```sql
SELECT * FROM v_next_best_actions ORDER BY priority_score DESC LIMIT 10;
```

---

#### `public.v_campaign_interactions`
**Columns (Expected):**
- `campaign_key`, `company_id`, `contact_id`, `event_name`, `occurred_at`, `meta`

**Purpose:** Campaign performance stats

**Usage:**
```sql
-- Count interactions per campaign
SELECT COUNT(*) FROM v_campaign_interactions WHERE campaign_key = 'spring_2025';

-- Count unique companies
SELECT COUNT(DISTINCT company_id) FROM v_campaign_interactions WHERE campaign_key = 'spring_2025';

-- Count unique contacts
SELECT COUNT(DISTINCT contact_id) FROM v_campaign_interactions WHERE campaign_key = 'spring_2025' AND contact_id IS NOT NULL;
```

**NOTE:** This view is READ by the code but **NOT** created by migrations. It must exist in Supabase. Expected definition:
```sql
CREATE OR REPLACE VIEW public.v_campaign_interactions AS
SELECT
  campaign_key, company_id, contact_id, event_name, occurred_at, meta
FROM engagement_events
WHERE campaign_key IS NOT NULL;
```

---

#### `public.v_knowledge_confirmation_queue`
**Columns (Expected):**
- `belief_id`, `company_id`, `company_name`, `model_id`, `model_display_name`, `model_level`
- `confidence`, `source`, `contact_id`, `evidence`, `created_at`, `updated_at`

**Purpose:** Admin review queue for machine knowledge (confidence 1-2)

**Usage:**
```sql
-- Fetch pending confirmations
SELECT * FROM v_knowledge_confirmation_queue
WHERE confidence IN (1, 2)
ORDER BY confidence DESC, updated_at ASC;
```

**NOTE:** This view is READ by the code but **NOT** created by migrations. It must exist in Supabase. Expected definition:
```sql
CREATE OR REPLACE VIEW public.v_knowledge_confirmation_queue AS
SELECT
  cb.belief_id, cb.company_id, c.company_name,
  cb.model_id, am.display_name AS model_display_name, am.level AS model_level,
  cb.confidence, cb.source, cb.contact_id, cb.evidence,
  cb.created_at, cb.updated_at
FROM company_beliefs cb
JOIN companies c ON cb.company_id = c.company_id
JOIN asset_models am ON cb.model_id = am.model_id
WHERE cb.confidence <= 3;
```

---

#### `public.vw_company_consumable_payload`
**Purpose:** Portal recommendations (pre-calculated consumables for company machines)

**Usage:** Read by customer portal to suggest products

---

### Missing Tables (Not in Migrations, Assumed to Exist)

These tables are **queried** by the code but **not created** by app migrations. They must already exist in Supabase:

1. ✅ `public.companies` - Core customer/prospect data
2. ✅ `public.contacts` - Contact records with email/marketing status
3. ✅ `public.products` - Product catalog with pricing
4. ✅ `public.sales` - Historical sales data (for suggestions)
5. ✅ `public.catalog_products` - Browsable product catalog
6. ✅ `public.tool_consumable_map` - Tool-to-consumable relationships
7. ⚠️  `public.asset_models` - **Canonical machine hierarchy** (must exist)
8. ⚠️  `public.company_beliefs` - **Canonical machine knowledge** (must exist)
9. ⚠️  `public.campaigns` - **Canonical campaign definitions** (must exist)
10. ⚠️  `public.v_campaign_interactions` - **View** (must be created in Supabase)
11. ⚠️  `public.v_knowledge_confirmation_queue` - **View** (must be created in Supabase)

---

## External Integrations

### Stripe

**SDK Version:** `stripe@latest` (API version: `2024-12-18.acacia`)

**Methods Used:**
- `stripe.products.create()` - Create product if `stripe_product_id` missing
- `stripe.prices.create()` - Create price if `stripe_price_id_default` missing
- `stripe.customers.create()` - Create customer on first order
- `stripe.checkout.sessions.create()` - Create checkout session
- `stripe.checkout.sessions.retrieve()` - Retrieve session with expanded line items
- `stripe.webhooks.constructEvent()` - Verify webhook signature

**Webhook Events Handled:**
1. `checkout.session.completed` → Create order, track `checkout_completed` event, enqueue Zoho sync
2. `payment_intent.succeeded` → Update order status to 'paid'
3. `payment_intent.payment_failed` → Track `payment_failed` event, set order status to 'cancelled'
4. `invoice.paid` → Track `invoice_paid` event (for subscriptions/manual invoices)
5. `charge.refunded` → Update order `payment_status` to 'refunded' or 'partially_refunded', track `charge_refunded` event

**Product Code → Price Mapping:**
- Products table has `stripe_product_id` and `stripe_price_id_default`
- If missing, `resolveStripePriceIds()` creates Stripe product/price on-the-fly
- Price = `product.price * 100` (converted to cents)
- Currency = `product.currency` (default 'GBP')

**Stripe Tax:**
- ✅ Enabled via `automatic_tax: { enabled: true }`
- Requires Stripe Tax to be configured in Stripe Dashboard

**Promotion Codes:**
- ✅ Enabled via `allow_promotion_codes: true`

**Metadata Passed to Stripe:**
- Checkout Session: `company_id`, `contact_id`, `offer_key`, `campaign_key`, `product_codes` (JSON array)
- Used to link orders back to campaigns and track attribution

**Idempotency:**
- Orders are created only if `stripe_checkout_session_id` doesn't already exist (UNIQUE constraint)
- Engagement events use `(source='stripe', source_event_id=session.id)` for idempotency

---

### Zoho

**Integration Points:**
1. **Zoho Books API** (via `zoho-books-client.ts`)
   - OAuth 2.0 flow (client_id, client_secret, refresh_token)
   - Create invoices from Stripe orders
   - Record payments against invoices
   - Sync customers/contacts

2. **Zoho CRM Webhooks** (via `/api/zoho/webhook`)
   - Receives email engagement events
   - Validates `X-Zoho-Secret` header

**Zoho Webhook Events Handled:**
- `email_sent` → Track as engagement event
- `email_delivered` → Track as engagement event
- `email_opened` → Track as engagement event
- `email_clicked` → Track as engagement event
- `email_bounced` → Track as engagement event
- `email_unsubscribed` → Map to canonical `unsubscribe` event, update `contacts.marketing_status = 'unsubscribed'`
- `campaign_sent`, `form_submitted`, `webinar_registered`, `deal_created`, `deal_won` → Track as engagement events

**Event Mapping (Zoho → Canonical):**
```javascript
{
  'email_sent': 'email_sent',
  'email_delivered': 'email_delivered',
  'email_opened': 'email_opened',
  'email_clicked': 'email_clicked',
  'email_bounced': 'email_bounced',
  'email_unsubscribed': 'unsubscribe',  // Canonical name
  'campaign_sent': 'campaign_sent',
  'form_submitted': 'form_submitted',
  'webinar_registered': 'webinar_registered',
  'deal_created': 'deal_created',
  'deal_won': 'deal_won',
}
```

**Contact Resolution:**
- If webhook provides `contact_id`, use directly
- If webhook provides `email`, lookup in `contacts` table by email
- Fetch `company_id` and `company_uuid` from contact record

**Idempotency:**
- Uses `(source='zoho', source_event_id=payload.event_id)` for idempotency
- Duplicate events return 200 with `{success: true, message: 'Event already processed'}`

**Outbox Sync:**
- When Stripe order completes, job enqueued in `outbox` table with `job_type='zoho_sync_order'`
- Cron job (`/api/outbox/run`) processes queue, calls Zoho Books API
- Order record updated with `zoho_invoice_id`, `zoho_payment_id`, `zoho_synced_at`
- Failures logged to `outbox.error`, retried up to `max_attempts` (default 3)

---

## How to Prove It Works

### 1. Generate a Valid Token Locally

**Node.js Script:**
```javascript
const crypto = require('crypto');

const TOKEN_TTL_HOURS = 72;
const TOKEN_HMAC_SECRET = process.env.TOKEN_HMAC_SECRET; // Must match .env.local

function generateToken(payload, ttlHours = TOKEN_TTL_HOURS) {
  const expiresAt = Date.now() + (ttlHours * 60 * 60 * 1000);
  const fullPayload = { ...payload, expires_at: expiresAt };

  const payloadStr = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');

  const hmac = crypto.createHmac('sha256', TOKEN_HMAC_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

// Example usage
const token = generateToken({
  company_id: 'ABC123',
  contact_id: 'uuid-here', // Optional
  offer_key: 'reorder_reminder',
  campaign_key: 'spring_2025'
});

console.log(`http://localhost:3000/x/${token}?utm_source=email&utm_campaign=spring_2025`);
```

**Or via API:**
```bash
# Using existing admin API (if available)
curl -X POST http://localhost:3000/api/admin/offers/send \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "ABC123",
    "contact_id": "uuid-here",
    "offer_key": "reorder_reminder",
    "campaign_key": "spring_2025"
  }'
```

---

### 2. Test `/x/[token]` Offer Page

**Request:**
```bash
curl -v "http://localhost:3000/x/YOUR_TOKEN_HERE?utm_source=email&utm_campaign=spring_2025"
```

**Expected:**
- Returns HTML page with offer content
- Shows company name: "Exclusive Offer for {company_name}"
- If no existing belief (confidence < 2): Shows progressive machine picker (family → brand → model)
- If existing belief (confidence ≥ 2): Shows "We know your machine: {model_display_name}"
- If contact opted out: Shows limited "unsubscribed" version

**Side Effects (Verify in DB):**
```sql
-- Check engagement event was logged
SELECT * FROM engagement_events
WHERE company_id = 'ABC123'
  AND event_name = 'offer_view'
  AND campaign_key = 'spring_2025'
ORDER BY occurred_at DESC LIMIT 1;

-- Expected: 1 row with source='vercel', offer_key='reorder_reminder', utm_source='email'
```

---

### 3. Test Machine Selection

**Request:**
```bash
curl -X POST http://localhost:3000/api/offers/machine-selection \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "company_id": "ABC123",
    "contact_id": "uuid-here",
    "model_id": "heidelberg-ti52",
    "brand": "Heidelberg",
    "model": "Stahlfolder Ti52",
    "offer_key": "reorder_reminder",
    "campaign_key": "spring_2025"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "event_id": "uuid-here"
}
```

**Side Effects (Verify in DB):**
```sql
-- Check engagement event
SELECT * FROM engagement_events
WHERE company_id = 'ABC123'
  AND event_name = 'machine_selected'
ORDER BY occurred_at DESC LIMIT 1;

-- Expected: meta = {"model_id": "heidelberg-ti52", "brand": "Heidelberg", "model": "Stahlfolder Ti52", "selection_source": "offer_picker"}

-- Check company_beliefs upserted
SELECT * FROM company_beliefs
WHERE company_id = 'ABC123'
  AND model_id = 'heidelberg-ti52';

-- Expected: confidence=2, source='offer_click', evidence contains event_id and click timestamp
```

---

### 4. Test Zoho Webhook (email_clicked)

**Request:**
```bash
curl -X POST http://localhost:3000/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zoho-Secret: YOUR_ZOHO_WEBHOOK_SECRET" \
  -d '{
    "event_type": "email_clicked",
    "event_id": "zoho_event_12345",
    "email": "john@abc123.com",
    "campaign_key": "spring_2025",
    "offer_key": "reorder_reminder",
    "url": "https://example.com/x/token123",
    "occurred_at": "2025-10-22T10:00:00Z",
    "metadata": {
      "email_subject": "Time to restock!",
      "link_text": "View Offer"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "event_id": "zoho_event_12345"
}
```

**Side Effects (Verify in DB):**
```sql
-- Contact lookup by email
SELECT contact_id, company_id FROM contacts WHERE email = 'john@abc123.com';

-- Check engagement event
SELECT * FROM engagement_events
WHERE source = 'zoho'
  AND source_event_id = 'zoho_event_12345';

-- Expected: event_name='email_clicked', company_id resolved from contact, meta contains email_subject, link_text
```

**Test Idempotency:**
```bash
# Send same request again
curl -X POST http://localhost:3000/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zoho-Secret: YOUR_ZOHO_WEBHOOK_SECRET" \
  -d '{ ... same payload ... }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event already processed"
}
```

**Verify in DB:**
```sql
-- Should still be only 1 row (not duplicated)
SELECT COUNT(*) FROM engagement_events
WHERE source = 'zoho'
  AND source_event_id = 'zoho_event_12345';

-- Expected: COUNT = 1
```

---

### 5. Test Checkout Flow

**Request:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "ABC123",
    "contact_id": "uuid-here",
    "items": [
      {"product_code": "TRI-001", "quantity": 2},
      {"product_code": "TRI-002", "quantity": 1}
    ],
    "offer_key": "reorder_reminder",
    "campaign_key": "spring_2025"
  }'
```

**Expected Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

**Side Effects (Verify in DB):**
```sql
-- Check checkout_started event
SELECT * FROM engagement_events
WHERE company_id = 'ABC123'
  AND event_name = 'checkout_started'
ORDER BY occurred_at DESC LIMIT 1;

-- Expected: meta contains stripe_session_id and items array

-- Check Stripe customer created (if first order)
SELECT stripe_customer_id FROM companies WHERE company_id = 'ABC123';

-- Expected: stripe_customer_id = 'cus_...' (if was NULL before)

-- Check products have Stripe IDs created (if missing)
SELECT product_code, stripe_product_id, stripe_price_id_default
FROM products
WHERE product_code IN ('TRI-001', 'TRI-002');

-- Expected: All have stripe_product_id and stripe_price_id_default populated
```

**Simulate Stripe Webhook (checkout.session.completed):**
```bash
# Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook
# Then trigger test webhook: stripe trigger checkout.session.completed
```

**Expected Side Effects:**
```sql
-- Check order created
SELECT * FROM orders
WHERE stripe_checkout_session_id = 'cs_test_...'
ORDER BY created_at DESC LIMIT 1;

-- Expected: status='paid', payment_status='paid', items JSONB contains product_codes, offer_key and campaign_key set

-- Check checkout_completed event
SELECT * FROM engagement_events
WHERE company_id = 'ABC123'
  AND event_name = 'checkout_completed'
  AND source = 'stripe'
ORDER BY occurred_at DESC LIMIT 1;

-- Expected: value = order total, meta contains order_id

-- Check Zoho sync job enqueued
SELECT * FROM outbox
WHERE order_id = (SELECT order_id FROM orders WHERE stripe_checkout_session_id = 'cs_test_...')
ORDER BY created_at DESC LIMIT 1;

-- Expected: job_type='zoho_sync_order', status='pending', payload contains order details
```

---

## Gaps & TODOs

### ✅ No Non-Canonical References Found

After comprehensive search:
- ❌ No references to `machine_taxonomy`, `company_machine_knowledge`, `campaign_interactions`, `campaign_links`, `knowledge_confirmation_queue` in code
- ❌ No `/c/[token]` routes (removed, only `/x/[token]` exists)
- ✅ All campaign code uses canonical tables: `asset_models`, `company_beliefs`, `campaigns`, `engagement_events`

### ⚠️ Missing Canonical Views

**Must be created in Supabase manually:**

1. **`public.v_campaign_interactions`** - Campaign performance view
   ```sql
   CREATE OR REPLACE VIEW public.v_campaign_interactions AS
   SELECT
     campaign_key, company_id, contact_id, event_name, occurred_at,
     offer_key, url, value, currency, meta
   FROM engagement_events
   WHERE campaign_key IS NOT NULL;
   ```

2. **`public.v_knowledge_confirmation_queue`** - Admin review queue
   ```sql
   CREATE OR REPLACE VIEW public.v_knowledge_confirmation_queue AS
   SELECT
     cb.belief_id, cb.company_id, c.company_name,
     cb.model_id, am.display_name AS model_display_name, am.level AS model_level,
     cb.confidence, cb.source, cb.contact_id, cb.evidence,
     cb.created_at, cb.updated_at
   FROM company_beliefs cb
   JOIN companies c ON cb.company_id = c.company_id
   JOIN asset_models am ON cb.model_id = am.model_id
   WHERE cb.confidence <= 3;
   ```

**Files Affected:**
- `src/app/admin/campaigns/[campaignKey]/page.tsx:95-113` - Queries `v_campaign_interactions`
- `src/app/admin/campaigns/confirm/page.tsx:146` - Queries `v_knowledge_confirmation_queue`

### ⚠️ Missing Canonical Tables

**Must exist in Supabase before app deployment:**

1. **`public.asset_models`** - Machine hierarchy (level 1-3, parent_id, slug, display_name)
2. **`public.company_beliefs`** - Machine knowledge (company_id, model_id, confidence, source, evidence)
3. **`public.campaigns`** - Campaign definitions (campaign_key, name, status, offer_key, target_level, target_model_id)

**Files Affected:**
- `src/app/x/[token]/page.tsx` - Queries `asset_models`, `company_beliefs`
- `src/app/api/offers/machine-selection/route.ts` - Upserts `company_beliefs`
- `src/app/admin/campaigns/*.tsx` - CRUD on `campaigns`

### 🔧 Recommended Improvements

1. **Add Migration for Canonical Views**
   - Create `20250120_09_create_campaign_views.sql` to define `v_campaign_interactions` and `v_knowledge_confirmation_queue`
   - Ensures views are consistently defined across environments

2. **Add Seed Data**
   - Create migration to seed `asset_models` with example machine hierarchy
   - Provides working demo without manual data entry

3. **Add TypeScript Types**
   - Define interfaces for `TokenPayload`, `AssetModel`, `CompanyBelief`, `Campaign`, `EngagementEvent`, etc.
   - Reduces runtime errors from typos in column names

4. **Add Tests**
   - Token generation/verification tests
   - Webhook payload validation tests
   - Idempotency tests for engagement events
   - Machine selection flow tests

5. **Add Admin Auth**
   - `/admin/*` routes have no authentication currently
   - Recommend Clerk, Auth0, or Supabase Auth

6. **Add Rate Limiting**
   - `/api/zoho/webhook` and `/api/stripe/webhook` should have rate limits
   - Prevent abuse if webhook secrets leak

7. **Add Monitoring**
   - Sentry/Bugsnag for error tracking
   - PostHog/Mixpanel for product analytics
   - Stripe Dashboard alerts for failed payments

8. **Document Zoho Setup**
   - How to configure Zoho CRM webhook URL and secret
   - How to set up Zoho Books OAuth app
   - How to get refresh token

9. **Document Stripe Setup**
   - How to configure Stripe webhook endpoint
   - How to enable Stripe Tax
   - How to set up test mode vs. production mode

---

## Architecture Decisions

### Token-Based Security
- **HMAC + TTL:** Offers are secured with HMAC SHA-256 signatures and 72-hour expiration
- **Defence-in-Depth:** Contact ownership validated against company_id in API routes
- **No JWT:** Simpler than JWT, sufficient for time-limited marketing links

### Idempotency Strategy
- **Unique Indexes:** `(source, source_event_id)` ensures external events aren't duplicated
- **Graceful Failures:** Duplicate key errors caught and return 200 (already processed)
- **Order Protection:** `stripe_checkout_session_id` UNIQUE constraint prevents double-charging

### Progressive Profiling
- **Confidence Levels:** 1=inferred → 2=clicked → 3=admin_confirm → 4=verified_by_order
- **Evidence Trail:** All clicks and confirmations stored in JSONB for audit
- **Skip Options:** Users can skip brand/model if they don't know specifics

### Async Job Queue (Outbox Pattern)
- **Reliability:** Zoho sync failures don't block order creation
- **Retries:** Automatic retry with exponential backoff (max 3 attempts)
- **Concurrency:** `locked_until` prevents duplicate processing by concurrent cron runs

### Canonical Event Tracking
- **Single Source of Truth:** All interactions flow through `engagement_events`
- **Flexible Metadata:** JSONB `meta` field allows event-specific data without schema changes
- **Multi-Source:** Tracks Zoho, Stripe, Vercel, and admin events in one table

---

## Performance Considerations

- **Indexes:** All foreign keys and query filters have covering indexes
- **Views:** Pre-computed views (`v_next_best_actions`) cache expensive aggregations
- **Connection Pooling:** Supabase client reuses connections (service role key)
- **Static Pages:** Marketing pages are static-generated (ISR)
- **Dynamic Routes:** Offer pages (`/x/[token]`) are server-rendered with caching headers

---

## Security Considerations

- **Server-Only Secrets:** All API keys are server-side (Next.js API routes)
- **Webhook Validation:** Stripe and Zoho webhooks verify signatures
- **CSRF Protection:** POST routes don't rely on cookies (stateless)
- **SQL Injection:** All queries use Supabase parameterized queries
- **XSS Protection:** Next.js escapes all user input by default
- **Rate Limiting:** TODO (not implemented)
- **Admin Auth:** TODO (not implemented)

---

**End of Snapshot**
