# Sales Engine Deployment Guide

## Overview
Transformed admin section from passive CRM into action-driven sales engine with 3 distinct sections:
1. **Sales Center** - Territory-filtered action dashboard for sales reps
2. **Marketing Suite** - Bulk campaign management
3. **CRM** - View-only audit system (cross-territory)

## What Changed

### New Files Created
1. **Architecture Document**
   - `/SALES_ENGINE_ARCHITECTURE.md` - Complete architecture design

2. **SQL Migrations**
   - `/supabase/migrations/20251214_01_create_urgent_actions_rpc.sql`
   - Creates 2 RPC functions:
     - `get_urgent_actions(rep_id)` - Returns urgent actions for sales rep territory
     - `get_sales_metrics(rep_id, period_start)` - Returns performance metrics

3. **Sales Center Pages**
   - `/src/app/admin/sales/page.tsx` - Action dashboard homepage
   - Shows urgent actions, performance metrics, quick action buttons

4. **Marketing Suite Pages**
   - `/src/app/admin/marketing/page.tsx` - Marketing homepage
   - Campaign stats, engagement metrics, prospect management

5. **CRM Pages**
   - `/src/app/admin/crm/page.tsx` - CRM homepage
   - Global metrics, recent orders, cross-territory search

6. **Components**
   - `/src/components/admin/AdminNavigation.tsx` - Dynamic navigation based on section

### Modified Files
1. `/src/app/admin/layout.tsx` - Updated with 3-section tabs
2. `/src/app/admin/page.tsx` - Now redirects to `/admin/sales` instead of `/admin/company`

## Deployment Steps

### 1. Apply SQL Migration to Supabase

**Option A: Via Supabase Dashboard (SQL Editor)**
```sql
-- Copy and paste contents of:
-- /supabase/migrations/20251214_01_create_urgent_actions_rpc.sql
-- into SQL Editor and run
```

**Option B: Via Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

**Option C: Manual Migration**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `supabase/migrations/20251214_01_create_urgent_actions_rpc.sql`
3. Paste and execute
4. Verify with:
```sql
SELECT proname FROM pg_proc WHERE proname IN ('get_urgent_actions', 'get_sales_metrics');
-- Should return 2 rows
```

### 2. Push Code to GitHub
```bash
git add .
git commit -m "Feature: Transform admin into 3-section sales engine

- Sales Center: Territory-filtered action dashboard
- Marketing Suite: Bulk campaign management
- CRM: View-only audit system
- Created RPC functions for urgent actions and metrics
- Streamlined navigation with dynamic sections"

git push origin main
```

### 3. Deploy to Vercel
Vercel will auto-deploy from GitHub push. No manual steps needed.

### 4. Test Deployment

**Test Sales Center:**
1. Navigate to `/admin` (should redirect to `/admin/sales`)
2. Verify action dashboard loads
3. Check that urgent actions query works (may be empty if no data)
4. Click "Create Quote" and "Send Invoice" buttons
5. Navigate to "My Companies" and "Pipeline"

**Test Marketing Suite:**
1. Click "Marketing" tab in sidebar
2. Verify marketing homepage loads
3. Navigate to Campaigns, Prospects, Engagement
4. Check quote requests page

**Test CRM:**
1. Click "CRM" tab in sidebar
2. Verify CRM homepage loads with global metrics
3. Navigate to "All Companies"
4. Check orders and subscriptions pages
5. Verify cross-territory search works

**Test Navigation:**
1. Verify sidebar navigation changes based on section
2. Check that all links work correctly
3. Verify active link highlighting
4. Test with both director and sales rep accounts

## Data Requirements

### For Urgent Actions to Show:
```sql
-- Need at least one of:
1. Trials ending in next 7 days
2. Unpaid invoices 7+ days old
3. Companies with consumable orders 90+ days old
4. Tools without active subscriptions

-- Sample data to test (if needed):
-- Create a trial ending soon
INSERT INTO subscriptions (company_id, status, trial_end_date, tools)
VALUES ('some-company-id', 'trial', NOW() + INTERVAL '2 days', '["tool-id"]');

-- Create an overdue invoice
INSERT INTO orders (company_id, contact_id, total_amount, payment_status, created_at)
VALUES ('some-company-id', 'contact-id', 500, 'unpaid', NOW() - INTERVAL '10 days');
```

### Account Owner Assignment
Ensure companies have `account_owner` field set:
```sql
-- Check current assignment
SELECT account_owner, COUNT(*) FROM companies GROUP BY account_owner;

-- Assign unassigned companies (if needed)
UPDATE companies SET account_owner = 'user-uuid' WHERE account_owner IS NULL;
```

## Rollback Plan

If issues arise, you can rollback to previous version:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel Dashboard:
# Settings → Deployments → Select previous deployment → Promote to Production
```

To remove RPC functions from Supabase:
```sql
DROP FUNCTION IF EXISTS get_urgent_actions(uuid);
DROP FUNCTION IF EXISTS get_sales_metrics(uuid, timestamp);
```

## Monitoring

After deployment, monitor:
1. Vercel deployment logs for errors
2. Supabase logs for RPC function errors
3. Browser console for client-side errors
4. User feedback on navigation clarity

## Known Issues / Future Work

1. **Territory Filtering**: Current "My Companies" page shows ALL companies. Need to add account_owner filter:
   ```sql
   WHERE account_owner = current_user_id
   ```

2. **Pipeline Page**: Existing pipeline might need territory filtering

3. **Performance**: RPC functions may need indexes on:
   - `companies.account_owner`
   - `subscriptions.status`
   - `orders.payment_status`
   - `orders.created_at`

4. **Streamlined Company View**: Sales Center should have simplified company view (tools, subscriptions, consumables only) vs full audit view in CRM

## Success Criteria

✅ All 3 section homepages load without errors
✅ Navigation switches between sections correctly
✅ RPC functions execute successfully
✅ Urgent actions display (or show "All Clear" if none)
✅ Performance metrics calculate correctly
✅ All existing features still accessible
✅ No broken links in navigation

## Questions?

If deployment issues arise:
1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Verify SQL migration applied: `SELECT proname FROM pg_proc WHERE proname LIKE 'get_%actions%'`
4. Check browser console for client errors
