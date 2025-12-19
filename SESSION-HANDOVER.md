# Session Handover - Technifold Automation Platform

**Last Updated:** December 19, 2025
**Status:** Production-ready tiered pricing system implemented
**Latest Commits:**
- `35a6e2c` - Add tiered pricing guide to customer re-order portals
- `5bd94e8` - Add tiered pricing guide with progress visualization (invoice builder)

---

## 🎯 WHERE WE ARE NOW

### What We Just Built (This Session)

**Premium Tiered Pricing System with Visual Guides**

1. **Admin Invoice Builder** (`/admin/invoices/new`)
   - Live pricing preview with tiered discounts
   - Visual progress bars showing tier advancement
   - "Unlock next tier" callouts with savings calculations
   - Premium design (Inter font, black/white/green palette)
   - Fixed all layout jump issues
   - Product images throughout

2. **Customer Re-order Portal** (`/r/[token]`)
   - SAME tiered pricing guide as invoice builder
   - Live pricing preview API endpoint
   - Shows savings in cart bar
   - Exact same premium design for consistency
   - Encourages customers to buy more (conversion psychology)

3. **Pricing Architecture**
   - Database-driven pricing (pricing data in DB, logic in code)
   - Two tier types:
     - **Standard**: £33 products priced on TOTAL quantity across all items
     - **Premium**: Percentage discounts per SKU (Cutting Boss, etc.)
   - 5-minute caching on pricing ladder queries
   - Works in: invoice builder, re-order portal, Stripe invoices, Stripe checkout

### Design Philosophy Applied

**"Apple of Print Finishing Equipment"**
- NOT generic SaaS design
- Premium black/white/green color palette
- Inter font with optical features
- British engineering precision aesthetic
- Exact pixel sizing (not Tailwind defaults)
- Custom shadows and spacing

---

## 🏗️ SYSTEM ARCHITECTURE

### Tech Stack
- **Frontend:** Next.js 15.5.7 (App Router), React 19, Tailwind CSS
- **Backend:** Supabase PostgreSQL (service role auth)
- **Payments:** Stripe Invoices (invoice-led billing, NOT checkout)
- **Email:** Resend (transactional emails)
- **Hosting:** Vercel

### Key Files & What They Do

#### Pricing Engine
- `/src/lib/pricing-v2.ts` - Core tiered pricing logic
- `/src/app/api/admin/invoices/preview/route.ts` - Admin invoice preview
- `/src/app/api/portal/pricing-preview/route.ts` - Customer portal pricing

#### Invoice Builder (Admin)
- `/src/app/admin/invoices/new/page.tsx` - Premium invoice builder UI
- `/src/app/api/admin/products/search/route.ts` - Product autocomplete

#### Customer Portal
- `/src/app/r/[token]/page.tsx` - Re-order portal route (HMAC auth)
- `/src/components/PortalPage.tsx` - Main portal UI with pricing guide
- `/src/components/CartBar.tsx` - Cart with savings display
- `/src/components/InvoiceRequestModal.tsx` - Invoice request flow

#### Stripe Integration
- `/src/lib/stripe-client.ts` - Stripe checkout (for quotes/trials)
- `/src/lib/stripe-invoices.ts` - Stripe invoices (applies tiered pricing!)
- `/src/app/api/portal/create-invoice/route.ts` - Customer invoice creation

#### Database Schema
- `/supabase-pricing-schema.sql` - Pricing tables schema
- `/sql/migrations/*` - Other database migrations

### Database Tables (Key Ones)

**Pricing System:**
- `standard_pricing_ladder` - Fixed prices per tier (1-3 units = £33, etc.)
- `premium_pricing_ladder` - Percentage discounts (10% off, 20% off, etc.)
- `products` - Has `pricing_tier` column ('standard' or 'premium')

**Orders & Invoices:**
- `invoices` - Stripe invoice records
- `invoice_items` - Line items with tiered prices
- `company_product_history` - Unified fact table (tools + consumables)

**Companies & Contacts:**
- `companies` - Customer companies (has `stripe_customer_id`, addresses)
- `contacts` - People at companies
- `shipping_addresses` - Delivery addresses

**Portal System:**
- `tool_consumable_map` - Links tools to compatible consumables
- Companies store `portal_payload` (cached reorder data)

---

## ✅ WHAT'S WORKING

### Admin Section
✅ Invoice builder with live tiered pricing preview
✅ Product search with images
✅ Tax and shipping calculations
✅ Stripe invoice creation
✅ Company management
✅ Subscription management
✅ Products/Tools/Consumables CRUD

### Customer Portal
✅ Re-order portal with HMAC token auth
✅ Tiered pricing guide with progress bars
✅ Invoice request flow
✅ Address collection if missing
✅ Email notifications via Resend

### Pricing System
✅ Database-driven pricing (easy to update tiers)
✅ Standard tier pricing (based on total quantity)
✅ Premium tier pricing (per-SKU discounts)
✅ Applied in invoice builder
✅ Applied in re-order portal
✅ Applied in Stripe invoice creation
✅ Applied in Stripe checkout (quote flow)

### Stripe Integration
✅ Invoice-led billing (primary flow)
✅ Checkout sessions (for quotes/trials)
✅ Automatic VAT calculation (UK 20%, EU reverse charge, Export 0%)
✅ Shipping cost calculation
✅ Customer management

---

## 🚧 WHAT'S NOT DONE / NEXT STEPS

### Immediate Next Tasks

1. **Apply Premium Design to Entire Admin Section**
   - Current admin pages still have old SaaS design
   - Need to apply Inter font + black/white/green palette
   - Pages to update: Companies, Products, Subscriptions, etc.

2. **Quote Builder System** (Strategic Opportunity)
   - Current flow: Static invoices → customer pays
   - Better flow: Tokenized quotes → customer adjusts quantities → sees live savings → bigger orders!
   - Would increase conversion and average order value

3. **Image Management in CRM**
   - Products have `image_url` but no upload UI in admin
   - Need image upload/management for product CRUD

4. **Frontend Application** (Not Started)
   - Current frontend is basic marketing site
   - User said "we will apply this to the front end in the future"
   - Premium design ready to extend to public site

### Strategic Considerations

**Invoices vs Quotes:**
- Current: Admin creates invoice → sends to customer → customer pays
- Opportunity: Admin sends quote → customer adjusts quantities (sees tiered savings) → requests invoice → bigger order!
- This would leverage the pricing guide for conversion

**Design Consistency:**
- Invoice builder + re-order portal = DONE ✅
- Rest of admin section = Still old design 🚧
- Frontend = Basic marketing site 🚧

---

## ⚙️ SETUP FOR NEXT SESSION

### Environment Variables Needed

Create `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ SECRET - for server-side only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...  # ⚠️ SECRET
STRIPE_WEBHOOK_SECRET=whsec_...  # ⚠️ SECRET

# Resend (Email)
RESEND_API_KEY=re_...  # ⚠️ SECRET

# HMAC Token Secret
HMAC_SECRET=your-random-secret-here  # ⚠️ SECRET - for portal tokens

# Admin Authentication (Basic)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password  # ⚠️ SECRET

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Setup

**You said you'll re-upload the entire schema**, but here's what you'll need:

1. Run `/supabase-pricing-schema.sql` - Creates pricing tables
2. Run migrations in `/sql/migrations/` - Other features
3. Ensure these functions exist:
   - `calculate_shipping_cost(country_code, subtotal)` - Returns shipping cost
   - Triggers for `company_product_history` fact table

### Key Schema Requirements

**Products table must have:**
- `pricing_tier` column ('standard' | 'premium' | null)
- `cost_price` column (for margin calculations)
- `image_url` column (for product images)
- `is_marketable` column (prevents non-public products in checkout)

**Companies table must have:**
- Billing address fields (`billing_address_line_1`, `billing_country`, etc.)
- `vat_number` field (for EU reverse charge)
- `stripe_customer_id` field

**Shipping addresses table:**
- Separate from billing address
- Has `is_default` flag

---

## 🎨 DESIGN SYSTEM

### Colors (Premium Palette)
```css
--black: #0a0a0a        /* Primary text, precision */
--white: #fafafa        /* Background, crisp */
--green: #16a34a        /* Savings, value, success */
--gray-50: #f9fafb      /* Subtle backgrounds */
--gray-100: #f5f5f5     /* Input backgrounds */
--gray-200: #e8e8e8     /* Borders */
--gray-600: #666        /* Secondary text */
--gray-900: #999        /* Disabled text */
```

### Typography
```css
Font: Inter (Google Fonts)
Weights: 300, 400, 500, 600, 700, 800
Features: 'cv02', 'cv03', 'cv04', 'cv11' (optical features)
Letter spacing: -0.011em
Antialiasing: -webkit-font-smoothing, -moz-osx-font-smoothing
```

### Spacing & Sizing
- Border radius: 20px (cards), 12px (callouts), 6px (badges)
- Shadows: `0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)`
- Exact pixel values (not Tailwind defaults)

---

## 📊 PRICING TIERS (Current Configuration)

### Standard Products (Creasing Matrix, etc.)
Based on TOTAL quantity across ALL standard products in cart:

| Tier | Units | Price per Unit |
|------|-------|----------------|
| 1    | 1-3   | £33.00         |
| 2    | 4-7   | £29.00         |
| 3    | 8-11  | £25.00         |
| 4    | 12-19 | £21.00         |
| 5    | 20+   | £17.00         |

### Premium Products (Cutting Boss, MPB, Knife)
Based on quantity of EACH individual SKU:

| Quantity | Discount |
|----------|----------|
| 1        | 0%       |
| 2-3      | 10%      |
| 4-5      | 15%      |
| 6+       | 20%      |

**To update pricing:** Edit `standard_pricing_ladder` and `premium_pricing_ladder` tables in Supabase.

---

## 🔐 AUTHENTICATION & SECURITY

### Admin Section
- Basic HTTP auth (username/password in `.env.local`)
- Middleware at `/src/lib/admin-auth.ts`
- All admin API routes verify auth

### Customer Portal
- HMAC-signed tokens (stateless, no database lookup)
- Token contains: `company_id`, `contact_id`, `exp` (expiry)
- Generated in admin, sent via email
- Library: `/src/lib/tokens.ts`

### API Routes
- Admin routes: Use `verifyAdminAuth(request)`
- Portal routes: Use `verifyToken(token)`
- Supabase: Use service role key (bypasses RLS)

---

## 🐛 KNOWN ISSUES & GOTCHAS

### None Currently! 🎉

Previous issues (ALL FIXED):
- ✅ Layout jump on quantity change - FIXED with min-height containers
- ✅ Dropdown z-index - FIXED with z-[200] for product, z-[100] for company
- ✅ Images missing in product search - FIXED by adding `image_url` to API
- ✅ Generic SaaS design - FIXED with premium custom design

---

## 💡 IMPORTANT NOTES

### Things NOT to Do

❌ **Don't use generic SaaS design** - You explicitly requested premium, industry-leading design
❌ **Don't use default Tailwind colors** - Use the custom black/white/green palette
❌ **Don't use system fonts** - Always use Inter with optical features
❌ **Don't break pricing logic** - UI changes are safe, but don't touch pricing calculations

### Things TO Do

✅ **Separation of concerns** - Logic (pricing, tax) vs Presentation (UI, styling)
✅ **Premium aesthetic** - British engineering precision, not startup SaaS
✅ **Conversion psychology** - Use visual cues (progress bars, savings) to drive behavior
✅ **Consistency** - Same design language across admin + portal + (future) frontend

---

## 📈 CONVERSION PSYCHOLOGY IMPLEMENTATION

The tiered pricing guide uses these techniques:

1. **Progress Bars** - Visual feedback on tier advancement (gamification)
2. **Unlock Callouts** - "Add 3 more units to unlock Tier 3!"
3. **Savings Display** - Shows exact £ amount saved
4. **Transparency** - All tiers visible, builds trust
5. **Urgency** - "Just 2 more units!" creates FOMO

This is working in:
- ✅ Admin invoice builder (admins see what customer will see)
- ✅ Re-order portal (customers see savings, encouraged to buy more)

---

## 🚀 DEPLOYMENT

### Current Setup
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Resend
- **Domain:** (You'll configure this)

### Build Command
```bash
npm run build
```

### Start Dev Server
```bash
npm run dev
```

Runs on `http://localhost:3000`

---

## 📝 FOR YOUR NEXT SESSION

### What to Load First
1. ✅ Set up `.env.local` with all secrets
2. ✅ Re-upload database schema to Supabase
3. ✅ Test invoice builder at `/admin/invoices/new`
4. ✅ Test re-order portal (generate token in admin)
5. ✅ Verify pricing calculations are working

### What to Build Next (Your Call)
- **Option A:** Apply premium design to rest of admin section
- **Option B:** Build quote system (tokenized quotes with quantity adjustment)
- **Option C:** Add image management to product CRUD
- **Option D:** Extend premium design to frontend marketing site

### Questions to Consider
- Do we want quotes or invoices? (Quotes = better conversion)
- Should customers adjust quantities in portal? (Currently yes, via cart)
- What other admin pages need the premium redesign?

---

## 🎯 SUCCESS METRICS

### What We Achieved This Session

1. ✅ Complete tiered pricing system (database-driven)
2. ✅ Visual pricing guides (invoice builder + portal)
3. ✅ Premium "Apple of print finishing" design
4. ✅ Conversion psychology implementation
5. ✅ Consistent design across admin + customer portal
6. ✅ All bugs fixed (layout jumps, z-index, images)
7. ✅ Live pricing preview in both contexts

### What This Enables

- **For Admins:** See exactly what customer will pay (with discounts)
- **For Customers:** Encouraged to buy more via visual tier progression
- **For Business:** Higher average order values through transparent pricing
- **For Brand:** Industry-leading premium aesthetic that differentiates from competitors

---

**Ready to continue building! 🚀**

This platform is production-ready for tiered pricing. Next step is your choice - keep refining, or expand to new features.
