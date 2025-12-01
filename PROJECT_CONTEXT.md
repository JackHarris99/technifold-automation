# Technifold Automation Platform - Project Context

**READ THIS FIRST when starting any new Claude Code session!**

---

## 🎯 What Is This Project?

**You are NOT building a website. You are transforming Technifold into a recurring revenue platform.**

### The Business Transformation

**OLD MODEL:**
- Selling individual tools, one at a time
- Reactive sales, manual quoting
- Tiny market penetration
- Low automation, no cross-machine view

**NEW MODEL:**
- **Automated print-finishing capability platform**
- Maps every folding machine, binder, stitcher globally
- Generates machine-specific proposals automatically
- **Rental-first bundles** (£159-£990/mo per factory)
- Ratcheting subscriptions (can only add, never downgrade)
- Becomes the industry's "operating system" for inline finishing

**This is a 27-year-old precision engineering company, NOT a SAAS startup.**

---

## 💰 The Business Model (Why This Matters)

### What You're Selling:
**Not tools. Finishing capability.**

- **Machine bundles:** £159-£199/mo per folder
- **Binder bundles:** £80-£120/mo
- **Stitcher bundles:** £40-£70/mo
- **Factory bundles:** £450-£990/mo (multiple machines)

### The Funnel:
1. **Machine-specific landing page** → Persuasive longform copy about THAT machine
2. **Tokenized link** (/x/, /m/, /r/, /q/) → Tracks exactly who clicked, what machine they have
3. **Free trial** → All tools for 30 days, zero risk
4. **Ratcheting subscription** → £159 → £239 → £450 (can only add, never downgrade)
5. **Consumables** → Recurring revenue on top of subscriptions
6. **Factory proposal** → "Here's how to upgrade ALL 6 machines in your shop"

### Why It's Unstoppable:
- **27 years of compatibility knowledge** = moat competitors can't cross
- **Operational integration** = once installed, returning tools feels insane
- **Compounding MRR** = every machine added, every upgrade, every factory
- **No one else does this** = you own the category

### Revenue Projections:
- **Year 1:** £30k-£80k MRR
- **Year 2:** £100k-£200k MRR
- **Year 3:** £200k-£400k MRR
- **Year 4-5:** £400k-£1M+ MRR (with marketplace + OS layer)

---

## 🔑 Key Technical Concepts

### 1. Token System (CRITICAL TO UNDERSTAND)

Every contact has a unique HMAC-signed token (72h TTL). When we send emails, we combine company_id + contact_id into a token URL.

**Token Routes:**
- `/x/[token]` - **Marketing** offers (campaigns, promotions)
- `/m/[token]` - **Marketing** follow-up (lead nurture)
- `/r/[token]` - **Reorder** portal (consumable reminders)
- `/q/[token]` - **Quote** viewer (custom pricing)
- `/o/[token]` - **Order** tracking (order status)
- `/i/[token]` - **Invoice** viewer (paid invoices)
- `/i/[token]` - **Invoice** viewer (paid invoices)

**Why?** We know exactly who clicked what, when, and what they looked at. All tracked in `engagement_events` table.

**Token Format:** `{company_id}:{contact_id}:{hmac_signature}:{expires_timestamp}`

### 2. Ratcheting Subscriptions

**Key Rules:**
- No term (evergreen)
- Minimum monthly payment locked
- Additions cannot be downgraded
- Only full cancellation allowed
- Tools returned = subscription ends
- Mid-term additions protected with 60-90 days minimum billing

**Why This Works:**
- Super flexible for customers (cancel any time)
- Super sticky for retention (operational integration)
- Super profitable (compounding MRR)
- Simple for reps (no complex negotiations)
- Predictable recurring revenue

### 3. Marketing Architecture (CRITICAL - CHANGED APPROACH)

**❌ ABANDONED APPROACH (Caused Problems):**
- JSONB problem/solution blocks in database
- MDX components (looked SAAS-y, not professional)
- Database-driven "problem cards" (created awful text blobs)

**✅ CURRENT APPROACH (Proven to Work):**

**Solution Pages (10 products):**
- Manual longform TSX files (400-500 lines each)
- Tri-Creaser, Quad-Creaser, Multi-Tool, etc.
- Dark blue/orange B2B catalog styling
- Professional, persuasive, flowing copy
- **These are DONE and PERFECT. Don't touch them.**
- Located in: `/src/app/tools/[solution]/page.tsx`

**Machine Pages (225 machines):**
- **Markdown files + Template system** (scalable approach)
- Each machine gets a markdown file: `/content/machines/heidelberg-stahl-ti52.md`
- Frontmatter contains: machine_id, brand, model, solutions, ROI metrics
- Body contains: Longform persuasive copy (400-500 lines)
- Template renders markdown as full-page professional layout
- **Same dark blue/orange styling as solution pages**
- **NOT tiny text blobs. FULL longform pages.**

**Why Markdown + Template:**
- Scalable (write 225 markdown files, not 225 TSX files)
- Consistent styling (template ensures uniform look)
- Easy to edit (markdown is simple)
- Version control friendly (git tracks changes)
- Can use AI to assist with copy generation
- Still produces longform, flowing, professional pages

---

## 📊 Database Schema (Supabase)

### Core Tables (ACTIVELY USED)

**Customer/CRM:**
- `companies` (2,851 rows) - Customer records
- `contacts` (4,020 rows) - Contact records with tokens
- `company_machine` - Machine ownership tracking
- `users` (4 rows) - Sales team users

**Products & Catalog:**
- `products` (1,603 rows) - Product catalog
- `machines` (225 rows) - Machine catalog
- `tool_consumable_map` (1,503 rows) - Tool → consumable compatibility
- `tool_brand_compatibility` (388 rows) - Tool → brand/shaft compatibility

**E-commerce:**
- `orders` - New order system (Stripe-driven)
- `order_items` - Order line items
- **`orders_legacy`** (28,862 rows) - Old order system (IGNORE unless asked)
- **`order_items_legacy`** (94,692 rows) - Old line items (IGNORE unless asked)

**Subscriptions & Rentals:** ✅ NEW
- `subscriptions` - Tool rental subscriptions with ratcheting pricing
- `subscription_events` - Audit trail for subscription changes
- `shipping_manifests` - International shipment tracking with customs declarations

**Tracking & Jobs:**
- `engagement_events` - Customer interaction tracking (tokenized link clicks)
- `outbox` - Async job queue (email sending, Zoho sync)

**Content:**
- `content_blocks` (139 rows) - CMS content blocks
- `brand_media` (3 rows) - Brand logos/hero images

**Unused/Empty Tables (IGNORE THESE):**
- ~~`solutions`~~ (empty - abandoned approach)
- ~~`problems`~~ (empty - abandoned approach)
- ~~`solution_problem`~~ (empty - abandoned approach)
- ~~`machine_solution_problem`~~ (empty - abandoned approach)
- `rental_agreements` (0 rows) - Webhooks work but no UI
- `shipping_addresses` (0 rows) - Captured but no CRUD
- `problem_solution_blocks` (0 rows) - Unused

---

## 🗺️ Site Architecture

### Public Routes (Customer-Facing)

```
/                              - Homepage with machine finder
/machines/[slug]               - 225 SEO-optimized machine landing pages
                                 (shows longform persuasive copy about THAT machine)
                                 (NOT problem cards - full page copy)
/solutions                     - Solution finder (brand → shaft → solutions)
/products                      - Product catalog
/tools/[category]              - Tool category pages (SSG)
/tools/tri-creaser             - Individual solution pages (10 products) ✅ DONE
/contact                       - Lead capture form
/datasheet/[product_code]      - Technical datasheets
```

### Token Routes (Personalized Portals)

```
/x/[token]                     - CANONICAL tokenized offer page
                                 - Decodes token → company_id + contact_id
                                 - Shows machine-specific offer
                                 - Compatible solutions for THEIR machine
                                 - Special pricing
                                 - "Book free trial" CTA
                                 - Tracks engagement with UTM parameters

/m/[token]                     - Marketing link (same as /x/)
/r/[token]                     - Reorder reminder link
/q/[token]                     - Quote link
```

### Admin Routes (Internal Sales Team)

```
/admin                         - Main dashboard (company list + quick actions)
/admin/company/[id]            - UNIFIED company console with 8 tabs:
                                 1. Overview
                                 2. Marketing Builder - Build personalized campaigns
                                 3. Reorder
                                 4. Contacts
                                 5. History
                                 6. Engagement (timeline + next best actions)
                                 7. Settings
                                 8. SKU Explorer

/admin/pipeline                - Sales pipeline view
/admin/prospects               - Machine ownership tracking
/admin/subscriptions           - Subscription management (rentals) ✅ NEW
/admin/subscriptions/create    - Create new subscription
/admin/subscriptions/[id]      - Manage individual subscription
/admin/quote-builder-v2        - Create quotes (ACTIVE version)
/admin/orders                  - Orders list
/admin/campaigns               - Campaign CRUD + analytics
/admin/engagements             - Engagement dashboard
/admin/sku-explorer            - Search/edit SKUs globally
/admin/ms-problem-editor       - Edit marketing copy (may be deprecated)
/admin/brand-media             - Upload logos/hero images
/admin/content-blocks          - CMS content blocks
/admin/system-check            - No-code testing panel (CRITICAL for QA)
```

### ~~Removed Routes (Cleanup Complete)~~

```
✅ /admin/login                - Removed (use /login only)
✅ /admin/dashboard            - Removed (use /admin only)
✅ /admin/quote-builder        - Removed (use quote-builder-v2)
✅ /admin/quote-generator      - Removed (unclear purpose)
```

---

## 🔧 Key Integrations

### Stripe (COMPLETE)
- Checkout sessions → orders
- Webhooks handle: checkout complete, payment, refunds, invoices, subscriptions
- Test keys active in `.env.local`
- Multi-currency (11 countries), automatic tax
- **Ratcheting subscription logic** - needs implementation

### Resend (CONFIGURED!)
- API key: `re_M4v9mvtk_KpdWycWUp6jhxvj33ZdkBVTb`
- **Missing:** `RESEND_FROM_EMAIL` env var
- Sends: order confirmations, campaign emails, quote emails, reorder reminders

### Supabase (COMPLETE)
- PostgreSQL database
- Service role key for admin operations
- RLS policies for security

### Zoho Books (OPTIONAL - Not Configured)
- Webhook handler exists
- Outbox job for order sync
- Not required for launch

---

## 🚨 Current Status & Next Steps

### ✅ What Works (Don't Touch)
- Solution pages (10 longform TSX pages) ✅ PERFECT
- Token generation/validation
- Engagement tracking
- Stripe checkout (card + BACS Direct Debit)
- **Subscription system** ✅ NEW
  - Create/manage subscriptions
  - Ratcheting pricing (price only increases)
  - Trial periods
  - Tool assignment
  - Activity logging
- Customs & international shipping schema
- Admin console (CRM, pipeline, quotes, subscriptions)
- Outbox job queue

### ⚠️ What Needs Work
1. **Machine pages** - Need markdown + template system (225 machines)
2. **Token page content** - Simplify /x/[token] (show machine-specific offer)
3. **Test core backend** - Verify checkout, webhooks, email sending
4. **Add RESEND_FROM_EMAIL** - Missing env var

### ❌ What to Ignore
- Empty marketing tables (solutions, problems, etc.) - abandoned approach
- Legacy orders (28k rows) - keep for reference but ignore
- JSONB/MDX approaches - proven to not work

---

## 📋 Immediate Action Plan

### PHASE 1: Test Core Backend (THIS WEEK)
Focus: Does the money-making engine work?

- [ ] Test Stripe checkout end-to-end
- [ ] Test token generation/validation
- [ ] Test quote builder workflow
- [ ] Test email sending (Resend)
- [ ] Verify webhook creates orders correctly
- [ ] Check engagement tracking

**If ANY fail, fix them. Ignore marketing until core works.**

### PHASE 2: Build Machine Page System (NEXT WEEK)
- [ ] Create `/content/machines/` directory
- [ ] Write 5 sample machine markdown files (top sellers)
- [ ] Build template component to render them
- [ ] Test on localhost:3001
- [ ] Get user feedback

### PHASE 3: Scale Marketing (GRADUAL)
- [ ] Write copy for top 50 machines (high volume)
- [ ] Use AI to assist with copy generation
- [ ] Add remaining 175 machines over time
- [ ] Each new machine = new revenue opportunity

---

## 📝 Common Commands

```bash
# Start dev server
npm run dev              # Runs on port 3001

# Check environment
cat .env.local           # View current config

# Deploy
vercel --prod            # Deploy to production
```

---

## 🎓 Architecture Principles

### Why Tokenized Links?
- Eliminates need for user accounts/passwords
- Precise tracking (who clicked what, when)
- Time-limited access (72h TTL)
- Works with email forwarding (doesn't break)

### Why Ratcheting Subscriptions?
- Flexible for customers (cancel any time = psychological safety)
- Sticky for retention (operational integration)
- Profitable (compounding MRR)
- Simple for reps (no complex negotiations)

### Why Markdown + Template for Machine Pages?
- Scalable (225 machines = 225 markdown files)
- Consistent styling (template ensures uniform look)
- Easy to edit (markdown is simple, version controlled)
- Can use AI to assist with copy generation
- Still produces longform, professional, B2B pages (NOT SAAS-y)

### Why NOT Database-Driven Cards?
- Created awful tiny text blobs
- Didn't flow as persuasive copy
- Looked unprofessional
- Limited Claude's ability to write compelling longform copy
- Abandoned this approach

---

## 🆘 Emergency Contacts

**Database:** Supabase Dashboard - https://supabase.com/dashboard/project/pziahtfkagyykelkxmah
**Hosting:** Vercel Dashboard
**Stripe:** Dashboard - Test mode active
**Admin Access:** Username: any, Password: `Technifold`

---

## 📚 Tech Stack Reference

- **Next.js 15.5.2** - App Router with Turbopack
- **React 19.1.0** - Server components
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling (dark blue/orange B2B theme)
- **Supabase** - PostgreSQL + Auth
- **Stripe** - Payments + Subscriptions
- **Resend** - Emails
- **Vercel** - Hosting + Cron
- **React Markdown** - Markdown rendering for machine pages

---

## 🏁 Remember

**This is a 27-year-old precision engineering company building a recurring revenue platform.**

**NOT:**
- A SAAS startup
- A tech company
- A website redesign

**YES:**
- A business transformation
- An industry operating system
- A recurring revenue engine
- A compatibility graph
- A rental-first platform

**The vision is brilliant. The backend is solid. The solution pages are perfect. Now we need to test the core, then scale the machine pages.**

---

**Last Updated:** December 1, 2025
**Completion:** 85-90%
**Next Milestone:** Test core backend functionality
