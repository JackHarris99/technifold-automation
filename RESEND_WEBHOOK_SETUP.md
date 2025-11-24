# Resend Webhook Setup Instructions

## Overview
This guide will help you configure Resend webhooks to track email opens, clicks, bounces, and complaints.

---

## Prerequisites

✅ **RESEND_API_KEY** is already in Vercel environment variables
✅ DNS records are being added to verify domain
✅ Webhook handler has been built at `/api/resend/webhook`

---

## Step 1: Verify Domain (If Not Done)

1. Log into Resend Dashboard: https://resend.com/domains
2. Add your domain (e.g., `technifold.com`)
3. Add DNS records they provide:
   - TXT record for verification
   - CNAME records for email sending
4. Wait for verification (usually 5-10 minutes)
5. Once verified, you can send emails from `noreply@technifold.com`

---

## Step 2: Configure Webhook in Resend Dashboard

1. **Go to Webhooks:**
   - Visit: https://resend.com/webhooks
   - Click "Create Webhook"

2. **Set Webhook URL:**
   ```
   https://technifold-automation-yv8i.vercel.app/api/resend/webhook
   ```
   (Use your actual Vercel domain from `NEXT_PUBLIC_BASE_URL`)

3. **Select Events to Track:**
   Check ALL of these boxes:
   - ✅ `email.delivered` - Email successfully delivered
   - ✅ `email.opened` - Recipient opened the email
   - ✅ `email.clicked` - Recipient clicked a link
   - ✅ `email.bounced` - Email bounced (hard or soft)
   - ✅ `email.complained` - Recipient marked as spam

4. **Save Webhook**

---

## Step 3: Test Email Tracking

### Send a Test Email

1. Go to `/admin/campaigns/send` in your admin panel
2. Filter contacts to just yourself or a test email
3. Send a test campaign
4. Check:
   - ✅ Email arrives in inbox
   - ✅ Click a link in the email
   - ✅ Go to `/admin/dashboard` and see:
     - "Email Opens" count increases
     - "Link Clicks" count increases
     - Hot lead appears if multiple interactions

### Verify in Database

```sql
-- Check if events are being tracked
SELECT
  event_name,
  occurred_at,
  contact_id,
  meta->>'resend_email_id' as email_id
FROM engagement_events
WHERE source = 'vercel'
  AND event_name IN ('email_delivered', 'email_opened', 'email_clicked')
ORDER BY occurred_at DESC
LIMIT 20;
```

---

## Step 4: Verify Webhook is Working

### Check Vercel Logs

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to "Logs" tab
4. Look for entries like:
   ```
   [resend-webhook] Received event: email.opened for email: abc123
   [resend-webhook] 🔥 High engagement: john@example.com email.clicked
   ```

### Check Resend Webhook Logs

1. Go to Resend Dashboard: https://resend.com/webhooks
2. Click on your webhook
3. See recent deliveries and responses
4. All should show `200 OK` status

---

## What Each Event Does

| Event | What It Tracks | Action Taken |
|-------|----------------|--------------|
| **email.delivered** | Email successfully reached inbox | Logged to `engagement_events` |
| **email.opened** | Recipient opened the email | Logged + **Hot lead indicator** 🔥 |
| **email.clicked** | Recipient clicked a link | Logged + **Hot lead indicator** 🔥🔥 + Sales rep notification (TODO) |
| **email.bounced** | Email bounced (invalid address) | Logged + Contact marked as `bounced` |
| **email.complained** | Marked as spam | Logged + Contact unsubscribed + `marketing_consent = false` |

---

## Sales Rep Dashboard

Once webhooks are configured, the dashboard (`/admin/dashboard`) will show:

### Live Metrics (Updates as events come in)
- 📧 **Email Opens** today
- 🖱️ **Link Clicks** today
- 👀 **Portal Views** today
- 💼 **Quote Requests** today

### Hot Leads (Last 7 Days)
- Shows contacts with most engagement
- Ranked by total interactions
- Color-coded badges for opens/clicks/views
- Click to go straight to company page

### Commission Tracking
- 💰 Revenue this month
- 🎯 Commission earned (10% of revenue)
- 🏢 Territory company count

---

## Mass Campaign Flow (End-to-End)

### 1. Create Campaign
- Go to `/admin/campaigns/send`
- Apply filters:
  - Company category (hot, active, dormant, prospect)
  - Machine status (has machine / no machine)
  - Last order date (30/90/180/365 days)
  - Consent only (GDPR compliant) ✅

### 2. Select Contacts
- Preview filtered contacts in table
- Select all or pick individually
- See count: "2,453 contacts selected"

### 3. Configure Campaign
- Campaign key: `spring_2025_reorder`
- Subject: `Solutions for your {{machine.brand}} {{machine.model}}`
- Personalization tokens available

### 4. Send
- Click "Send to X Contacts"
- System does:
  1. Generate unique token per contact
  2. Create personalized marketing URL: `/m/[token]`
  3. Send email via Resend
  4. Log `email_sent` event
  5. Rate limit: 500ms between emails (2/second)

### 5. Track Results
- Resend webhooks fire as contacts interact
- Events logged to `engagement_events` table
- Dashboard updates in real-time
- Hot leads appear automatically

### 6. Sales Rep Acts
- Sees hot lead on dashboard
- Clicks through to company page
- Reviews engagement timeline
- Sends personalized quote

---

## Email Tracking Fields in Database

### engagement_events table

```sql
{
  event_id: uuid,
  occurred_at: timestamp,
  company_id: text,
  contact_id: uuid,
  source: 'vercel',  -- All email events from Resend webhook
  source_event_id: 'resend_abc123_email.opened',  -- Idempotency
  event_name: 'email_opened',
  campaign_key: 'spring_2025_reorder',
  offer_key: 'spring_2025_reorder',
  url: 'https://yourdomain.com/m/token123',  -- For clicks
  meta: {
    resend_email_id: 'abc123',
    from: 'noreply@technifold.com',
    subject: 'Solutions for your Heidelberg XL106',
    link: 'https://...',  -- For clicks only
    clicked_at: '2025-01-15T10:30:00Z',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...'
  }
}
```

---

## Troubleshooting

### Webhook Not Receiving Events

**Check 1:** Verify webhook URL is correct
```
https://YOUR-DOMAIN.vercel.app/api/resend/webhook
```

**Check 2:** Check Vercel logs for errors
```
[resend-webhook] Error processing webhook: ...
```

**Check 3:** Check Resend webhook delivery logs
- Should show 200 OK responses
- If 4xx/5xx errors, check Vercel logs

### Contacts Not Showing as Bounced

**Issue:** Email bounced but contact still has `marketing_consent = true`

**Solution:** The webhook automatically sets:
```sql
UPDATE contacts
SET email_status = 'bounced',
    updated_at = NOW()
WHERE contact_id = 'xxx';
```

Check if `contacts` table has `email_status` column. If not, add it:
```sql
ALTER TABLE contacts ADD COLUMN email_status TEXT DEFAULT 'valid';
```

### No Hot Leads Appearing

**Issue:** Dashboard shows 0 hot leads even though emails sent

**Possible Causes:**
1. No one has opened/clicked yet (wait a bit)
2. Webhook not configured (no events being tracked)
3. Events tracked but for wrong contacts (territory filter)

**Check:**
```sql
-- See recent email events
SELECT * FROM engagement_events
WHERE event_name IN ('email_opened', 'email_clicked')
  AND occurred_at > NOW() - INTERVAL '7 days'
ORDER BY occurred_at DESC;
```

---

## Rate Limits (Resend Plans)

### Free Plan
- 100 emails/day
- 2 emails/second

### Pro Plan ($20/month)
- 50,000 emails/month
- 10 emails/second

**Current Implementation:**
- 500ms delay between sends = 2/second (free tier compatible)
- For 50K campaign, adjust to 100ms delay if on Pro plan

**Edit rate limit in:**
`src/app/api/admin/campaigns/send-bulk/route.ts`
```typescript
// Line ~120
await new Promise(resolve => setTimeout(resolve, 100)); // 100ms = 10/sec (Pro)
```

---

## Next Steps (Future Enhancements)

### Sales Rep Notifications
- [ ] Email digest: "Your contacts had 12 interactions yesterday"
- [ ] Real-time notifications in admin UI (bell icon)
- [ ] Slack/SMS notifications for hot leads

### AI Automation
- [ ] Auto-score leads based on engagement
- [ ] Predict next best action
- [ ] Auto-send follow-ups based on behavior
- [ ] Optimize email send times per contact

### Advanced Tracking
- [ ] Time on page (JavaScript tracker)
- [ ] Scroll depth tracking
- [ ] Form abandonment tracking
- [ ] Video view tracking

---

## Summary Checklist

- [ ] Resend domain verified (DNS records added)
- [ ] RESEND_API_KEY in Vercel environment variables
- [ ] Webhook created in Resend dashboard
- [ ] Webhook URL points to `/api/resend/webhook`
- [ ] All events selected (delivered, opened, clicked, bounced, complained)
- [ ] Test email sent and tracked
- [ ] Dashboard shows live metrics
- [ ] Hot leads appearing after interactions
- [ ] Mass campaign sent successfully
- [ ] Email tracking confirmed in database

---

**You're ready to track engagement and close more deals! 🚀**
