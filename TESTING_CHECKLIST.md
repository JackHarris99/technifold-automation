# Core Backend Testing Checklist

**Purpose:** Verify all money-making functionality works BEFORE building marketing pages.

**Rule:** Don't touch marketing until every checkbox below is ✅

---

## 🎯 Philosophy

**Marketing pages don't matter if the core doesn't work.**

You can have the most persuasive longform copy in the world, but if:
- Stripe checkout breaks → no revenue
- Token validation fails → tracking broken
- Emails don't send → customers never see offers
- Webhooks fail → orders never recorded

Then the business doesn't work. Marketing comes LAST.

---

## ✅ PHASE 1: Authentication & Access

### Admin Login
- [ ] Navigate to http://localhost:3001/login
- [ ] Enter password: `Technifold`
- [ ] Should redirect to /admin dashboard
- [ ] Should see company list
- [ ] Should see quick action buttons

**If fails:** Check ADMIN_SECRET in .env.local

---

## ✅ PHASE 2: Token System

### Token Generation
- [ ] Login to admin
- [ ] Navigate to `/admin/company/[company_id]`
- [ ] Click "Marketing Builder" tab
- [ ] Should generate tokenized link in format: `/x/{token}`
- [ ] Token should contain: `company_id:contact_id:signature:expires`
- [ ] Copy token URL

**If fails:** Check TOKEN_HMAC_SECRET in .env.local

### Token Validation
- [ ] Paste token URL into browser
- [ ] Should decode successfully
- [ ] Should show company name + contact name
- [ ] Should track engagement in database
- [ ] Should show compatible solutions for that company's machines

**If fails:** Check token signature logic in `/src/lib/tokenHelpers.ts`

### Token Expiry
- [ ] Generate token
- [ ] Check `expires` timestamp (should be 72h from now)
- [ ] Token should work within 72h window
- [ ] Token should fail after 72h (test with manual timestamp manipulation)

**If fails:** Check TTL calculation in token generation

---

## ✅ PHASE 3: Engagement Tracking

### Click Tracking
- [ ] Generate tokenized link for a company
- [ ] Click the link (or visit in new browser)
- [ ] Check Supabase → `engagement_events` table
- [ ] Should see new row with:
  - `company_id`
  - `contact_id`
  - `event_type: 'link_click'`
  - `timestamp`
  - `metadata` (UTM params if present)

**Expected:** Every token click creates engagement event with idempotency

**If fails:** Check `/src/app/x/[token]/page.tsx` engagement tracking logic

### Idempotency
- [ ] Click same token link multiple times
- [ ] Should create multiple events (we want to track every visit)
- [ ] OR: Should deduplicate within 1-hour window (depends on business logic)

**Decision needed:** Do we track every click, or deduplicate recent clicks?

---

## ✅ PHASE 4: Email Sending (Resend)

### Environment Setup
- [ ] Check `.env.local` contains `RESEND_API_KEY=re_M4v9mvtk_...`
- [ ] Check `.env.local` contains `RESEND_FROM_EMAIL=sales@technifold.com`
- [ ] If missing FROM email, add it now

### Test Email Send
- [ ] Navigate to admin → Campaigns → New Campaign
- [ ] OR: Use test script (create one if needed)
- [ ] Send test email to your own address
- [ ] Check email arrives
- [ ] Check email contains tokenized link
- [ ] Click link, verify tracking works

**If fails:**
1. Check Resend API key is valid
2. Check FROM email domain is verified in Resend
3. Check outbox job queue is processing
4. Check Vercel cron is running (if deployed)

### Outbox Job Queue
- [ ] Check Supabase → `outbox` table
- [ ] Send email (should create outbox job)
- [ ] Job should have `status: 'pending'`
- [ ] Cron job should process it (check `/api/cron/process-outbox`)
- [ ] Job status should change to `'completed'` or `'failed'`
- [ ] If failed, check `error_message` column

**If fails:** Check cron job logic in `/src/app/api/cron/process-outbox/route.ts`

---

## ✅ PHASE 5: Stripe Checkout

### Stripe Configuration
- [ ] Check `.env.local` contains `STRIPE_SECRET_KEY=sk_test_...`
- [ ] Check `.env.local` contains `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] Verify keys are TEST mode (not production)
- [ ] Login to Stripe dashboard → Developers → Webhooks
- [ ] Verify webhook endpoint exists (or create one)

### Create Checkout Session
- [ ] Navigate to a solution page (e.g., `/tools/tri-creaser`)
- [ ] Click "Add to Cart" or "Buy Now" button
- [ ] Should redirect to Stripe checkout page
- [ ] Should show product name, price, description
- [ ] Should show correct currency (GBP)

**If fails:** Check Stripe API call in checkout creation logic

### Complete Checkout (Test Mode)
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Complete checkout
- [ ] Should redirect to success page

**If fails:** Check Stripe checkout session configuration

### Verify Order Creation
- [ ] After checkout success, check Supabase → `orders` table
- [ ] Should see new order with:
  - `stripe_checkout_session_id`
  - `stripe_payment_intent_id`
  - `company_id` (if logged in or tokenized)
  - `contact_id`
  - `total`
  - `status: 'completed'`

**If fails:** Check webhook handler at `/api/webhooks/stripe/route.ts`

### Verify Order Items
- [ ] Check Supabase → `order_items` table
- [ ] Should see line items for the order
- [ ] Should have correct SKU, quantity, price

**If fails:** Check order creation logic in webhook handler

---

## ✅ PHASE 6: Webhooks

### Stripe Webhooks
- [ ] Login to Stripe dashboard → Developers → Webhooks
- [ ] Check webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
- [ ] Should be listening for events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `invoice.paid` (for subscriptions)
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### Test Webhook Locally (Stripe CLI)
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

- [ ] Should see webhook received in terminal
- [ ] Should see order created in database
- [ ] Should see successful response (200 OK)

**If fails:** Check webhook signature verification in handler

### Test Webhook on Vercel (Deployed)
- [ ] Deploy to Vercel
- [ ] Add webhook endpoint in Stripe dashboard
- [ ] Complete real checkout (test mode)
- [ ] Check Vercel logs → Functions → Webhook logs
- [ ] Should see successful webhook processing

**If fails:** Check Vercel function logs for errors

---

## ✅ PHASE 7: Quote Builder

### Create Quote
- [ ] Login to admin
- [ ] Navigate to `/admin/quote-builder-v2`
- [ ] Select company
- [ ] Add products to quote
- [ ] Set quantities, prices
- [ ] Save quote

**If fails:** Check quote creation API route

### Generate Quote PDF
- [ ] Open saved quote
- [ ] Click "Generate PDF"
- [ ] Should download PDF with quote details
- [ ] PDF should include company name, products, prices, terms

**If fails:** Check PDF generation logic

### Send Quote Email
- [ ] Open saved quote
- [ ] Click "Send to Customer"
- [ ] Should create outbox job
- [ ] Email should send with tokenized quote link `/q/{token}`
- [ ] Customer clicks link → should see quote
- [ ] Quote should have "Accept Quote" button

**If fails:** Check quote email template and routing

---

## ✅ PHASE 8: CRM & Company Management

### Company Console
- [ ] Navigate to `/admin/company/[company_id]`
- [ ] Should see 8 tabs:
  1. Overview
  2. Marketing Builder
  3. Reorder
  4. Contacts
  5. History
  6. Engagement
  7. Settings
  8. SKU Explorer

### Machine Ownership Tracking
- [ ] Open company console → Overview tab
- [ ] Should see list of machines this company owns
- [ ] Should be able to add new machine
- [ ] Should be able to edit machine details
- [ ] Should be able to remove machine

**If fails:** Check `company_machine` table and CRUD operations

### Contact Management
- [ ] Open company console → Contacts tab
- [ ] Should see list of contacts for this company
- [ ] Should be able to add new contact
- [ ] Should be able to edit contact details
- [ ] Should be able to generate token for contact

**If fails:** Check `contacts` table and CRUD operations

### Engagement Timeline
- [ ] Open company console → Engagement tab
- [ ] Should see timeline of all interactions:
  - Emails sent
  - Links clicked
  - Quotes sent
  - Orders placed
- [ ] Should be in chronological order (newest first)
- [ ] Should show "Next Best Actions" suggestions

**If fails:** Check engagement query logic

---

## ✅ PHASE 9: Pipeline & Prospects

### Sales Pipeline View
- [ ] Navigate to `/admin/pipeline`
- [ ] Should see companies organized by stage:
  - Cold (no engagement)
  - Warm (clicked link)
  - Hot (requested quote)
  - Won (placed order)
  - Lost (inactive 90+ days)
- [ ] Should be able to drag/drop between stages
- [ ] Should update database on move

**If fails:** Check pipeline state management

### Prospect Tracking
- [ ] Navigate to `/admin/prospects`
- [ ] Should see companies grouped by machine ownership
- [ ] Should filter by machine brand/model
- [ ] Should show which companies have which machines
- [ ] Should identify cross-sell opportunities

**If fails:** Check prospect query logic

---

## ✅ PHASE 10: Campaign Management

### Create Campaign
- [ ] Navigate to `/admin/campaigns/new`
- [ ] Select campaign type (marketing, reorder, quote)
- [ ] Define audience (filter by territory, machine, last order date)
- [ ] Write email copy
- [ ] Preview email with token substitution
- [ ] Save campaign

**If fails:** Check campaign creation logic

### Configure Campaign
- [ ] Navigate to `/admin/campaigns/configure`
- [ ] Review audience count
- [ ] Set send schedule (now or scheduled)
- [ ] Confirm configuration
- [ ] Submit for sending

**If fails:** Check campaign configuration logic

### Send Campaign
- [ ] Campaign should create outbox jobs (one per recipient)
- [ ] Jobs should process via cron
- [ ] Emails should send with unique tokens
- [ ] Track delivery status in outbox table

**If fails:** Check campaign sending logic and outbox processing

### Campaign Analytics
- [ ] Navigate to `/admin/campaigns`
- [ ] Should see list of sent campaigns
- [ ] Click campaign to view analytics:
  - Total sent
  - Total delivered
  - Total clicked (from engagement_events)
  - Click rate
  - Conversion rate (orders from campaign)

**If fails:** Check campaign analytics query logic

---

## ✅ PHASE 11: Subscription Management (Ratcheting)

### Create Rental Agreement
- [ ] Company places order for rental product
- [ ] Should create `rental_agreements` record
- [ ] Should have:
  - `subscription_start_date`
  - `monthly_payment` (locked minimum)
  - `current_items` (JSON array of rented items)
  - `stripe_subscription_id`

**If fails:** Check webhook handler for subscription creation

### Add Items to Subscription
- [ ] Company orders additional rental item
- [ ] Should update existing rental agreement
- [ ] Should increase `monthly_payment` (ratcheting)
- [ ] Should append to `current_items` array
- [ ] Should NOT allow downgrade

**If fails:** Check ratcheting logic in subscription update handler

### Cancel Subscription
- [ ] Company cancels subscription
- [ ] Should mark rental agreement as `status: 'cancelled'`
- [ ] Should NOT reduce monthly payment
- [ ] Should trigger return process
- [ ] Should send return shipping label

**If fails:** Check subscription cancellation webhook handler

---

## ✅ PHASE 12: Cron Jobs

### Process Outbox Queue
- [ ] Check `/api/cron/process-outbox` exists
- [ ] Check Vercel cron job is configured (vercel.json)
- [ ] Manually trigger: `curl http://localhost:3001/api/cron/process-outbox`
- [ ] Should process pending outbox jobs
- [ ] Should update job status
- [ ] Should retry failed jobs (with exponential backoff)

**If fails:** Check cron job logic and Vercel configuration

### Send Reorder Reminders
- [ ] Check `/api/cron/reorder-reminders` exists
- [ ] Should query orders from 90 days ago
- [ ] Should create outbox jobs for reorder emails
- [ ] Should generate `/r/{token}` links

**If fails:** Check reorder reminder logic

### Sync to Zoho (Optional)
- [ ] Check `/api/cron/sync-zoho` exists
- [ ] Should sync new orders to Zoho Books
- [ ] Should create invoices in Zoho
- [ ] Should update sync status in database

**If fails:** Check Zoho API integration (not required for launch)

---

## 🚨 Critical Issues Checklist

Before considering core backend "complete", verify:

- [ ] **No console errors** on any admin page
- [ ] **No TypeScript errors** in build (`npm run build`)
- [ ] **All webhooks return 200 OK** in Stripe dashboard
- [ ] **Emails actually arrive** (not just sent)
- [ ] **Tokens work end-to-end** (generate → click → track)
- [ ] **Orders appear in database** after checkout
- [ ] **Engagement events tracked** for every action
- [ ] **Admin login works** without errors
- [ ] **Company console loads** all 8 tabs without errors
- [ ] **No database connection errors** in Vercel logs

---

## 📊 Success Criteria

**Core backend is READY when:**

1. ✅ You can generate a token and send it to a test email
2. ✅ Recipient clicks link and you see engagement event in database
3. ✅ Recipient completes Stripe checkout (test mode)
4. ✅ Webhook creates order in database
5. ✅ You can see the order in admin console
6. ✅ You can create a quote and email it
7. ✅ You can track the company's engagement timeline
8. ✅ Cron jobs process outbox queue without errors

**If ANY of these fail, fix them before building marketing pages.**

---

## 🎯 Testing Order

Test in this exact order (dependencies):

1. **Phase 1: Authentication** (need admin access for everything else)
2. **Phase 2: Token System** (foundation for tracking)
3. **Phase 3: Engagement Tracking** (verify tokens create events)
4. **Phase 4: Email Sending** (need working emails for campaigns)
5. **Phase 5: Stripe Checkout** (money-making engine)
6. **Phase 6: Webhooks** (order creation depends on this)
7. **Phase 7: Quote Builder** (uses email + token system)
8. **Phase 8: CRM** (depends on database being populated)
9. **Phase 9: Pipeline** (depends on engagement data)
10. **Phase 10: Campaigns** (depends on email + tokens + outbox)
11. **Phase 11: Subscriptions** (depends on Stripe + webhooks)
12. **Phase 12: Cron Jobs** (depends on outbox + email)

---

## 🆘 Common Issues & Solutions

### Issue: Tokens Not Validating
**Solution:** Check TOKEN_HMAC_SECRET matches between generation and validation

### Issue: Emails Not Sending
**Solution:** Add RESEND_FROM_EMAIL to .env.local

### Issue: Webhooks Failing
**Solution:** Check webhook signature verification, ensure endpoint is publicly accessible

### Issue: Orders Not Creating
**Solution:** Check Stripe webhook handler is receiving events, check database permissions

### Issue: Engagement Events Not Tracking
**Solution:** Check token decoding logic, ensure engagement API route exists

---

**Remember: No marketing pages until core works. Test everything. Fix everything. Then scale.**

---

## ✅ NEW FEATURES TESTING (December 2024)

### Token Routes (All 6 Routes)

- [ ] `/x/[token]` - Marketing offers load correctly
- [ ] `/m/[token]` - Marketing follow-up pages show personalized content
- [ ] `/r/[token]` - Reorder portal loads with consumables
- [ ] `/q/[token]` - Quote viewer shows products and pricing
- [ ] `/o/[token]` - Order tracking shows recent orders
- [ ] `/i/[token]` - Invoice viewer shows paid invoices with breakdowns

### Stripe Checkout (BACS + Card)

- [ ] Reorder portal checkout button works
- [ ] Checkout page shows both Card and BACS Direct Debit options
- [ ] Test card payment completes successfully
- [ ] Test BACS payment shows "Payment pending" correctly
- [ ] Success page shows after payment
- [ ] Cancel page shows if payment cancelled
- [ ] Webhook creates order after successful payment
- [ ] `/checkout/success` page displays correctly
- [ ] `/checkout/cancel` page displays correctly

### Subscriptions (Flexible Pricing)

- [ ] Create subscription with fixed price (£159/mo)
- [ ] Create subscription with custom price (£847/mo)
- [ ] 30-day free trial starts correctly
- [ ] First payment collected after trial ends
- [ ] Update subscription price (ratcheting increase)
- [ ] Retention discount applied (price decrease)
- [ ] Subscription metadata tracks tools correctly

### Customs & International Shipping

- [ ] Run migration: `ADD_CUSTOMS_SHIPPING_FIELDS.sql`
- [ ] Products table has HS codes
- [ ] Generate customs declaration for test shipment
- [ ] Customs invoice formats correctly
- [ ] Shipping manifest created in database
- [ ] International shipment marked as "RENTAL" correctly

### Payment Methods

**Card Payments:**
- [ ] Card checkout works
- [ ] Settlement within 2 days
- [ ] Failed card payment handled correctly

**BACS Direct Debit (UK):**
- [ ] BACS option appears in checkout
- [ ] Customer can enter sort code + account number
- [ ] Mandate signed successfully
- [ ] Payment shows "pending" status
- [ ] Payment settles within 3-5 days
- [ ] BACS failure handled gracefully

---

## 📋 Pre-Launch Checklist

**Before enabling live Stripe:**

1. ✅ All 6 token routes working
2. ✅ Stripe checkout (card + BACS) tested
3. ✅ Webhooks creating orders correctly
4. ✅ Customs migration run on production
5. ✅ Success/cancel pages displaying
6. ✅ Email sending working
7. ✅ Engagement tracking working
8. ⏸️ Enable BACS in Stripe Dashboard (Production)
9. ⏸️ Switch to live Stripe keys
10. ⏸️ Update webhook endpoints to production URLs

**Documentation:**
- ✅ SUBSCRIPTION_SYSTEM.md created
- ✅ PROJECT_CONTEXT.md updated with new routes
- ✅ SQL migration for customs fields ready

---

## 🎯 Next Steps After Testing

1. **Run customs migration on production database**
2. **Enable BACS Direct Debit in Stripe Dashboard**
3. **Test end-to-end purchase flow with real products**
4. **Create first test subscription**
5. **Monitor webhooks in Stripe Dashboard**
6. **Deploy to production and test live**

