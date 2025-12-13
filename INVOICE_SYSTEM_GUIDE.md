# Invoice-Led Billing System - Complete Guide

## Overview

Technifold now uses **invoice-led billing** instead of checkout-led. This means:
- Every order creates a Stripe Invoice (not just a checkout session)
- Invoices are sent to customers via email with a payment link
- Unpaid invoices remain visible for follow-up
- B2B-friendly: customers can forward invoices internally

---

## System Architecture

### 1. Invoice Creation Flow

**Reorder Portal:**
```
Customer clicks "Request Invoice"
  → POST /api/portal/create-invoice
  → createStripeInvoice() in lib/stripe-invoices.ts
  → Stripe creates invoice + sends email
  → Order record created in database
  → Customer receives email with payment link
```

**Admin Quotes:**
```
Admin builds quote
  → POST /api/admin/invoices/create
  → createStripeInvoice()
  → Invoice sent to customer
  → Tracked in orders table
```

### 2. VAT Handling (Automatic)

**Logic in `lib/stripe-invoices.ts:calculateVAT()`:**

- **UK Customers:** 20% VAT added
- **EU Customers with VAT number:** 0% VAT (reverse charge) - stored in `companies.vat_number`
- **EU Customers without VAT number:** 0% VAT + warning logged
- **Rest of World:** 0% VAT (export)

**VAT Number Storage (Permanent):**

The `companies` table already has a `vat_number` column. Here's how it works:

```typescript
// When creating invoice, check if VAT number exists
const { data: company } = await supabase
  .from('companies')
  .select('vat_number, country')
  .eq('company_id', company_id)
  .single();

// If EU customer AND no VAT number stored:
if (isEUCountry(company.country) && !company.vat_number) {
  // Show form to collect VAT number
  // Save to companies table permanently:
  await supabase
    .from('companies')
    .update({ vat_number: 'DE123456789' })
    .eq('company_id', company_id);
}

// All future invoices use stored VAT number automatically
```

**You only ask ONCE per company, then it's stored forever.**

---

## 3. Invoice Status Pipeline

**Invoice Lifecycle (tracked via webhooks):**

1. **`draft`** - Invoice created, not finalized
2. **`open`** - Finalized, ready to send
3. **`sent`** - Emailed to customer (webhook: `invoice.sent`)
4. **`paid`** - Customer paid (webhook: `invoice.paid`)
5. **`void`** - Cancelled (webhook: `invoice.voided`)
6. **`uncollectible`** - Bad debt (webhook: `invoice.marked_uncollectible`)

**Database Updates:**

All status changes are tracked in `orders.invoice_status` via webhooks in `/api/stripe/webhook/route.ts`.

---

## 4. Payment Methods (Stripe Configuration)

**Currently Enabled:**
- Credit/Debit Cards
- Apple Pay / Google Pay

**To Enable Bank Transfer:**

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Enable: "Bank transfers" (BACS for UK)
3. Save

Customers will then see bank transfer option on invoice payment page.

---

## 5. Commercial Invoices (International Orders)

**Automatic Generation:**

When `invoice.paid` webhook fires for non-GB customers:
```
Webhook detects country !== 'GB'
  → generateCommercialInvoice() called
  → Fetches: HS codes, weights, country of origin from products table
  → Generates HTML invoice with customs data
  → Stores URL in orders.commercial_invoice_pdf_url
```

**Commercial Invoice Contains:**
- HS Tariff Codes (from `products.hs_code`)
- Country of Origin (from `products.country_of_origin`)
- Weight per item (from `products.weight_kg`)
- Customs Value (from `products.customs_value_gbp`)
- Exporter details (Technifold)
- Consignee details (customer)
- Incoterms (DDP by default)
- Reason for export ("Sale")

**Download URL:**
```
/api/invoices/commercial/[order_id]/download
```

This can be:
- Printed by warehouse staff
- Attached to shipment (3 copies)
- Sent to courier for customs clearance

---

## 6. Stripe Dashboard Configuration

### **Required Setup:**

1. **Branding:**
   - Go to: https://dashboard.stripe.com/settings/branding
   - Upload Technifold logo
   - Set brand color: `#2563eb` (blue)
   - Add business details:
     ```
     Technifold Ltd
     Unit 2, St John's Business Park
     Lutterworth, Leicestershire, LE17 4HB, UK
     VAT: GB123456789 (if applicable)
     Phone: 01707 275 114
     ```

2. **Payment Methods:**
   - Settings → Payment Methods
   - Enable: Cards, Bank Transfers (BACS), Apple/Google Pay

3. **Invoice Settings:**
   - Settings → Invoices
   - Enable: Automatic reminders (optional)
   - Set default due date: "Due on receipt"

4. **Webhook Endpoint:**
   - Already configured: `/api/stripe/webhook`
   - Events listened to:
     - `invoice.created`
     - `invoice.finalized`
     - `invoice.sent`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `invoice.voided`
     - `invoice.marked_uncollectible`

---

## 7. Admin Workflow Changes

### **Old (Checkout-Led):**
```
Sales rep → Sends link → Customer checks out → Payment → Maybe abandoned
```

### **New (Invoice-Led):**
```
Sales rep → Creates invoice → Invoice sent → Visible in "Open Invoices" pipeline
  → Customer pays (or doesn't)
  → Rep can follow up on unpaid invoices
```

**Admin Views Needed:**

1. **Open Invoices Dashboard:**
   - Query: `WHERE invoice_status IN ('sent', 'open') AND payment_status = 'unpaid'`
   - Columns: Company, Amount, Days Open, Contact, Actions (Resend, Void)

2. **Overdue Invoices:**
   - Query: `WHERE invoice_status = 'sent' AND created_at < NOW() - INTERVAL '7 days'`
   - Sort by: Days overdue (descending)

3. **Paid Invoices (Awaiting Fulfillment):**
   - Query: `WHERE invoice_status = 'paid' AND fulfillment_status = 'pending'`
   - Action: Generate shipping label, print commercial invoice (if international)

---

## 8. Testing Checklist

### **Test Invoice Creation:**

```bash
curl -X POST http://localhost:3000/api/admin/invoices/create \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "TEST123",
    "contact_id": "contact-uuid",
    "items": [
      {
        "product_code": "CR133-H",
        "description": "Creaser 133mm",
        "quantity": 2,
        "unit_price": 75.00
      }
    ],
    "currency": "gbp"
  }'
```

**Expected Result:**
- Stripe invoice created
- Email sent to contact
- Order record in database with `stripe_invoice_id`

### **Test VAT Calculation:**

1. **UK Customer:**
   - Company country: `GB`
   - Expected: 20% VAT added
   - Invoice total: £180 (£150 + £30 VAT)

2. **EU Customer with VAT:**
   - Company country: `DE`, VAT number: `DE123456789`
   - Expected: 0% VAT (reverse charge)
   - Invoice footer: "VAT: EU Reverse Charge"

3. **US Customer:**
   - Company country: `US`
   - Expected: 0% VAT (export)
   - Invoice footer: "VAT: Export"

### **Test International Order:**

1. Create invoice for US customer
2. Pay invoice in Stripe test mode
3. Check `invoice.paid` webhook fires
4. Verify commercial invoice generated
5. Download: `/api/invoices/commercial/[order_id]/download`
6. Confirm HS codes, weights, origin country present

---

## 9. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ INVOICE CREATION                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin/Portal                                               │
│      │                                                      │
│      ├─→ POST /api/.../invoices/create                     │
│      │                                                      │
│      ├─→ createStripeInvoice()                             │
│      │    ├─ Get company (VAT number, country)             │
│      │    ├─ Calculate VAT                                 │
│      │    ├─ Create Stripe Customer (if needed)            │
│      │    ├─ Create Invoice Items                          │
│      │    ├─ Create Invoice                                │
│      │    ├─ Finalize Invoice                              │
│      │    └─ Send Invoice (Stripe emails customer)         │
│      │                                                      │
│      └─→ Insert to orders table                            │
│           - stripe_invoice_id                               │
│           - invoice_status: 'sent'                          │
│           - payment_status: 'unpaid'                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER PAYMENT                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Customer receives email                                    │
│      │                                                      │
│      ├─→ Opens invoice.stripe.com/...                      │
│      │                                                      │
│      ├─→ Pays (Card or Bank Transfer)                      │
│      │                                                      │
│      └─→ Stripe fires webhook: invoice.paid                │
│                                                             │
│  Webhook Handler                                            │
│      │                                                      │
│      ├─→ Update orders table                               │
│      │    - invoice_status: 'paid'                         │
│      │    - payment_status: 'paid'                         │
│      │    - paid_at: NOW()                                 │
│      │                                                      │
│      ├─→ Check if international (country !== 'GB')         │
│      │                                                      │
│      └─→ If yes: Generate commercial invoice               │
│           - Fetch HS codes, weights, origin                │
│           - Build HTML with customs data                   │
│           - Store commercial_invoice_pdf_url               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Troubleshooting

**Issue: EU customer charged VAT**
- Check: `companies.vat_number` is populated
- Check: VAT number format is correct (e.g., `DE123456789`)
- Check: `companies.country` is an EU country code

**Issue: Commercial invoice not generating**
- Check: `products.hs_code` is populated for all products
- Check: `products.country_of_origin` is set
- Check: Webhook `invoice.paid` is firing
- Check logs: Search for "[stripe-webhook] International order detected"

**Issue: Invoice not sent to customer**
- Check: Stripe webhook `invoice.sent` fired
- Check: Contact email is valid
- Check: Resend API is configured
- Check Stripe Dashboard → Invoices → View email log

---

## Files Created/Modified

**New Files:**
- `supabase/migrations/20250128_01_add_invoice_fields.sql`
- `src/lib/stripe-invoices.ts`
- `src/lib/commercial-invoice.ts`
- `src/lib/vat-helpers.ts` (VAT validation and EU country detection)
- `src/components/shared/VATNumberForm.tsx` (VAT collection UI)
- `src/app/api/portal/create-invoice/route.ts`
- `src/app/api/admin/invoices/create/route.ts`
- `src/app/api/invoices/commercial/[order_id]/download/route.ts`
- `src/app/api/companies/update-vat/route.ts` (save VAT number)
- `src/app/api/companies/check-vat-needed/route.ts` (check VAT status)

**Modified Files:**
- `src/app/api/stripe/webhook/route.ts` (added invoice webhook handlers)
- `src/components/admin/CreateQuoteModal.tsx` (integrated VAT collection)
- `src/components/PortalPage.tsx` (switched to invoice-led flow)
- `src/components/CartBar.tsx` (updated button text to "Request Invoice")
- `src/components/InvoiceRequestModal.tsx` (new - replaces CheckoutModal)

**Existing Schema (already has):**
- `companies.vat_number` ✅
- `companies.eori_number` ✅
- `companies.country` ✅
- `products.hs_code` ✅
- `products.country_of_origin` ✅
- `products.weight_kg` ✅
- `products.customs_value_gbp` ✅

---

## Next Steps

1. **Configure Stripe Dashboard:** 📋 **SEE: STRIPE_DASHBOARD_SETUP.md**
   - Complete step-by-step guide created
   - Add Technifold branding (logo, colors)
   - Enable bank transfer payment method
   - Configure invoice settings
   - Set up tax/VAT settings
   - Enable customer portal (optional)

2. **Test in Stripe Test Mode:**
   - Create test invoice via admin quote
   - Create test invoice via customer portal
   - Pay with test card: `4242 4242 4242 4242`
   - Verify webhooks fire in Stripe dashboard
   - Check database: `orders.invoice_status` updated to `paid`
   - Test international order → commercial invoice generated
   - Test EU customer → VAT form appears

3. **Build Admin UI (Optional - Future Enhancement):**
   - Open Invoices dashboard
   - Overdue Invoices view
   - Paid/Awaiting Fulfillment view
   - Invoice resend/void actions

4. ✅ **COMPLETE - Core Features:**
   - ✅ Invoice creation API with VAT calculation
   - ✅ Webhook handlers for invoice lifecycle
   - ✅ Commercial invoice generation for international orders
   - ✅ VAT number collection (auto-detects EU customers)
   - ✅ Admin quote creation with invoice
   - ✅ Portal reorder with invoice (replaces checkout)

---

## 11. Customer Portal Invoice Flow

The customer portal has been updated from **checkout-led** to **invoice-led** billing.

### **Old Flow (Checkout-Led):**
```
Customer adds items to cart
  → Clicks "Proceed to Checkout"
  → Embedded payment form (Stripe Elements)
  → Pays immediately with card
  → Order created in database
```

**Problems with old flow:**
- No paper trail if payment abandoned
- Requires immediate payment (not B2B friendly)
- No option for bank transfer or invoice forwarding

### **New Flow (Invoice-Led):**
```
Customer adds items to cart
  → Clicks "Request Invoice"
  → System checks if VAT number needed (EU customers)
  → If needed: Show VAT form → Save to companies table
  → Create Stripe Invoice
  → Send invoice email to customer (Stripe handles this)
  → Customer receives email with payment link
  → Customer can:
     - Pay now (card or bank transfer via Stripe hosted page)
     - Pay later (link remains valid)
     - Forward invoice to accounts department
```

**Benefits:**
- ✅ Invoice exists even if unpaid (can track in admin)
- ✅ B2B friendly (customers can forward invoices)
- ✅ Bank transfer option (for large orders)
- ✅ Professional invoice email from Stripe
- ✅ Customer can pay at their convenience

### **Customer Experience:**

1. **In Portal:**
   - Add items to cart
   - Click "Request Invoice" button (green button at bottom)
   - Modal appears: "Request Invoice"
   - Shows order summary with totals
   - Click "Request Invoice" button

2. **If EU Customer Without VAT:**
   - VAT form appears inline
   - Enter VAT number (e.g., DE123456789)
   - Click "Save VAT Number"
   - Proceeds to invoice creation

3. **Invoice Created:**
   - Success screen: "Invoice Sent!"
   - Two options:
     - **"Pay Now"** → Opens Stripe hosted invoice page in new tab
     - **"I'll Pay Later"** → Closes modal, invoice link in email

4. **In Email (from Stripe):**
   - Professional branded email
   - Shows Technifold logo and details
   - Itemized invoice with VAT breakdown
   - "View and pay invoice" button
   - Payment link valid indefinitely

5. **On Stripe Invoice Page:**
   - Shows full invoice details
   - Payment options:
     - Card (instant)
     - Apple Pay / Google Pay (instant)
     - Bank Transfer (3-5 days, shows account details)
   - Customer enters payment details
   - Receives confirmation email

6. **After Payment:**
   - Webhook fires → Database updated
   - Order status: `paid`
   - If international: Commercial invoice auto-generated
   - Warehouse receives notification to fulfill order

### **Code Changes:**

**Created:**
- `src/components/InvoiceRequestModal.tsx` (new modal for invoice flow)

**Modified:**
- `src/components/PortalPage.tsx` (switched from CheckoutModal to InvoiceRequestModal)
- `src/components/CartBar.tsx` (button text: "Request Invoice" instead of "Proceed to Checkout")

**Removed (no longer used):**
- `src/components/CheckoutModal.tsx` (old embedded payment form - keep for reference)

---

## 12. VAT Number Collection (Auto-Detection)

The system automatically detects when a VAT number is needed and prompts for collection before invoice creation.

### **How It Works:**

1. **Detection on Quote Creation:**
   - When admin creates a quote for an EU customer
   - System checks `companies.country` and `companies.vat_number`
   - If EU country AND no VAT number stored → show form

2. **One-Time Collection:**
   - VAT form appears inline in quote creation modal
   - User enters VAT number (e.g., DE123456789)
   - Saved permanently to `companies.vat_number`
   - All future invoices automatically use stored VAT number

3. **Format Validation:**
   - Must start with 2-letter country code
   - Length validated per country (e.g., DE=9 digits, FR=11 digits)
   - Automatically converts to uppercase

### **Components Created:**

**VATNumberForm Component** (`src/components/shared/VATNumberForm.tsx`):
- Amber warning banner with clear messaging
- Explains why VAT number is needed (reverse charge)
- Input with country-specific placeholder
- "Save" and "Skip for Now" buttons
- Stores permanently on save

**API Endpoints:**

1. `POST /api/companies/update-vat`
   - Saves VAT number to companies table
   - Basic format validation
   - Returns success/error

2. `GET /api/companies/check-vat-needed?company_id=xxx`
   - Checks if VAT collection needed
   - Returns: `{ vat_needed: true/false, company: {...} }`

**Integration Points:**

- ✅ **Admin Quote Creation:** Integrated into `CreateQuoteModal.tsx`
- ✅ **Portal Invoice Request:** Integrated into `InvoiceRequestModal.tsx` (replaces old checkout flow)

### **Testing the VAT Collection:**

1. Find an EU company in admin (country: DE, FR, IT, etc.)
2. Ensure they have NO vat_number stored
3. Click "Create Quote" for that company
4. VAT form should appear automatically
5. Enter VAT number (e.g., DE123456789)
6. Click "Save VAT Number"
7. Quote creation proceeds with 0% VAT applied
8. Check database: `companies.vat_number` should be populated
9. Try creating another quote for same company → no VAT form shown

---

**System is LIVE and READY for testing!** 🚀
