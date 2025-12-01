# Technifold Data Strategy: From Product Catalogue to Industry Platform

## Executive Summary

We are transforming from a company that sells finishing tools to a company that sells **operational capability** - powered by a data infrastructure that enables hyper-personalisation at scale.

This document explains the data architecture decisions that make this possible, and how they enable personalised marketing, machine-specific guides, business-level savings proposals, and ultimately position Technifold as the industry authority on print finishing equipment.

---

## Part 1: The Problem With How We Stored Data

### The Old Way: Rigid Columns

Our database stored product specifications in separate columns:

```
product_code | shaft_size_mm | outer_diameter_mm
TRI-FF-35-01 | 35            | 58.00
```

**Why this breaks down:**

1. **Shaft size and outer diameter are symbiotic** - 35mm shaft with 58.00mm OD is completely different from 35mm shaft with 58.87mm OD. Separate columns imply they're independent. They're not. A 0.87mm difference means incompatibility.

2. **Machines vary in complexity** - A simple folder has 1 shaft. A perfect binder might have 4 shafts with different specs. Do we add 8 columns (4 shafts × 2 measurements)? What about machines with 6 shafts? We end up with dozens of mostly-empty columns.

3. **We can't store what we don't anticipate** - If width becomes relevant for some machines, we need to add a column, migrate data, update code. Every new attribute requires engineering work.

4. **Products and machines don't speak the same language** - If products have columns and machines have different columns, matching them requires complex translation logic.

---

## Part 2: The Solution - JSONB for Specifications

### What is JSONB?

JSONB is a flexible data format that stores structured information without requiring fixed columns. It's fully searchable, queryable, and is how modern platforms handle variable data.

### How We Now Store Specifications

**A simple folder product:**
```json
{
  "shaft_size_mm": 35,
  "outer_diameter_mm": 58.00
}
```

**A complex binder product:**
```json
{
  "upper": {"shaft_size_mm": 35, "outer_diameter_mm": 50},
  "lower": {"shaft_size_mm": 40, "outer_diameter_mm": 55},
  "cover_feeder_upper": {"shaft_size_mm": 35, "outer_diameter_mm": 48},
  "cover_feeder_lower": {"shaft_size_mm": 35, "outer_diameter_mm": 48}
}
```

**A machine with the same structure:**
```json
{
  "upper": {"shaft_size_mm": 35, "outer_diameter_mm": 50},
  "lower": {"shaft_size_mm": 40, "outer_diameter_mm": 55}
}
```

### Why This Is Better

| Problem | JSONB Solution |
|---------|----------------|
| Symbiotic values stored separately | Kept together as one unit |
| Variable shaft counts | Just add more entries - no schema change |
| New attributes needed | Add the field where relevant - no migration |
| Products and machines need to match | Same structure = direct comparison |
| Future machine specs we don't know yet | Store whatever we discover |

### What Stays As Traditional Tables

JSONB doesn't replace everything. We use it where data is **variable or symbiotic**. Traditional tables remain for:

| Keep As Tables | Why |
|----------------|-----|
| Product codes, names, categories | Consistent, always present |
| Brand names, machine models | Lookup/reference data |
| Tool → Consumable relationships | It's a link, not a specification |
| Customer records | Standard CRM data |
| Foreign key relationships | How tables connect to each other |

**The principle:** Tables are the skeleton (structure, relationships). JSONB stores the organs (specs that vary in shape and size).

---

## Part 3: What This Enables

### A) Personalisation of Consumable Setup Per Machine

**Before:** Generic consumable guide for "Tri-Creaser Fast-Fit"

**After:** Consumable guide for "Tri-Creaser Fast-Fit on YOUR Heidelberg Stahl TH82"

Because we know:
- The machine's exact specifications (JSONB)
- Which product variant fits those specs (JSONB matching)
- Which consumables that product uses (relationship table)
- The attributes of those consumables (JSONB: colour, GSM range, stock type)

**Output:** "Your TH82 uses the TRI-FF-35-01. For stocks under 200gsm, use Orange ribs (M-174). For 200-270gsm, use Blue ribs (M-175). Order here."

One template. Thousands of machine-specific versions generated on demand.

---

### B) Personalisation of Marketing Per Machine

**Before:** Generic brochure listing all Technifold products

**After:** "The Complete Technifold Guide for Your MBO B30"

Because we know:
- MBO B30 specifications (JSONB)
- Every Technifold product compatible with those specs
- Benefits, testimonials, and use cases for each (content files)
- Consumable requirements and longevity data

**Output:** A brochure that only shows what's relevant to that machine, with specific ROI calculations, specific consumable information, and specific testimonials from similar users.

**Scale:** We maintain 1 brochure template. The system generates 500+ machine-specific versions on demand.

---

### C) Personalisation Per Business Establishment

This is where it becomes a genuine competitive moat.

**The Plant List Concept:**

When we know a customer's full equipment list:
```json
{
  "company": "ABC Printing Ltd",
  "machines": [
    {"brand": "MBO", "model": "B30", "type": "folder"},
    {"brand": "Heidelberg", "model": "Stahl TH82", "type": "folder"},
    {"brand": "Muller Martini", "model": "Alegro", "type": "binder"},
    {"brand": "Polar", "model": "115XT", "type": "guillotine"}
  ]
}
```

**We can now generate:**

1. **Complete Capability Assessment**
   - "3 of your 4 machines are compatible with Technifold products"
   - "Here's what fits each one"

2. **Workflow Optimisation Proposal**
   - "Your Alegro binder is a bottleneck for cover creasing"
   - "Adding a Quad-Creaser eliminates offline cover prep"
   - "Your two folders could both have Tri-Creasers - if one is busy, divert the job"

3. **Personalised Savings Calculation**
   - "Based on your equipment, estimated annual savings: £14,200"
   - Broken down by machine, by capability, by operational efficiency

4. **Rental Package Proposal**
   - "Full Technifold capability across your entire shop: £X/month"
   - Not selling individual tools - selling operational flexibility

5. **The Guillotine Point**
   - We don't sell guillotine products (yet)
   - But knowing they have one lets us say: "Your Multi-Tool inline cutting could reduce guillotine dependency by 40%"
   - Shows we understand their workflow, not just pushing products

**The Rental Model Makes This Work:**

| Approach | Customer Thinking |
|----------|-------------------|
| Sell tool-by-tool | "£1,200 for one machine. Do I need it?" |
| Rent full capability | "£X/month for flexibility across everything. That's operational insurance." |

Lower barrier. Higher lifetime value. Stickier relationship. Compounding MRR.

---

### D) Industry Data Gathering and Authority Positioning

**The Long-Term Play:**

Every machine spec we store, every compatibility we confirm, every workflow we document - this builds an industry database that becomes increasingly valuable and increasingly difficult to replicate.

**How JSONB Accelerates This:**

| With Rigid Schema | With JSONB |
|-------------------|------------|
| New machine has unusual specs? Add columns, migrate, update code | Just store it - add whatever fields exist |
| Scrape specs from PDF or website? Must parse into exact columns | Ingest as JSON, validate and clean later |
| AI extracts machine data? Must match rigid structure | Flexible ingestion, normalise over time |
| Unknown future attributes? Can't store them | Store whatever we discover |

**Practical Example:**

We find a PDF with specs for 50 machines we don't have. Some have 2 shafts, some have 4, some have unusual measurements we've never tracked.

- **Old way:** Create new columns, hope they cover all cases, manually map each machine
- **JSONB way:** Parse the specs as-is, store them, query later to find which match our products

**The result:** We can grow the machine database 10x faster than competitors using traditional methods.

**Authority Positioning:**

When Technifold has the most comprehensive, accurate database of print finishing machine specifications:
- Customers come to us to check compatibility (even before buying)
- Distributors rely on our data
- We see market trends before anyone else (which machines are common, which are dying)
- We can proactively develop products for underserved machine types

---

## Part 4: The Complete Data Architecture

### Tables (Traditional Schema)

| Table | Purpose |
|-------|---------|
| `products` | Product codes, names, categories, pricing |
| `consumables` | Consumable codes, names, categories |
| `machines` | Brand, model, machine type |
| `customers` | Company info, contacts |
| `product_consumables` | Which consumables go with which products (join table) |
| `tool_machine_direct` | Explicit compatibility overrides for edge cases |

### JSONB Fields

| Table | JSONB Field | Contains |
|-------|-------------|----------|
| `products` | `shaft_specs` | Symbiotic shaft size + OD combinations |
| `products` | `attributes` | Colour, type, GSM range, use cases (especially for consumables) |
| `machines` | `shaft_specs` | Machine shaft specifications (variable structure) |
| `customers` | `plant_list` | Their equipment with specs |

### How Matching Works

**Simple case (folders):**
```
Product shaft_specs: {"shaft_size_mm": 35, "outer_diameter_mm": 58.00}
Machine shaft_specs: {"shaft_size_mm": 35, "outer_diameter_mm": 58.00}
→ Match
```

**Complex case (binders):**
```
Product shaft_specs: {
  "upper": {"shaft_size_mm": 35, "outer_diameter_mm": 50},
  "lower": {"shaft_size_mm": 40, "outer_diameter_mm": 55}
}
Machine shaft_specs: {
  "upper": {"shaft_size_mm": 35, "outer_diameter_mm": 50},
  "lower": {"shaft_size_mm": 40, "outer_diameter_mm": 55}
}
→ Match
```

The matching logic compares JSONB structures. Same approach scales from simple to complex.

---

## Part 5: What We Can Build With This

### Immediate Capabilities

| Capability | How It Works |
|------------|--------------|
| Machine-specific product pages | Query products where specs match machine specs |
| Machine-specific brochures (PDF) | Template + machine data + compatible products |
| Machine-specific user guides | Template + product + consumables for that config |
| Consumable reorder system | Customer's machine → compatible products → required consumables |

### Medium-Term Capabilities

| Capability | How It Works |
|------------|--------------|
| Customer portal with their equipment | Plant list stored, shows only relevant products |
| Personalised savings calculator | Their machines + our products + operational assumptions |
| Rental package builder | Select machines, calculate coverage, generate quote |
| Distributor tools | Same capabilities, white-labelled |

### Long-Term Capabilities

| Capability | How It Works |
|------------|--------------|
| Industry machine database | Comprehensive specs, positioning as authority |
| Predictive product development | "These 50 machines have no Technifold product - should we make one?" |
| Acquisition targeting | "These companies have high-compatibility plant lists" |
| AI-powered workflow consulting | "Based on your equipment, here's your optimal Technifold setup" |

---

## Part 6: The Competitive Moat

**Why competitors cannot easily replicate this:**

1. **The compatibility data took years to build** - It's institutional knowledge encoded in data, not just a product list

2. **The machine database grows with every customer interaction** - Each plant list we capture, each spec we verify, adds to the moat

3. **JSONB + structured content enables personalisation at scale** - Generating 5,000 machine-specific brochures isn't a manual task, it's a query

4. **The rental model creates recurring relationships** - We're not selling products and walking away; we're providing ongoing capability

5. **The data enables insights competitors can't see** - Which machines are most common? Which consumables have highest attach rates? Where are the market gaps?

---

## Part 7: Implementation Summary

### What We've Done

- Processed 568 source documents into structured content files
- Created solution pages for all product categories
- Built testimonial database with tagged quotes
- Documented consumable longevity data for rental pricing
- Established product hierarchy rules

### What We're Doing Now

- Adding JSONB specification fields to products and machines tables
- Documenting current schema before modifications
- Building tool-to-machine compatibility using JSONB specs
- Creating canonical files that serve as source of truth

### What Comes Next

1. Connect AI to database (read-only initially) for schema documentation
2. Design JSONB structures for products and machines
3. Migrate existing compatibility data to new structure
4. Build machine-specific page generation
5. Build customer plant list capture
6. Build personalised proposal generation

---

## Conclusion

This isn't a website redesign. It's a transformation of how Technifold stores, connects, and activates its institutional knowledge.

The combination of:
- **JSONB for flexible specifications**
- **Traditional tables for relationships**
- **Structured content files for marketing copy**
- **AI for pattern recognition and generation**

...creates a platform that can deliver personalised, machine-specific, business-specific value at a scale that manual processes cannot match.

The rental model monetises this capability. The data infrastructure makes it defensible.
