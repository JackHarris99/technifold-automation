# Subscription System Architecture

## Overview

Technifold's subscription system enables B2B customers to rent tools on a monthly basis with flexible pricing, free trials, and ratcheting subscription models. The system integrates Stripe for payment processing while maintaining full control over business logic, pricing, and tool assignment.

---

## Key Principles

### 1. **Stripe Handles Billing, You Handle Everything Else**

**Stripe knows:**
- Monthly price (£159, £847, £22, etc.)
- Payment method (card or BACS Direct Debit)
- Billing interval (monthly)
- Customer ID

**Your system tracks:**
- Which tools customer has
- Product codes for dispatch
- Subscription history
- Custom agreements
- Upsell opportunities

### 2. **Single Line Item Pricing**

Customer invoices show:
```
Technifold Print Finishing    £159.00
```

NOT:
```
Tri-Creaser                    £89.00
Quad-Creaser                   £70.00
Total                          £159.00
```

Benefits:
- Clean invoices
- Flexible pricing
- Easy ratcheting
- No SKU exposure to customer

### 3. **Ratcheting Subscriptions**

Prices can **only increase**, never decrease:
- Month 1: £159/mo (Tri-Creaser + Quad-Creaser)
- Month 5: £181/mo (+ CP Applicator)
- Month 12: £331/mo (+ Multi-Tool)

Customer cannot remove tools, only add. This is enforced in your business logic, not Stripe.

---

## Payment Methods

### Card Payments
- **Settlement:** 2 days
- **Fees:** 1.5% + 20p per transaction
- **International:** Works globally
- **Expiry:** Cards expire, requires updates

### BACS Direct Debit (UK Only)
- **Settlement:** 3-5 days
- **Fees:** 0.8% (much cheaper)
- **Failure rate:** ~0.1% (very reliable)
- **No expiry:** Bank accounts don't expire
- **Lower churn:** Harder to cancel
- **B2B preferred:** Professional customers prefer it

**Example cost comparison (£500/mo subscription):**
- Card: £9.70/mo in fees
- BACS: £4.00/mo in fees
- **Annual savings: £68.40 per customer**

### International Direct Debit
- **EU:** SEPA Direct Debit (`sepa_debit`) - 2-3 days
- **US:** ACH Direct Debit (`us_bank_account`) - 5-7 days
- **Australia:** BECS Direct Debit (`au_becs_debit`) - 3 days

All checkout flows support multiple payment methods. Customer sees relevant options based on their location.

---

## Subscription Workflows

### Workflow 1: Instant Trial with Known Pricing

**Use case:** Standard packages with published pricing

**Flow:**
1. Customer sees "Technifold Print Finishing from £159/mo"
2. Clicks "Start Free Trial"
3. Enters payment details (card or BACS)
4. Signs mandate/saves card
5. Gets instant access to tools
6. Day 30: Auto-charged £159

**Code:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card', 'bacs_debit'],
  line_items: [{
    price_data: {
      currency: 'gbp',
      recurring: { interval: 'month' },
      unit_amount: 15900, // £159
    }
  }],
  subscription_data: {
    trial_period_days: 30,
  },
});
```

---

### Workflow 2: Full Capability Trial with "From" Pricing

**Use case:** Customer tries everything, price negotiated during trial

**Flow:**
1. Advertise "Technifold Print Finishing from £159/mo"
2. Customer requests trial (no payment yet)
3. Ship them EVERYTHING (full capability)
4. Day 1-29: Customer tries all tools
5. Mid-trial: Sales calls - "Which tools are you using most?"
6. Customer: "Love Tri-Creaser and Quad-Creaser"
7. Day 25: Send personalized checkout link
   - `/q/[token]` with price £159/mo
8. Customer enters payment details
9. Day 30: First charge £159
10. Collect unused tools

**Code:**
```typescript
// No Stripe subscription yet - track internally
await db.trials.insert({
  company_id,
  trial_type: 'full_capability',
  tools_shipped: ['TRI', 'QUAD', 'MULTI', 'CP-APP'],
  trial_start: new Date(),
  trial_end: addDays(30),
  pricing_tbd: true,
});

// Day 25: Generate custom quote
const token = generateToken({
  company_id,
  contact_id,
  products: ['TRI', 'QUAD'],
  custom_price: 159.00,
  trial_conversion: true,
}, 168); // 7 days to accept

// Send email with /q/[token]
```

---

### Workflow 3: Custom Enterprise Deal

**Use case:** Large customer, negotiated pricing, extended trial

**Flow:**
1. Enterprise customer requests demo
2. Sales team demos full capability
3. Negotiate custom package:
   - 5 tools
   - £847/mo
   - 90-day trial
4. Create subscription manually
5. Ship equipment
6. Day 90: First charge

**Code:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card', 'bacs_debit'],
  line_items: [{
    price_data: {
      currency: 'gbp',
      recurring: { interval: 'month' },
      unit_amount: 84700, // £847 custom price
    }
  }],
  subscription_data: {
    trial_period_days: 90, // Extended trial
    metadata: {
      deal_type: 'enterprise',
      tools: 'TRI,QUAD,MULTI,CP-APP,SPINE',
      agreement_id: 'ENT-2024-047',
    }
  },
});
```

---

## Adding Capability (Ratcheting)

**Customer calls:** "Can we add the CP Applicator?"

**You say:** "Sure! Add it for just £22/mo"

**Code:**
```typescript
// Get current subscription
const subscription = await stripe.subscriptions.retrieve(sub_id);
const currentPrice = subscription.items.data[0].price.unit_amount; // 15900 (£159)

// Update to new price
await stripe.subscriptions.update(sub_id, {
  items: [{
    id: subscription.items.data[0].id,
    price_data: {
      currency: 'gbp',
      recurring: { interval: 'month' },
      unit_amount: currentPrice + 2200, // £159 + £22 = £181
    }
  }],
  metadata: {
    tools_active: 'TRI,QUAD,CP-APP',
    last_update: new Date().toISOString(),
    update_reason: 'added_cp_applicator',
  },
  proration_behavior: 'none', // Don't charge immediately
});

// Update your database
await db.subscriptions.update({
  subscription_id: sub_id,
  monthly_price: 181.00,
  tools: ['TRI-CREASER', 'QUAD-CREASER', 'CP-APPLICATOR'],
});

// Ship the new tool
await dispatch.scheduleDelivery({
  company_id,
  items: ['CP-APPLICATOR-12mm'],
});
```

**Next billing cycle:** Customer pays £181 automatically.

---

## Retention Offers

**Customer wants to cancel because price is too high.**

**Your move:** Drop the price to keep them.

```typescript
await stripe.subscriptions.update(sub_id, {
  items: [{
    id: subscription.items.data[0].id,
    price_data: {
      unit_amount: 12900, // £159 → £129 (retention discount)
    }
  }],
  metadata: {
    discount_applied: '19% retention offer',
    discount_reason: 'prevent_churn',
  }
});
```

**You have complete pricing flexibility.** Stripe doesn't care.

---

## Invoicing

### Stripe Invoice (Simple)
```
Technifold Print Finishing Subscription
Monthly charge                          £159.00
VAT (20%)                              £31.80
Total                                   £190.80
```

### Custom PDF Invoice (Detailed)
```
Technifold Print Finishing Subscription - March 2024

Equipment Rental:
  - Tri-Creaser (Model TC-35)
  - Quad-Creaser (Model QC-STD)
  - CP Applicator (12mm)

Support & Maintenance Included
24/7 Technical Support
Consumables Discount (15%)

Monthly Subscription                    £159.00
VAT (20%)                              £31.80
──────────────────────────────────────────────
Total Due                               £190.80
```

**Send detailed PDF via email after payment succeeds.**

---

## International Shipping & Customs

### Customs Requirements

**All international shipments require:**
- Commercial invoice
- HS codes for each item
- Country of origin
- Declared value
- Weight and dimensions

### Database Schema

```sql
ALTER TABLE products
ADD COLUMN hs_code VARCHAR(10),
ADD COLUMN country_of_origin VARCHAR(2),
ADD COLUMN customs_value_gbp DECIMAL(10,2),
ADD COLUMN weight_kg DECIMAL(8,3);
```

**Common HS codes:**
- `8442.30.00` - Printing machinery (tools)
- `8442.90.00` - Parts and accessories (consumables)

### For Rentals/Subscriptions

Mark shipments as:
```
Purpose: RENTAL EQUIPMENT (Temporary Export)
Equipment remains property of Technifold Ltd, UK
Rental period: Monthly subscription
```

**Benefits:**
- Often exempt from import duties
- Simplified return process
- Clear ownership status

### Generate Customs Declaration

```typescript
import { generateCustomsDeclaration, formatCustomsInvoice } from '@/lib/customs';

const declaration = await generateCustomsDeclaration({
  company_id: 'abc-123',
  destination_country: 'DE', // Germany
  shipment_type: 'rental',
  product_codes: ['TRI-CREASER', 'QUAD-CREASER'],
  subscription_id: 'sub_abc123',
});

// Generate printable invoice
const invoice = formatCustomsInvoice(declaration, {
  company_name: 'Technifold Ltd',
  address: 'Your Address, UK',
  country: 'GB',
  eori_number: 'GB123456789000',
}, {
  company_name: recipient.company_name,
  address: recipient.address,
  country: 'DE',
  vat_number: recipient.vat_number,
});

// Print and attach to package
```

---

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  company_id UUID REFERENCES companies(company_id),

  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',

  -- Tools assigned
  tools JSONB, -- ['TRI-CREASER', 'QUAD-CREASER', 'CP-APPLICATOR']

  -- Status
  status VARCHAR(50), -- 'trial', 'active', 'past_due', 'cancelled'
  trial_end TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  -- Ratcheting
  ratchet_max DECIMAL(10,2), -- Maximum price customer has paid

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

### Shipping Manifests Table

```sql
CREATE TABLE shipping_manifests (
  manifest_id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(company_id),
  subscription_id VARCHAR(255),

  destination_country VARCHAR(2),
  shipment_type VARCHAR(50), -- 'rental', 'sale', 'consumables', 'return'

  -- Customs
  customs_invoice_number VARCHAR(100),
  total_customs_value_gbp DECIMAL(10,2),
  total_weight_kg DECIMAL(10,3),

  -- Items as JSONB
  items JSONB,

  -- Tracking
  courier VARCHAR(100),
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Checklist

- [ ] Create subscription with 30-day trial
- [ ] Customer enters BACS details (instant sign-up)
- [ ] Customer enters card details (instant sign-up)
- [ ] Trial ends, first payment collected
- [ ] Add capability, price increases correctly
- [ ] Retention discount applied, price decreases
- [ ] Custom enterprise deal with 90-day trial
- [ ] Full capability trial → negotiated conversion
- [ ] International shipment → customs invoice generated
- [ ] Webhook creates order after payment
- [ ] Invoice emailed to customer
- [ ] Detailed PDF invoice includes tool breakdown

---

## Key Files

**Stripe Integration:**
- `src/lib/stripe-client.ts` - Stripe client and checkout functions
- `src/app/api/checkout/route.ts` - General checkout (consumables)
- `src/app/api/quote/checkout/route.ts` - Tool rentals/purchases
- `src/app/api/stripe/webhook/route.ts` - Payment webhooks

**Customs:**
- `src/lib/customs.ts` - Customs declaration generation
- `sql/migrations/ADD_CUSTOMS_SHIPPING_FIELDS.sql` - Database schema

**Checkout Pages:**
- `src/app/checkout/success/page.tsx` - Payment success
- `src/app/checkout/cancel/page.tsx` - Payment cancelled

---

## Next Steps

1. **Enable BACS in Stripe Dashboard**
   - Settings → Payment methods → Enable "BACS Direct Debit"
   - Verify business details

2. **Run Migration**
   ```bash
   psql $DATABASE_URL < sql/migrations/ADD_CUSTOMS_SHIPPING_FIELDS.sql
   ```

3. **Update Product Data**
   - Add HS codes to products
   - Add weights and dimensions
   - Set customs values

4. **Test End-to-End**
   - Create test subscription
   - Try both card and BACS
   - Verify webhooks create orders
   - Test price updates

5. **Go Live**
   - Switch to live Stripe keys
   - Enable production webhooks
   - Deploy to Vercel

---

## Summary

- **Stripe = Billing processor** (just charges the amount you tell it)
- **You = Business logic** (pricing, tools, trials, upsells)
- **Single line item** (clean invoices, flexible pricing)
- **BACS preferred** (lower fees, lower churn)
- **Ratcheting works** (prices only increase)
- **Customs ready** (international shipping supported)
- **Complete freedom** (build any subscription model you want)
