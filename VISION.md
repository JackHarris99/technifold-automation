# Technifold Automation - Vision & Strategy

## 🎯 The Big Picture

**Transform Technifold from a traditional manufacturing supplier into a modern subscription-based finishing solutions company.**

---

## The Problem We're Solving

### For Technifold (The Business)
❌ **Before:**
- Manual quoting process (hours per customer)
- Order processing bottlenecks
- Inconsistent customer communication
- No automated reorder system
- Limited customer lifetime value tracking
- Product-first messaging (confusing SKUs like "QC-MU-PA-FP-6-01")

✅ **After:**
- Automated subscription onboarding
- Self-service reorder portals
- Email automation for retention
- RFM-based customer segmentation
- Machine-centric capability marketing
- Predictable recurring revenue

### For Customers (Print Shops)
❌ **Before:**
- Don't know which products fit their machine
- Complex product codes
- Ordering requires phone calls or emails
- Forget when to reorder consumables
- Trial barriers (upfront cost)

✅ **After:**
- Find solutions by machine type (e.g., "Heidelberg Stahlfolder Ti52")
- Clear capability-based pricing (£99/month = full inline capability)
- One-click reorder via personalized link
- Email reminders when consumables run low
- Risk-free 30-day trials

---

## Strategic Model Shift (Dec 2025)

### OLD MODEL: Product-Code Marketing
```
"You need a QC-MU-PA-FP-6-01"
↓
Customer thinks: "What the hell is that?"
```

### NEW MODEL: Machine-Centric Capability Marketing
```
"Eliminate fiber cracking on your Heidelberg Stahlfolder"
↓
Customer thinks: "I have that machine, tell me more"
↓
"Full inline creasing capability: £99/month"
↓
Customer thinks: "That's clear, let me try it"
```

**Key Insight:** "Stripe doesn't care about product codes. Sell the outcome."

---

## Revenue Model Evolution

### Phase 1: Traditional Sales (Pre-2025)
- One-time product sales
- Manual quote → invoice → payment
- No subscription model
- Limited customer retention tracking

### Phase 2: Subscription-First (Current)
- **Primary**: Monthly subscriptions (£69/£89/£99/month)
- **Secondary**: Consumable reorders (automated)
- **Tertiary**: One-off product sales (via quote builder)

### Revenue Streams

#### 1. Subscriptions (Growth Engine)
**Pricing Tiers:**
- £69/month - Saddle Stitchers (basic capability)
- £89/month - Perfect Binders (mid capability)
- £99/month - Folding Machines (full capability)

**Why This Works:**
- Predictable revenue (MRR)
- Lower barrier to entry (vs £2,000 upfront)
- 30-day trial = risk-free testing
- Customer locks in (convenience + inertia)

**Target:**
- Year 1: 100 subscriptions = £100k/year MRR
- Year 2: 300 subscriptions = £300k/year MRR
- Year 3: 500 subscriptions = £500k/year MRR

#### 2. Consumable Reorders (Retention Engine)
**How It Works:**
- Customer uses consumables (creasing ribs, perf blades, etc.)
- System tracks purchase history
- Automated emails at optimal reorder time
- Tokenized reorder link = one-click purchase

**Why This Works:**
- 80% of revenue from existing customers
- Reorder rate increases with automation
- Reduces customer churn
- Increases customer lifetime value

**Target:**
- 60% reorder rate (up from current ~40%)
- Average 3 reorders per customer per year
- £150 average order value

#### 3. One-Off Sales (Quote System)
**Use Cases:**
- Customers not ready for subscription
- Unique machine configurations
- Large bulk orders
- Custom solutions

**Process:**
- Quote builder in admin
- Email quote with tokenized checkout
- One-time payment via Stripe

---

## Customer Journey Maps

### Journey 1: New Customer (Subscription)

```
DISCOVERY
Google: "Heidelberg Stahlfolder creasing solutions"
↓
Lands on: /machines/heidelberg-stahlfolder-ti-52
↓
Sees: "Eliminate fiber cracking on YOUR machine"

CONSIDERATION
Reads: Problems (cracking, slow production, high costs)
Sees: Solution (inline capability, faster, better quality)
Price: £99/month - clear and fair
↓
Clicks: "Request Free Trial"

TRIAL REQUEST
Fills form: Company, name, email, phone
Submits
↓
Email sent: Personalized trial link

TRIAL ACTIVATION
Clicks email link → Lands on /r/[token]
Enters card details (not charged for 30 days)
Confirms trial
↓
Trial kit ships in 2-3 days

TRIAL PERIOD (30 days)
Tests product
Sales team checks in (optional)
Decides to keep or cancel

CONVERSION
If keeps: Card charged £99/month
If cancels: Return kit (or buy outright)

RETENTION
Uses product
Reorders consumables (automated reminders)
Refers colleagues (potential)
```

### Journey 2: Existing Customer (Reorder)

```
PURCHASE HISTORY
Customer bought consumables 6 months ago
System knows: Average usage = 6 months

AUTOMATED REMINDER (Month 5.5)
Email: "Your creasing ribs are probably running low"
Link: Personalized reorder portal /r/[token]

ONE-CLICK REORDER
Customer clicks link
Portal pre-filled with previous order
One click: "Reorder Same Items"
↓
Payment processed
Shipping notification

RETENTION
Happy customer
Continues subscription
Lifetime value increases
```

### Journey 3: High-Value Customer (RFM Champion)

```
RFM SEGMENTATION
Customer identified as "Champion"
- Recency: Ordered last month
- Frequency: 8 orders in 12 months
- Monetary: £3,500 total spend

SPECIAL TREATMENT
Priority support
Early access to new products
Volume discount offers
Quarterly check-in calls

EXPANSION
Upsell to higher capability tier
Cross-sell to other machines
Referral incentive program

ADVOCACY
Customer becomes case study
Provides testimonial
Refers 2-3 new customers
```

---

## Technical Strategy

### Architecture Principles

**1. Automation First**
- If a human does it twice, automate it
- Email automation > manual follow-ups
- Self-service portals > phone calls
- Scheduled jobs > manual triggers

**2. Data-Driven Decisions**
- RFM scores guide customer communication
- Engagement events tracked (email opens, link clicks, purchases)
- A/B test templates (future)
- Conversion funnel analytics (future)

**3. Scalability**
- Database-driven content (templates, products, machines)
- Single dynamic routes (not 225 static pages)
- Token-based authentication (no user accounts needed)
- Outbox pattern (reliable email delivery at scale)

**4. SEO as Acquisition**
- 225 machine pages = 225 Google entry points
- Long-tail keywords: "Heidelberg Stahlfolder Ti52 creasing solutions"
- Rich structured data (Schema.org Product)
- Fast page loads (Vercel CDN)

### Tech Stack Choices

**Next.js 15 + App Router:**
- Server Components = better SEO
- Edge rendering = faster globally
- API routes = backend in same repo

**Supabase (PostgreSQL):**
- Powerful queries (JSONB, views, RLS)
- Real-time potential (future)
- Managed hosting = less DevOps

**Stripe:**
- Subscription billing = proven
- Webhooks = reliable event handling
- Test mode = safe development

**Resend:**
- Developer-friendly email API
- Better deliverability than SMTP
- Template flexibility

---

## Marketing Strategy

### Acquisition Channels

**1. SEO (Primary)**
- **Target**: Print shop operators searching for machine-specific solutions
- **Tactic**: 225 machine landing pages with rich content
- **Example queries:**
  - "Heidelberg Stahlfolder fiber cracking"
  - "MBO B30 creasing solutions"
  - "Perfect binder spine creasing tools"

**2. Direct Email (Existing Customers)**
- **Target**: Previous purchasers in database
- **Tactic**: Reorder reminders, new product announcements
- **Goal**: Reactivate dormant customers

**3. Sales Outreach (High-Value Prospects)**
- **Target**: Companies identified via engagement tracking
- **Tactic**: Personalized quote emails from admin system
- **Goal**: Close large deals, build relationships

**4. Referrals (Future)**
- **Target**: Happy customers ("Champions" in RFM)
- **Tactic**: Incentivize referrals (discount, credit, bonus)
- **Goal**: Organic growth through word-of-mouth

### Content Strategy

**Machine Pages** (Live)
- Problem-focused (cracking, slow production, costs)
- Solution-oriented (inline capability, speed, quality)
- Trust signals (2,800+ customers, award-winning, UK support)
- Clear CTA (Request Free Trial)

**Email Templates** (Coming)
- Trial welcome: "Your trial kit is shipping"
- Reorder reminder: "Time to restock your consumables"
- Win-back: "We miss you, here's 20% off"
- Upsell: "Unlock advanced capability"

**Video Content** (Future)
- Machine installation guides
- Before/after demonstrations
- Customer testimonials
- Product comparisons

---

## Operational Strategy

### Admin Workflows

**Daily:**
- Check pipeline (/admin/pipeline)
- Review new trial requests
- Process orders (/admin/orders)

**Weekly:**
- Send campaigns (/admin/campaigns)
- Build quotes for prospects (/admin/quote-builder)
- Review engagement metrics (/admin/engagements)

**Monthly:**
- Analyze subscription churn (/admin/subscriptions)
- Update RFM segments (automated cron)
- Review sales history (/admin/sales-history)

### Automation Goals

**Email:**
- 100% automated trial emails
- 100% automated reorder reminders
- 80% automated campaign sends (20% manual review)

**Subscriptions:**
- 90% self-service sign-ups (10% sales-assisted)
- <5% churn rate
- >60% trial-to-paid conversion

**Reorders:**
- 70% via tokenized links (30% phone/email)
- 60% reorder rate (up from 40%)
- 3x average orders per customer per year

---

## Success Metrics

### Year 1 Goals

**Revenue:**
- £100k/year MRR from subscriptions (100 customers @ £83/month avg)
- £150k/year from consumable reorders
- £50k/year from one-off sales
- **Total: £300k/year**

**Customers:**
- 100 active subscriptions
- 500 customers in database
- 300 engaged (email opens, purchases)

**Efficiency:**
- 50% reduction in quote generation time
- 80% reduction in manual follow-ups
- 90% email automation rate

### Year 2 Goals

**Revenue:**
- £300k/year MRR from subscriptions (300 customers)
- £400k/year from reorders
- £100k/year from one-off sales
- **Total: £800k/year**

**Growth:**
- 200% subscription growth
- 50% reorder rate increase
- 10+ machine page SEO rankings (page 1 Google)

---

## Competitive Advantages

**1. Machine-Specific Expertise**
- 225 machines cataloged with compatibility data
- Personalized solutions per machine
- Installation guides tailored to each model

**2. Subscription Model**
- Lower barrier to entry than competitors
- Risk-free trials
- Convenience wins over ownership

**3. Automated Retention**
- Reorder reminders competitors don't have
- RFM-based personalization
- Tokenized self-service portals

**4. UK-Based Support**
- Phone support: 01707 275 114
- Email: sales@technifold.co.uk
- Local presence builds trust

---

## The Ultimate Vision (3-5 Years)

**Technifold becomes the "Stripe of print finishing":**

- Every print shop subscription = recurring revenue
- Global reach via online acquisition (not just UK)
- Product innovation driven by customer data
- Marketplace model (other manufacturers use our platform?)
- Industry standard for finishing automation

**Revenue Target:** £2-5M/year with 70%+ recurring revenue

---

**Status:** Foundation complete, growth phase begins now.
