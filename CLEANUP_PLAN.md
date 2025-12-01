# Technifold Cleanup Plan - Remove Bloat & Simplify

**Goal:** Remove redundant code, clarify structure, make project instantly understandable.

**Estimated Time:** 4-6 hours total

---

## ✅ PHASE 1: Delete Dead Files (30 mins)

### Duplicate Route Files (DELETE THESE)
```bash
rm src/app/admin/login/page.tsx
rm src/app/admin/dashboard/page.tsx
rm src/app/admin/quote-builder/page.tsx
rm src/app/admin/quote-generator/page.tsx
```

### Legacy Files (DELETE THESE)
```bash
rm src/app/x/[token]/page-OLD-SCHEMA.tsx
rm src/app/solutions/[brand]/[model]/page_OLD.tsx
rm explore-schema.js  # After we're done with analysis
```

### Temp Files (DELETE IF EXIST)
```bash
rm -rf .next/cache/*  # Clear Next.js cache
rm -rf node_modules/.cache/*  # Clear module cache
```

---

## ✅ PHASE 2: Add Redirects for Removed Routes (15 mins)

Create redirect middleware to handle old routes:

**File:** `src/middleware.ts` (if exists, append; if not, create)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect duplicate admin routes
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/admin/dashboard') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/login', '/admin/dashboard'],
};
```

---

## ✅ PHASE 3: Database Cleanup (1-2 hours)

### Option A: Namespace Legacy Data (RECOMMENDED)

**Execute in Supabase SQL Editor:**

```sql
-- Rename legacy order tables
ALTER TABLE orders RENAME TO orders_legacy;
ALTER TABLE order_items RENAME TO order_items_legacy;

-- Add note to legacy tables
COMMENT ON TABLE orders_legacy IS 'Legacy orders from old system (28,862 rows). Keep for historical reference. New orders use new schema.';
COMMENT ON TABLE order_items_legacy IS 'Legacy order line items (94,692 rows). Keep for historical reference.';

-- Create new orders table (if not exists)
CREATE TABLE IF NOT EXISTS orders_new (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT REFERENCES companies(company_id),
  contact_id UUID REFERENCES contacts(contact_id),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  total NUMERIC(10, 2),
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update code to reference orders_new
```

### Option B: Export & Archive

```sql
-- Export legacy orders to CSV (do this in Supabase dashboard)
-- Table Editor → orders → Export → CSV

-- Then drop tables
DROP TABLE order_items;
DROP TABLE orders;
```

**I recommend Option A** - keeps history, clearer namespace.

---

## ✅ PHASE 4: Populate Marketing Tables (2-3 hours)

Your **machine_solution_problem** table is EMPTY. This is why copy isn't rendering!

### Step 1: Seed Solutions

```sql
INSERT INTO solutions (solution_id, name, description) VALUES
  (gen_random_uuid(), 'Tri-Creaser', 'Rotary creasing that eliminates fiber cracking'),
  (gen_random_uuid(), 'Quad-Creaser', 'Four-crease perfect bound book finishing'),
  (gen_random_uuid(), 'Spine-Creaser', 'Saddle stitcher spine creasing'),
  (gen_random_uuid(), 'Multi-Tool', '6-in-1 modular finishing system'),
  (gen_random_uuid(), 'Micro-Perforator', 'Inline perforation up to 72 TPI'),
  (gen_random_uuid(), 'Section-Scorer', '3x deeper scoring for signatures'),
  (gen_random_uuid(), 'CP-Applicator', 'Close proximity crease + perf'),
  (gen_random_uuid(), 'Gripper-Boss', 'Replaceable gripper band system'),
  (gen_random_uuid(), 'Spine & Hinge Creaser', 'Up to 4 deep creases');
```

### Step 2: Seed Problems

```sql
INSERT INTO problems (problem_id, name, description) VALUES
  (gen_random_uuid(), 'Fiber Cracking on Folds', 'Print coating cracks when folding heavy stocks'),
  (gen_random_uuid(), 'Spine Flaking on Books', 'Perfect bound book spines flake and crack'),
  (gen_random_uuid(), 'Weak Scores', 'OEM scoring tools create shallow, weak scores'),
  (gen_random_uuid(), 'Broken Perforation Blades', 'Metal-on-metal blades break constantly'),
  (gen_random_uuid(), 'Gripper Wheel Downtime', 'Sending wheels away for re-gripping takes weeks'),
  (gen_random_uuid(), 'Cross-Grain Cracking', 'Material cracks when folding against the grain'),
  (gen_random_uuid(), 'Digital Toner Flaking', 'Toner flakes off at fold line'),
  (gen_random_uuid(), 'Outsourcing Delays', 'Sending work offline delays production');
```

### Step 3: Map Solutions to Problems

```sql
-- Map Tri-Creaser to problems
INSERT INTO solution_problem (solution_id, problem_id, problem_solution_copy) VALUES
  (
    (SELECT solution_id FROM solutions WHERE name = 'Tri-Creaser'),
    (SELECT problem_id FROM problems WHERE name = 'Fiber Cracking on Folds'),
    '## Stop Fiber Cracking Forever

The Tri-Creaser uses specially formulated rubber creasing ribs that gently stretch fibers instead of breaking them. This patented "reverse crease" method delivers letterpress-quality results inline.

**Results:**
- 100% elimination of fiber cracking
- 3x deeper creases than OEM scoring
- Works on UV coated, laminated, and digital stocks
- Pays for itself in 1-3 jobs'
  );

-- Repeat for all solution-problem combinations
```

### Step 4: Add Machine-Specific Overrides

```sql
-- Example: Override for specific machine
INSERT INTO machine_solution_problem (
  machine_id,
  solution_id,
  problem_id,
  problem_solution_copy,
  curated_skus
) VALUES (
  (SELECT machine_id FROM machines WHERE slug = 'heidelberg-stahl-ti52'),
  (SELECT solution_id FROM solutions WHERE name = 'Tri-Creaser'),
  (SELECT problem_id FROM problems WHERE name = 'Fiber Cracking on Folds'),
  '## Perfect for Your Heidelberg Stahl Ti52

Your Ti52 handles 80-350gsm stocks at high speed. The Tri-Creaser Fast-Fit system installs in minutes and delivers:

**Why Ti52 operators love it:**
- No speed reduction (works at full machine speed)
- Color-coded settings (Orange 85-200gsm, Blue 170-270gsm, Yellow 250-350gsm)
- Split rib design (change without removing shafts)
- Zero fiber cracking on coated stocks',
  ARRAY['TC-FF-OR', 'TC-FF-BL', 'TC-FF-YE', 'TC-MALE-3.5']
);
```

---

## ✅ PHASE 5: Environment Variable Audit (15 mins)

### Check .env.local

```bash
cat .env.local
```

**Verify:**
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ STRIPE_SECRET_KEY (test mode)
- ✅ RESEND_API_KEY
- ❌ RESEND_FROM_EMAIL (MISSING - add this!)
- ✅ TOKEN_HMAC_SECRET
- ✅ ADMIN_SECRET

**Add Missing:**
```bash
echo "RESEND_FROM_EMAIL=sales@technifold.com" >> .env.local
```

---

## ✅ PHASE 6: Create Quick Reference Files (30 mins)

### File 1: ROUTES_MAP.md

Quick reference for all routes (which to keep, which to remove).

### File 2: DATABASE_MAP.md

Visual diagram of database tables (which are used, which are legacy).

### File 3: ONBOARDING.md

Step-by-step guide for new Claude sessions:
1. Read PROJECT_CONTEXT.md first
2. Check ROUTES_MAP.md for route architecture
3. Check DATABASE_MAP.md for schema
4. Run `npm run dev` to start

---

## ✅ PHASE 7: Component Cleanup (1 hour)

### Find Unused Components

```bash
# Find all components
find src/components -name "*.tsx" -o -name "*.ts"

# Check if each is imported anywhere
# If not imported → DELETE
```

### Common Unused Components to Check:
- Old card layouts
- Unused form components
- Legacy modal components
- Duplicate header/footer variations

---

## ✅ PHASE 8: API Route Audit (30 mins)

### Check API Route Usage

```bash
# List all API routes
find src/app/api -name "route.ts"

# For each route, check if it's called by frontend
# grep -r "fetch.*api/route-name" src/
```

### Known Unused Routes:
- `/api/debug/products-count` - Debug only
- `/api/admin/utils/*` - One-time migration scripts

---

## 🎯 FINAL CHECKLIST

Before considering cleanup complete:

- [ ] All duplicate routes deleted or redirected
- [ ] Legacy files removed
- [ ] Marketing tables populated (solutions, problems, solution_problem)
- [ ] At least 5 machine_solution_problem entries created
- [ ] PROJECT_CONTEXT.md exists and is accurate
- [ ] ROUTES_MAP.md created
- [ ] DATABASE_MAP.md created
- [ ] Environment variables complete
- [ ] `npm run dev` works on port 3001
- [ ] Test token page `/x/[token]` renders problem cards
- [ ] Test machine page `/machines/[slug]` renders problem cards
- [ ] Test admin login `/login` works
- [ ] Test company console `/admin/company/[id]` works

---

## 📊 EXPECTED RESULTS

**Before Cleanup:**
- 244 TypeScript files
- Many duplicate routes
- Confusing file structure
- Empty marketing tables
- 28k legacy orders mixed with new schema

**After Cleanup:**
- ~200 TypeScript files (44 removed)
- Clear route architecture
- Documented structure
- Populated marketing tables
- Legacy data namespaced clearly

**Performance Improvement:**
- Faster Next.js compilation
- Clearer debugging
- Easier onboarding
- Less cognitive load

---

**Next Steps:** Execute phases 1-8 in order. Each phase is independent and can be done separately.
