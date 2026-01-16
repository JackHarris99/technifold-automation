# Current Work: Distributor Portal Development

## Status: Distributor Portal Phase - Login System Next

### What's Complete

✅ **Distributor Portal - Fully Built**
- Portal accessible at `/distributor/login` and `/distributor`
- Beautiful UI matching reorder portals aesthetic
- Products organized by type (Tools/Consumables) and categories
- Shopping cart and order placement functionality
- Creates Stripe invoices on order (invoice-led system)
- Address management (billing + shipping)
- Recent orders/invoices display
- Search with dropdown results
- Product images and pricing

✅ **Distributor Pricing System**
- Column-based structure: `distributor_pricing` table with `standard_price` column
- ~1,300 products with pricing set
- Products filtered by `show_in_distributor_portal` flag in products table
- Admin UI at `/admin/distributor-pricing` for managing prices
- Tier pricing ready (currently 'standard', can add 'gold' later)
- Companies have `pricing_tier` field (default: 'standard')

✅ **Home Page Integration**
- "Distributor Login" button added to marketing header
- Links to `/distributor/login`

### Database Schema (Relevant Tables)

**companies table:**
- `company_id` (TEXT, primary key)
- `company_name` (TEXT)
- `distributor_email` (TEXT) - login email for portal
- `distributor_password` (TEXT) - hashed password
- `pricing_tier` (TEXT) - 'standard', 'gold', etc.
- `type` (TEXT) - 'customer', 'distributor', etc.
- Billing address fields
- `stripe_customer_id` (TEXT)

**distributor_pricing table:**
- `product_code` (TEXT, unique)
- `standard_price` (DECIMAL)
- `currency` (TEXT, default 'GBP')
- `active` (BOOLEAN)

**products table:**
- `product_code` (TEXT, primary key)
- `description`, `price`, `type`, `category`, etc.
- `show_in_distributor_portal` (BOOLEAN) - controls visibility

### Authentication System

**Current Implementation:**
- Login endpoint: `/api/distributor/auth/login` (POST)
- Credentials stored in `companies` table
- Password hashing: bcrypt via `crypt()` function
- Session management: HMAC tokens (similar to reorder portals)
- Auth helper: `getCurrentDistributor()` in `/src/lib/distributorAuth.ts`

**Current Login Process:**
1. Distributor enters email + password at `/distributor/login`
2. System checks `companies.distributor_email` and `distributor_password`
3. Creates HMAC token with company_id
4. Redirects to `/distributor` (portal dashboard)

---

## 🎯 NEXT PRIORITY: Distributor Login Management

### The Problem

Currently, distributor logins are manually set in the database. There's no admin UI or self-service system for creating/managing these logins.

### User Requirements (from conversation)

1. **Create logins for all distributors**
   - User is **open to options**: by company OR by individual user
   - Current system is by company (one login per company)
   - Could be expanded to individual users within a company

2. **View all reorder portals without logging in**
   - User wants to see everyone's reorder portal
   - NO sensitive data concern (invoice-led, Stripe handles payment)
   - Current reorder portals use HMAC token authentication
   - Reorder portal at: `/portal/[token]`

### Options to Present

**A) Admin UI for Company-Based Logins (Quick, matches current system)**
- Page at `/admin/distributors`
- List all distributor companies
- "Set Login" button → generates temporary password
- Email credentials to distributor
- Reset password functionality
- Pros: Simple, matches current architecture
- Cons: One login per company (shared credentials)

**B) Multi-User System (More robust)**
- Create `distributor_users` table
- Multiple users per company
- Each user has own email/password
- User roles: admin, viewer, orderer, etc.
- Pros: Better security, audit trail
- Cons: More complex, migration needed

**C) Invitation System (Self-service)**
- You invite distributors via email
- They receive one-time link to set password
- No need to manually create passwords
- Pros: Professional, self-service
- Cons: Requires email integration

**D) SSO/OAuth Integration**
- Login with Google, Microsoft, etc.
- No password management needed
- Pros: Most secure, easiest for users
- Cons: Significant development effort

### Reorder Portal Viewing

**Current State:**
- Reorder portals at `/portal/[token]`
- Token is HMAC signed with company_id + timestamp
- No login required (token-based access)

**To Add Admin Access:**
- Create `/admin/reorder-portals` page
- List all companies with reorder portal access
- "View Portal" button → generates admin token or direct view
- No sensitive data, so showing orders is fine

### Files to Check/Modify

**For Login Management:**
- `/src/app/admin/distributors/` (new directory)
- `/src/components/admin/DistributorLoginManagement.tsx` (new)
- `/src/app/api/admin/distributors/create-login/route.ts` (new)
- `/src/app/api/admin/distributors/reset-password/route.ts` (new)

**For Reorder Portal Viewing:**
- `/src/app/admin/reorder-portals/` (new directory)
- Query: `SELECT * FROM companies WHERE portal_payload IS NOT NULL`

**Authentication Libraries:**
- `/src/lib/distributorAuth.ts` (existing)
- `/src/lib/hmac.ts` (existing, for tokens)

---

## CSV Files in Project (Keep for reference)

- `DISTRIBUTOR PRICING 5.csv` - Latest bulk pricing update
- `distributor pricing 2.csv` - Previous bulk update
- `distibutor pricing 3 standard.csv` - Standard tier pricing
- `distributor pricing 4 standard.csv` - More standard tier pricing
- `standard distributor pricing file.csv` - Original pricing export

These were used to populate `distributor_pricing` table. SQL import files were already executed and removed.

---

## Key Architecture Notes

### Pricing Flow
1. Portal loads: checks company's `pricing_tier`
2. Fetches from `distributor_pricing` WHERE `active = true`
3. For each product:
   - If `standard_price` exists: use it
   - Else: fallback to `products.price`
4. Filter products: `show_in_distributor_portal = true`
5. Custom catalogs: If company has entries in `company_product_catalog`, show ONLY those products

### Order Flow
1. Distributor adds items to cart
2. Selects shipping address
3. Clicks "Place Order"
4. API creates Stripe invoice:
   - Creates/updates Stripe customer
   - Adds line items with product codes in metadata
   - Calculates shipping + VAT
   - Finalizes and sends invoice via Stripe
5. Stores in `invoices` and `invoice_items` tables
6. Stripe webhook updates payment status when paid

### No Customer Pricing Overlap
- Distributor pricing is **completely isolated** from customer pricing
- Customer pricing tables: `customer_pricing_overrides`, `standard_pricing_ladder`, `premium_pricing_ladder`
- Distributor pricing table: `distributor_pricing`
- No shared logic - totally separate code paths

---

## Quick Start Commands

```bash
# Development server
npm run dev

# Access portals
http://localhost:3000 - Home page
http://localhost:3000/distributor/login - Distributor login
http://localhost:3000/admin - Admin panel
http://localhost:3000/admin/distributor-pricing - Pricing management

# Database
# Connect to Supabase via .env.local credentials
# SQL Editor: https://supabase.com/dashboard/project/pziahtfkagyykelkxmah/sql

# Migrations located in: /supabase/migrations/
```

---

## Questions for User (Next Session)

1. **Login Approach:** Company-based (current) or multi-user system?
2. **Password Management:** Manual admin creation, invitation system, or self-service?
3. **Reorder Portal Access:** Should admin be able to view all portals? (User said yes, no sensitive data)
4. **Email Integration:** Do you have email sending set up? (Needed for invitations/password resets)

---

## Recent Commits

- `5562e51` - Add Distributor Login button to home page header
- `ec32e3d` - Restructure distributor pricing to use columns instead of rows
- `b0c0fe5` - Add navigation links for Distributor Pricing and Product Catalogs to Sales Center
- `66a135f` - Add company-specific product catalogs for distributor portal

All work is committed and pushed to GitHub main branch.
