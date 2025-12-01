# Next Steps - Action Plan

**Priority Order:** Critical → High → Medium → Low
**Estimated Total Time to Launch-Ready:** 6-8 hours

---

## 🔴 CRITICAL (Must Do Before First Customer)

### 1. Create Email Templates (2-3 hours)

**Why Critical:** Email system is built but can't send without templates

**Tasks:**
- [ ] Create trial request email template
  - Subject: "Your Technifold Trial Kit is On The Way"
  - Body: Welcome message, trial link, what to expect
  - Include: Company name, machine name, trial link, support contact
  - Format: HTML + text fallback

- [ ] Test email delivery end-to-end
  - Create test outbox job in DB
  - Run `/api/outbox/run` endpoint
  - Verify email received
  - Test on Gmail, Outlook, Apple Mail

- [ ] Document email template structure
  - Create `/emails` directory
  - Add template files
  - Document placeholders and variables

**Files to Create:**
```
emails/
  trial-request.html
  trial-request.txt
  reorder-reminder.html
  reorder-reminder.txt
  campaign-template.html
  campaign-template.txt
```

**Template Variables:**
```typescript
{
  contact_name: string;
  company_name: string;
  machine_name: string;
  trial_link: string;
  offer_price: number;
  support_email: string;
  support_phone: string;
}
```

**Test Checklist:**
- [ ] Email sends successfully
- [ ] Trial link works (clicks through to /r/[token])
- [ ] Email renders correctly on mobile
- [ ] Email renders correctly on desktop
- [ ] Unsubscribe link works (future)

---

### 2. Configure Stripe Webhook in Production (30 mins)

**Why Critical:** Subscriptions won't update without webhook

**Tasks:**
- [ ] Log into Stripe Dashboard
- [ ] Go to Developers → Webhooks
- [ ] Add endpoint: `https://technifold-automation.vercel.app/api/stripe/webhook`
- [ ] Select events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Update STRIPE_WEBHOOK_SECRET in Vercel environment variables
- [ ] Test with Stripe CLI: `stripe trigger checkout.session.completed`

**Verification:**
- [ ] Create test subscription with test card
- [ ] Verify subscription appears in `/admin/subscriptions`
- [ ] Check `subscriptions` table in database
- [ ] Verify trial end date calculated correctly

---

### 3. Test First Subscription Flow End-to-End (1 hour)

**Why Critical:** Need to verify entire customer journey works

**Test Scenario:**
1. **Visit Machine Page**
   - Go to `/machines/heidelberg-stahlfolder-ti-52`
   - Verify page loads with correct content
   - Check "Request Free Trial" button

2. **Submit Trial Request**
   - Click "Request Free Trial"
   - Fill form with test data
   - Submit
   - Verify success message

3. **Check Email**
   - Check test email inbox
   - Verify trial email received
   - Check formatting looks good
   - Click trial link

4. **Complete Checkout**
   - Verify lands on checkout page
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete checkout
   - Verify success page shows

5. **Verify Database**
   - Check `subscriptions` table
   - Verify status = 'trialing'
   - Verify trial_end_date = 30 days from now
   - Check `companies` and `contacts` created

6. **Check Admin Dashboard**
   - Go to `/admin/subscriptions`
   - Verify new subscription appears
   - Check company page shows subscription

**Success Criteria:**
- ✅ All steps complete without errors
- ✅ Email received and formatted correctly
- ✅ Subscription created in Stripe
- ✅ Database updated correctly
- ✅ Admin dashboard shows subscription

---

## 🟡 HIGH PRIORITY (Pre-Launch)

### 4. Set Up Vercel Cron Jobs (30 mins)

**Why Important:** Automation requires scheduled tasks

**Tasks:**
- [ ] Create `vercel.json` in project root
- [ ] Configure cron schedules:
  ```json
  {
    "crons": [
      {
        "path": "/api/outbox/run",
        "schedule": "0 */6 * * *"
      },
      {
        "path": "/api/cron/update-rfm-scores",
        "schedule": "0 2 * * *"
      },
      {
        "path": "/api/cron/generate-reorder-reminders",
        "schedule": "0 9 * * *"
      }
    ]
  }
  ```
- [ ] Deploy to Vercel
- [ ] Verify crons running in Vercel dashboard
- [ ] Check logs after first run

**Cron Schedule Breakdown:**
- Outbox: Every 6 hours (emails sent 4x per day)
- RFM Scores: Daily at 2am UTC (low traffic time)
- Reorder Reminders: Daily at 9am UTC (business hours)

---

### 5. Submit Sitemap to Google Search Console (15 mins)

**Why Important:** SEO acquisition requires indexing

**Tasks:**
- [ ] Generate sitemap (Next.js auto-generates at `/sitemap.xml`)
- [ ] Verify sitemap includes all machine pages
- [ ] Sign up for Google Search Console
- [ ] Add property: `https://technifold-automation.vercel.app`
- [ ] Verify ownership (meta tag or DNS)
- [ ] Submit sitemap URL
- [ ] Monitor indexing status

**Expected Results:**
- 225 machine pages indexed within 1-2 weeks
- Coverage report shows no errors
- Search performance data starts collecting

---

### 6. Add Basic Error Monitoring (1 hour)

**Why Important:** Need visibility when things break

**Options:**
1. **Sentry (Recommended)**
   - Free tier: 5k errors/month
   - Easy Next.js integration
   - Source map support

2. **LogRocket**
   - Session replay
   - More expensive

3. **Built-in: Vercel Analytics**
   - Already included
   - Basic error tracking

**Implementation (Sentry):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
- Set up error alerting (email/Slack)
- Configure sampling (100% in dev, 10% in prod)
- Add context: user ID, company ID, etc.

---

## 🟢 MEDIUM PRIORITY (Post-Launch Improvements)

### 7. Create Reorder Reminder Email Template (1 hour)

**Not Critical Yet:** No customers with purchase history yet

**Template Structure:**
```
Subject: Time to Restock Your Creasing Ribs?

Hi {contact_name},

It's been {months_since_purchase} months since you ordered {product_name}.

Based on typical usage, your consumables might be running low.

[Reorder Now Button] → Link to /r/[token]

Your previous order:
- {product_1} x {quantity}
- {product_2} x {quantity}

Total: £{previous_total}

Questions? Call 01707 275 114

Best regards,
Technifold Team
```

---

### 8. Add Machine Images to Pages (2-4 hours)

**Not Critical:** Pages work without images, but look better with them

**Tasks:**
- [ ] Create `/public/machine-images` directory
- [ ] Add generic images per type:
  - `folding-machines-generic.jpg`
  - `perfect-binders-generic.jpg`
  - `saddle-stitchers-generic.jpg`
- [ ] Add machine-specific images (225 images - optional):
  - `heidelberg-stahlfolder-ti-52.jpg`
  - `mbo-b30.jpg`
  - etc.
- [ ] Update MachinePageClient to display images
- [ ] Add fallback logic: specific → type-generic → placeholder

**Image Specs:**
- Format: JPG or WebP
- Size: 1200x800px
- Optimized for web (<200KB each)

---

### 9. Build Template Editor UI (3-4 hours)

**Not Critical:** Can edit templates via SQL for now

**Page:** `/admin/templates`

**Features:**
- [ ] List all templates
- [ ] Edit template copy sections
- [ ] Preview changes live
- [ ] Save updates to database
- [ ] Create new templates
- [ ] Mark templates active/inactive

**UI Structure:**
```
Templates
├── Folding Machines
│   ├── Cover Work (Active)
│   └── Section Work (Draft)
├── Perfect Binders
│   └── Standard (Active)
└── Saddle Stitchers
    └── Standard (Active)

[+ Create New Template]
```

**Editor Fields:**
- Template Key (slug)
- Machine Type (dropdown)
- Job Type (optional text)
- Hero Headline (text input)
- Hero Subheading (textarea)
- Problems (repeatable: icon, title, description)
- Solution Features (repeatable)
- Value Props (repeatable)
- CTAs (text inputs)

---

### 10. Add Analytics & Tracking (2-3 hours)

**Not Critical:** Works without, but useful data

**Events to Track:**
- Machine page view
- Trial request submitted
- Trial email opened
- Trial link clicked
- Checkout started
- Checkout completed
- Subscription created
- Reorder link clicked
- Email unsubscribed

**Implementation Options:**
1. **Existing System:** `engagement_events` table (already built!)
   - Already tracking some events
   - Extend to cover all customer actions

2. **Google Analytics 4:**
   - Free
   - Industry standard
   - Good for attribution

3. **PostHog:**
   - Open source
   - Self-hosted option
   - More privacy-friendly

**Quick Win:** Just use existing `engagement_events` table
```typescript
// Already implemented in trial request flow
await supabase.from('engagement_events').insert({
  company_id,
  contact_id,
  event_type: 'trial_requested',
  event_data: { machine_slug, offer_price }
});
```

---

## 🔵 LOW PRIORITY (Future Enhancements)

### 11. A/B Test Templates (Later)
- Create alternate templates
- Random assignment logic
- Track conversion rates
- Analyze winner

### 12. Video Content (Later)
- Installation guide videos
- Before/after demonstrations
- Customer testimonials

### 13. Automated Testing Suite (Later)
- Playwright for E2E tests
- API integration tests
- CI/CD pipeline

### 14. Customer Portal (Later)
- Self-service subscription management
- Invoice history
- Update payment method
- Cancel/reactivate subscription

---

## 📋 Quick Start Checklist (Next Session)

When you open Claude Code next time, do these in order:

**First 10 Minutes:**
- [ ] Read PROJECT_STATUS.md (this file)
- [ ] Check git status (see what's uncommitted)
- [ ] Pull latest from main
- [ ] Run `npm run build` to verify working

**Next Hour:**
- [ ] Create trial email template (HTML + text)
- [ ] Test email sending locally
- [ ] Deploy to Vercel
- [ ] Test email in production

**Next 30 Minutes:**
- [ ] Configure Stripe webhook
- [ ] Test subscription creation
- [ ] Verify database updates

**Final 30 Minutes:**
- [ ] Set up Vercel cron jobs
- [ ] Submit sitemap to Google
- [ ] Run full end-to-end test

**Total Time:** ~2.5 hours to launch-ready system

---

## 🎯 Definition of "Launch-Ready"

The system is ready for first customers when:
- ✅ Emails send automatically (templates created, cron running)
- ✅ Stripe subscriptions create successfully (webhook configured)
- ✅ Machine pages indexed by Google (sitemap submitted)
- ✅ Full customer journey tested end-to-end (trial → email → checkout → subscription)
- ✅ Admin can monitor subscriptions (dashboard working)
- ✅ Error monitoring active (Sentry or similar)

**Current Status:** 4/6 complete
**Remaining Work:** ~3-4 hours

---

## 📞 Support & Resources

**If Something Breaks:**
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Check Stripe dashboard (for payment issues)
4. Check Resend dashboard (for email issues)

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Resend: https://resend.com/docs

**Environment Variables:**
- All in `.env.local` (local dev)
- All in Vercel project settings (production)
- Webhook secrets: Stripe dashboard → Webhooks

---

**Start Here Next Session:** Create trial email template → Test end-to-end → Configure webhook → Set up cron → Launch! 🚀
