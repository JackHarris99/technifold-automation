# Database Schema - Technifold Automation Platform

**Last Updated**: December 15, 2025
**Total Tables**: 27

---

## Core Business Tables

### companies
Customer organizations
- `company_id` (text, PK) - Unique company identifier
- `company_name` (text) - Company name
- `website` (text) - Company website
- `country` (text) - Country code
- `type` (text) - 'customer', 'prospect', etc.
- `source` (text) - 'sage_import', 'manual', etc.
- `account_opened_at` (date) - When account was opened
- `first_invoice_at` (date) - First invoice date
- `last_invoice_at` (date) - Most recent invoice date
- `vat_number` (text) - VAT number for EU
- `eori_number` (text) - EORI for customs
- `company_reg_number` (text) - Company registration number
- `category` (text) - RFM category or segment
- `stripe_customer_id` (text) - Stripe customer ID
- `zoho_account_id` (text) - Legacy Zoho ID
- `account_owner` (text) - Sales rep assigned (rep_a, rep_b, rep_c)
- `portal_payload` (jsonb) - Cached reorder portal data
- `domain` (text) - Company email domain
- `created_at`, `updated_at` (timestamptz)

### contacts
Individual contacts at companies
- `contact_id` (uuid, PK) - Unique contact identifier
- `company_id` (text, FK → companies) - Company they belong to
- `first_name`, `last_name`, `full_name` (text) - Contact name
- `email` (text) - Email address
- `phone` (text) - Phone number
- `role` (text) - Job title/role
- `source` (text) - 'sage_import', 'website_form', etc.
- `status` (text) - 'active', 'inactive', etc.
- `token` (uuid) - Unique token for portal access
- `marketing_status` (text) - Marketing consent status
- `gdpr_consent_at` (timestamptz) - GDPR consent timestamp
- `zoho_contact_id` (text) - Legacy Zoho ID
- `created_at`, `updated_at` (timestamptz)

---

## Product & Inventory Tables

### products
All products (tools, consumables, parts)
- `product_code` (text, PK) - Unique product code
- `description` (text) - Product description
- `type` (text) - 'tool', 'consumable', 'part'
- `category` (text) - Product category
- `active` (boolean) - Is product active
- `is_marketable` (boolean) - Show on website
- `is_reminder_eligible` (boolean) - Include in reorder reminders
- `price` (numeric) - Sale price
- `currency` (text) - Currency code (default: GBP)
- `site_visibility` (text[]) - Which sites can see it
- `extra` (jsonb) - Extra metadata
- `image_url` (text) - Product image URL
- `image_alt` (text) - Image alt text
- `video_url` (text) - Product video URL
- **Shipping & Customs:**
  - `weight_kg` (numeric) - Weight in kg
  - `dimensions_cm` (text) - Dimensions string
  - `width_cm`, `height_cm`, `depth_cm` (numeric) - Dimensions
  - `hs_code` (text) - Harmonized System code for customs
  - `country_of_origin` (text) - ISO country code (default: GB)
  - `customs_value_gbp` (numeric) - Declared customs value
- `rental_price_monthly` (numeric) - Monthly rental price

### tool_consumable_map
Many-to-many mapping of tools to their consumables
- `tool_code` (text, PK, FK → products)
- `consumable_code` (text, PK, FK → products)

---

## Fact Tables (Pre-aggregated Data)

### company_tools
Tools owned by companies (fact table)
- `company_id` (text, PK, FK → companies)
- `tool_code` (text, PK, FK → products)
- `first_seen_at` (date) - First time company acquired this tool
- `last_seen_at` (date) - Most recent acquisition
- `total_units` (integer) - Total number of units owned

**Note**: This is manually manageable via admin UI, but also auto-populated from purchase history

### company_consumables
Consumable order history per company (fact table)
- `company_id` (text, PK, FK → companies)
- `consumable_code` (text, PK, FK → products)
- `first_ordered_at` (date) - First order date
- `last_ordered_at` (date) - Most recent order date
- `total_orders` (integer) - Number of orders
- `total_quantity` (integer) - Total quantity ordered
- `last_order_amount` (numeric) - Last order amount
- `last_order_quantity` (integer) - Last order quantity
- `last_invoice_id` (text) - Reference to last invoice

---

## Orders & Invoicing

### orders
Customer orders
- `order_id` (uuid, PK)
- `company_id` (text, FK → companies)
- `currency` (text) - Currency code (default: GBP)
- `payment_channel` (text) - 'stripe', 'manual', etc.
- `payment_status` (text) - 'unpaid', 'paid', etc.
- `fulfillment_status` (text) - 'hold_unpaid', 'shipped', etc.
- **Amounts:**
  - `subtotal` (numeric)
  - `shipping_amount` (numeric)
  - `tax_amount` (numeric)
  - `total_amount` (numeric)
- **Shipping:**
  - `shipping_country` (text)
  - `shipping_name`, `shipping_company` (text)
  - `shipping_address1`, `shipping_address2` (text)
  - `shipping_city`, `shipping_postcode` (text)
  - `shipping_address_id` (uuid, FK → shipping_addresses)
  - `tracking_number`, `carrier` (text)
  - `shipped_at` (timestamptz)
  - `estimated_delivery` (text)
- **Stripe:**
  - `stripe_checkout_session_id` (text)
  - `stripe_payment_intent_id` (text)
  - `stripe_invoice_id` (text)
- **Legacy Zoho Books:**
  - `books_customer_id`, `books_invoice_id`, `books_payment_id` (text)
- **Invoice:**
  - `invoice_number` (text)
  - `invoice_status` (text)
  - `invoice_url` (text) - Stripe hosted invoice URL
  - `invoice_pdf_url` (text) - Stripe PDF URL
  - `commercial_invoice_pdf_url` (text) - Customs invoice for international
  - `invoice_sent_at`, `invoice_voided_at` (timestamptz)
- **International Shipping:**
  - `shipping_weight_kg` (numeric)
  - `incoterms` (text) - DDP, DAP, EXW, etc.
- `order_type` (text) - Type of order
- `rental_agreement_id` (uuid, FK → rental_agreements)
- `created_at`, `updated_at` (timestamptz)

### order_items
Line items for orders
- `order_id` (uuid, PK, FK → orders)
- `product_code` (text, PK, FK → products)
- `description` (text)
- `qty` (integer)
- `unit_price` (numeric)
- `line_total` (numeric)

### invoices
Stripe invoices (separate from orders)
- `invoice_id` (uuid, PK)
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `stripe_invoice_id`, `stripe_customer_id`, `stripe_payment_intent_id` (text)
- `invoice_number` (text)
- `invoice_type` (text)
- `currency` (text) - Default: gbp
- **Amounts:**
  - `subtotal`, `tax_amount`, `shipping_amount`, `total_amount` (numeric)
- **Status:**
  - `status` (text) - Invoice status
  - `payment_status` (text) - Payment status
- **Dates:**
  - `invoice_date`, `due_date` (date)
  - `paid_at`, `sent_at`, `voided_at` (timestamptz)
- **URLs:**
  - `invoice_url` (text) - Stripe hosted URL
  - `invoice_pdf_url` (text) - Stripe PDF URL
- **Shipping:**
  - `shipping_address_id` (uuid, FK → shipping_addresses)
  - `shipping_country`, `tracking_number`, `carrier` (text)
  - `shipped_at` (timestamptz)
- `notes` (text)
- `created_by` (text) - User who created
- `created_at`, `updated_at` (timestamptz)

### invoice_items
Line items for invoices
- `invoice_id` (uuid, PK, FK → invoices)
- `product_code` (text, PK, FK → products)
- `line_number` (integer, PK)
- `description` (text)
- `quantity` (integer)
- `unit_price` (numeric)
- `line_total` (numeric)
- `notes` (text)

---

## Subscriptions & Rentals

### subscriptions
Tool rental subscriptions (Stripe subscriptions)
- `subscription_id` (uuid, PK)
- `stripe_subscription_id`, `stripe_customer_id` (varchar)
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `monthly_price` (numeric)
- `currency` (varchar) - Default: GBP
- `tools` (jsonb) - Legacy tools array
- `status` (varchar) - 'trial', 'active', 'cancelled', etc.
- **Dates:**
  - `trial_start_date`, `trial_end_date` (timestamp)
  - `current_period_start`, `current_period_end` (timestamp)
  - `next_billing_date` (timestamp)
  - `cancelled_at` (timestamp)
- `ratchet_max` (numeric) - Maximum ratchet price
- `cancel_at_period_end` (boolean)
- `cancellation_reason` (text)
- `notes` (text)
- `created_by`, `updated_by` (text)
- `created_at`, `updated_at` (timestamp)

### subscription_tools
Tools allocated to subscriptions (many-to-many with audit trail)
- `subscription_id` (uuid, PK, FK → subscriptions)
- `tool_code` (text, PK, FK → products)
- `added_at` (timestamptz, PK) - When tool was added
- `added_by` (text) - Who added it
- `removed_at` (timestamptz) - When removed (NULL = still active)
- `removed_by` (text) - Who removed it
- `removal_reason` (text) - Why removed

### subscription_events
Audit trail for subscription changes
- `event_id` (uuid, PK)
- `subscription_id` (uuid, FK → subscriptions)
- `event_type` (varchar) - Type of event
- `event_name` (varchar) - Event name
- `old_value`, `new_value` (jsonb) - Before/after state
- `performed_by` (text) - Who made the change
- `performed_at` (timestamp)
- `notes` (text)

### rental_agreements
Legacy rental agreements (being phased out for subscriptions)
- `rental_id` (uuid, PK)
- `serial_number` (text) - Tool serial number
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `product_code` (text, FK → products)
- `stripe_subscription_id`, `stripe_customer_id` (text)
- `monthly_price` (numeric)
- `currency` (text) - Default: GBP
- **Dates:**
  - `start_date` (timestamptz)
  - `trial_end_date` (timestamptz)
  - `contract_signed_at` (timestamptz)
  - `cancelled_at` (timestamptz)
  - `tool_returned_at` (timestamptz)
- `minimum_term_months` (integer) - Default: 24
- `contract_pdf_url` (text)
- `contract_ip_address` (inet)
- `status` (text) - 'trial', 'active', 'cancelled', etc.
- `cancellation_reason` (text)
- `return_condition` (text)
- `created_at`, `updated_at` (timestamptz)

---

## Shipping & International

### shipping_addresses
Customer shipping addresses
- `address_id` (uuid, PK)
- `company_id` (text, FK → companies)
- `address_line_1`, `address_line_2` (text)
- `city`, `state_province`, `postal_code` (text)
- `country` (text) - Default: GB
- `is_default` (boolean)
- `label` (text) - Address nickname
- `created_at`, `updated_at` (timestamptz)

### shipping_manifests
International shipment tracking with customs
- `manifest_id` (uuid, PK)
- `company_id` (text, FK → companies)
- `subscription_id` (varchar) - If rental shipment
- `order_id` (uuid, FK → orders) - If order shipment
- `destination_country` (varchar) - ISO country code
- `shipment_type` (varchar) - 'rental', 'sale', 'consumables', 'return'
- `courier` (varchar) - DHL, FedEx, etc.
- `tracking_number` (varchar)
- `shipped_at`, `delivered_at` (timestamp)
- **Customs:**
  - `customs_invoice_number` (varchar)
  - `total_customs_value_gbp` (numeric)
  - `total_weight_kg` (numeric)
  - `items` (jsonb) - Array of items with HS codes, weights, values
- `notes` (text)
- `created_at`, `updated_at` (timestamp)

---

## Machines & Discovery

### machines
Folder/MBO machines in the market
- `machine_id` (uuid, PK)
- `brand` (text) - MBO, Heidelberg, etc.
- `model` (text) - K88, T800, etc.
- `display_name` (text) - User-friendly name
- `type` (text) - 'folder', 'press', etc.
- `type_canonical` (text) - Canonical type
- `shaft_size_mm` (integer) - Shaft size in mm
- `outer_diameter_mm` (numeric) - Outer diameter
- `shaft_specs` (jsonb) - Shaft specifications
- `shaft_config_id` (integer) - Shaft configuration ID
- `country` (text) - Country of origin
- `oem_url` (text) - OEM website
- `description` (text)
- `slug` (text) - URL slug
- `created_at`, `updated_at` (timestamptz)

### company_machine
Companies' machine inventory (discovery workflow)
- `id` (uuid, PK)
- `company_id` (text, FK → companies)
- `machine_id` (uuid, FK → machines)
- `quantity` (integer) - Default: 1
- `location` (text) - Where machine is located
- `verified` (boolean) - Is ownership verified
- `confidence` (smallint) - Confidence score (1-5)
- `source` (text) - 'website_form', 'sales_confirmed', etc.
- `evidence` (jsonb) - Evidence of ownership
- `notes` (text)
- `created_at` (timestamptz)

---

## Engagement & Marketing

### engagement_events
All customer engagement events
- `event_id` (uuid, PK)
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `occurred_at` (timestamptz)
- `event_type` (text) - 'portal_view', 'email_open', 'link_click', etc.
- `event_name` (text) - Specific event name
- `source` (text) - 'vercel', 'resend', etc.
- `url` (text) - URL where event occurred
- `meta` (jsonb) - Event metadata
- `source_event_id` (text) - ID from source system
- `campaign_key` (text) - Campaign identifier
- `offer_key` (text) - Offer identifier
- `value` (numeric) - Monetary value if applicable
- `currency` (text) - Currency code

### contact_interactions
Legacy contact interactions (being phased out for engagement_events)
- `id` (uuid, PK)
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `interaction_type` (text) - Type of interaction
- `url` (text)
- `referrer` (text)
- `metadata` (jsonb)
- `occurred_at` (timestamptz)

### quote_requests
Quote requests from customers
- `quote_request_id` (uuid, PK)
- `company_id` (varchar, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `machine_slug` (varchar) - Machine they're interested in
- `interested_products` (jsonb) - Array of product codes
- `status` (varchar) - 'requested', 'quoted', 'won', 'lost'
- `source` (varchar) - 'manual', 'website_form', etc.
- `assigned_to` (varchar) - Sales rep assigned
- `notes` (text)
- `marketing_token` (text) - Marketing tracking token
- `quote_token` (text) - Quote access token
- `lost_reason` (text) - Why quote was lost
- `won_amount` (numeric) - Deal value if won
- `created_at`, `updated_at` (timestamptz)
- `quote_sent_at`, `closed_at` (timestamptz)

### trial_intents
Trial signup intents
- `id` (uuid, PK)
- `token` (text) - Unique token
- `company_id` (text, FK → companies)
- `contact_id` (uuid, FK → contacts)
- `machine_id` (uuid, FK → machines) - Machine they want to trial
- `created_at` (timestamptz)

---

## Email & Background Jobs

### outbox
Email outbox with pessimistic locking
- `job_id` (uuid, PK)
- `job_type` (text) - 'send_email', etc.
- `status` (text) - 'pending', 'processing', 'completed', 'failed'
- `attempts` (integer) - Number of attempts (default: 0)
- `max_attempts` (integer) - Max retries (default: 3)
- `payload` (jsonb) - Job payload
- `company_id` (text, FK → companies)
- `order_id` (uuid, FK → orders)
- `last_error` (text) - Last error message
- `locked_until` (timestamptz) - Lock expiry
- `created_at`, `updated_at` (timestamptz)
- `completed_at` (timestamptz)

**Indexes**:
- `idx_outbox_pick` on (status, locked_until, attempts) for job queue

---

## Users & Admin

### users
Admin users
- `user_id` (uuid, PK)
- `email` (text) - Login email
- `password_hash` (text) - Hashed password
- `full_name` (text)
- `role` (text) - 'admin', 'sales', etc.
- `sales_rep_id` (text) - Sales rep identifier
- `is_active` (boolean)
- `last_login_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

### activity_log
Admin activity audit trail
- `activity_id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `user_email`, `user_name` (text)
- `action_type` (text) - Type of action
- `entity_type` (text) - What was affected
- `entity_id` (text) - ID of entity
- `description` (text)
- `metadata` (jsonb)
- `ip_address`, `user_agent` (text)
- `created_at` (timestamptz)

---

## Branding

### site_branding
Site branding configuration
- `brand_key` (text, PK) - 'technifold', 'tri-creaser', etc.
- `brand_name` (text)
- `logo_url` (text)
- `created_at`, `updated_at` (timestamptz)

### brand_media
Brand media assets (legacy)
- `brand_slug` (text, PK)
- `brand_name` (text)
- `logo_url` (text)
- `hero_url` (text)

---

## Key Relationships

```
companies (1) ----< (many) contacts
companies (1) ----< (many) orders
companies (1) ----< (many) company_tools
companies (1) ----< (many) company_consumables
companies (1) ----< (many) subscriptions
companies (1) ----< (many) company_machine

orders (1) ----< (many) order_items
invoices (1) ----< (many) invoice_items

subscriptions (1) ----< (many) subscription_tools
subscriptions (1) ----< (many) subscription_events

products (1) ----< (many) tool_consumable_map (many) ----> (1) products

machines (1) ----< (many) company_machine
```

---

## Important Notes

1. **company_tools.total_units**: Column is `total_units` (NOT `total_quantity`)
2. **company_consumables.total_quantity**: This one IS `total_quantity`
3. **Stripe Integration**: Full integration with customer IDs, subscription IDs, invoice IDs
4. **Zoho Books**: Legacy fields exist but integration was scrapped
5. **International Shipping**: Full customs support with HS codes, EORI, Incoterms
6. **Fact Tables**: company_tools and company_consumables are pre-aggregated for performance
7. **Portal Payload**: companies.portal_payload caches reorder portal data
8. **Email Outbox**: Uses pessimistic locking pattern for reliable delivery

---

**Generated**: December 15, 2025
**Schema Version**: Production
