# CLEANUP MASTER PLAN - Remove All Bloat & Confusion

**Problem:** Old documentation files + code still using abandoned marketing schema = confusion on every new Claude session

**Solution:** Delete everything that conflicts with PROJECT_CONTEXT.md

---

## 🔥 PHASE 1: Delete Old Documentation Files

These files contain **outdated and conflicting** information. They will confuse future Claude sessions.

### Delete These Immediately:

```bash
rm ARCHITECTURE_AUDIT.md           # Old architecture analysis
rm BRIEF_V1_COMPLETE.md            # Old brief/spec
rm CODEBASE_SNAPSHOT.md            # Old codebase snapshot
rm IMPLEMENTATION_ALIGNMENT.md     # Old implementation notes
rm IMPLEMENTATION_STATUS.md        # Old status (conflicts with PROJECT_CONTEXT.md)
rm IMPLEMENTATION_SUMMARY.md       # Old summary
rm MACHINE_DISCOVERY_BUILD.md      # Old machine discovery notes
rm MEDIA_UPLOAD_SETUP.md           # Old media upload notes
rm PROJECT_STATUS.md               # OLD STATUS (conflicts with PROJECT_CONTEXT.md)
rm RESEND_WEBHOOK_SETUP.md         # Old Resend setup notes
rm SCHEMA_VALIDATION.md            # Old schema notes
rm SYSTEM_AUDIT.md                 # Old system audit
rm TECHNICAL_BUILD_STATUS.md       # OLD STATUS (conflicts with PROJECT_CONTEXT.md)
rm TEST_PLAN.md                    # Old test plan (replaced by TESTING_CHECKLIST.md)
rm context.md                      # Old context (replaced by PROJECT_CONTEXT.md)
rm "schema answers for chat gpt.md" # Old schema Q&A
```

**Why delete?**
- PROJECT_STATUS.md says "Solution Finder functional" and references `problem_solution` table (abandoned!)
- IMPLEMENTATION_STATUS.md mentions old schema (`asset_models`, `company_beliefs`) that don't exist
- TECHNICAL_BUILD_STATUS.md has old routes (`portal/[token]` not `x/[token]`)
- All of these will confuse Claude Code on future sessions

### Keep These Files:

```
✅ PROJECT_CONTEXT.md               # MASTER reference (413 lines)
✅ MACHINE_PAGE_TEMPLATE.md         # How to build machine pages
✅ TESTING_CHECKLIST.md             # Core backend testing
✅ QUICK_START.md                   # Quick reference
✅ CLEANUP_PLAN.md                  # Original cleanup plan (may need update)
✅ CLEANUP_MASTER_PLAN.md           # This file
✅ README.md                        # Git repo README
✅ .env.example                     # Environment variable template
```

---

## 🔥 PHASE 2: Identify Code Using Abandoned Schema

**26 TSX files reference the abandoned marketing schema.** We need to understand what they're doing.

### Files Using Abandoned Schema:

```
src/app/machines/[slug]/page.tsx              # ⚠️ CRITICAL - Queries v_problem_solution_machine
src/app/x/[token]/page.tsx                    # ⚠️ CRITICAL - Uses content_blocks + assembleContent()
src/app/m/[token]/page.tsx                    # ⚠️ Alias of /x/ route
src/app/q/[token]/page.tsx                    # Quote tokenized page
src/components/marketing/MachinePageClient.tsx
src/components/marketing/MachineSolutionsDisplay.tsx
src/components/marketing/MachineFinder.tsx
src/components/solutions/SolutionFinder.tsx
src/components/solutions/SolutionPageClient.tsx
src/components/offers/TokenMachineFinder.tsx
src/components/content/BlockRenderer.tsx      # ⚠️ Renders content_blocks
src/components/admin/console-tabs/MarketingTab.tsx
src/components/admin/MarketingBuilderTab.tsx
src/components/admin/CopyEditor.tsx
src/app/solutions/page.tsx
src/app/tools/[category]/page.tsx
... (20 more files)
```

### Three Categories of Files:

**Category 1: BREAKING (Must Fix)**
- `/machines/[slug]/page.tsx` - Machine landing pages (currently queries abandoned view)
- `/x/[token]/page.tsx` - Tokenized marketing pages (currently uses content_blocks)
- These are **core revenue-generating pages** - must work!

**Category 2: ADMIN TOOLS (Low Priority)**
- `/admin/ms-problem-editor` - Marketing copy editor (may be deprecated)
- `CopyEditor.tsx` - Admin component for editing abandoned schema
- These can be ignored or deleted

**Category 3: SOLUTION FINDER (Unknown Status)**
- `/solutions/page.tsx` - Brand → shaft → solutions finder
- May or may not depend on abandoned schema
- Need to test if this works

---

## 🔥 PHASE 3: Decision - What To Do With Broken Code

### Option A: Delete Broken Pages (FASTEST)
**Delete these routes entirely until we rebuild them:**

```bash
# Delete machine pages (broken - query abandoned view)
rm src/app/machines/[slug]/page.tsx
rm src/components/marketing/MachinePageClient.tsx
rm src/components/marketing/MachineSolutionsDisplay.tsx

# Delete solution finder (may be broken)
rm src/app/solutions/page.tsx
rm src/app/solutions/[brand]/[model]/page.tsx  # If exists
rm src/components/solutions/SolutionFinder.tsx
rm src/components/solutions/SolutionPageClient.tsx
```

**Result:** Site still works (solution pages, admin, checkout) but machine-specific pages 404 until rebuilt

**Pros:**
- Clean slate
- No confusion about what works
- Forces rebuild using correct approach

**Cons:**
- Lose existing machine pages immediately
- Must rebuild before launching

---

### Option B: Comment Out Broken Code (SAFER)
**Keep files but prevent them from running:**

In `src/app/machines/[slug]/page.tsx`:
```typescript
export default async function MachinePage({ params }: MachinePageProps) {
  // TODO: This page uses abandoned schema (v_problem_solution_machine)
  // Must rebuild using Markdown + Template approach (see MACHINE_PAGE_TEMPLATE.md)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Under Construction</h1>
        <p className="text-gray-600 mb-8">
          Machine-specific pages are being rebuilt. Please check back soon.
        </p>
        <a href="/" className="text-blue-600 hover:text-blue-700">
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
```

**Pros:**
- Files remain as reference
- Clear "under construction" message
- Can rebuild incrementally

**Cons:**
- Still have bloated codebase
- May confuse Claude Code

---

### Option C: Fix Pages to Use Correct Approach (SLOWEST)
**Rebuild `/machines/[slug]` using Markdown + Template approach:**

1. Create `/content/machines/` directory
2. Write sample markdown files
3. Build template component (see MACHINE_PAGE_TEMPLATE.md)
4. Replace broken page with working one

**Pros:**
- Pages work immediately
- Clean implementation

**Cons:**
- Takes time to write 225 markdown files
- Marketing should come LAST (after testing core)

---

## 🎯 RECOMMENDED APPROACH

**Phase 1: Delete Old Documentation (5 mins)**
- Delete all old status files immediately
- Keep only PROJECT_CONTEXT.md and new docs

**Phase 2: Comment Out Broken Pages (10 mins)**
- Replace broken machine pages with "Under Construction"
- Replace broken token page content with simple message
- Keep admin pages (not critical path)

**Phase 3: Test Core Backend (1-2 hours)**
- Follow TESTING_CHECKLIST.md
- Verify checkout, webhooks, emails, tokens work
- Don't touch marketing until core is proven

**Phase 4: Rebuild Machine Pages (Later)**
- After core works, rebuild using Markdown + Template
- Start with top 5 machines
- Scale gradually

---

## 🚨 Critical Files - Don't Touch!

**These files work perfectly - leave them alone:**

```
src/app/tools/tri-creaser/page.tsx              # ✅ PERFECT longform copy
src/app/tools/quad-creaser/page.tsx             # ✅ PERFECT
src/app/tools/spine-creaser/page.tsx            # ✅ PERFECT
src/app/tools/micro-perforator/page.tsx         # ✅ PERFECT
src/app/tools/multi-tool/page.tsx               # ✅ PERFECT
src/app/tools/gripper-boss/page.tsx             # ✅ PERFECT
src/app/tools/cp-applicator/page.tsx            # ✅ PERFECT
src/app/tools/section-scorer/page.tsx           # ✅ PERFECT
src/app/tools/spine-and-hinge-creaser/page.tsx  # ✅ PERFECT
src/app/tools/web-tool/page.tsx                 # ✅ PERFECT

src/app/admin/*                                 # ✅ Admin pages work
src/lib/tokens.ts                               # ✅ Token generation works
src/lib/supabase.ts                             # ✅ Database works
```

---

## 📋 Execution Checklist

### Immediate (Do Now):
- [ ] Delete 15 old documentation files
- [ ] Test if site still compiles (`npm run build`)
- [ ] Test if solution pages still render (http://localhost:3001/tools/tri-creaser)

### Next (Before Touching Marketing):
- [ ] Follow TESTING_CHECKLIST.md Phase 1-6
- [ ] Verify admin login works
- [ ] Verify token generation works
- [ ] Verify Stripe checkout works
- [ ] Verify emails send

### Later (After Core Works):
- [ ] Decide on machine page approach (delete, comment out, or rebuild)
- [ ] Create sample machine markdown files
- [ ] Build template component
- [ ] Test rendering

---

## 🎯 Success Criteria

**Project is CLEAN when:**

1. ✅ Only 6 documentation files in root (PROJECT_CONTEXT.md, TESTING_CHECKLIST.md, etc.)
2. ✅ No files reference abandoned schema (`v_problem_solution_machine`, `content_blocks`)
3. ✅ OR: Files that reference abandoned schema are clearly marked "UNDER CONSTRUCTION"
4. ✅ Claude Code can read PROJECT_CONTEXT.md and understand entire project instantly
5. ✅ No conflicting status files to confuse future sessions

---

**Remember: DELETE OLD DOCS FIRST. Everything else can wait.**
