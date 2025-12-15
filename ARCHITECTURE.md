# Technifold Automation - Architecture & Data Strategy

**Last Updated**: December 15, 2025

---

## System Overview

This platform is an **automated sales powerhouse** focused on customer engagement, subscription management, and streamlined operations. It works alongside Sage (official accounting system) but operates independently.

---

## Data Architecture Philosophy

### **Separation of Concerns**

```
┌─────────────────────────────────────────┐
│ SAGE (Accounting System)                │
│ • Official financial records            │
│ • Legal/tax compliance                  │
│ • Historic data preservation            │
│ • Remains separate                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ THIS PLATFORM (Sales Automation)        │
│ • Customer engagement tracking          │
│ • Fact-based product ownership          │
│ • Future Stripe invoices                │
│ • Subscription management               │
│ • Marketing automation                  │
└─────────────────────────────────────────┘
```

### **Core Principle: Facts Over History**

❌ **OLD APPROACH**: Try to reconstruct detailed historic invoices from Sage
- Complex line-item history
- Price inconsistencies over time
- Data quality issues
- Maintenance nightmare

✅ **NEW APPROACH**: Extract essential facts, track going forward
- Who owns what tools (with dates)
- What consumables they buy (with patterns)
- Current subscriptions and their state
- Future invoices tracked properly via Stripe

---

## Table Strategy

### **ACTIVE TABLES** (Build On These)

#### **Fact Tables** (Pre-aggregated, Fast Queries)
| Table | Purpose | Data Source |
|-------|---------|-------------|
| `company_tools` | Tool ownership tracking | Extracted from historic sales + manual updates |
| `company_consumables` | Consumable purchase history | Extracted from historic sales |
| `company_product_history` | Other product purchases (parts, accessories) | Extracted from historic sales |
| `tool_consumable_map` | Which consumables fit which tools | Manual mapping |

#### **Subscription System**
| Table | Purpose |
|-------|---------|
| `subscriptions` | Active/trial/cancelled subscriptions |
| `subscription_tools` | Tools allocated to subscriptions (with audit trail) |
| `subscription_events` | Full audit log of subscription changes |

#### **Invoicing** (Future Stripe Only)
| Table | Purpose |
|-------|---------|
| `invoices` | **NEW Stripe invoices going forward** |
| `invoice_items` | Line items for Stripe invoices |

#### **Engagement Tracking**
| Table | Purpose | Level |
|-------|---------|-------|
| `engagement_events` | ✅ **USE THIS** - All customer interactions | Company + Contact |
| `contact_interactions` | ⚠️ **DEPRECATED** - Legacy tracking | Contact only |

**Why engagement_events?**
- Tracks at BOTH company and contact levels
- Includes campaign attribution (`campaign_key`, `offer_key`)
- Tracks value (`value`, `currency`)
- More flexible metadata (`meta` JSONB)

**For Sales Reps:**
Shows WHO at the company is engaging (contact-level detail) while rolling up to company-level metrics.

---

### **DEPRECATED TABLES** (Do Not Build New Features)

⚠️ **These tables contain historic Sage data but are no longer the source of truth:**

| Table | Status | Why Deprecated | What To Do |
|-------|--------|----------------|------------|
| `orders` | **DEPRECATED** | Historic Sage invoice mess. Prices wrong, data inconsistent. | Extract facts to `company_tools` / `company_consumables` / `company_product_history`, then ignore. **DO NOT DELETE** (keep for reference). |
| `order_items` | **DEPRECATED** | Line items from Sage. Too messy to rebuild history from. | Same as above - extract facts, then ignore. **DO NOT DELETE**. |
| `contact_interactions` | **DEPRECATED** | Superseded by `engagement_events` which is more flexible. | Migrate to `engagement_events`. **DO NOT DELETE**. |

**IMPORTANT**: These tables are marked deprecated but **NOT deleted** from the schema. They remain for:
- Reference if needed
- Safety/rollback capability
- Historic audit trail

---

## Product Type Tracking

Products have a `type` field in the `products` table:
- `tool` → Tracked in `company_tools`
- `consumable` → Tracked in `company_consumables`
- `part`, `accessory`, `service`, etc. → Tracked in `company_product_history`

This ensures comprehensive purchase history without overloading the specific tool/consumable tables.

---

## Campaign Tracking (Partial Implementation)

### **Current State**

The `engagement_events` table includes fields for campaign tracking:
- `campaign_key` (text) - Campaign identifier
- `offer_key` (text) - Specific offer/variant within campaign

⚠️ **IMPORTANT**: Full campaign management UI does not yet exist. These fields are:
- **Safe to use** - They won't break anything
- **Forward-looking** - Ready for when campaigns are fully built
- **Currently optional** - Can be NULL

### **What Exists:**
- Campaign tracking infrastructure in database ✅
- Engagement event logging with campaign attribution ✅

### **What Doesn't Exist Yet:**
- Full campaign creation UI ❌
- Campaign performance dashboards ❌
- A/B testing framework ❌

### **For Developers:**
When logging engagement events, you CAN populate `campaign_key` and `offer_key` if you know them (e.g., from URL parameters). The system is ready to receive this data even though full campaign management isn't built yet.

---

## Invoice Strategy Going Forward

### **Historic Invoices** (Sage)
- Stored in deprecated `orders` + `order_items` tables
- **Extract facts only**: Who bought what, when
- Don't try to reconstruct full invoice details
- Prices are wrong, data is messy - that's OK, we only need ownership facts

### **Future Invoices** (Stripe)
- Store in `invoices` + `invoice_items` tables
- Clean, proper structure
- Stripe provides:
  - `stripe_invoice_id`
  - `invoice_url` (hosted payment page)
  - `invoice_pdf_url` (downloadable PDF)
- This is the source of truth going forward

### **International Orders**
- Generate commercial invoices for customs (shipping_country != 'GB')
- Stored separately in `orders.commercial_invoice_pdf_url`
- Full customs data (HS codes, weights, EORI, Incoterms)

---

## Admin Interface Strategy

### **Focus Areas**

Build admin features around:

1. **Company Intelligence**
   - Tool ownership (company_tools)
   - Consumable reorder patterns (company_consumables)
   - Engagement timeline (engagement_events)
   - Contact activity (who's clicking what)

2. **Subscription Management**
   - Active subscriptions with tool allocations
   - Trial expiration tracking
   - Subscription event audit trail

3. **Sales Actions**
   - Send reorder links (personalized by company_tools)
   - Create quotes
   - Create invoices (Stripe going forward)
   - Track engagement

4. **Future Invoicing**
   - View/manage Stripe invoices only
   - Don't try to reconstruct Sage history

### **Don't Build:**
- Historic order reconstruction from `orders` table
- Detailed line-item sales history from Sage
- Reports trying to show "all invoices ever" (messy)

### **Instead:**
- Show tool ownership facts
- Show consumable purchase patterns
- Show future Stripe invoices
- Show engagement trends

---

## Migration Path

### **Phase 1: Extract Facts** ✅
1. Run fact extraction from `orders`/`order_items` → `company_tools`, `company_consumables`, `company_product_history`
2. Verify data looks correct
3. Mark `orders` tables as deprecated (but don't delete)

### **Phase 2: Consolidate Engagement** (In Progress)
1. Migrate any critical data from `contact_interactions` → `engagement_events`
2. Update all new code to use `engagement_events` only
3. Mark `contact_interactions` as deprecated (but don't delete)

### **Phase 3: Clean Admin** (In Progress)
1. Remove pages querying deprecated `orders` table
2. Build new pages around fact tables
3. Add deprecation banners to old pages (don't delete them)

### **Phase 4: Stripe Forward** (Ready)
1. All new invoices go through Stripe
2. Store in `invoices` + `invoice_items` tables
3. Clean, proper tracking going forward

---

## Key Takeaways

1. **Sage = Official Accounting** (separate system)
2. **This Platform = Sales Automation** (engagement + facts)
3. **Facts > Full History** (who owns what > full invoice reconstruction)
4. **Stripe Forward** (new invoices in `invoices` table, not `orders`)
5. **engagement_events** (use this, not contact_interactions)
6. **Deprecated ≠ Deleted** (tables stay for safety, just don't build on them)
7. **Campaigns** (tracking ready, full UI not built yet)

---

**Questions? Check:**
- `DATABASE_SCHEMA.md` - Full table documentation
- `RECENT_CHANGES.md` - What changed recently
- This doc - Architecture strategy
