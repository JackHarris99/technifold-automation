# Database Schema Cleanup Plan

**Problem:** Abandoned marketing tables still exist in Supabase but aren't used by any code.

**Risk:** Future Claude sessions might query these tables and get confused.

---

## 🗑️ Tables/Views to Drop (Abandoned Approach)

These are part of the abandoned database-driven marketing approach:

### Empty Tables (Never Populated):
```sql
-- Marketing tables (abandoned approach)
DROP TABLE IF EXISTS machine_solution_problem CASCADE;
DROP TABLE IF EXISTS solution_problem CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS solutions CASCADE;

-- Content blocks (abandoned approach)
DROP TABLE IF EXISTS content_blocks CASCADE;
DROP TABLE IF EXISTS problem_solution_blocks CASCADE;
```

### Views (Depend on Abandoned Tables):
```sql
-- Views that query abandoned tables
DROP VIEW IF EXISTS v_problem_solution_machine CASCADE;
DROP VIEW IF EXISTS v_machine_solution_problem_full CASCADE;
```

---

## ✅ Tables to Keep (Actively Used)

### Core Business Tables:
```sql
-- Customer/CRM
companies (2,851 rows)
contacts (4,020 rows)
company_machine (tracks machine ownership)
users (4 sales team users)

-- Products & Catalog
products (1,603 rows)
machines (225 rows)
tool_consumable_map (1,503 rows)
tool_brand_compatibility (388 rows)

-- E-commerce
orders (new Stripe-driven orders)
order_items (order line items)
orders_legacy (28,862 rows - keep for historical reference)
order_items_legacy (94,692 rows - keep for historical reference)

-- Tracking & Jobs
engagement_events (tokenized link clicks)
outbox (async job queue)

-- Content
content_blocks (139 rows) - NOTE: May be used, verify first
brand_media (3 rows) - Brand logos/hero images

-- Subscriptions
rental_agreements (0 rows but webhooks work, keep)
shipping_addresses (0 rows but captured, keep)
```

---

## 🔍 Verification Needed

Before dropping, verify no code references these tables:

```bash
# Search codebase for references
grep -r "v_problem_solution_machine" src/
grep -r "machine_solution_problem" src/
grep -r "solution_problem" src/
grep -r "content_blocks" src/
grep -r "problems" src/ | grep -v "// problems"
grep -r "solutions" src/ | grep -v "/solutions" | grep -v "Compatible solutions"
```

---

## 📋 Execution Plan

### Phase 1: Verify No Code References (Do First)
Run grep commands above to ensure no active code uses abandoned tables.

### Phase 2: Backup (Optional but Recommended)
```sql
-- Export tables before dropping (just in case)
-- Use Supabase Dashboard → Table Editor → Export → CSV
```

### Phase 3: Drop Abandoned Tables
Execute in Supabase SQL Editor:

```sql
-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS v_machine_solution_problem_full CASCADE;
DROP VIEW IF EXISTS v_problem_solution_machine CASCADE;

-- Drop abandoned marketing tables
DROP TABLE IF EXISTS machine_solution_problem CASCADE;
DROP TABLE IF EXISTS solution_problem CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS solutions CASCADE;

-- Drop abandoned content blocks (verify not used first!)
DROP TABLE IF EXISTS problem_solution_blocks CASCADE;
-- DROP TABLE IF EXISTS content_blocks CASCADE;  -- VERIFY FIRST!

-- Verify tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'solutions',
  'problems',
  'solution_problem',
  'machine_solution_problem',
  'v_problem_solution_machine',
  'v_machine_solution_problem_full'
);
```

---

## ⚠️ Warning: content_blocks Table

**Status:** 139 rows exist - may be used elsewhere

**Action:** Search codebase first:
```bash
grep -r "content_blocks" src/
```

**If used:** Keep the table
**If not used:** Drop it

---

## 🎯 Expected Result

**Before:**
- 15+ tables (many empty, many abandoned)
- Views querying non-existent data
- Confusion about what's in use

**After:**
- ~10 core tables (all actively used)
- Clean schema (products, companies, orders, engagement)
- No abandoned approaches to confuse Claude

---

## 🚀 Quick Execution (After Verification)

If grep commands show NO references to abandoned tables:

```sql
-- EXECUTE THIS IN SUPABASE SQL EDITOR
BEGIN;

-- Drop views
DROP VIEW IF EXISTS v_machine_solution_problem_full CASCADE;
DROP VIEW IF EXISTS v_problem_solution_machine CASCADE;

-- Drop marketing tables
DROP TABLE IF EXISTS machine_solution_problem CASCADE;
DROP TABLE IF EXISTS solution_problem CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS solutions CASCADE;
DROP TABLE IF EXISTS problem_solution_blocks CASCADE;

-- Verify success
SELECT 'Cleanup complete!' as status;

COMMIT;
```

---

## 📝 After Cleanup

Update PROJECT_CONTEXT.md to remove references to deleted tables:

```markdown
**Unused/Empty Tables (DELETED):**
- ~~solutions~~ (deleted - abandoned approach)
- ~~problems~~ (deleted - abandoned approach)
- ~~solution_problem~~ (deleted - abandoned approach)
- ~~machine_solution_problem~~ (deleted - abandoned approach)
```

---

**Remember:** Verify no code references these tables BEFORE dropping them. Use grep commands above.
