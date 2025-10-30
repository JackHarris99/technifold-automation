# Implementation Brief Alignment - Technical Status

**Date:** 2025-01-28
**Purpose:** Gap analysis between current build and final implementation brief
**For:** ChatGPT handoff or developer onboarding

---

## SCHEMA VERIFICATION (Actual Database State)

### ✅ Tables Confirmed

**machines** - 99 rows, has `slug` column populated
**solutions** - Exists with `active` boolean
**problems** - Exists
**machine_solution** - Exists with `relevance_rank`
**solution_problem** - Exists with `problem_solution_copy`, `pitch_headline`, `pitch_detail`, `action_cta`, `relevance_rank`
**machine_solution_problem** - Exists with:
- `problem_solution_copy` ✅ (copy override field)
- `curated_skus` ✅ (text[] for SKU curation)
- `pitch_headline`, `pitch_detail`, `action_cta` ✅
- `relevance_rank` ✅

**company_machine** - ✅ Created (Phase 1)
**companies** - ✅ Has `account_owner` column
**products** - ✅ Exists (SKU catalog)

### ⚠️ View Status

**Current view `v_machine_solution_problem_full` is MISSING:**
- `problem_solution_copy` (from machine_solution_problem OR solution_problem)
- `curated_skus` (from machine_solution_problem)

**View needs to be recreated with these fields.**

---

## WHAT'S BUILT (Current State)

### ✅ Completed & Aligned with Brief

#### 0. Guardrails
- ✅ No new tables added (only used company_machine from Phase 1)
- ✅ Reading from correct tables
- ⚠️ Using pitch_headline/detail/cta instead of problem_solution_copy fallback chain
- ❌ Not using curated_skus (field exists but not in view)

#### 1. Legacy Removal
- ❌ "Browse all products" grid still visible on homepage (NEEDS REMOVAL)
- ❌ Nav links to tools/[SKU] still present (NEEDS REMOVAL)

#### 2.1 Homepage (/)
- ✅ Blue hero with Brand → Model dropdowns
- ✅ MachineFinder renders problem cards inline
- ✅ ONE CARD PER PROBLEM (not grouped)
- ⚠️ Using pitch_headline/detail instead of problem_solution_copy
- ❌ No Setup Guide block at bottom (NEEDS BUILD)

#### 2.2 Machine Pages (/machines/[slug])
- ✅ 99 machine pages with slugs
- ✅ Server-rendered
- ✅ ONE CARD PER PROBLEM
- ✅ Machine Ownership form at bottom
- ⚠️ Using pitch_headline/detail instead of problem_solution_copy
- ❌ No Setup Guide block (NEEDS BUILD)

#### 2.3 Token Pages (/x/[token])
- ✅ Checks company_machine for known machines
- ✅ Shows MachineFinder if unknown
- ✅ Shows problem cards if machine known
- ⚠️ Using pitch_headline/detail instead of problem_solution_copy
- ❌ No intro paragraph from first card's copy (NEEDS BUILD)
- ❌ No Setup Guide block (NEEDS BUILD)
- ❌ Not limiting to top 2 cards for email preview mode (NEEDS BUILD)

#### 3. Copy & Setup Guide
- ❌ Not using copy fallback chain (NEEDS IMPLEMENTATION)
- ❌ Not rendering copy as Markdown (NEEDS IMPLEMENTATION)
- ❌ No Setup Guide component (NEEDS BUILD)
- ❌ Not reading curated_skus (NEEDS IMPLEMENTATION)

#### 4. Admin UX
- ❌ `/admin/sku-explorer` - NOT BUILT
- ❌ `/admin/customer/[company_id]` Marketing Builder tab - NOT BUILT
- ❌ `/admin/ms-problem-editor` - NOT BUILT
- ✅ `/admin/prospects` - Built (basic version)
- ✅ `/admin/reorder` - Built and working

#### 5. Outbox Handler
- ❌ `send_offer_email` handler - STUB ONLY (NEEDS FULL IMPLEMENTATION)

---

## WHAT NEEDS TO BE BUILT (Gap Analysis)

### CRITICAL PATH (Blocking v1 Demo)

#### 1. Update View to Include Copy Fields ⚠️ HIGH PRIORITY

**Action:** Recreate `v_machine_solution_problem_full` to include:
```sql
-- Add to SELECT:
COALESCE(
  msp.problem_solution_copy,
  sp.problem_solution_copy,
  CONCAT(sp.pitch_headline, '\n\n', sp.pitch_detail)
) AS resolved_copy,

msp.curated_skus AS curated_skus,
msp.problem_solution_copy AS msp_copy_override,
sp.problem_solution_copy AS sp_copy_base
```

**Where:** Supabase SQL Editor (manual)
**File:** Will update `supabase/migrations/20250128_01_add_slug_to_machine_view.sql`

#### 2. Build SetupGuide Component ⚠️ HIGH PRIORITY

**Component:** `src/components/marketing/SetupGuide.tsx`

**Props:**
```typescript
interface SetupGuideProps {
  curatedSkus?: string[];        // from machine_solution_problem.curated_skus
  machineId?: string;            // for fallback query
  solutionId?: string;           // for fallback query
  machineName?: string;          // for title
}
```

**Logic:**
```typescript
if (curatedSkus && curatedSkus.length > 0) {
  // Show curated SKUs only
  query products WHERE code IN (curatedSkus)
} else {
  // Show all compatible SKUs for this machine/solution
  query via tool_consumable_map or equivalent
}

// Render as:
- Section title: "Setup Guide: Fix this on your [machine]"
- List of SKUs with code, name, description
- Optional grouping: "Essentials" vs "More options"
```

**Where to use:**
- Bottom of homepage (once per page after all cards)
- Bottom of `/machines/[slug]` (once)
- Bottom of `/x/[token]` (once)

#### 3. Update All Card Rendering to Use Copy Fallback ⚠️ HIGH PRIORITY

**Files to update:**
- `src/app/machines/[slug]/page.tsx`
- `src/components/marketing/MachineFinder.tsx`
- `src/app/x/[token]/page.tsx`
- `src/app/api/machines/solutions/route.ts`

**Change:**
```typescript
// OLD (current):
<h2>{card.pitch_headline}</h2>
<p>{card.pitch_detail}</p>
<button>{card.action_cta}</button>

// NEW:
const copy = card.resolved_copy; // from view
<div dangerouslySetInnerHTML={{ __html: marked(copy) }} />
// OR parse sections from copy if structured
```

**Copy fallback chain:**
1. `machine_solution_problem.problem_solution_copy` (override)
2. `solution_problem.problem_solution_copy` (base)
3. Synthesize from `pitch_headline + '\n\n' + pitch_detail` (fallback)

**Render as Markdown** using a markdown library (e.g., `marked`, `react-markdown`)

#### 4. Remove Legacy Product Browsing ⚠️ HIGH PRIORITY

**Homepage (`src/app/page.tsx`):**
- ❌ Remove `<ToolCategoryCards />` section
- ❌ Remove "Browse All Products" heading
- ✅ Keep Machine Finder hero
- ✅ Keep pain story cards

**Navigation:**
- Check `MarketingHeader` component for nav links
- Remove any links to `/tools/[category]` or product browsing
- Keep: Contact, maybe Products (if it's just a list)

#### 5. Build Admin SKU Explorer 🔧 MEDIUM PRIORITY

**Route:** `/admin/sku-explorer`

**Features:**
- Search box (autocomplete on `products.code` or `products.name`)
- Left panel: SKU details from `products` table
- Right panel tabs:
  - **Tools/Machines:** Show which tools and machines this SKU associates with
  - **Curated In:** List `machine_solution_problem` rows with this SKU in `curated_skus`
- Inline editor for `products.description` (debounce + save toast)

**New files needed:**
- `src/app/admin/sku-explorer/page.tsx`
- `src/components/admin/SkuExplorer.tsx`
- `src/app/api/admin/products/[code]/route.ts` (GET/PATCH for description)

#### 6. Build Marketing Builder (Customer Workspace) 🔧 MEDIUM PRIORITY

**Route:** `/admin/customer/[company_id]` (enhance existing)

**New Tab: "Marketing Builder"**

**Features:**
1. **Machine Selector** - Pick from company's known machines
2. **Card Preview** - Shows all cards for that machine with checkboxes
3. **SKU Curation** - Multi-select from compatible SKUs (pre-tick curated_skus)
4. **Live Preview** - Shows hero + selected cards + setup guide
5. **Send Button** - Enqueues `send_offer_email` job with:
```json
{
  "company_id": "...",
  "contact_ids": ["..."],
  "campaign_key": "...",
  "offer_key": "...",
  "machine_slug": "...",
  "selected_problem_ids": ["...", "..."],
  "curated_skus": ["...", "..."]
}
```

**New files needed:**
- `src/components/admin/MarketingBuilderTab.tsx`
- Update `src/app/admin/customer/[company_id]/page.tsx` to add tab

#### 7. Build Copy Editor 🔧 MEDIUM PRIORITY

**Route:** `/admin/ms-problem-editor`

**Features:**
- Cascading selects: Brand → Model → Solution → Problem
- Side-by-side editors (Markdown):
  - Left: `solution_problem.problem_solution_copy` (base copy)
  - Right: `machine_solution_problem.problem_solution_copy` (override)
- SKU curation: Multi-select for `machine_solution_problem.curated_skus`
- Save button writes to database
- Preview pane showing rendered card + setup guide

**New files needed:**
- `src/app/admin/ms-problem-editor/page.tsx`
- `src/components/admin/CopyEditor.tsx`
- `src/app/api/admin/copy/update/route.ts` (PATCH endpoint)

#### 8. Implement Outbox Handler ⚠️ HIGH PRIORITY

**File:** `src/app/api/outbox/run/route.ts`

**Handler for `send_offer_email`:**
```typescript
case 'send_offer_email':
  const { company_id, contact_ids, campaign_key, offer_key,
          machine_slug, selected_problem_ids, curated_skus } = job.payload;

  // 1. Generate tokenized URL
  const tokenUrl = generateOfferUrl(baseUrl, company_id, offer_key, {
    contactId: contact_ids[0],
    campaignKey: campaign_key,
    ttlHours: 72
  });

  // 2. Fetch top 2 cards (if selected_problem_ids provided)
  const cards = await fetchCardsByProblemIds(selected_problem_ids);

  // 3. Build email HTML
  const intro = extractFirstParagraph(cards[0].resolved_copy);
  const emailHtml = renderEmailTemplate({
    intro,
    cards: cards.slice(0, 2), // top 2 only
    ctaUrl: tokenUrl,
    ctaText: "See all solutions for your machine"
  });

  // 4. Send email via mailer
  await sendEmail(contact_ids, subject, emailHtml);

  // 5. Mark job complete
  return { status: 'completed' };
```

**Dependencies:**
- Email service integration (Zoho, SendGrid, Resend, etc.)
- Email template component/renderer
- Token generation (already exists in `lib/tokens.ts`)

---

## IMPLEMENTATION PLAN (Prioritized)

### Phase A: Fix Critical Data Flow (TODAY - 2-3 hours)

**Priority:** 🔴 BLOCKER - Nothing works properly without this

1. ✅ Update view to include `problem_solution_copy` and `curated_skus`
2. ✅ Build SetupGuide component
3. ✅ Update all card rendering to use copy fallback chain + markdown
4. ✅ Add Setup Guide to homepage, machine pages, token pages
5. ✅ Remove legacy product browsing from homepage

**Files to modify:**
- `supabase/migrations/20250128_01_add_slug_to_machine_view.sql`
- `src/components/marketing/SetupGuide.tsx` (create)
- `src/app/machines/[slug]/page.tsx`
- `src/components/marketing/MachineFinder.tsx`
- `src/app/x/[token]/page.tsx`
- `src/app/page.tsx`

**Result:** Homepage, machine pages, and token pages work correctly per spec.

---

### Phase B: Build Admin Tools (NEXT - 4-6 hours)

**Priority:** 🟡 IMPORTANT - Sales team needs these to curate content

#### B1. SKU Explorer (2 hours)
- Search and autocomplete
- View SKU associations
- Edit descriptions inline

#### B2. Marketing Builder (2-3 hours)
- Add tab to customer detail page
- Machine selector
- Card checkboxes
- SKU curation
- Preview pane
- Send button

#### B3. Copy Editor (1-2 hours)
- Cascading selects
- Dual markdown editors
- SKU multi-select
- Save functionality
- Preview

---

### Phase C: Outbox Handler (LAST - 2-3 hours)

**Priority:** 🟢 NICE TO HAVE - Can enqueue jobs now, process later

1. Choose email provider (Zoho, SendGrid, Resend)
2. Build email template component
3. Implement handler in `/api/outbox/run`
4. Test end-to-end send

---

## CURRENT BUILD STATUS vs BRIEF

### What's WORKING ✅

| Brief Section | Status | Notes |
|--------------|--------|-------|
| Machine Finder Hero | ✅ Working | On homepage, inline results |
| ONE CARD PER PROBLEM | ✅ Working | Not grouped by solution |
| Machine Pages (/machines/[slug]) | ✅ Working | 99 URLs live |
| Machine Ownership Form | ✅ Working | Creates company_machine |
| Token Pages (/x/[token]) | ✅ Working | Checks company_machine |
| Admin Prospects | ✅ Working | Machine tracking, rep assignment |
| Admin Reorder | ✅ Working | Reorder reminders |
| Admin Navigation | ✅ Working | Prospects/Reorder prominent |
| Database Schema | ✅ Complete | All tables/columns exist |

### What's BROKEN/MISSING ❌

| Brief Section | Status | What's Wrong |
|--------------|--------|--------------|
| Copy Fallback Chain | ❌ Not implemented | Using pitch_* fields directly |
| Markdown Rendering | ❌ Not implemented | Showing plain text only |
| Setup Guide | ❌ Not built | Critical feature missing |
| curated_skus | ❌ Not used | Field exists but not in view |
| Legacy Product Grid | ❌ Still visible | Needs removal from homepage |
| SKU Explorer | ❌ Not built | Admin tool missing |
| Marketing Builder | ❌ Not built | Admin tool missing |
| Copy Editor | ❌ Not built | Admin tool missing |
| Outbox Handler | ❌ Stub only | send_offer_email not processed |
| Token Page Intro | ❌ Not built | Should use first card's copy |
| Email Preview Mode | ❌ Not built | Should limit to top 2 cards |

---

## DETAILED GAP ANALYSIS

### Gap 1: Copy Source (Critical)

**Current implementation:**
```typescript
<h2>{card.pitch_headline}</h2>
<p>{card.pitch_detail}</p>
<button>{card.action_cta}</button>
```

**Required implementation:**
```typescript
// View should have:
const resolvedCopy = COALESCE(
  msp.problem_solution_copy,
  sp.problem_solution_copy,
  CONCAT(sp.pitch_headline, '\n\n', sp.pitch_detail)
);

// Frontend:
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{card.resolved_copy}</ReactMarkdown>
```

**Impact:** High - Copy is the core of the marketing message
**Effort:** Medium - Need to update view + install markdown library + update all renderers

---

### Gap 2: Setup Guide (Critical)

**Current:** Nothing
**Required:** Single component at bottom of each page

**Component structure:**
```typescript
<SetupGuide
  curatedSkus={['Mould-161', 'QC-123']}  // from machine_solution_problem
  machineId="..."
  solutionId="..."
  machineName="Heidelberg TD 66"
/>

// Renders:
<section>
  <h2>Setup Guide: Fix this on your Heidelberg TD 66</h2>
  <div className="sku-list">
    {skus.map(sku => (
      <div>
        <strong>{sku.code}</strong> - {sku.name}
        <p>{sku.description}</p>
      </div>
    ))}
  </div>
</section>
```

**Data source:**
- If `curated_skus` array has values → query `products WHERE code IN (curated_skus)`
- Else → query all compatible via `tool_consumable_map` or similar

**Impact:** High - This is how customers know what to buy
**Effort:** Medium - New component + query logic

---

### Gap 3: Legacy Product Removal (Easy)

**Files to modify:**
- `src/app/page.tsx` - Remove `<ToolCategoryCards />` section
- `src/components/marketing/MarketingHeader.tsx` - Check nav links, remove tools links

**Impact:** Low - Just cleanup
**Effort:** Low - 5 minutes

---

### Gap 4: Admin SKU Explorer (Medium)

**New route:** `/admin/sku-explorer`

**Features:**
- Search input with autocomplete from `products`
- Selected SKU shows:
  - Product details (code, name, description, price)
  - Tools/machines it's used on (via joins)
  - Where it's curated (which machine_solution_problem rows)
- Inline edit for `products.description`

**Impact:** Medium - Sales team content curation
**Effort:** High - 2-3 hours (search, autocomplete, associations, editing)

---

### Gap 5: Marketing Builder (High Value)

**Location:** `/admin/customer/[company_id]` - new tab

**Features:**
- Machine dropdown (from company_machine)
- Shows all problem cards for that machine
- Checkboxes to include/exclude cards
- SKU multi-select (shows curated_skus as pre-ticked)
- Live preview pane
- Send button creates outbox job with full payload

**Impact:** High - Core sales workflow
**Effort:** High - 3-4 hours (complex UI, preview rendering, job creation)

---

### Gap 6: Copy Editor (High Value)

**New route:** `/admin/ms-problem-editor`

**Features:**
- Brand → Model → Solution → Problem (cascading)
- Two markdown editors:
  - Base copy (`solution_problem.problem_solution_copy`)
  - Override copy (`machine_solution_problem.problem_solution_copy`)
- SKU multi-select for curated_skus
- Save updates both copy and curated_skus
- Preview shows rendered card + setup guide

**Impact:** High - Content management for sales
**Effort:** High - 3-4 hours (cascading selects, dual editors, SKU selection, save logic)

---

### Gap 7: Outbox Email Handler (Critical for Sending)

**File:** `src/app/api/outbox/run/route.ts`

**Implementation:**
```typescript
case 'send_offer_email': {
  const payload = job.payload;

  // Generate token
  const token = generateOfferUrl(
    process.env.NEXT_PUBLIC_BASE_URL,
    payload.company_id,
    payload.offer_key,
    {
      contactId: payload.contact_ids[0],
      campaignKey: payload.campaign_key,
      ttlHours: 72
    }
  );

  // Fetch cards for email (top 2 only)
  const cards = await fetchCardsByProblemIds(payload.selected_problem_ids);
  const intro = extractFirstParagraph(cards[0]?.resolved_copy || '');

  // Build email
  const html = `
    <div>
      <p>${intro}</p>
      ${cards.slice(0, 2).map(card => renderCardSummary(card)).join('')}
      <a href="${token}">See all solutions for your machine</a>
      <p>Direct link: ${token}</p>
    </div>
  `;

  // Send
  await sendEmail({
    to: payload.contact_ids,
    subject: `Solutions for your ${payload.machine_slug}`,
    html
  });

  return { status: 'completed' };
}
```

**Dependencies:**
- Email service SDK (choose: Zoho, SendGrid, Resend)
- Email template renderer
- Error handling + retry logic

**Impact:** Critical - Can't send emails without this
**Effort:** Medium - 2-3 hours (choose service, build template, implement handler)

---

## RECOMMENDED IMPLEMENTATION ORDER

### Step 1: Fix View (15 minutes)
Run SQL in Supabase to add `problem_solution_copy` and `curated_skus` to view.

### Step 2: Install Dependencies (2 minutes)
```bash
npm install react-markdown remark-gfm
```

### Step 3: Build SetupGuide Component (30 minutes)
Create reusable component for SKU listing.

### Step 4: Update Card Rendering (45 minutes)
Modify all pages to use `resolved_copy` and render as markdown.

### Step 5: Remove Legacy Product Grid (10 minutes)
Clean up homepage.

### Step 6: Test Public Flow (15 minutes)
Verify homepage → machine pages → token pages all work.

**PAUSE HERE FOR APPROVAL** ⏸️

### Step 7: Build Admin SKU Explorer (2-3 hours)
Search, view, edit SKU descriptions.

### Step 8: Build Marketing Builder (3-4 hours)
Customer workspace with card selection and preview.

### Step 9: Build Copy Editor (3-4 hours)
Dual markdown editors + SKU curation.

### Step 10: Implement Email Handler (2-3 hours)
Choose provider, build template, wire up handler.

---

## ACCEPTANCE CRITERIA CHECKLIST

Per the brief's Definition of Done:

### Public UX
- [ ] Home and `/machines/[slug]` render correct cards ⚠️ (cards yes, copy source wrong, setup guide missing)
- [ ] One setup guide block ❌ (not built)
- [ ] `/x/[token]` renders intro + all cards ⚠️ (cards yes, intro missing, setup guide missing)
- [ ] Setup guide based on curated_skus or fallback ❌ (not built)

### Admin UX
- [ ] SKU Explorer lets us find/view/edit SKUs ❌ (not built)
- [ ] Customer Marketing Builder works ❌ (not built)
- [ ] MS Problem Editor allows editing copy + SKUs ❌ (not built)

### Technical QA
- [x] Cards never group by solution ✅
- [ ] Copy fallback chain works ❌ (not implemented)
- [ ] Setup guide shows once at bottom ❌ (not built)
- [ ] No legacy product grid visible ❌ (still there)
- [ ] Emails use buttons, not raw URLs ❌ (handler not built)
- [x] No new SQL migrations needed ✅

**Current Score: 3/12 acceptance criteria met** ❌

---

## DEPENDENCIES NEEDED

```bash
npm install react-markdown remark-gfm
```

For markdown rendering in cards and editors.

---

## SQL MIGRATION NEEDED (Run in Supabase)

```sql
-- Add copy and SKU fields to view
DROP VIEW IF EXISTS public.v_machine_solution_problem_full;

CREATE OR REPLACE VIEW public.v_machine_solution_problem_full AS
SELECT
  -- Machine info
  m.machine_id,
  m.brand AS machine_brand,
  m.model AS machine_model,
  m.display_name AS machine_display_name,
  m.type AS machine_type,
  m.slug AS machine_slug,

  -- Solution info
  s.solution_id,
  s.name AS solution_name,
  s.core_benefit AS solution_core_benefit,
  s.long_description AS solution_long_description,
  s.media_urls AS solution_media_urls,

  -- Problem info
  p.problem_id,
  p.title AS problem_title,
  p.description AS problem_description,

  -- Copy fallback chain (CRITICAL)
  COALESCE(
    msp.problem_solution_copy,
    sp.problem_solution_copy,
    CONCAT(sp.pitch_headline, E'\n\n', sp.pitch_detail)
  ) AS resolved_copy,

  -- Individual copy fields for editing
  msp.problem_solution_copy AS msp_copy_override,
  sp.problem_solution_copy AS sp_copy_base,

  -- Legacy fields (for backward compat during transition)
  sp.pitch_headline,
  sp.pitch_detail,
  sp.action_cta,

  -- SKU curation (CRITICAL)
  msp.curated_skus,

  -- Ranking
  sp.relevance_rank AS pitch_relevance_rank,
  ms.relevance_rank AS machine_solution_rank,
  ms.machine_solution_id

FROM public.machines m
INNER JOIN public.machine_solution ms ON m.machine_id = ms.machine_id
INNER JOIN public.solutions s ON ms.solution_id = s.solution_id
INNER JOIN public.machine_solution_problem msp ON ms.machine_solution_id = msp.machine_solution_id
INNER JOIN public.problems p ON msp.problem_id = p.problem_id
INNER JOIN public.solution_problem sp ON sp.solution_id = s.solution_id AND sp.problem_id = p.problem_id
WHERE s.active = true
ORDER BY m.machine_id, ms.relevance_rank, sp.relevance_rank;
```

---

## FILES THAT NEED CHANGES

### Immediate (Phase A)

```
MODIFY:
- supabase/migrations/20250128_01_add_slug_to_machine_view.sql
- src/app/page.tsx (remove product grid)
- src/app/machines/[slug]/page.tsx (use resolved_copy, add setup guide)
- src/components/marketing/MachineFinder.tsx (use resolved_copy, add setup guide)
- src/app/x/[token]/page.tsx (use resolved_copy, add intro, add setup guide)
- src/app/api/machines/solutions/route.ts (return resolved_copy)
- package.json (add react-markdown)

CREATE:
- src/components/marketing/SetupGuide.tsx
```

### Later (Phase B)

```
CREATE:
- src/app/admin/sku-explorer/page.tsx
- src/components/admin/SkuExplorer.tsx
- src/app/api/admin/products/[code]/route.ts
- src/app/admin/ms-problem-editor/page.tsx
- src/components/admin/CopyEditor.tsx
- src/components/admin/MarketingBuilderTab.tsx
- src/app/api/admin/copy/update/route.ts

MODIFY:
- src/app/admin/customer/[company_id]/page.tsx (add Marketing Builder tab)
```

### Last (Phase C)

```
MODIFY:
- src/app/api/outbox/run/route.ts (implement send_offer_email handler)

CREATE:
- src/lib/email-template.tsx (email renderer)
- src/lib/email-client.ts (email service wrapper)
```

---

## SUMMARY FOR CHATGPT

### Current Reality
We have built:
- ✅ Machine discovery flow (homepage + machine pages)
- ✅ Machine ownership tracking (company_machine table)
- ✅ Admin prospects page (rep assignment, machine confirmation)
- ✅ Admin reorder page (push-button reminders)
- ✅ Token pages with machine logic

**BUT we're using the WRONG data structure:**
- Using `pitch_headline`, `pitch_detail`, `action_cta` as separate fields
- Should be using `problem_solution_copy` markdown field with fallback chain
- Missing `curated_skus` SKU curation
- Missing Setup Guide component entirely
- Still showing legacy product browsing

### What Needs to Happen (Priority Order)

**CRITICAL (Do First):**
1. Update view SQL to include `resolved_copy` and `curated_skus`
2. Install `react-markdown`
3. Build `SetupGuide` component
4. Update all card rendering to use markdown copy
5. Add Setup Guide to all pages
6. Remove legacy product grid

**IMPORTANT (Do Second):**
7. Build SKU Explorer admin tool
8. Build Marketing Builder tab
9. Build Copy Editor tool

**NICE TO HAVE (Do Last):**
10. Implement outbox email handler

### Technical Constraints

- **Do NOT add new tables** - Use existing schema only
- **ONE CARD PER PROBLEM** - Never group by solution
- **Copy fallback:** msp.problem_solution_copy → sp.problem_solution_copy → synthesized
- **SKUs fallback:** msp.curated_skus (if has values) → all compatible (if empty)
- **Setup Guide:** Once per page at bottom, not per card

### Files Reference
All implementation details, file paths, component specs, and SQL are documented above.

---

**Status:** 🟡 Partially Complete
**Blockers:** View update, copy implementation, Setup Guide
**Estimated Time to v1:** 6-10 hours total (2-3 hours critical path, 4-6 hours admin tools, 2-3 hours email)

---

**Next Action:** Confirm priority order and begin Phase A (critical data flow fixes).
