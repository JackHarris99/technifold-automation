# Subscription System Testing Guide

**Testing Date:** December 1, 2025
**Dev Server:** http://localhost:3002
**Status:** Ready for testing

---

## Pre-Testing Setup

### 1. Verify Migrations Are Applied

Open **Supabase Dashboard → SQL Editor** and run:

```sql
-- Check subscriptions table exists
SELECT COUNT(*) FROM subscriptions;

-- Check subscription_events table exists
SELECT COUNT(*) FROM subscription_events;

-- Check v_active_subscriptions view exists
SELECT * FROM v_active_subscriptions LIMIT 1;

-- Check customs fields on products table
SELECT hs_code, country_of_origin, customs_value_gbp, weight_kg
FROM products
WHERE hs_code IS NOT NULL
LIMIT 5;

-- Check shipping_manifests table exists
SELECT COUNT(*) FROM shipping_manifests;
```

**Expected Results:**
- All queries should return without errors
- subscriptions: 0 rows (empty table)
- subscription_events: 0 rows (empty table)
- v_active_subscriptions: Empty result (no subscriptions yet)
- products: Should show 5 products with customs data
- shipping_manifests: 0 rows (empty table)

---

## Part 1: Create Your First Subscription

### Step 1: Access Subscriptions Page

1. Go to http://localhost:3002/admin
2. Login with password: `Technifold`
3. Click **"Subscriptions"** in the left sidebar (💳 icon)
4. You should see an empty state with "No subscriptions found"

**Expected UI:**
- Header: "Subscriptions"
- "Create Subscription" button in top right
- Empty state message
- Filter buttons: All, Trial, Active, Past Due, Cancelled
- Summary stats showing 0 for all metrics

### Step 2: Create Test Subscription

1. Click **"+ Create Subscription"**
2. Fill out the form:
   - **Company:** Search for any test company (e.g., "Print")
   - **Primary Contact:** Select a contact (optional)
   - **Tools to Include:** Check 2-3 tools (e.g., Tri-Creaser, Quad-Creaser)
   - **Monthly Price:** Enter `159.00`
   - **Currency:** Leave as GBP
   - **Trial Period:** Enter `30` days
   - **Internal Notes:** Enter "Test subscription - do not dispatch"
3. Click **"Create Subscription"**

**Expected Behavior:**
- Alert: "Subscription created successfully!"
- Redirects to subscription detail page
- Shows subscription status as "TRIAL"
- Shows trial end date (30 days from now)
- Shows 2-3 tools in "Tools Included" section
- Shows monthly price as £159.00
- Activity log shows "Subscription created" event

### Step 3: Verify Subscription Appears in List

1. Click **"← Back to Subscriptions"**
2. You should see your test subscription in the list
3. Click **"Trial"** filter button
4. Subscription should still be visible
5. Click **"Active"** filter button
6. Subscription should disappear (it's in trial, not active)

**Expected UI:**
- List shows 1 subscription
- Company name displayed
- Contact name and email displayed
- Tools: "2 tools" or "3 tools"
- Price: "£159.00/mo"
- Status badge: blue "TRIAL"
- Trial days remaining: "30 days left"
- Summary stats updated: "Total: 1", "Active Trials: 1"

---

## Part 2: Manage Subscription (Ratcheting)

### Step 4: Add a Tool (Ratcheting Up)

1. Click **"Manage"** on your test subscription
2. In the "Tools Included" section, click **"+ Add Tool"**
3. Select "CP Applicator" from dropdown
4. Click **"Add"**

**Expected Behavior:**
- Alert: "Tool added successfully! Don't forget to update the price if needed."
- Tool list now shows 3 or 4 tools
- CP Applicator appears in the list
- Activity log shows "Tool added to subscription" event

### Step 5: Update Price (Ratcheting)

1. In the right sidebar, click **"Update Price"**
2. Enter new price: `181.00` (£159 + £22 for CP Applicator)
3. Click **"Update"**

**Expected Behavior:**
- Alert: "Price updated successfully!"
- Monthly price changes to £181.00
- "Ratchet max" field should now show £181.00
- Activity log shows "Subscription price updated" event with old/new values

### Step 6: Try to Lower Price (Ratchet Warning)

1. Click **"Update Price"** again
2. Enter price: `150.00` (lower than ratchet max)
3. Click **"Update"**

**Expected Behavior:**
- Warning dialog appears:
  > "Warning: This price (£150) is lower than the maximum price ever charged (£181). Ratcheting subscriptions should only increase. Are you sure you want to proceed?"
- If you click "Cancel": Price stays at £181
- If you click "OK": Price drops to £150 (but ratchet_max stays at £181 in database)

### Step 7: Verify Ratchet Protection

1. Increase price back to `181.00`
2. Check the subscription details
3. Verify "Peak" value shows the highest price ever charged

**Database Check:**
```sql
SELECT
  monthly_price,
  ratchet_max,
  tools
FROM subscriptions
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- `monthly_price`: 181.00
- `ratchet_max`: 181.00 (or higher if you lowered/raised)
- `tools`: JSON array with 3-4 product codes

---

## Part 3: Subscription Lifecycle

### Step 8: Activate Subscription Early

1. On subscription detail page, click **"Activate Now"** in right sidebar
2. Confirm action

**Expected Behavior:**
- Alert: "Subscription activated"
- Status badge changes from blue "TRIAL" to green "ACTIVE"
- Trial end date disappears
- Activity log shows "Subscription activated" event

### Step 9: Cancel Subscription

1. Click **"Cancel Subscription"** in right sidebar
2. Enter cancellation reason: "Test cancellation"
3. Click OK

**Expected Behavior:**
- Alert: "Subscription cancelled"
- Status badge changes to gray "CANCELLED"
- "Cancelled at" timestamp appears
- "Cancellation reason" field shows "Test cancellation"
- Activity log shows "Subscription cancelled" event
- Action buttons disappear (no Update Price or Add Tool buttons)

---

## Part 4: Create Multiple Subscriptions

### Step 10: Create 3 More Test Subscriptions

Create subscriptions with varying parameters:

**Subscription 2:**
- Company: Different company
- Tools: 1 tool only
- Price: £89.00
- Trial: 7 days
- Notes: "Short trial test"

**Subscription 3:**
- Company: Different company
- Tools: 4 tools
- Price: £299.00
- Trial: 60 days
- Notes: "Enterprise trial"

**Subscription 4:**
- Company: Same as Subscription 1
- Tools: 2 tools
- Price: £159.00
- Trial: 30 days
- Notes: "Second subscription for same company"

### Step 11: Verify List View

1. Go back to `/admin/subscriptions`
2. You should see 4 total subscriptions
3. Click each filter button and verify counts
4. Check summary stats at bottom:
   - Total Subscriptions: 4
   - Active Trials: 3 (assuming first one is cancelled)
   - Active Paying: 0
   - Monthly MRR: £0.00

---

## Part 5: Database Verification

### Step 12: Check Database Records

Open **Supabase Dashboard → SQL Editor** and run:

```sql
-- View all subscriptions
SELECT
  subscription_id,
  company_id,
  monthly_price,
  status,
  jsonb_array_length(tools) as tool_count,
  ratchet_max,
  trial_end_date,
  created_at
FROM subscriptions
ORDER BY created_at DESC;

-- View all subscription events
SELECT
  event_type,
  event_name,
  performed_at,
  notes
FROM subscription_events
ORDER BY performed_at DESC
LIMIT 20;

-- Test the view
SELECT
  company_name,
  monthly_price,
  tool_count,
  status,
  trial_days_remaining
FROM v_active_subscriptions;
```

**Expected Results:**
- subscriptions table: 4 rows
- subscription_events: Multiple rows (created, price_increased, tool_added, cancelled, etc.)
- v_active_subscriptions: 3 rows (excludes cancelled subscription)

---

## Part 6: Edge Cases & Error Handling

### Step 13: Try Creating Invalid Subscriptions

**Test 1: No company selected**
- Try to create subscription without selecting company
- Expected: Alert "Please select a company"

**Test 2: No tools selected**
- Select company but don't check any tools
- Expected: Alert "Please select at least one tool"

**Test 3: Invalid price**
- Enter price as `0` or `-10`
- Expected: Alert "Please enter a valid monthly price"

**Test 4: Duplicate tool addition**
- Try adding the same tool twice to a subscription
- Expected: Tool should already not appear in "Select Tool to Add" dropdown

### Step 14: Test Filtering

1. Go to subscriptions list
2. Create subscriptions in different states:
   - 2 in trial
   - 1 activated (active)
   - 1 cancelled
3. Click each filter button:
   - **All:** Shows all 4
   - **Trial:** Shows 2
   - **Active:** Shows 1
   - **Cancelled:** Shows 1

---

## Part 7: Stripe Integration (Future)

### Current State
- Subscriptions work **without** Stripe
- No Stripe webhooks required yet
- `stripe_subscription_id` is NULL for all subscriptions

### What You'll Need to Add
1. Generate checkout link for customer to enter payment details
2. Handle `checkout.session.completed` webhook
3. Update subscription with `stripe_subscription_id` and `stripe_customer_id`
4. Handle `invoice.payment_succeeded` webhook to track billing
5. Handle `customer.subscription.updated` webhook for status changes

**For now:** You can manually track subscriptions and send Stripe checkout links later.

---

## Part 8: Customs & Shipping (Verify Schema)

### Step 15: Check Product Customs Data

```sql
-- View products with customs data
SELECT
  product_code,
  description,
  hs_code,
  country_of_origin,
  customs_value_gbp,
  weight_kg,
  width_cm,
  height_cm,
  depth_cm
FROM products
WHERE type = 'tool'
LIMIT 10;
```

**Expected Results:**
- hs_code: `8442.30.00` (for tools)
- country_of_origin: `GB`
- customs_value_gbp: Price or default value
- weight_kg: 5.0 or custom value

### Step 16: Test Customs Declaration Generation (Optional)

This requires writing a test script since there's no UI yet. Skip for now unless needed.

---

## Success Criteria

**Your subscription system is working if:**

✅ You can create subscriptions with multiple tools
✅ Subscriptions appear in list view with correct filtering
✅ You can add tools and see them in the list
✅ You can update prices and ratcheting works
✅ Ratchet warning appears when lowering price below max
✅ You can activate subscriptions early
✅ You can cancel subscriptions
✅ Activity log records all changes
✅ Summary stats calculate correctly
✅ Database records match UI data
✅ Products have customs fields populated
✅ No console errors in browser or terminal

---

## Next Steps After Testing

### If Everything Works:
1. ✅ Mark "Test subscription creation flow" as complete
2. Create 2-3 real customer subscriptions
3. Generate Stripe checkout links for customers
4. Set up webhook handlers for live Stripe events
5. Deploy to production

### If Issues Found:
1. Document the bug with screenshots
2. Check browser console for errors
3. Check server logs in terminal
4. Check Supabase logs for database errors
5. Report issues for debugging

---

## Quick Testing Checklist

- [ ] Migrations applied successfully
- [ ] Can access /admin/subscriptions
- [ ] Can create subscription with tools
- [ ] Subscription appears in list
- [ ] Can add tool to subscription
- [ ] Can update subscription price
- [ ] Ratchet warning appears when lowering price
- [ ] Can activate subscription early
- [ ] Can cancel subscription
- [ ] Activity log shows all events
- [ ] Filters work correctly
- [ ] Summary stats calculate correctly
- [ ] Database records are correct
- [ ] Products have customs data
- [ ] No errors in console or logs

---

## Dev Server Info

**Current Status:** Running on port 3002
**Access URL:** http://localhost:3002
**Admin Login:** Password: `Technifold`
**Database:** Supabase (remote)

**Check Dev Server:**
```bash
# If server is not running:
npm run dev

# Check running servers:
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

---

**Happy Testing! 🎉**

If everything works, you're ready to onboard your first customer with tool rental subscriptions!
