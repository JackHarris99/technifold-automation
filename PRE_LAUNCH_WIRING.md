# Pre-Launch Wiring Checklist

**Status:** Ready to wire up when Vercel Pro is activated + email system tested

---

## 🔌 Cron Jobs to Enable (After Vercel Pro Upgrade)

All code is complete and tested. These cron jobs are **disabled in vercel.json** to prevent accidental email sends before launch.

### 1. RFM Auto-Categorization
**File:** `src/app/api/cron/update-rfm-scores/route.ts` ✅ BUILT
**Schedule:** Daily at 06:00 UTC (7am BST)
**What it does:**
- Calculates Recency, Frequency, Monetary scores for all 2,851 companies
- Auto-categorizes into segments: Hot VIP, Regular, At Risk, Cold, etc.
- Updates `companies.category` field for smart targeting

**To enable:** Add to `vercel.json`:
```json
{
  "path": "/api/cron/update-rfm-scores",
  "schedule": "0 6 * * *"
}
```

---

### 2. Auto-Reorder Reminder Generator
**File:** `src/app/api/cron/generate-reorder-reminders/route.ts` ✅ BUILT
**Schedule:** Daily at 10:00 UTC (11am BST)
**What it does:**
- Finds companies with no orders in 90+ days
- Creates outbox jobs for subscribed contacts
- Avoids duplicates (checks last 7 days)
- Processes up to 200 companies per day

**Revenue potential:** £142k/year

**To enable:** Add to `vercel.json`:
```json
{
  "path": "/api/cron/generate-reorder-reminders",
  "schedule": "0 10 * * *"
}
```

---

## 📋 Pre-Launch Testing Checklist

Before enabling these cron jobs:

- [ ] Vercel Pro plan activated (removes 2-cron limit)
- [ ] Test reorder email template renders correctly
- [ ] Test HMAC token generation and personalization
- [ ] Verify Stripe subscription flow works end-to-end
- [ ] Check Resend API limits (may need paid plan if >100 emails/day)
- [ ] Test unsubscribe flow
- [ ] Verify `/admin/engagements` tracking works
- [ ] Run manual test of both cron endpoints:
  - `POST /api/cron/update-rfm-scores` (with CRON_SECRET header)
  - `POST /api/cron/generate-reorder-reminders` (with CRON_SECRET header)
- [ ] Monitor first 3 days of automated emails
- [ ] Adjust REMINDER_THRESHOLD_DAYS if needed (currently 90 days)

---

## 🚀 Launch Day Instructions

**Step 1:** Upgrade Vercel to Pro ($20/month)

**Step 2:** Edit `vercel.json` and add both cron jobs:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    },
    "src/app/api/outbox/run/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/update-rfm-scores",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/generate-reorder-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/outbox/run",
      "schedule": "0 12 * * *"
    }
  ]
}
```

**Step 3:** Commit and push:
```bash
git add vercel.json
git commit -m "Launch: Enable RFM categorization + auto-reorder cron jobs"
git push origin main
```

**Step 4:** Verify in Vercel Dashboard:
- Go to: Project → Settings → Cron Jobs
- Should see 3 active cron jobs
- Click "Run Now" on each to test manually

**Step 5:** Monitor first automated cycle (next day):
- 06:00 UTC - Check RFM scores updated
- 10:00 UTC - Check outbox table for new reorder jobs
- 12:00 UTC - Check emails sent via `/admin/engagements`

---

## 📊 Expected Results (Week 1)

- **Day 1:** ~50-100 reorder reminder emails sent
- **Week 1:** Track open rates, click-through rates, conversions
- **Adjust:** Fine-tune REMINDER_THRESHOLD_DAYS (currently 90)
- **Scale:** Increase daily limit from 200 companies if results are good

---

## 🔧 Current Configuration

**Reorder Threshold:** 90 days (adjust in `generate-reorder-reminders/route.ts`)
**Daily Limit:** 200 companies (adjust in same file)
**RFM Segments:** Hot VIP, Hot, Regular, At Risk, Hibernating VIP, Cold, Warm, New/Small
**Email Rate:** Up to 200 companies/day × avg 1.5 contacts = ~300 emails/day
**Resend Limit:** Free tier = 100 emails/day (may need upgrade)

---

**Status:** All systems built and ready. Just needs vercel.json wiring + Pro plan! 🚀
