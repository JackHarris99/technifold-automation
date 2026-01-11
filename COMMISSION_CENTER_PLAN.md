# Commission & Activity Center - Implementation Plan

## Overview
Build a sales activity tracking and commission calculation center focused on **leading indicators** (activities) rather than just revenue targets. Perfect for a 3-person sales team.

## Core Philosophy
**More activity = More revenue**
- Track calls, visits, quotes, follow-ups
- Make these metrics competitive (safe for small team)
- Revenue/commission is the outcome, not the goal

---

## What Already Exists ✅

### Database Tables
- `engagement_events` - Tracks all customer interactions
  - Already has `manual_contact%` event convention
  - `company_id`, `contact_id`, `occurred_at`, `event_name`
- `quotes` - Quote tracking
  - `sent_at`, `created_by`, `status`, `accepted_at`, `won_at`
- `invoices` - Revenue tracking
  - `subtotal`, `payment_status`, `invoice_date`
- `companies` - Customer ownership
  - `account_owner` field (sales rep assignment)

### Current Features
- Sales Centre page with 30-day rolling revenue
- Engagement timeline viewer
- Company detail pages

---

## What to Build 🚀

### 1. Activity Logging UI
**Location:** Company detail page

**Add quick-action buttons:**
- 📞 **Log Call** - Record phone conversation
- 🚗 **Log Visit** - Record on-site visit
- ✉️ **Log Email** - Record email sent
- 🔄 **Log Follow-up** - Record follow-up attempt
- 🤝 **Log Meeting** - Record scheduled meeting

**Modal for each activity:**
```
┌─────────────────────────────────┐
│ Log Phone Call                  │
├─────────────────────────────────┤
│ Company: [Auto-filled]          │
│ Contact: [Dropdown]             │
│ Outcome:                        │
│   ○ Successful conversation     │
│   ○ Left voicemail              │
│   ○ No answer                   │
│   ○ Scheduled follow-up         │
│                                 │
│ Notes: [Text area]              │
│                                 │
│ [Cancel]  [Log Activity]        │
└─────────────────────────────────┘
```

**Database:**
Insert into `engagement_events`:
- `event_name`: `manual_contact_call_success`, `manual_contact_visit`, etc.
- `event_type`: `manual_activity`
- `occurred_at`: NOW()
- Auto-fill company_id, contact_id
- Store notes in `meta` jsonb field

---

### 2. Commission Dashboard Page
**Route:** `/admin/commission` or `/admin/my-performance`

**Layout:**

```
┌────────────────────────────────────────────────────┐
│  My Performance - January 2026          [John Doe] │
├────────────────────────────────────────────────────┤
│                                                     │
│  💰 COMMISSION THIS MONTH                          │
│  ┌──────────────────────────────────────────────┐ │
│  │  Revenue (Subtotal):  £12,450                │ │
│  │  Commission Rate:     5%                     │ │
│  │  Commission Earned:   £622.50                │ │
│  │                                              │ │
│  │  Progress: [████████░░] 62% of month        │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  📊 ACTIVITY METRICS - JANUARY                     │
│  ┌───────────────┬───────────────┬──────────────┐ │
│  │ 📞 Calls Made │ 🚗 Visits     │ ✉️ Quotes    │ │
│  │     42        │     8         │     12       │ │
│  │ #1 in team 🥇 │ #2 in team    │ #1 in team🥇 │ │
│  └───────────────┴───────────────┴──────────────┘ │
│                                                     │
│  🏆 TOP PRODUCTS SOLD THIS MONTH                   │
│  1. MOULD-161      (15 units, £3,200)             │
│  2. CP-NY/SL-35    (8 units, £1,800)              │
│  3. 317-SS-BLUE    (12 units, £950)               │
│                                                     │
│  📈 6-MONTH HISTORY                                │
│  [Chart showing monthly revenue & commission]      │
│                                                     │
└────────────────────────────────────────────────────┘
```

**Key Sections:**

#### A. Current Month Commission
- Query: `invoices` WHERE `payment_status = 'paid'` AND `invoice_date >= first day of month` AND company's `account_owner = current_user`
- Sum: `subtotal` (excludes VAT/shipping)
- Commission: `subtotal * commission_rate`
- Progress bar: Days into month

#### B. Activity Metrics (Competitive!)
- **Calls Made:** Count `engagement_events` WHERE `event_name LIKE 'manual_contact_call%'` this month
- **Visits:** Count WHERE `event_name LIKE 'manual_contact_visit%'`
- **Quotes Sent:** Count `quotes` WHERE `sent_at` this month AND `created_by = rep`
- **Emails Sent:** Count WHERE `event_name LIKE 'manual_contact_email%'`
- **Follow-ups:** Count WHERE `event_name LIKE 'manual_contact_followup%'`

**Show team ranking:**
- #1, #2, #3 with trophy emoji for winner
- Safe for 3-person team, focuses on effort not just results

#### C. Top Products Sold
- Query `invoice_items` joined with `invoices` for paid invoices this month
- Group by `product_code`
- Show product name, units sold, revenue generated

#### D. Historical Performance
- Last 6 months calendar view
- Each month shows: Revenue, Commission, Key activities
- Chart visualization

---

### 3. Team Activity Comparison (NOT Revenue)
**Location:** Separate tab or section

**Safe metrics to compare:**
- Calls made (encourages outreach)
- Customer visits (encourages relationship building)
- Quotes sent (encourages proposals)
- Follow-ups completed (encourages persistence)

**Format:**
```
TEAM ACTIVITY - JANUARY 2026

📞 Calls Made
  John Doe    ████████████████ 42
  Jane Smith  ███████████░░░░░ 35
  Bob Jones   ██████████░░░░░░ 28

🚗 Customer Visits
  Jane Smith  ████████████████ 12
  John Doe    ██████████░░░░░░ 8
  Bob Jones   ██████░░░░░░░░░░ 5

✉️ Quotes Sent
  John Doe    ████████████████ 12
  Bob Jones   ████████░░░░░░░░ 9
  Jane Smith  ██████░░░░░░░░░░ 6
```

**NO revenue comparison** - keeps it about effort, not results. Avoids arguments.

---

### 4. Commission Rate Configuration
**Location:** Settings or admin config

**Structure:**
```typescript
interface CommissionStructure {
  rep_id: string;
  commission_rate: number; // e.g., 0.05 for 5%
  // Future: tiered rates
  tiers?: Array<{
    threshold: number;
    rate: number;
  }>;
}
```

**Options:**
- Flat rate per rep (e.g., 5% of subtotal)
- Tiered rates (future): "5% up to £20k, 7% above"
- Different rates per rep (if needed)

---

### 5. Activity Goals (Future - Optional)
When ready to set targets:

```
MONTHLY GOALS

📞 Calls:        [████████░░] 42 / 50
🚗 Visits:       [██████████] 8 / 8  ✅
✉️ Quotes:       [████████░░] 12 / 15
💰 Revenue:      [██████░░░░] £12k / £20k
```

---

## Implementation Priority

### Phase 1: Foundation (Do First) 🔥
1. **Activity logging UI** on company detail page
   - Quick buttons to log calls, visits, emails, follow-ups
   - Modal with outcome tracking
   - Insert into `engagement_events`

2. **Commission dashboard page**
   - Current month revenue & commission
   - Activity metrics with team ranking
   - Top products sold

### Phase 2: Enhancement
3. **Historical view**
   - 6-month chart
   - Month-by-month breakdown

4. **Team activity comparison page**
   - Safe metrics only (no revenue comparison)

### Phase 3: Advanced (Future)
5. **Activity goals/targets**
   - Once you have baseline data
6. **Subscription tracking**
   - When subscription system is live
7. **Tiered commission rates**
   - If needed for incentivization

---

## Technical Implementation

### New Database Table: `commission_config`
```sql
CREATE TABLE commission_config (
  rep_id TEXT PRIMARY KEY,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT
);
```

### New API Endpoints

#### POST `/api/admin/activity/log`
Log manual sales activity
```json
{
  "company_id": "ABC001",
  "contact_id": "uuid",
  "activity_type": "call" | "visit" | "email" | "followup" | "meeting",
  "outcome": "success" | "voicemail" | "no_answer" | "scheduled",
  "notes": "Discussed Q1 tooling needs"
}
```

#### GET `/api/admin/commission/current`
Get current month performance for logged-in rep
```json
{
  "month": "2026-01",
  "revenue": 12450.00,
  "commission_rate": 0.05,
  "commission_earned": 622.50,
  "invoices_closed": 8,
  "activities": {
    "calls": 42,
    "visits": 8,
    "quotes_sent": 12,
    "emails": 18,
    "followups": 15
  },
  "top_products": [...]
}
```

#### GET `/api/admin/commission/team-activities`
Get team activity metrics (not revenue)
```json
{
  "month": "2026-01",
  "reps": [
    {
      "rep_id": "john",
      "full_name": "John Doe",
      "activities": {
        "calls": 42,
        "visits": 8,
        "quotes_sent": 12
      }
    },
    ...
  ]
}
```

---

## Benefits

✅ **Motivates through activities** (not just outcomes)
✅ **Safe competition** for small team (no revenue comparison)
✅ **Transparency** in commission calculations
✅ **Data-driven decisions** on what activities drive revenue
✅ **Recognition** for effort and hustle
✅ **Top products** helps reps focus on what sells
✅ **Eventually adds subscriptions** when that system is ready

---

## Questions to Answer

1. **Commission rate:** What % of subtotal? Same for all reps?
2. **Activity outcomes:** What outcomes matter? (successful call vs voicemail)
3. **Quotes that become invoices:** Track conversion rate?
4. **Split commissions:** If account_owner changes mid-month, how to handle?
5. **Historical cutoff:** When did current commission system start? (for history view)

---

## Next Steps

After Stripe import tomorrow, we can:
1. Build activity logging UI (1-2 hours)
2. Build commission dashboard page (2-3 hours)
3. Add team activity comparison (1 hour)

Total build time: ~4-6 hours of focused work

Sound good? 🚀
