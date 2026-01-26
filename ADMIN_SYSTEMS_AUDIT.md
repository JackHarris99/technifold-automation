# Technifold Admin Systems Audit
**Started:** 2026-01-26
**Purpose:** Comprehensive review of all admin functionality, schema links, access control, and duplicated capabilities

---

## Systems to Audit (In Order)
1. ⏳ Sales Engine - IN PROGRESS
2. ⬜ Marketing
3. ⬜ Distributors
4. ⬜ Press & Media
5. ⬜ Suppliers
6. ⬜ Partner Portal (Future - Not Urgent)

---

## 1. SALES ENGINE (`/admin/sales`)
**Purpose:** Direct customer relationship management for 2,726 companies who purchase directly (not through distributors). Automate consumable reorders, identify cross-sell opportunities for additional machines, manage customer lifecycle (active/dead), and territory management across 3 sales reps. Future goal: fully automated self-service reorders with machine learning.

**Key Rule:** ONLY `companies` where `type='customer'` AND `status != 'dead'`

---

### Pages & Functionality

#### 1.1 Sales Center Dashboard (`/admin/sales`)
**Route:** `/admin/sales` (also redirects from `/admin`)
**Access:** All users (filtered by view mode)
**What it does:**
- Main hub for sales team showing action items and performance metrics
- Displays current month revenue, paid invoices count, active trials, territory company count
- Shows top 10 items from each action category (expandable engagement timeline)
- Filters by view mode: "All Companies" or "My Customers Only" or "View as [Rep]"

**Buttons/Actions:**
- ✅ 💰 My Performance → `/admin/my-performance` (view commissions earned)
- ✅ 📊 Active Engagement (expandable timeline) - shows recent company activity
- ✅ View All Trials Ending → `/admin/sales/trials-ending`
- ✅ View All Unpaid Invoices → `/admin/sales/unpaid-invoices`
- ✅ View All Reorder Opportunities → `/admin/sales/reorder-opportunities`
- ✅ 📦 Distributor Control Center → `/admin/sales/distributors`
- ✅ 🏢 My Territory → `/admin/companies`
- ✅ 🔍 Search All Companies → `/admin/companies`
- ✅ 📄 All Invoices → `/admin/invoices`
- ❌ 💰 Distributor Pricing → `/admin/distributor-pricing` **[BROKEN LINK]**

**Schema Links:**
- `companies` table: Filters `type='customer'`, `status != 'dead'`, optional `account_owner` filter
- `invoices` table: Paid invoices this month (for revenue), unpaid invoices (for action items)
- `subscriptions` table: Trial status and trial_end_date
- Batch loads companies in 1000-row chunks to avoid limit

**Issues Found:**
- ✅ FIXED: Line 349: Links to old `/admin/distributor-pricing` route (removed entire Quick Actions panel)
- ✅ FIXED: Active Engagement querying wrong table (`activity_tracking` with 0 rows instead of `engagement_events` with 480 rows)
- ✅ FIXED: Active Engagement showing zero data because passing 2,428 companies (over 100-company limit, so component skipped loading)
- ✅ FIXED: **CRITICAL** - Sales rep view showing 0 results for unpaid invoices & reorder opportunities
  - Root cause: `.limit(10)` applied BEFORE `.in('company_id', companyIds)` filter
  - Got 10 records from ALL reps, then filtered to specific rep (often resulting in 0)
  - Fixed: Apply `.limit(10)` AFTER filtering by sales rep

---

#### 1.2 Reorder Opportunities (`/admin/sales/reorder-opportunities`)
**Route:** `/admin/sales/reorder-opportunities`
**Access:** All users (filtered by view mode)
**What it does:**
- Shows ALL customers who haven't ordered in 90+ days
- Groups by urgency: Dormant (365+ days), At Risk (180-364 days), Due Soon (90-179 days)
- Displays total spent lifetime and total order count for context
- Click company name → goes to company detail page

**Buttons/Actions:**
- ✅ Click company row → `/admin/company/[company_id]`
- ✅ ← Back to Sales Center → `/admin/sales`

**Schema Links:**
- `companies` table: Filters `type='customer'`, `last_invoice_at < 90 days ago`, optional `account_owner` filter
- `invoices` table: Counts paid invoices per company for order history
- Uses `total_revenue` and `last_invoice_at` fields from companies table

**Issues Found:**
- None

---

#### 1.3 Trials Ending (`/admin/sales/trials-ending`)
**Route:** `/admin/sales/trials-ending`
**Access:** All users (filtered by view mode)
**What it does:**
- Shows ALL trials ending within 30 days
- Groups by urgency: Critical (0-3 days), Urgent (4-7 days), Upcoming (8-30 days)
- Shows machine name if linked, otherwise "Unknown machine"
- Click company name → goes to company detail page

**Buttons/Actions:**
- ✅ Click trial row → `/admin/company/[company_id]`
- ✅ ← Back to Sales Center → `/admin/sales`

**Schema Links:**
- `companies` table: Filters `type='customer'`, optional `account_owner` filter
- `subscriptions` table: Filters `status='trial'`, `trial_end_date` between now and 30 days
- `machines` table: Joins to get machine brand/model for display

**Issues Found:**
- None

---

#### 1.4 Unpaid Invoices (`/admin/sales/unpaid-invoices`)
**Route:** `/admin/sales/unpaid-invoices`
**Access:** All users (filtered by view mode)
**What it does:**
- Shows ALL unpaid invoices for territory customers
- Groups by age: Overdue 30+ days, Overdue 14-29 days, Recent (under 14 days)
- Displays total unpaid amount in header
- Each invoice shows company name, date, amount, "View" button (opens Stripe invoice URL)

**Buttons/Actions:**
- ✅ View (per invoice) → Opens Stripe invoice_url in new tab
- ✅ Click invoice row → `/admin/company/[company_id]`
- ✅ ← Back to Sales Center → `/admin/sales`

**Schema Links:**
- `companies` table: Filters `type='customer'`, optional `account_owner` filter
- `invoices` table: Filters `payment_status='unpaid'` and company_id IN territory

**Issues Found:**
- None

---

#### 1.5 Distributor Control Center (`/admin/sales/distributors`)
**Route:** `/admin/sales/distributors`
**Access:** [To confirm with user]
**What it does:**
- [Deep dive pending - this is in the Distributors Hub section]

**Note:** This page is a CROSS-LINK from Sales Engine to Distributors Hub. Will audit in Distributors section.

---

#### 1.6 Active Engagement (Sales Center Dashboard Section)
**Component:** `SalesCenterClient.tsx` (calls `CompanyEngagementTimeline.tsx`)
**API:** `/api/admin/engagement/company-activity?company_ids=...`
**What it does:**
- Shows top 10 most engaged companies based on 7-day engagement score
- Tracks customer interactions: quote views, portal logins, emails, purchases, etc.
- Calculates heat level (🔥 fire, 🌡️ hot, ☀️ warm, ❄️ cold) based on recent activity
- Expandable timeline shows recent events for each company
- Click company name → goes to company detail page

**How scoring works:**
- Purchase: +100 points
- Trial checkout: +80 points
- Quote view: +10 points
- Portal view: +8 points
- Email sent: +5 points
- Payment issue: -5 points
- Quote lost: -10 points

**Heat levels (7-day score):**
- 🔥 Fire: 50+ points
- 🌡️ Hot: 20-49 points
- ☀️ Warm: 5-19 points
- ❄️ Cold: 0-4 points

**Schema Links:**
- `engagement_events` table: Tracks all customer activity (quote views, portal logins, purchases, etc.)
- Fields: `company_id`, `event_type`, `event_name`, `source`, `url`, `occurred_at`
- 480 events tracked across 75 companies

**Issues Found:**
- ✅ FIXED: API was querying wrong table (`activity_tracking` with 0 rows)
- ✅ FIXED: Should query `engagement_events` (480 rows)
- ✅ FIXED: Wrong column name (`customer_company_id` → `company_id`)
- ✅ FIXED: EVENT_SCORES mapping had wrong event types
- ✅ FIXED: Sales Center passing ALL 2,428 companies via URL (over 100 limit, URL length issue)
- ✅ FIXED: **ARCHITECTURAL IMPROVEMENT** - Refactored to industry-standard server-side processing
  - API now accepts `sales_rep_id` and `limit` parameters (no company IDs via URL)
  - Single JOIN query: `engagement_events` INNER JOIN `companies`
  - Server-side filtering, scoring, sorting, and limiting
  - Scales to unlimited companies (no URL length limits)
  - Ready for automated marketing campaigns with 500+ engaged companies

---

## Progress Tracker (Sales Engine)
- ✅ Dashboard (1.1) - COMPLETE
- ✅ Reorder Opportunities (1.2) - COMPLETE
- ✅ Trials Ending (1.3) - COMPLETE
- ✅ Unpaid Invoices (1.4) - COMPLETE
- ⏸️ Distributor Control (1.5) - Will audit in Distributors section
- ✅ Active Engagement (1.6) - COMPLETE

**Schema Filtering:** ✅ CLEAN - All queries correctly filter `type='customer'`
**Issues Fixed:** 2 (broken link in Quick Actions removed, wrong table query in Active Engagement)

---

## 2. MARKETING (Not Started)
**Purpose:** [User will describe]

---

## 3. DISTRIBUTORS (Not Started)
**Purpose:** [User will describe]

---

## 4. PRESS & MEDIA (Not Started)
**Purpose:** [User will describe]

---

## 5. SUPPLIERS (Not Started)
**Purpose:** [User will describe]

---

## 6. PARTNER PORTAL (Future)
**Purpose:** Partner login to view their customers, sales, and commission
**Status:** Not urgent - will build after other systems are polished

---

## GLOBAL ISSUES FOUND

### Duplicate Functionality
1. **Prospects split across two tables:**
   - `prospect_companies` table: 1 record
   - `companies` table (type='prospect'): 4,558 records
   - Marketing system queries `prospect_companies`, so only shows 1 prospect
   - **Fix needed:** Consolidate to single source of truth

### Broken Links
1. ✅ FIXED: **Sales Center Dashboard** - Removed entire Quick Actions panel (had broken distributor-pricing link)

### Schema-Code Mismatches
1. ✅ FIXED: **Active Engagement API** (`/api/admin/engagement/company-activity`):
   - **Table mismatch**: Was querying `activity_tracking` (0 rows) instead of `engagement_events` (480 rows)
   - **Column mismatch**: Wrong column name `customer_company_id` should be `company_id`
   - **Event type mismatch**: EVENT_SCORES mapping had wrong event types
   - **Scalability issue**: Sales Center passing 2,428 companies via URL (100-company limit, URL length issue)
   - **ARCHITECTURAL FIX**: Refactored to industry-standard server-side processing
     - API now queries `engagement_events INNER JOIN companies` server-side
     - Accepts `sales_rep_id` and `limit` parameters (no company IDs via URL)
     - Filters, scores, sorts, and limits all on server
     - Scales to unlimited companies (ready for 500+ automated marketing campaigns)
   - Result: Engagement timeline displays top engaged companies, fully scalable

2. ✅ FIXED: **Sales Rep View Query Order Bug** (`/admin/sales` page):
   - **Query order bug**: `.limit(10)` applied BEFORE `.in('company_id', companyIds)` filter
   - Impact: When viewing "Steve's Customers", showed 0 unpaid invoices and 0 reorder opportunities
   - Logic flow (BROKEN):
     1. Get 10 oldest unpaid invoices from ALL customers
     2. Filter those 10 to Steve's companies
     3. Result: If those 10 don't belong to Steve → 0 results
   - Logic flow (FIXED):
     1. Get all unpaid invoices
     2. Filter to Steve's companies
     3. THEN limit to 10 oldest
     4. Result: Steve's 10 oldest unpaid invoices displayed correctly
   - Applied to: unpaidInvoicesQuery, reorderQuery, endingTrialsQuery

### Redundant Pages
- [To document as we find them]

### Standalone Pages That Could Be Consolidated
- [To document as we find them]

---

## Progress Tracker
- Sales Engine: ✅ 5/5 pages documented (100% - Distributor Control is cross-link)
- Marketing: 0% complete
- Distributors: 0% complete
- Press & Media: 0% complete
- Suppliers: 0% complete

**Issues Found & Fixed:** 3 (broken link removed, engagement tracking fixed, prospect table duplication documented)
