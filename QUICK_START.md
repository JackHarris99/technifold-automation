# Quick Start for New Claude Code Sessions

**Copy/paste this prompt when starting a new session:**

---

## 📋 New Session Prompt Template

```
I'm working on the Technifold Automation Platform. Before we start:

1. Read /mnt/c/Users/User/Projects/technifold-automation/PROJECT_CONTEXT.md
2. This is a B2B e-commerce platform for print finishing equipment
3. Key concepts:
   - Token routes: /x/ (marketing), /r/ (reorder), /q/ (quotations)
   - Each contact has a unique HMAC token for tracking
   - Copy renders from machine_solution_problem table with fallback chain
   - 28k legacy orders in orders_legacy table (ignore unless asked)
   - Marketing tables (solutions, problems, solution_problem) need population

Current dev server: http://localhost:3001

What would you like to work on?
```

---

## 🎯 Common Tasks & Quick Commands

### Start Development
```bash
npm run dev  # Runs on port 3001
```

### Check Database Schema
```bash
node explore-schema.js  # Shows all tables and row counts
```

### Test Key Routes
```
Homepage:           http://localhost:3001
Machine page:       http://localhost:3001/machines/heidelberg-stahl-ti52
Solution finder:    http://localhost:3001/solutions
Admin dashboard:    http://localhost:3001/admin
Admin login:        http://localhost:3001/login (password: Technifold)
Company console:    http://localhost:3001/admin/company/[company_id]
```

### Key Files to Know
```
PROJECT_CONTEXT.md        - Full project explanation (READ FIRST!)
CLEANUP_PLAN.md           - Steps to remove bloat
.env.local                - Environment variables
src/app/x/[token]/page.tsx - MAIN token route (marketing offers)
src/app/machines/[slug]/page.tsx - Machine landing pages
src/app/admin/company/[company_id]/page.tsx - Company console
```

---

## 🚨 Common Issues & Solutions

### Issue: Copy Not Rendering on Machine Pages
**Cause:** Marketing tables (machine_solution_problem) are empty
**Fix:** See CLEANUP_PLAN.md Phase 4 - Populate Marketing Tables

### Issue: Dev Server on Wrong Port
**Cause:** Old process on port 3000
**Fix:** Server auto-switches to 3001, use that

### Issue: Token Route Not Working
**Cause:** Token expired (72h TTL) or invalid format
**Fix:** Generate new token via admin Marketing Builder

### Issue: Email Not Sending
**Cause:** RESEND_FROM_EMAIL not set
**Fix:** Add to .env.local: `RESEND_FROM_EMAIL=sales@technifold.com`

---

## 📊 Database Quick Reference

### Core Tables (Use These)
- **companies** (2,851) - Customer records
- **contacts** (4,020) - Contact records with tokens
- **machines** (225) - Machine catalog
- **products** (1,603) - Product catalog
- **tool_brand_compatibility** (388) - Machine → solution mapping

### Marketing Tables (Need Data!)
- **solutions** (0) - Technifold solutions
- **problems** (0) - Machine problems
- **solution_problem** (0) - Base marketing copy
- **machine_solution_problem** (0) - Machine-specific copy + curated SKUs

### Legacy (Ignore Unless Asked)
- **orders_legacy** (28,862) - Old order system
- **order_items_legacy** (94,692) - Old line items

---

## 🔧 Environment Variables

```bash
# Supabase (Database)
SUPABASE_URL=https://pziahtfkagyykelkxmah.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[key in .env.local]

# Stripe (Payments - TEST MODE)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (Email)
RESEND_API_KEY=re_M4v9mvtk_...
RESEND_FROM_EMAIL=sales@technifold.com  # ← ADD THIS IF MISSING

# Security
TOKEN_HMAC_SECRET=[secret in .env.local]
ADMIN_SECRET=Technifold

# Base URL
NEXT_PUBLIC_BASE_URL=https://technifold-automation.vercel.app
```

---

## 🎓 Project Architecture Principles

### 1. Token System = Precise Tracking
Every link knows exactly who clicked it and when. Format: `{company_id}:{contact_id}:{signature}:{expires}`

### 2. Copy Fallback Chain = Gradual Population
Start with base copy (solution_problem), override for specific machines (machine_solution_problem), synthesize if missing.

### 3. Territory Permissions = Sales Rep Isolation
Sales reps see only their accounts. Directors see all. Color-coded UI (green=mine, gray=others).

### 4. Outbox Pattern = Reliable Async Jobs
Email sending, Zoho sync, etc. uses job queue with retry logic. Cron runs every minute.

### 5. ONE Card Per Problem = Clarity
Don't group problems. Show one problem card per problem. Setup guide appears once at bottom.

---

## 📝 Cleanup Status

**Completed:**
- ✅ PROJECT_CONTEXT.md created
- ✅ CLEANUP_PLAN.md created
- ✅ Schema exploration complete

**TODO (See CLEANUP_PLAN.md):**
- [ ] Delete duplicate route files
- [ ] Populate marketing tables
- [ ] Add RESEND_FROM_EMAIL to .env.local
- [ ] Create middleware redirects
- [ ] Namespace legacy orders

---

## 🆘 Emergency Recovery

If something breaks:

1. **Check dev server logs** - Look for TypeScript errors
2. **Check Supabase logs** - Dashboard → Logs → API
3. **Check Vercel logs** - Dashboard → Deployments → Logs
4. **Roll back** - `git reset --hard HEAD~1` (if recent commit broke it)
5. **Fresh start** - `rm -rf .next && npm run dev`

---

**Remember:** Always read PROJECT_CONTEXT.md first! It has everything you need to understand this project.
