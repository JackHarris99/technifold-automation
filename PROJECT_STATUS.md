# Technifold Consumables Portal - Project Status

**Last Updated:** 29 November 2025
**Current State:** Work in Progress - Solution Finder functional, architecture under review

---

## What This Project Is

A B2B sales automation system for Technifold USA that:
1. Helps customers find compatible Technifold products for their folding machines
2. Presents solutions as persuasive narratives (not product dumps)
3. Will eventually cover binders and stitchers too

---

## What's Working Right Now

### Solution Finder Flow
1. Customer visits homepage or `/solutions`
2. Selects machine **brand** from dropdown (e.g., MBO, Heidelberg/Stahl, Baum)
3. Selects **shaft size** from dropdown (e.g., "35mm" or "20mm (36mm OD)" when disambiguation needed)
4. Clicks "View Compatible Solutions"
5. Navigates to `/solutions/[brand]/[shaft]` (e.g., `/solutions/MBO/35mm`)
6. Solution page shows compatible Technifold products

### Key Files

**Frontend:**
- `src/app/page.tsx` - Homepage with SolutionFinder
- `src/app/solutions/page.tsx` - Dedicated solution finder page
- `src/app/solutions/[brand]/[model]/page.tsx` - Solution results page (handles both shaft URLs and real machine URLs)
- `src/components/solutions/SolutionFinder.tsx` - Brand + shaft dropdown component
- `src/components/solutions/SolutionPageClient.tsx` - Client-side solution display

**APIs:**
- `src/app/api/solutions/shafts/route.ts` - Returns available shaft sizes for a brand
- `src/app/api/compatibility/route.ts` - Returns compatible products for brand + shaft specs
- `src/app/api/machines/brands/route.ts` - Returns list of machine brands

**Database Tables (Supabase):**
- `machines` - Machine brand, model, type, shaft_specs (JSONB)
- `products` - Product codes, descriptions, images, categories
- `tool_brand_compatibility` - Links product_code → brand + shaft_specs (388 records)
- `tool_consumable_map` - Links tools to their consumables
- `problem_solution` - Marketing copy for solution pages
- `brand_media` - Brand logos and hero images

---

## The Architecture Question We're Stuck On

### Current Approach
The `tool_brand_compatibility` table stores:
```
product_code | brand | shaft_specs (JSONB)
```

Where `shaft_specs` = `{shaft_size_mm: 35, outer_diameter_mm: 58}`

**Problem:** This works for folders where shaft_size + OD determines compatibility. But:
1. Binders and stitchers have different compatibility factors
2. The "brand" column is redundant - a TC/35 fits ANY 35mm/58mm shaft regardless of brand
3. Third-party consumables might be model-specific, not shaft-based

### Options Being Considered

**Option A: Products have shaft_specs directly**
```sql
products.shaft_specs = {shaft_size_mm: 35, outer_diameter_mm: 58}
machines.shaft_specs = {shaft_size_mm: 35, outer_diameter_mm: 58}
-- Match where they're equal
```

**Option B: Shaft configuration lookup table**
```sql
shaft_configurations (id, shaft_size_mm, outer_diameter_mm)
products.shaft_config_id → shaft_configurations
machines.shaft_config_id → shaft_configurations
-- Match on shaft_config_id
```

**Option C: Direct machine → product linking**
```sql
machine_product_compatibility (machine_id, product_code, source)
-- Explicit links, computed from shaft rules for Technifold products
-- Manual links for third-party and non-folder products
```

### Key Insight
- **Technifold folder products** follow a rule: shaft_size_mm + outer_diameter_mm determines compatibility
- **Third-party consumables** may be model-specific
- **Binders/stitchers** have completely different compatibility factors

We need an architecture that handles all three cleanly.

---

## Database: Important Notes

### The shaft_specs JSONB
Both values MUST stay together - shaft_size_mm alone is NOT enough for compatibility:
- 20mm shaft with 36mm OD ≠ 20mm shaft with 40mm OD
- These are physically different configurations

### Existing Data
- 388 records in `tool_brand_compatibility` linking Technifold products to brand + shaft specs
- Real machines in `machines` table (not fake shaft-size "machines")
- Some machines have `shaft_specs`, some don't (fallback mode shows softer language)

---

## The Solution Page Vision

NOT a product dump. Should be a flowing narrative:

> "Your MBO folder with 35mm shafts is ready for a complete finishing upgrade.
> The **Tri-Creaser** eliminates fiber cracking on digital stocks...
> Add a **Micro-Perforator** for tear-off response cards...
> The **CP Applicator** handles cold glue applications..."

Copy is **solution-type specific** (Tri-Creaser story, Quad-Creaser story), not product-code specific.

Current implementation is still "boxy" - needs narrative redesign.

---

## Files to Ignore/Delete Later

- `context.md` - Old context file (can be removed)
- `read_docx.ps1` - PowerShell script for reading docs (utility)
- Fake "shaft-size machines" in the machines table (e.g., model="35mm") - these were a wrong turn

---

## To Continue This Project

1. **Pull from GitHub** on your other machine
2. Run `npm install`
3. Create `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Run `npm run dev`
5. Decide on the architecture question above
6. Implement the solution page narrative (currently too boxy)

---

## Immediate Next Steps

1. **Decide architecture** - How to link products to machines for:
   - Technifold folder products (shaft-based rule)
   - Third-party consumables (possibly model-specific)
   - Binders/stitchers (different compatibility factors)

2. **Clean up fake machines** - Remove shaft-size "machines" from machines table

3. **Solution page narrative** - Transform from product grid to persuasive story

4. **Add Path A** - Allow customers to select brand + specific model (not just shaft size)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) with Turbopack
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Language:** TypeScript
