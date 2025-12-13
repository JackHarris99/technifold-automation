# Stripe Dashboard Configuration Guide

Complete setup checklist for Technifold's invoice-led billing system.

---

## 1. Business Branding

**Why:** Makes invoices look professional with your logo and colors

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/branding
2. Click "Upload logo" → Upload Technifold logo (PNG/SVG, max 512KB)
3. **Brand color:** Set to `#2563eb` (Technifold blue)
4. **Icon:** Upload square icon version of logo (for payment page favicon)
5. Click **Save**

---

## 2. Business Information

**Why:** Shows on all invoices and payment receipts

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/public
2. Fill in business details:
   ```
   Legal business name: Technifold Ltd
   Business address:
     Unit 2, St John's Business Park
     Lutterworth
     Leicestershire
     LE17 4HB
     United Kingdom

   Phone: 01707 275 114
   Support email: sales@technifold.com
   Website: https://technifold.com
   ```
3. **VAT/Tax ID:** Add your VAT number (e.g., GB123456789)
4. Click **Save**

---

## 3. Payment Methods

**Why:** Enables customers to pay by bank transfer (essential for large B2B orders)

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. **Enabled payment methods:**
   - ✅ Cards (enabled by default)
   - ✅ Apple Pay / Google Pay (enabled by default)
   - ✅ **BACS Direct Debit** (click "Turn on" if not enabled)
   - ✅ **Bank transfers (BACS)** (click "Turn on" - this is the key one!)
3. Scroll down to "Payment method settings"
4. Click **Save**

**Note:** Bank transfers in the UK use BACS (Bankers' Automated Clearing System). Payments typically take 3-5 business days to clear.

---

## 4. Invoice Settings

**Why:** Configures how invoices are sent and tracked

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/billing/invoice
2. **Invoice settings:**
   - Default payment terms: **Due on receipt** (already correct)
   - Footer text: *(Optional)* Add custom footer like:
     ```
     Questions? Contact us at sales@technifold.com or call 01707 275 114
     ```
3. **Email settings:**
   - "Send email when invoice is created" → ✅ **ON**
   - Email template: Use default Stripe template (professional and tested)
4. **Automatic collection:**
   - "Automatically attempt to collect payment" → ✅ **ON**
5. **Reminders (Optional but recommended):**
   - Enable automatic payment reminders:
     - 3 days after due date
     - 7 days after due date
     - 14 days after due date
6. Click **Save**

---

## 5. Webhook Configuration (Already Done)

**Why:** Updates your database when invoices are paid/failed

**Verify webhook is working:**
1. Go to: https://dashboard.stripe.com/webhooks
2. You should see: `https://technifold.com/api/stripe/webhook` (or your production domain)
3. **Listening to events:**
   - ✅ `invoice.created`
   - ✅ `invoice.finalized`
   - ✅ `invoice.sent`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.voided`
   - ✅ `invoice.marked_uncollectible`

**Status:** Should show ✅ **Active** with recent events

---

## 6. Customer Portal (Optional)

**Why:** Lets customers view/download past invoices themselves

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Enable customer portal: ✅ **ON**
3. Features to enable:
   - ✅ View invoices
   - ✅ Download invoices
   - ✅ Update payment method
   - ❌ Cancel subscription (not needed - subscriptions managed via admin)
4. Click **Save**

**Usage:** You can send customers a link to their portal to view all invoices.

---

## 7. Tax Settings (VAT)

**Why:** Ensures correct VAT calculation for UK/EU/International

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/tax
2. **Tax calculation:**
   - Method: **Manual** (your system handles VAT calculation)
   - Default tax behavior: **Inclusive** for UK, **Exclusive** for exports
3. **UK VAT:**
   - Tax ID: GB123456789 (your VAT number)
   - Rate: 20%
4. Click **Save**

**Note:** Your invoice creation API (`src/lib/stripe-invoices.ts`) already handles VAT calculation automatically based on customer country and VAT number.

---

## 8. Email Receipts

**Why:** Customers get branded email when they pay

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/emails
2. **Receipt emails:**
   - "Send receipt email when charge succeeds" → ✅ **ON**
3. **Email branding:**
   - Uses your branding from step 1 automatically
   - Preview email to check it looks good
4. Click **Save**

---

## 9. Test Mode vs Live Mode

**Important:** Make these changes in **BOTH** test mode and live mode!

**Test Mode (for development):**
- Top-left switch: "Viewing test data"
- Use test card: `4242 4242 4242 4242` (any future date, any CVC)

**Live Mode (for production):**
- Top-left switch: "Viewing live data"
- Real payments, real money

---

## 10. Security Settings

**Why:** Protects your Stripe account

**Steps:**
1. Go to: https://dashboard.stripe.com/settings/team
2. **Two-factor authentication:**
   - Enable 2FA for all team members: ✅ **REQUIRED**
3. **API keys:**
   - Keep secret key in `.env.local` file (NEVER commit to git)
   - Rotate keys if ever exposed
4. **Restrict API key:** (Recommended)
   - Go to: https://dashboard.stripe.com/apikeys
   - Create restricted key with only required permissions:
     - ✅ Invoices: Read + Write
     - ✅ Customers: Read + Write
     - ✅ Payments: Read
     - ❌ Everything else: None

---

## Verification Checklist

After completing all steps, verify:

- [ ] Invoice created in test mode → Check email received
- [ ] Invoice shows Technifold branding (logo, colors)
- [ ] Invoice payment page shows bank transfer option
- [ ] Test payment with card `4242 4242 4242 4242` → Webhook fires
- [ ] Check database: `orders.invoice_status` updated to `paid`
- [ ] International order → Commercial invoice generated
- [ ] EU customer without VAT number → VAT form appears in admin

---

## Useful Stripe Dashboard URLs

- **Invoices:** https://dashboard.stripe.com/invoices
- **Customers:** https://dashboard.stripe.com/customers
- **Payments:** https://dashboard.stripe.com/payments
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Logs:** https://dashboard.stripe.com/logs
- **Settings:** https://dashboard.stripe.com/settings

---

## Support

If you encounter issues:
1. Check **Stripe Logs:** https://dashboard.stripe.com/logs
2. Check **Webhook events:** https://dashboard.stripe.com/webhooks
3. Check application logs: Look for `[stripe-webhook]` or `[stripe-invoices]`
4. Stripe documentation: https://stripe.com/docs/invoicing

---

**Last updated:** 2025-01-28
