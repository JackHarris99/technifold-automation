# Content Folder

This folder contains structured marketing content extracted from Technifold source documents. This content serves as the building blocks for machine-specific marketing pages.

## Structure

```
/content
  /solutions          <- Marketing content per solution/capability (COMPLETE)
    tri-creaser.md          - Rotary creasing for folders (hierarchy: Advance > Fast-Fit > Easy-Fit > Deluxe)
    quad-creaser.md         - 4-crease for perfect binders
    spine-creaser.md        - Single crease for saddle stitchers
    spine-and-hinge-creaser.md - 4-crease for folders (offline workflows)
    micro-perforator.md     - Inline perforation
    cp-applicator.md        - Close proximity perf+crease (PATENTED, unique)
    multi-tool.md           - Modular finishing (cut/perf/trim)
    gripper-boss.md         - Replacement gripper wheels
    section-scorer.md       - Signature scoring for folders
    web-tool.md             - NOTE: Not a real product category (clarification file)

  /knowledge          <- Educational content
    creasing-vs-scoring.md  - Why creasing beats OEM scoring
    colour-coding-system.md - The Technifold colour-coding system explained

  /data               <- Structured data (JSON)
    consumable-longevity.json - Life expectancy data for rental pricing
    product-hierarchy.json    - Variant rules and machine type mappings

  /testimonials       <- Customer quotes
    testimonials-database.json - All extracted testimonials with tags

  /brands             <- Brand-level content (TO DO)
    [brand-name].md

  /machines           <- Machine-specific overrides (TO DO)
    [machine-model].md

  /email-campaigns    <- Proven marketing hooks (TO DO)
    [campaign-name].md

  /reports            <- Free reports, guides (TO DO)
    [report-name].md

  /general            <- Company story, general marketing (TO DO)
    [topic].md

  /source-pdfs        <- 568 source documents (PDFs, DOCx, Excel)
    [various files]
```

## Content Status

### Complete
- All solution files have real extracted content
- Educational knowledge files created
- Consumable longevity data structured as JSON
- Testimonials database with tagged quotes
- Product hierarchy rules documented

### Pending (requires compatibility tables)
- Machine-specific pages (need product_code → machine mapping)
- Brand-level content
- Email campaign templates

## Key Data Files

### consumable-longevity.json
Used for rental pricing models. Contains:
- Life expectancy by rib colour
- Perforation blade life
- Cutting blade life
- Nylon sleeve replacement intervals

### product-hierarchy.json
Used when multiple product variants exist for same machine. Contains:
- Tri-Creaser hierarchy: Advance > Fast-Fit > Easy-Fit > Deluxe
- Quad-Creaser hierarchy: Fully Adjustable > Standard
- Machine type → solution mappings
- Related product relationships

### testimonials-database.json
All customer quotes tagged by:
- Product
- Benefit type (ROI, quality, ease-of-use, etc.)
- Machine type (folders, binders, stitchers)

## How to Use This Content

### For Machine Pages
1. Look up machine brand/model in compatibility table
2. Get list of compatible solutions
3. Pull content from relevant `/solutions/*.md` files
4. Apply hierarchy rules from `product-hierarchy.json`
5. Pull relevant testimonials from `testimonials-database.json`
6. Generate machine-specific page

### For Rental Pricing
1. Reference `consumable-longevity.json` for life expectancy
2. Calculate cost per 1000 sheets
3. Add margin for rental pricing model

## Next Steps

1. Upload compatibility tables (product_code → machine brand/shaft/OD)
2. Build machine pages combining content with compatibility data
3. Add brand-level narrative content
4. Extract email campaign proven hooks
