# Resend Email Integration for Invoices

## Changes Made

### ✅ Switched from Stripe Email to Resend

**Why?**
- You asked: "Why not Resend?"  - Stripe's email system was automatic but you already have Resend configured- Using Resend ensures consistent branding across ALL emails (quotes, orders, invoices)
- More control over email content and styling
- Better deliverability tracking via Resend dashboard

**Before:**
```typescript
// Used Stripe's automatic email
await stripe.invoices.sendInvoice(invoice.id);
```

**After:**
```typescript
// Use Resend with your branded email template
await sendInvoiceEmail({
  to: contact.email,
  contactName: contact.full_name,
  companyName: company.company_name,
  invoiceNumber: finalizedInvoice.number,
  invoiceUrl: finalizedInvoice.hosted_invoice_url,
  items: items,
  subtotal, taxAmount, totalAmount,
  currency, vatExemptReason
});
```

---

## Email Template

**New function:** `sendInvoiceEmail()` in `src/lib/resend-client.ts`

**Features:**
- ✅ Outlook-compatible table-based layout
- ✅ Professional Technifold branding (blue header)
- ✅ Itemized product list with quantities and prices
- ✅ VAT breakdown with exemption reasons
- ✅ Large green "View and Pay Invoice" button
- ✅ Payment methods listed (card, bank transfer, Apple/Google Pay)
- ✅ "B2B Friendly" notice (can forward to accounts dept)
- ✅ Download PDF link (if available)
- ✅ Company footer with contact details

**Subject Line:**
```
Invoice INV-12345 from Technifold - £150.00
```

**From Address:**
```
sales@technifold.com (from RESEND_FROM_EMAIL env var)
```

---

## Files Modified

**1. `src/lib/resend-client.ts`**
- Added `sendInvoiceEmail()` function (187 lines of table-based HTML)

**2. `src/lib/stripe-invoices.ts`**
- Replaced `stripe.invoices.sendInvoice()` with `sendInvoiceEmail()`
- Email failure doesn't block invoice creation (fails gracefully)
- Invoice URL still accessible via Stripe dashboard if email fails

---

## Testing

**Test invoice email:**
1. Create invoice via admin or portal
2. Check email arrives from `sales@technifold.com`
3. Verify:
   - Professional blue header
   - Itemized list with correct prices
   - VAT calculated correctly
   - Green "View and Pay Invoice" button works
   - Opens Stripe hosted invoice page
   - Payment options visible (card, bank transfer)

**Check Resend Dashboard:**
- Go to: https://resend.com/emails
- See all sent invoices
- Check delivery status, opens, clicks

---

## Stripe Key Issue ⚠️

**Found in `env.local.txt`:**
```
STRIPE_SECRET_KEY=rk_live_51...
```

**Problem:** This is a **restricted key** (starts with `rk_live_`), not a full secret key.

**What are restricted keys?**
- Limited permissions
- Created in Stripe Dashboard → Developers → API keys → Restricted keys
- Might not have permission to finalize/send invoices

**What you need:** **Full secret key** (starts with `sk_live_`)

### How to Fix:

1. **Go to Stripe Dashboard:**
   https://dashboard.stripe.com/apikeys

2. **Check "Secret key" section:**
   - You should see: `sk_live_51OPDi4Kww71RAGKG...` (masked)
   - Click "Reveal test key" or "Reveal live key"

3. **Copy the FULL secret key** (starts with `sk_live_`)

4. **Update your `.env.local` file:**
   ```
   STRIPE_SECRET_KEY=sk_live_51xxxxxxxxxxxxx
   ```
   (Replace with actual key from Stripe Dashboard)

5. **Redeploy to Vercel:**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Update `STRIPE_SECRET_KEY` with full key (starts with `sk_live_`)
   - Redeploy

**Why it matters:**
- Restricted keys might cause "Permission denied" errors when creating invoices
- Full secret key has all permissions needed for invoice operations

---

## Current Environment Variables

**From `env.local.txt`:**
```
✅ RESEND_API_KEY=re_M4v9mvtk_KpdWycWUp6jhxvj33ZdkBVTb
✅ RESEND_FROM_EMAIL=sales@technifold.com
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51... (CORRECT - live key)
⚠️ STRIPE_SECRET_KEY=rk_live_51... (RESTRICTED KEY - needs full sk_live_ key)
✅ STRIPE_WEBHOOK_SECRET=whsec_ufsMpw4Y9awN1LzUnjWcUzO3iKLV6Wat
✅ SUPABASE_URL=https://pziahtfkagyykelkxmah.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=[configured]
```

**Action Required:** Update `STRIPE_SECRET_KEY` to full secret key (sk_live_)

---

## Benefits of This Change

1. **Consistent Branding:**
   - All emails (quotes, orders, invoices) now use same Technifold template
   - Customers recognize your emails immediately

2. **Better Tracking:**
   - See email delivery, opens, clicks in Resend dashboard
   - Debug email issues more easily

3. **More Control:**
   - Customize email content anytime
   - A/B test subject lines
   - Add custom messages per invoice type

4. **B2B Friendly:**
   - Email explicitly says "you can forward this invoice"
   - Customers can send to accounts department
   - Payment link works for anyone

5. **Reliability:**
   - If Resend fails, invoice still created
   - Customer can access via Stripe dashboard
   - Graceful degradation

---

## What Happens Now

**Invoice Creation Flow:**
```
1. Admin/Portal creates invoice
   ↓
2. Stripe creates invoice + finalizes it
   ↓
3. Resend sends branded email to customer
   ↓
4. Customer receives email from sales@technifold.com
   ↓
5. Customer clicks "View and Pay Invoice"
   ↓
6. Opens Stripe hosted invoice page
   ↓
7. Customer pays (card or bank transfer)
   ↓
8. Webhook fires → Database updated → Commercial invoice generated
```

**Email will look like this:**
- Blue header: "Invoice from Technifold"
- Subtitle: "Invoice #INV-12345"
- Greeting: "Hi [Name],"
- Itemized product table
- Subtotal + VAT + Total
- Big green button: "View and Pay Invoice"
- Payment methods box (card, bank, Apple Pay)
- B2B friendly notice
- Technifold footer with contact details

---

## Ready to Test!

1. **Update Stripe secret key** (rk_live → sk_live) in Vercel
2. **Create a test invoice** via admin or portal
3. **Check your inbox** (or customer's inbox)
4. **Verify email** looks professional and branded
5. **Click "View and Pay Invoice"** → should open Stripe invoice page
6. **Test payment** in live mode with real card

All invoices will now be sent via Resend with your branded template! 🎉
