# Machine Page Template System - Scalable Longform Copy

**Problem:** Need 225 machine-specific marketing pages with professional longform copy, but can't manually build 225 TSX files.

**Solution:** Markdown files + Template component = Scalable + Professional + Maintainable

---

## 🎯 How It Works

### 1. Markdown File Per Machine

Each machine gets its own markdown file in `/content/machines/[slug].md`

**File naming:** `heidelberg-stahl-ti52.md`, `mbo-t49.md`, `muller-martini-pantera.md`

### 2. Frontmatter Contains Metadata

```markdown
---
machine_id: "mach_001"
brand: "Heidelberg Stahl"
model: "Ti52"
slug: "heidelberg-stahl-ti52"
solutions: ["Tri-Creaser", "Multi-Tool", "Micro-Perforator"]
compatible_shafts: ["3.5mm", "4.5mm"]
monthly_rental_base: 159
payback_jobs: 3
---
```

### 3. Body Contains Longform Copy (400-500 lines)

```markdown
# Stop Fiber Cracking on Your Heidelberg Stahl Ti52

Your Ti52 handles 80-350gsm stocks at speeds up to 40,000 sheets/hour. But when you're running UV coated, laminated, or digital stocks, fiber cracking threatens to ruin every fold.

**The problem isn't your machine. It's the OEM scoring tools.**

Traditional scoring uses metal-on-metal compression. This crushes fibers instead of stretching them. Result? Ugly white cracks along every fold line.

## Why Ti52 Operators Choose Tech-ni-Fold

Your Ti52 has three buckle plate positions. Each can accept our Fast-Fit creasing system:

**Position 1 (First Fold):**
- Install Tri-Creaser Fast-Fit Orange (85-200gsm)
- Eliminates fiber cracking on coated stocks
- Works at full machine speed (40k/hr)
- No slowdown required

**Position 2 (Second Fold):**
- Install Tri-Creaser Fast-Fit Blue (170-270gsm)
- Handles heavy stocks and laminated materials
- Split-rib design (change without removing shafts)
- Zero downtime for changeovers

**Position 3 (Third Fold):**
- Install Multi-Tool with perforation boss
- Add kiss-cut perforation inline
- Or install Tri-Creaser Yellow for 250-350gsm stocks
- Modular system = ultimate flexibility

## Real Ti52 Results

**Graham Print (Manchester):**
- 350gsm UV coated book covers
- Was outsourcing creasing offline (£200/job delay)
- Installed Tri-Creaser Fast-Fit Blue
- Now creases inline at 35,000/hr
- Paid for itself in 2 jobs

**Pierce Finishing (Birmingham):**
- Running digital stocks on Ti52-4
- Fiber cracking on 60% of jobs
- Installed complete Fast-Fit system (3 positions)
- Zero cracking, zero complaints
- "Best investment we've made in 10 years"

## Technical Specifications

**Compatible with:**
- Heidelberg Stahl Ti52, Ti52-4, Ti52-6
- All buckle plate configurations
- Standard 3.5mm drive shafts
- Optional 4.5mm conversion available

**Color-Coded System:**
- Orange: 85-200gsm (most digital stocks)
- Blue: 170-270gsm (cover stocks)
- Yellow: 250-350gsm (heavy board)
- Green: 150-250gsm (mid-range)

**Installation:**
- Tool-free Fast-Fit mounting (2 minutes)
- Split-rib design (no shaft removal)
- Adjustable pressure (dial-in perfect crease)
- Includes setup guide + sample pack

## What You Get

### Tri-Creaser Fast-Fit Starter Kit (£159/mo rental):
- 1x Male creasing rib (3.5mm)
- 3x Female creasing ribs (Orange, Blue, Yellow)
- Fast-Fit mounting brackets
- Setup guide + color-coded sample cards
- Free trial (30 days, zero risk)

### Multi-Tool Upgrade (add £89/mo):
- 6-in-1 modular finishing system
- Perforation, cutting, matrix removal
- Works alongside Tri-Creaser
- Same Fast-Fit mounting system

### Factory Bundle (£450/mo):
- All three buckle positions equipped
- Multi-Tool perforation system
- Complete consumable kit
- Priority support + quarterly reviews

## How Rental Works

**Ratcheting subscription:**
- Start at £159/mo (cancel any time)
- Add tools as you need them (£159 → £248 → £450)
- Can only ADD, never downgrade
- Return tools = subscription ends
- No term, no contract, no bullshit

**Why operators love it:**
- Zero upfront capital
- Cancel any time = psychological safety
- Operational integration = too valuable to return
- Compounding value as you add machines

## Installation Support

**We don't just ship tools. We integrate systems.**

1. **Pre-install consultation** (video call)
   - Review your Ti52 configuration
   - Identify buckle plate positions
   - Select correct shaft sizes
   - Plan installation timing

2. **Delivery + setup guide**
   - Color-coded installation guide
   - Sample pack (test all stock ranges)
   - Video tutorials (Ti52-specific)
   - Direct phone support

3. **30-day trial period**
   - Test on YOUR stocks
   - Run YOUR jobs
   - Measure YOUR results
   - Zero commitment

4. **Ongoing support**
   - Quarterly check-ins
   - Consumable reminders (before you run out)
   - New product updates
   - Factory-wide proposals (as you scale)

## Next Steps

### Option 1: Free Trial (Recommended)
Test Tri-Creaser Fast-Fit on your Ti52 for 30 days. Zero risk, zero commitment.

**Includes:**
- Complete starter kit
- Setup guide + samples
- Phone support
- Return shipping (if you don't keep it)

[Request Free Trial →](#)

### Option 2: Book Consultation
20-minute video call to review your Ti52 setup and recommend exact configuration.

[Book Consultation →](#)

### Option 3: See Technical Specs
Download complete technical datasheet, compatibility chart, and installation guide.

[Download Datasheet →](#)

---

**Questions?** Call us: 01234 567890 | Email: sales@technifold.com

**Already convinced?** [Start your free trial →](#)
```

---

## 📐 Template Component

**File:** `/src/app/machines/[slug]/page.tsx`

```tsx
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';

// Generate static params for all machines
export async function generateStaticParams() {
  const machinesDir = path.join(process.cwd(), 'content/machines');
  const files = fs.readdirSync(machinesDir);

  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace('.md', ''),
    }));
}

// Generate metadata from frontmatter
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/machines', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);

  return {
    title: `${data.brand} ${data.model} - Inline Finishing Solutions | Technifold`,
    description: `Stop fiber cracking on your ${data.brand} ${data.model}. Professional inline creasing, perforation, and finishing tools. From £${data.monthly_rental_base}/mo. 30-day free trial.`,
  };
}

export default function MachinePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/machines', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero - Machine Specific */}
      <section className="bg-slate-900 text-white py-16 border-b-4 border-orange-500">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-4 text-orange-300 inline-flex">
            Machine-Specific Solutions
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {data.brand} {data.model}<br />
            <span className="text-orange-400">Inline Finishing Solutions</span>
          </h1>

          <div className="flex items-center gap-6 text-sm mb-8">
            <div className="bg-slate-800 px-4 py-2 border border-slate-700">
              <span className="text-gray-400">From: </span>
              <span className="text-white font-bold">£{data.monthly_rental_base}/mo</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 border border-slate-700">
              <span className="text-gray-400">Payback: </span>
              <span className="text-white font-bold">{data.payback_jobs} jobs</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 border border-slate-700">
              <span className="text-gray-400">Compatible: </span>
              <span className="text-white font-bold">{data.solutions.length} solutions</span>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-8 py-3 text-base font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial (30 Days) →
          </a>
        </div>
      </section>

      {/* Markdown Content - Professional Styling */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <article className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b-4 prose-h1:border-orange-500
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-gray-300
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-slate-800
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:my-6 prose-ul:space-y-2
            prose-li:text-gray-700
            prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 hover:prose-a:underline
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-12 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your {data.brand} {data.model}?</h2>
          <p className="text-lg text-orange-100 mb-6">
            Start your 30-day free trial. Zero risk, zero commitment, zero fiber cracking.
          </p>
          <a
            href="/contact"
            className="inline-block bg-slate-900 text-white px-8 py-3 text-base font-bold hover:bg-slate-800 transition-colors"
          >
            Request Free Trial →
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
```

---

## 🎨 Why This Works

### Scalability
- Write 225 markdown files (NOT 225 TSX files)
- One template component renders ALL machines
- Can use AI to assist with copy generation
- Version controlled (git tracks changes)

### Professional Quality
- Same dark blue/orange B2B styling as solution pages
- Longform flowing copy (NOT text blobs)
- Markdown renders as full-page layout
- Typography system matches proven solution pages

### Maintainability
- Markdown is simple to edit
- Template ensures consistent styling
- Frontmatter makes machine data queryable
- Easy to update pricing/features globally

### Developer Experience
- Next.js SSG (pre-renders all 225 pages at build time)
- TypeScript type safety for frontmatter
- Hot reload during development
- Fast page loads in production

---

## 📝 Writing Machine Copy (Guidelines)

### Structure (Follow This):

1. **Hero Hook** (50-100 words)
   - Address machine-specific pain point
   - "Your [Machine] handles [specs], but [problem]"
   - Blame OEM tools, not their machine

2. **Why Tech-ni-Fold** (200-300 words)
   - Machine-specific configuration
   - Which buckle plates / shaft positions
   - Color-coded system explanation
   - Speed/capacity maintenance

3. **Real Results** (150-200 words)
   - 2-3 testimonials from operators with THIS machine
   - Include company name + location
   - Specific job details (stock, speed, payback)
   - Direct quotes in "quotation marks"

4. **Technical Specifications** (100-150 words)
   - Compatible machine models
   - Shaft sizes
   - Color-coded ranges
   - Installation method

5. **What You Get** (200-300 words)
   - Starter kit breakdown
   - Upgrade options
   - Factory bundle (multi-machine)
   - Rental pricing tiers

6. **How Rental Works** (150-200 words)
   - Ratcheting subscription explanation
   - Start small, scale up
   - Cancel any time
   - Why operators keep it

7. **Installation Support** (150-200 words)
   - Pre-install consultation
   - Delivery + setup
   - 30-day trial
   - Ongoing support

8. **Next Steps** (100 words)
   - Option 1: Free trial (recommended)
   - Option 2: Book consultation
   - Option 3: Download datasheet

### Tone (B2B Professional):
- Not SAAS-y or tech startup language
- 27-year precision engineering company
- Speaks to print operators (not IT people)
- Technical but accessible
- Results-focused, not feature-focused

### Avoid:
- Generic copy (must be machine-specific)
- Marketing jargon ("game-changing", "revolutionary")
- Tiny text blobs
- Database-driven card layouts
- MDX interactive components

---

## 🚀 Implementation Plan

### Phase 1: Create Template Component (1 hour)
1. Build `/src/app/machines/[slug]/page.tsx`
2. Test with one sample markdown file
3. Verify styling matches solution pages
4. Confirm SSG works (generateStaticParams)

### Phase 2: Write Sample Machines (4 hours)
1. Heidelberg Stahl Ti52 (top seller)
2. MBO T49 (popular folder)
3. Muller Martini Pantera (binder)
4. Horizon StitchLiner (stitcher)
5. GUK FA36 (web folder)

Test each, get user feedback, refine template.

### Phase 3: Scale to Top 50 (1-2 weeks)
- Write copy for high-volume machines
- Use AI to assist with structure
- Human review for quality
- Deploy incrementally

### Phase 4: Complete Remaining 175 (Gradual)
- Write as opportunities arise
- Each new machine = new revenue opportunity
- No rush (already have top sellers)

---

## ✅ Success Criteria

A machine page is DONE when:
- [ ] Markdown file exists in `/content/machines/[slug].md`
- [ ] Frontmatter complete (machine_id, brand, model, solutions, pricing)
- [ ] Body contains 400-500 lines of longform copy
- [ ] Copy follows structure guidelines above
- [ ] Page renders with dark blue/orange styling
- [ ] SSG pre-renders page at build time
- [ ] Metadata includes machine name in title/description

---

**Remember:** This is NOT about building interactive SAAS pages. This is about scalable longform B2B catalog copy that persuades operators to try YOUR tools on THEIR machines.
