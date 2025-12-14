# Sales-Action Engine Architecture

## Design Philosophy
- **Action-first, not data-first**: Every view should answer "What should I do next?"
- **Territory-filtered for sales reps**: Reps only see their assigned companies
- **No bloat**: Historical invoices stay in Sage, streamlined data only
- **Every company is a prospect**: 3-20 machines per company, always opportunity for more

## 3-Section Split

### 1. Sales Center (`/admin/sales`)
**Purpose**: Territory-filtered action-driven workspace for sales reps
**Users**: Sales reps (account owners)

**Homepage - Action Dashboard**
- **Urgent Actions (Territory-wide)**
  - Trials ending (7 days or less)
  - Unpaid invoices (7+ days overdue, viewed 3+ times)
  - Reorder opportunities (consumables 90+ days since last order)
  - Upsell triggers (machines with no tools/subscriptions)

- **Performance Metrics**
  - Monthly revenue (vs target)
  - Deals closed this month
  - Active trials
  - Conversion rate

- **Quick Actions Bar**
  - Create Quote (modal)
  - Send Invoice (modal with company search)
  - Schedule Trial (modal)
  - Log Call/Note

**Sub-pages**
- `/admin/sales/pipeline` - Visual pipeline with drag-drop stages
- `/admin/sales/companies` - Territory companies ONLY, streamlined view
- `/admin/sales/company/[id]` - Streamlined company view:
  - Tools owned (with install dates)
  - Active subscriptions (with renewal dates)
  - Consumables purchased (last order dates)
  - Recent notes/calls
  - Quick actions: Quote, Invoice, Call Log
  - **NO full invoice history**

### 2. Marketing Suite (`/admin/marketing`)
**Purpose**: Bulk campaign management for large lists
**Users**: Marketing team, directors

**Pages**
- `/admin/marketing/campaigns` - Email campaign builder & scheduler
- `/admin/marketing/prospects` - Lead generation & import
- `/admin/marketing/engagement` - Open rates, click rates, unsubscribes
- `/admin/marketing/content` - Email templates, brand assets
- `/admin/marketing/quote-requests` - Inbound quote form submissions

### 3. CRM (`/admin/crm`)
**Purpose**: View-only audit system for ALL companies (cross-territory)
**Users**: Directors, finance, support (view-only)

**Pages**
- `/admin/crm/companies` - All companies, searchable, full history
- `/admin/crm/company/[id]` - Complete company audit view:
  - Full order history
  - All invoices (Stripe + Sage imports)
  - All subscriptions
  - All tools
  - All contacts
  - Complete activity log
- `/admin/crm/orders` - All orders across all companies
- `/admin/crm/sales-history` - Revenue analytics
- `/admin/crm/subscriptions` - All subscriptions

## Data Structure Changes

### Remove Bloat
1. **Sales Center views**: NO orders/order_items tables
2. **Streamlined company data**:
   ```sql
   -- Sales Center query (what rep needs)
   SELECT
     t.serial_number,
     t.model,
     t.install_date,
     s.status as subscription_status,
     s.trial_end_date,
     s.next_billing_date,
     recent_consumables.last_order_date
   FROM tools t
   LEFT JOIN subscriptions s ON s.tools @> jsonb_build_array(t.tool_id)
   LEFT JOIN LATERAL (
     SELECT MAX(created_at) as last_order_date
     FROM orders
     WHERE company_id = t.company_id
     AND items @> '[{"type": "consumable"}]'
   ) recent_consumables ON true
   WHERE t.company_id = :company_id
   ```

### Action Triggers (RPC Functions)
```sql
-- Get urgent actions for sales rep territory
CREATE OR REPLACE FUNCTION get_urgent_actions(rep_id uuid)
RETURNS TABLE (
  action_type text,
  company_id uuid,
  company_name text,
  priority int,
  message text,
  action_data jsonb
) AS $$
  -- Trials ending
  UNION ALL
  SELECT
    'trial_ending',
    c.company_id,
    c.company_name,
    CASE
      WHEN s.trial_end_date < NOW() + INTERVAL '3 days' THEN 1
      ELSE 2
    END as priority,
    'Trial ends ' || EXTRACT(DAY FROM s.trial_end_date - NOW()) || ' days',
    jsonb_build_object(
      'subscription_id', s.subscription_id,
      'trial_end_date', s.trial_end_date
    )
  FROM subscriptions s
  JOIN companies c ON s.company_id = c.company_id
  WHERE s.status = 'trial'
    AND s.trial_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND c.account_owner = rep_id

  -- Unpaid invoices
  UNION ALL
  SELECT
    'invoice_overdue',
    c.company_id,
    c.company_name,
    1 as priority,
    '£' || o.total_amount || ' invoice overdue ' || EXTRACT(DAY FROM NOW() - o.created_at) || ' days',
    jsonb_build_object(
      'order_id', o.order_id,
      'amount', o.total_amount,
      'invoice_url', o.invoice_url
    )
  FROM orders o
  JOIN companies c ON o.company_id = c.company_id
  WHERE o.payment_status = 'unpaid'
    AND o.created_at < NOW() - INTERVAL '7 days'
    AND c.account_owner = rep_id

  -- Reorder opportunities
  UNION ALL
  SELECT
    'reorder_opportunity',
    c.company_id,
    c.company_name,
    3 as priority,
    p.description || ' last ordered ' || EXTRACT(DAY FROM NOW() - MAX(o.created_at)) || ' days ago',
    jsonb_build_object(
      'product_code', p.product_code,
      'last_order_date', MAX(o.created_at)
    )
  FROM orders o
  JOIN companies c ON o.company_id = c.company_id
  CROSS JOIN LATERAL jsonb_array_elements(o.items) items
  JOIN products p ON items->>'product_code' = p.product_code
  WHERE p.type = 'consumable'
    AND c.account_owner = rep_id
  GROUP BY c.company_id, c.company_name, p.product_code, p.description
  HAVING MAX(o.created_at) < NOW() - INTERVAL '90 days'

  ORDER BY priority, company_name;
$$ LANGUAGE sql;
```

## Navigation Structure

### Sales Center Nav
```
📊 Action Dashboard (homepage)
📈 Pipeline
🏢 My Companies (territory-filtered)
📄 Quick Quote
📧 Send Invoice
```

### Marketing Suite Nav
```
📧 Campaigns
👥 Prospects
📊 Engagement Analytics
📝 Content Library
📬 Quote Requests
```

### CRM Nav
```
🏢 All Companies
📦 All Orders
📈 Sales History
💳 All Subscriptions
👥 All Contacts
```

## Implementation Order
1. Create `/admin/sales/page.tsx` - Action dashboard
2. Create RPC function `get_urgent_actions()`
3. Update admin layout with 3-section tabs
4. Migrate existing pages to appropriate sections
5. Create streamlined company view for Sales Center
6. Remove order history from Sales Center
7. Build Marketing Suite pages
8. Build CRM audit pages
