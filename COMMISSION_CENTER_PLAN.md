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
│  │  🔧 Tool Sales:       £8,450 → £845.00 (10%)│ │
│  │  📦 Consumables:      £4,000 → £40.00  (1%) │ │
│  │  🔄 Subscriptions:    £0     → £0.00   (10%)│ │
│  │  ─────────────────────────────────────────   │ │
│  │  TOTAL COMMISSION:    £885.00                │ │
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
**Complex calculation by product type:**

```sql
-- Get all paid invoices this month with items and product types
SELECT
  ii.invoice_id,
  ii.product_code,
  p.type as product_type,
  ii.quantity,
  ii.unit_price,
  (ii.quantity * ii.unit_price) as item_subtotal,
  i.company_id,
  c.account_owner,
  CASE
    WHEN p.type = 'tool' THEN (ii.quantity * ii.unit_price) * 0.10
    WHEN p.type = 'consumable' AND c.account_owner = 'current_rep_id'
      THEN (ii.quantity * ii.unit_price) * 0.01
    ELSE 0
  END as commission
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.invoice_id
JOIN products p ON ii.product_code = p.product_code
JOIN companies c ON i.company_id = c.company_id
WHERE i.payment_status = 'paid'
  AND i.invoice_date >= '2026-01-01'  -- First day of current month
  AND i.invoice_date < '2026-02-01'   -- First day of next month
```

**Breakdown display:**
- Tool revenue → Commission @ 10%
- Consumable revenue (only assigned customers) → Commission @ 1%
- Subscription revenue (future) → Commission @ 10%
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

### 4. Commission Rate Structure (ACTUAL)

**Commission is product-type based:**

| Product Type | Commission Rate | Condition |
|--------------|----------------|-----------|
| **Tools** | 10% | All tool sales |
| **Tool Subscriptions** | 10% | Recurring revenue (future) |
| **Consumables** | 1% | ONLY for customers assigned to rep (account_owner) |

**Logic:**
1. For each paid invoice, get invoice_items
2. Join with products table to get product.type
3. Calculate commission per item:
   - If `type = 'tool'` → `subtotal × 0.10`
   - If `type = 'consumable'` AND `invoice.company_id.account_owner = rep` → `subtotal × 0.01`
   - If `type = 'consumable'` but customer NOT assigned → £0 commission
4. Sum all item commissions = total commission for invoice

**Example:**
```
Invoice ABC-123 (Company: XYZ001, account_owner: john)
  Item 1: MOULD-161 (tool)       - £500 → Commission: £50 (10%)
  Item 2: CP-NY/SL-35 (consumable) - £200 → Commission: £2 (1%, customer assigned to john)
  Item 3: 317-SS-BLUE (tool)      - £150 → Commission: £15 (10%)

Total commission for john: £67
```

**Edge case:**
If Jane sells consumables to XYZ001 (john's customer), john still gets the 1% commission (customer assignment, not who created the invoice).

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
  "commission_breakdown": {
    "tools": {
      "revenue": 8450.00,
      "commission": 845.00,
      "rate": 0.10
    },
    "consumables": {
      "revenue": 4000.00,
      "commission": 40.00,
      "rate": 0.01,
      "note": "Only from assigned customers"
    },
    "subscriptions": {
      "revenue": 0,
      "commission": 0,
      "rate": 0.10
    }
  },
  "total_commission": 885.00,
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

1. ~~**Commission rate:**~~ ✅ ANSWERED - 10% tools/subscriptions, 1% consumables (assigned customers only)
2. **Activity outcomes:** What outcomes matter? (successful call vs voicemail) - Do we track both or just successful?
3. **Quotes that become invoices:** Track conversion rate? (Good metric for dashboard)
4. **Split commissions:** If account_owner changes mid-month, how to handle?
   - Option A: Commission goes to whoever owns customer at month-end
   - Option B: Commission split based on days owned
   - Option C: Commission goes to whoever owned customer when invoice was paid
5. **Historical cutoff:** When did current commission system start? (for history view)
6. **Consumable commission clarification:** If a rep creates an invoice for a customer NOT assigned to them, who gets consumable commission?
   - Current assumption: Always goes to account_owner (customer assignment)
   - Alternative: Goes to whoever created the invoice

---

## Important for Stripe Import

When importing historical Stripe invoices tomorrow, ensure:
1. **invoice_items.unit_price is populated** - Needed for commission calculations
2. **Products have correct `type`** - Must be 'tool' or 'consumable' for commission logic
3. **Companies have `account_owner` set** - Required for consumable commission attribution

Without these, commission calculations will be £0 or incorrect!

---

## Next Steps

After Stripe import tomorrow, we can:
1. Build activity logging UI (1-2 hours)
2. Build commission dashboard page (2-3 hours)
3. Add team activity comparison (1 hour)

Total build time: ~4-6 hours of focused work

Sound good? 🚀
