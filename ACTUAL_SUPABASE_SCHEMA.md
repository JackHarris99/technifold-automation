# Actual Supabase Database Schema
**Date:** 2025-12-14
**Source:** Direct from production Supabase database

## Critical Schema Facts

### Data Types (Confirmed from Production)
- `company_id`: **TEXT** (not UUID!)
- `account_owner`: **TEXT** (values: "Lee", "Callum", "Steve", "jack_harris")
- `order_id`: **UUID**
- `contact_id`: **UUID**
- `product_code`: **TEXT**

### Tables That DO Exist (I was wrong about these being missing!)
✅ `order_items` - EXISTS (composite PK: order_id + product_code)
✅ `quote_requests` - EXISTS
✅ `rental_agreements` - EXISTS
✅ `subscriptions` - EXISTS
✅ `trial_intents` - EXISTS

### Views That Exist
✅ `v_active_subscriptions`
✅ `v_subscription_anomalies`
✅ `vw_company_consumable_payload`
✅ `catalog_products`

## Complete Table List (23 tables)

1. activity_log
2. brand_media
3. companies
4. company_machine
5. company_tool
6. contact_interactions
7. contacts
8. engagement_events
9. machines
10. order_items
11. orders
12. outbox
13. products
14. quote_requests
15. rental_agreements
16. shipping_addresses
17. shipping_manifests
18. site_branding
19. subscription_events
20. subscriptions
21. tool_consumable_map
22. trial_intents
23. users

## Table Schemas

### companies
```
company_id (text) PK
company_name (text)
website (text)
country (text)
type (text)
source (text)
account_opened_at (date)
first_invoice_at (date)
last_invoice_at (date)
vat_number (text)
eori_number (text)
company_reg_number (text)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
category (text)
stripe_customer_id (text)
zoho_account_id (text)
account_owner (text)  -- Sales rep name (TEXT, not UUID!)
portal_payload (jsonb)
domain (text)
```

### users
```
user_id (uuid) PK
id (uuid) PK  -- WEIRD: Two PK columns?
email (text)
password_hash (text)
full_name (text)
role (text)
sales_rep_id (text)  -- This is what matches account_owner!
is_active (boolean)
last_login_at (timestamp with time zone)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
```

**IMPORTANT:** `users.sales_rep_id` (TEXT) is what should match `companies.account_owner` (TEXT)

### order_items
```
order_id (uuid) PK (composite)
product_code (text) PK (composite)
description (text)
qty (integer)  -- NOTE: "qty" not "quantity"!
unit_price (numeric)
line_total (numeric)
```

**IMPORTANT:** Composite primary key (order_id, product_code). No surrogate `order_item_id`!

### orders
```
order_id (uuid) PK
company_id (text) FK -> companies
currency (text)
payment_channel (text)
payment_status (text)
fulfillment_status (text)
subtotal (numeric)
shipping_amount (numeric)
tax_amount (numeric)
total_amount (numeric)
shipping_country (text)
shipping_name (text)
shipping_company (text)
shipping_address1 (text)
shipping_address2 (text)
shipping_city (text)
shipping_postcode (text)
stripe_checkout_session_id (text)
stripe_payment_intent_id (text)
books_customer_id (text)
books_invoice_id (text)
books_payment_id (text)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
shipping_address_id (uuid) FK -> shipping_addresses
invoice_number (text)
order_type (text)
rental_agreement_id (uuid) FK -> rental_agreements
tracking_number (text)
carrier (text)
shipped_at (timestamp with time zone)
estimated_delivery (text)
stripe_invoice_id (text)
invoice_status (text)
invoice_url (text)
invoice_pdf_url (text)
commercial_invoice_pdf_url (text)
invoice_sent_at (timestamp with time zone)
invoice_voided_at (timestamp with time zone)
shipping_weight_kg (numeric)
incoterms (text)
```

### subscriptions
```
subscription_id (uuid) PK
stripe_subscription_id (character varying)
stripe_customer_id (character varying)
company_id (text) FK -> companies
contact_id (uuid) FK -> contacts
monthly_price (numeric)
currency (character varying)
tools (jsonb)  -- Array of tool IDs
status (character varying)  -- 'trial', 'active', 'cancelled'
trial_start_date (timestamp without time zone)
trial_end_date (timestamp without time zone)
current_period_start (timestamp without time zone)
current_period_end (timestamp without time zone)
next_billing_date (timestamp without time zone)
ratchet_max (numeric)  -- Maximum price for ratchet pricing
cancel_at_period_end (boolean)
cancelled_at (timestamp without time zone)
cancellation_reason (text)
created_at (timestamp without time zone)
updated_at (timestamp without time zone)
notes (text)
created_by (text)
updated_by (text)
```

### contacts
```
contact_id (uuid) PK
company_id (text) FK -> companies
first_name (text)
last_name (text)
full_name (text)
email (text)
phone (text)
role (text)
source (text)
status (text)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
token (uuid)
marketing_status (text)
gdpr_consent_at (timestamp with time zone)
zoho_contact_id (text)
```

### quote_requests
```
quote_request_id (uuid) PK
company_id (character varying) FK -> companies
contact_id (uuid) FK -> contacts
machine_slug (character varying)
interested_products (jsonb)
status (character varying)
source (character varying)
assigned_to (character varying)
notes (text)
marketing_token (text)
quote_token (text)
lost_reason (text)
won_amount (numeric)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
quote_sent_at (timestamp with time zone)
closed_at (timestamp with time zone)
```

### rental_agreements
```
rental_id (uuid) PK
serial_number (text)
company_id (text) FK -> companies
contact_id (uuid) FK -> contacts
product_code (text) FK -> products
stripe_subscription_id (text)
stripe_customer_id (text)
monthly_price (numeric)
currency (text)
start_date (timestamp with time zone)
trial_end_date (timestamp with time zone)
minimum_term_months (integer)
contract_signed_at (timestamp with time zone)
contract_pdf_url (text)
contract_ip_address (inet)
status (text)
cancelled_at (timestamp with time zone)
cancellation_reason (text)
tool_returned_at (timestamp with time zone)
return_condition (text)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
```

### trial_intents
```
id (uuid) PK
token (text)
company_id (text) FK -> companies
contact_id (uuid) FK -> contacts
machine_id (uuid) FK -> machines
created_at (timestamp with time zone)
```

### products
```
product_code (text) PK
description (text)
type (text)  -- 'tool', 'consumable', etc.
category (text)
active (boolean)
is_marketable (boolean)
is_reminder_eligible (boolean)
price (numeric)
currency (text)
site_visibility (ARRAY)
extra (jsonb)
image_url (text)
image_alt (text)
video_url (text)
weight_kg (numeric)
dimensions_cm (text)
hs_code (text)
country_of_origin (text)
rental_price_monthly (numeric)
customs_value_gbp (numeric)
width_cm (numeric)
height_cm (numeric)
depth_cm (numeric)
```

### company_machine
```
id (uuid) PK
machine_id (uuid) FK -> machines
quantity (integer)
location (text)
verified (boolean)
source (text)
notes (text)
created_at (timestamp with time zone)
company_id (text) FK -> companies
confidence (smallint)
evidence (jsonb)
```

### company_tool
```
company_id (text) PK (composite) FK -> companies
tool_code (text) PK (composite) FK -> products
first_seen_at (date)
last_seen_at (date)
total_units (integer)
```

### engagement_events
```
event_id (uuid) PK
company_id (text) FK -> companies
contact_id (uuid) FK -> contacts
occurred_at (timestamp with time zone)
event_type (text)
source (text)
url (text)
meta (jsonb)
source_event_id (text)
event_name (text)
campaign_key (text)
offer_key (text)
value (numeric)
currency (text)
```

## Foreign Key Relationships

```
company_machine.company_id -> companies.company_id
company_machine.machine_id -> machines.machine_id
company_tool.company_id -> companies.company_id
company_tool.tool_code -> products.product_code
contacts.company_id -> companies.company_id
contact_interactions.company_id -> companies.company_id
contact_interactions.contact_id -> contacts.contact_id
engagement_events.company_id -> companies.company_id
engagement_events.contact_id -> contacts.contact_id
order_items.order_id -> orders.order_id
orders.shipping_address_id -> shipping_addresses.address_id
orders.rental_agreement_id -> rental_agreements.rental_id
quote_requests.company_id -> companies.company_id
quote_requests.contact_id -> contacts.contact_id
rental_agreements.company_id -> companies.company_id
rental_agreements.contact_id -> contacts.contact_id
rental_agreements.product_code -> products.product_code
subscriptions.company_id -> companies.company_id
subscriptions.contact_id -> contacts.contact_id
trial_intents.company_id -> companies.company_id
trial_intents.contact_id -> contacts.contact_id
trial_intents.machine_id -> machines.machine_id
```

## Views

### v_active_subscriptions
```
subscription_id (uuid)
stripe_subscription_id (character varying)
company_id (text)
company_name (text)
contact_id (uuid)
contact_name (text)
contact_email (text)
monthly_price (numeric)
currency (character varying)
tools (jsonb)
status (character varying)
trial_end_date (timestamp without time zone)
next_billing_date (timestamp without time zone)
ratchet_max (numeric)
created_at (timestamp without time zone)
trial_days_remaining (integer)  -- CALCULATED
tool_count (integer)  -- CALCULATED
```

### v_subscription_anomalies
```
subscription_id (uuid)
company_id (text)
contact_id (uuid)
stripe_subscription_id (character varying)
stripe_customer_id (character varying)
status (character varying)
monthly_price (numeric)
ratchet_max (numeric)
violation_amount (numeric)  -- CALCULATED: monthly_price - ratchet_max
violation_percent (numeric)  -- CALCULATED
current_period_start (timestamp without time zone)
current_period_end (timestamp without time zone)
next_billing_date (timestamp without time zone)
trial_end_date (timestamp without time zone)
updated_at (timestamp without time zone)
```

## RPC Functions

1. generate_rental_serial_number
2. regenerate_company_payload
3. set_engagement_company_from_contact
4. set_rental_serial_number
5. set_updated_at
6. update_company_machine_updated_at
7. update_quote_requests_updated_at
8. update_updated_at_column
9. update_users_updated_at

## Key Insights

### What I Was Wrong About

❌ **I said these tables were MISSING** - They actually EXIST:
- order_items
- quote_requests
- rental_agreements
- subscriptions
- trial_intents

✅ **All views exist**
✅ **All admin pages should actually work**

### The Real Issues

1. **Territory Filtering Must Use TEXT:**
   ```sql
   -- WRONG (what I wrote):
   WHERE account_owner = user_id::uuid

   -- CORRECT:
   WHERE account_owner = users.sales_rep_id
   ```

2. **Field Naming Inconsistency:**
   - Database: `qty`
   - Code expectations: `quantity`

3. **Composite Primary Keys:**
   - order_items: (order_id, product_code) - no surrogate key
   - company_tool: (company_id, tool_code)
   - tool_consumable_map: (consumable_code, tool_code)

4. **users table weird PK:**
   - Has BOTH `user_id` and `id` as primary key columns
   - Need to understand which one is actually used

### Territory Filtering Logic

To filter by sales rep territory:
```sql
-- Get current user's sales_rep_id from users table
SELECT sales_rep_id FROM users WHERE user_id = current_user_id;

-- Then filter companies
SELECT * FROM companies WHERE account_owner = :sales_rep_id;
```

**NOT** by matching UUIDs - by matching TEXT fields!
