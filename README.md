# Technifold Automation Platform

A comprehensive e-commerce and customer engagement platform for Technifold, featuring:
- Public marketing website for print finishing products
- Customer portal with personalized product catalogs
- Stripe checkout integration with automatic tax calculation
- Zoho Books sync for invoicing and payments
- Engagement tracking and AI-driven customer suggestions
- Admin dashboard with analytics

## Features

### Public Website
- **Marketing Pages**: Home, products catalog, tool categories, datasheets
- **Product Showcase**: Tri-Creaser, Spine-Creaser, and consumables
- **SEO Optimized**: Meta tags and structured content
- **Contact Forms**: Sales inquiries and quotes

### Customer Portal
- **Dynamic Portal Access**: Personalized portals via `/portal/[token]` URLs
- **Tabbed Interface**: Reorder tab and tool-specific consumable tabs
- **Product Categories**: Browse by product category
- **Shopping Cart**: Add items and checkout via Stripe
- **Order History**: View past orders and invoices
- **Mobile Responsive**: Optimized for all devices

### E-Commerce
- **Stripe Integration**: Secure checkout with automatic tax calculation
- **Product Eligibility**: Control which products are available for purchase
- **Multi-Currency**: Support for GBP, EUR, USD, and more
- **Tokenized Offers**: HMAC-signed promotional links with TTL
- **Campaign Tracking**: UTM parameters and offer/campaign keys

### Zoho Books Integration
- **Automatic Invoice Creation**: Orders sync to Zoho Books
- **Payment Recording**: Stripe payments recorded in Zoho
- **Customer Sync**: Companies and contacts auto-created in Zoho
- **Retry Logic**: Exponential backoff for failed syncs
- **Outbox Pattern**: Reliable async job processing

### Engagement Tracking
- **Unified Events**: Track all customer interactions (views, clicks, purchases, emails)
- **Timeline View**: Chronological feed of engagement events
- **AI Suggestions**: Next best actions for customer engagement
- **Campaign Attribution**: Track ROI of marketing campaigns
- **Idempotency**: Prevent duplicate events

### Admin Control Plane
- **Companies List**: Searchable/sortable directory with engagement scores
- **Company Detail**: Comprehensive tabs for Overview, Timeline, Contacts, Orders, Machines, Portal
- **Orders Management**: View all orders with Stripe and Zoho links
- **Outbox Jobs**: Monitor async job queue with retry functionality
- **Action CTAs**: Create quotes, send offers, copy portal links
- **Consent Management**: Respect marketing preferences in all communications
- **Next Best Actions**: AI-driven follow-up recommendations per company

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL), Vercel Edge Functions
- **Payments**: Stripe Checkout, Automatic Tax
- **Invoicing**: Zoho Books API
- **Deployment**: Vercel (with Cron for async jobs)

## Prerequisites

- Node.js 20+ (Recommended)
- Supabase account and project
- Stripe account
- Zoho Books account (optional, for invoice sync)

## Installation

1. **Clone the repository:**
   ```bash
   cd consumables-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your credentials (see Environment Variables section below).

4. **Run database migrations:**

   Go to your Supabase project's SQL Editor and run the migration files in order:
   ```
   supabase/migrations/20250120_01_add_integration_fields.sql
   supabase/migrations/20250120_02_add_stripe_product_fields.sql
   supabase/migrations/20250120_03_create_engagement_events.sql
   supabase/migrations/20250120_04_create_outbox_table.sql
   supabase/migrations/20250120_05_create_orders_table.sql
   supabase/migrations/20250120_06_create_engagement_views.sql
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   Navigate to `http://localhost:3000`

## Environment Variables

### Required

```env
# Next.js / Vercel
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
TOKEN_HMAC_SECRET=your-random-secret  # Generate with: openssl rand -base64 32
CRON_SECRET=your-cron-secret  # Generate with: openssl rand -base64 32
```

### Optional (Zoho Books Integration)

```env
ZOHO_BOOKS_API_BASE=https://books.zoho.com/api/v3
ZOHO_ORGANIZATION_ID=your-org-id
ZOHO_CLIENT_ID=your-client-id
ZOHO_CLIENT_SECRET=your-client-secret
ZOHO_REFRESH_TOKEN=your-refresh-token
```

## Configuration

### Stripe Setup

1. **Create Stripe Account**: https://dashboard.stripe.com/register
2. **Enable Automatic Tax**: https://dashboard.stripe.com/settings/tax/activate
3. **Get API Keys**: https://dashboard.stripe.com/apikeys
4. **Create Webhook**:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Zoho Books Setup (Optional)

1. **Create Zoho Books Account**: https://books.zoho.com/
2. **Register OAuth App**: https://api-console.zoho.com/
3. **Get Refresh Token**:
   ```bash
   # Generate authorization code (in browser):
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&access_type=offline

   # Exchange for refresh token (in terminal):
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "code=YOUR_AUTH_CODE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "grant_type=authorization_code"
   ```

### Vercel Deployment

1. **Push to GitHub**
2. **Import to Vercel**: https://vercel.com/new
3. **Add Environment Variables**: Copy from `.env.local`
4. **Deploy**: Vercel will automatically detect `vercel.json` and set up cron jobs

The `vercel.json` file configures a cron job to run the outbox worker every minute.

## Admin Control Plane Navigation

### Main Pages
- `/companies` - Companies list with search, sort, and engagement scores
- `/companies/[companyId]` - Company detail with 6 tabs:
  - **Overview**: Key metrics, next best actions, compatible products
  - **Timeline**: Engagement feed with all customer interactions
  - **Contacts**: Contact list with consent status and action buttons
  - **Quotes & Orders**: Order history with Stripe and Zoho links
  - **Machines & Fitment**: Confirmed and believed machines
  - **Portal**: Read-only preview with portal URL and copy button
- `/orders` - All orders with status filters and company links
- `/outbox` - Job queue monitoring with retry buttons for failed jobs

### Action Modals
- **Create Quote**: Select products (server-resolved pricing) + discount request
- **Send Offer**: Choose template + contacts (consent-filtered) → enqueue Zoho job
- **Copy Portal Link**: HMAC-signed tokenized link to clipboard
- **Create Invoice**: (TODO) Trigger Zoho Books invoice creation
- **Retry Job**: Reset failed outbox job to pending status

### Access
All admin pages are wrapped by `/app/(admin)/layout.tsx` with:
- Navigation bar: Companies | Orders | Outbox Jobs
- Consistent header styling
- "Back to Site" link

## API Routes

### Public Routes
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `POST /api/zoho/webhook` - Zoho email event webhook
- `GET /x/[token]` - Tokenized offer page

### Admin Routes
- `GET /api/admin/engagement-feed` - Engagement timeline data
- `GET /api/admin/suggestions` - Next best actions
- `GET /api/admin/companies/[companyId]/contacts` - Fetch company contacts
- `POST /api/admin/quotes/create` - Create quote with server-side pricing
- `POST /api/admin/offers/send` - Send marketing offers via Zoho
- `POST /api/admin/outbox/retry` - Retry failed outbox job

### Worker Routes
- `POST /api/outbox/run` - Process outbox jobs (called by Vercel Cron)

## Database Schema

### Core Tables
- `companies` - Customer companies
- `contacts` - Customer contacts
- `products` - Product catalog (tools and consumables)
- `sales` - Historical sales data
- `orders` - New orders from Stripe checkout
- `engagement_events` - All customer interactions
- `outbox` - Async job queue

### Views
- `vw_company_consumable_payload` - Personalized product catalogs
- `v_engagement_feed` - Timeline of engagement events
- `v_next_best_actions` - AI-driven suggestions

## Usage Examples

### Generate Tokenized Offer Link

```typescript
import { generateOfferUrl } from '@/lib/tokens';

const offerUrl = generateOfferUrl(
  process.env.NEXT_PUBLIC_BASE_URL!,
  'COMPANY123',
  'reorder_reminder',
  {
    contactId: 'contact-uuid',
    campaignKey: 'q1-2025-reorder',
    ttlHours: 72, // 3 days
  }
);

// Send offerUrl via email
// https://yourdomain.com/x/eyJjb21wYW55X2lkIjoiQ09NUEFOWT...
```

### Track Engagement Event

```typescript
const supabase = getSupabaseClient();

await supabase.from('engagement_events').insert({
  company_id: 'COMPANY123',
  contact_id: 'contact-uuid',
  source: 'vercel',
  event_name: 'email_clicked',
  campaign_key: 'q1-2025-reorder',
  url: 'https://yourdomain.com/products/matrix-123',
  utm_source: 'email',
  utm_campaign: 'reorder_reminder',
});
```

### Create Checkout Session

```typescript
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_id: 'COMPANY123',
    contact_id: 'contact-uuid',
    items: [
      { product_code: 'MATRIX-RED', quantity: 10 },
      { product_code: 'GRIPPER-BLUE', quantity: 5 },
    ],
    offer_key: 'reorder_reminder',
    campaign_key: 'q1-2025-reorder',
  }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Checkout
```

## Project Structure

```
consumables-portal/
├── src/
│   ├── app/
│   │   ├── (admin)/                        # Admin route group
│   │   │   ├── layout.tsx                  # Admin layout with nav
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx                # Companies list
│   │   │   │   └── [companyId]/page.tsx    # Company detail with tabs
│   │   │   ├── orders/page.tsx             # Orders list
│   │   │   └── outbox/page.tsx             # Outbox jobs monitor
│   │   ├── api/
│   │   │   ├── checkout/route.ts           # Checkout API
│   │   │   ├── stripe/webhook/route.ts     # Stripe webhook
│   │   │   ├── zoho/webhook/route.ts       # Zoho email events
│   │   │   ├── outbox/run/route.ts         # Outbox worker
│   │   │   └── admin/
│   │   │       ├── engagement-feed/route.ts
│   │   │       ├── suggestions/route.ts
│   │   │       ├── companies/[companyId]/contacts/route.ts
│   │   │       ├── quotes/create/route.ts
│   │   │       ├── offers/send/route.ts
│   │   │       └── outbox/retry/route.ts
│   │   ├── portal/[token]/                 # Customer portal
│   │   ├── products/                       # Product catalog
│   │   ├── tools/[category]/               # Tool category pages
│   │   ├── datasheet/[product_code]/       # Product datasheets
│   │   ├── x/[token]/                      # Tokenized offers
│   │   └── page.tsx                        # Home page
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CompanyHeader.tsx           # Company actions header
│   │   │   ├── CompanyDetailTabs.tsx       # Tabbed company view
│   │   │   ├── CreateQuoteModal.tsx        # Quote creation form
│   │   │   ├── SendOfferModal.tsx          # Offer sending form
│   │   │   ├── OutboxJobsTable.tsx         # Job queue table
│   │   │   ├── EngagementTimeline.tsx      # Timeline component
│   │   │   ├── SuggestionsPanel.tsx        # Next actions panel
│   │   │   ├── CustomerProfilePage.tsx
│   │   │   ├── CompanyGrid.tsx
│   │   │   └── DatasheetGrid.tsx
│   │   └── marketing/
│   │       ├── HeroSection.tsx
│   │       ├── ProductShowcase.tsx
│   │       └── MarketingHeader.tsx
│   ├── lib/
│   │   ├── supabase.ts                     # Supabase client
│   │   ├── stripe-client.ts                # Stripe helpers
│   │   ├── zoho-books-client.ts            # Zoho Books API
│   │   └── tokens.ts                       # HMAC token utils
│   └── types/
│       └── index.ts                        # TypeScript types
├── supabase/
│   └── migrations/                         # Database migrations
├── .env.example                            # Environment template
├── vercel.json                             # Vercel config (cron)
└── README.md                               # This file
```

## Development Workflow

1. **Make code changes**
2. **Test locally**: `npm run dev`
3. **Commit changes**: `git add . && git commit -m "Description"`
4. **Push to GitHub**: `git push`
5. **Vercel auto-deploys**: Production deployment happens automatically

## Monitoring

- **Stripe Dashboard**: https://dashboard.stripe.com/payments
- **Zoho Books**: https://books.zoho.com/app/invoices
- **Vercel Logs**: https://vercel.com/dashboard
- **Supabase Logs**: https://supabase.com/dashboard/project/_/logs

## Troubleshooting

### Stripe Webhook Not Working
1. Check webhook is configured in Stripe dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Vercel logs for webhook errors

### Zoho Sync Failing
1. Check Zoho refresh token is valid (expires after 6 months of inactivity)
2. Verify Zoho organization ID is correct
3. Check outbox table for failed jobs with error messages

### Outbox Worker Not Running
1. Verify `vercel.json` exists and cron is configured
2. Check Vercel dashboard for cron logs
3. Test manually: `curl https://yourdomain.com/api/outbox/run -H "Authorization: Bearer YOUR_CRON_SECRET"`

### Token Verification Failing
1. Ensure `TOKEN_HMAC_SECRET` is set and consistent
2. Check token hasn't expired (default 72 hours)
3. Verify token wasn't tampered with

## Support

For issues or questions:
- **Email**: support@technifold.com
- **GitHub Issues**: https://github.com/JackHarris99/technifold-automation/issues

## License

Proprietary - Technifold Ltd.
