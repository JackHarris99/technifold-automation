# Test Plan & Sample Payloads

## Testing Environment Setup

### Prerequisites
1. `.env.local` configured with all required variables
2. Database migrations applied (run in order 01-08)
3. Local development server running: `npm run dev`
4. Stripe CLI installed for webhook testing: `brew install stripe/stripe-cli/stripe`
5. curl or Postman for API testing

### Test Database State
Ensure you have:
- At least 1 company with `portal_token`
- At least 1 contact with `email` and `marketing_status = 'active'`
- At least 1 product with `is_marketable = true`
- Stripe integration configured (products/prices created)

---

## 1. Token Generation & Resolution

### Test 1.1: Generate Tokenized Offer Link

```typescript
// Run in Node.js console or create test script
import { generateOfferUrl } from '@/lib/tokens';

const offerUrl = generateOfferUrl(
  'http://localhost:3000',
  'COMPANY123',  // Replace with real company_id
  'reorder_reminder',
  {
    contactId: 'contact-uuid-here',  // Replace with real contact_id
    campaignKey: 'test-campaign',
    ttlHours: 72
  }
);

console.log('Offer URL:', offerUrl);
```

### Test 1.2: Visit Token Page

1. Open the generated URL in browser
2. **Expected:**
   - Page loads without errors
   - Engagement event created in `engagement_events` table
   - Session cookie set
   - Personalized content shown (if contact has consent)
   - Generic content shown (if contact opted out)

**SQL to verify:**
```sql
SELECT * FROM engagement_events
WHERE event_name = 'offer_view'
ORDER BY occurred_at DESC LIMIT 5;
```

---

## 2. Stripe Checkout Flow

### Test 2.1: Create Checkout Session

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "COMPANY123",
    "contact_id": "contact-uuid",
    "items": [
      { "product_code": "MATRIX-RED", "quantity": 10 },
      { "product_code": "GRIPPER-BLUE", "quantity": 5 }
    ],
    "offer_key": "reorder_reminder",
    "campaign_key": "test-campaign"
  }'
```

**Expected Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "session_id": "cs_test_..."
}
```

**Verify:**
- `checkout_started` event created
- Products resolved to Stripe price IDs
- Checkout session created in Stripe dashboard

### Test 2.2: Stripe Webhook Testing

**Setup Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Trigger test events:**
```bash
# Test checkout.session.completed
stripe trigger checkout.session.completed

# Test payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Test payment_intent.payment_failed
stripe trigger payment_intent.payment_failed

# Test charge.refunded
stripe trigger charge.refunded
```

**Sample webhook payload (checkout.session.completed):**
```json
{
  "id": "evt_test_123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_123",
      "customer": "cus_test_123",
      "payment_intent": "pi_test_123",
      "amount_total": 5000,
      "amount_subtotal": 4500,
      "currency": "gbp",
      "metadata": {
        "company_id": "COMPANY123",
        "contact_id": "contact-uuid",
        "offer_key": "reorder_reminder",
        "campaign_key": "test-campaign",
        "product_codes": "[\"MATRIX-RED\",\"GRIPPER-BLUE\"]"
      }
    }
  }
}
```

**Verify after webhook:**
```sql
-- Check order created
SELECT * FROM orders WHERE stripe_checkout_session_id = 'cs_test_123';

-- Check engagement event
SELECT * FROM engagement_events
WHERE source = 'stripe' AND event_name = 'checkout_completed';

-- Check outbox job enqueued
SELECT * FROM outbox WHERE job_type = 'zoho_sync_order' ORDER BY created_at DESC LIMIT 1;
```

---

## 3. Zoho Webhook Testing

### Test 3.1: Send Zoho Email Event

```bash
curl -X POST http://localhost:3000/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zoho-Secret: your-zoho-secret" \
  -d '{
    "event_type": "email_opened",
    "event_id": "zoho_event_12345",
    "company_id": "COMPANY123",
    "contact_id": "contact-uuid",
    "campaign_key": "q1-2025-newsletter",
    "url": "https://example.com/email-link",
    "occurred_at": "2025-01-20T12:00:00Z",
    "metadata": {
      "email_subject": "Your January Newsletter"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "event_id": "zoho_event_12345"
}
```

**Verify idempotency** (send same payload twice):
```bash
# Second request should return:
{
  "success": true,
  "message": "Event already processed"
}
```

**SQL verification:**
```sql
SELECT * FROM engagement_events
WHERE source = 'zoho' AND source_event_id = 'zoho_event_12345';
```

---

## 4. Outbox Worker Testing

### Test 4.1: Manual Worker Execution

```bash
curl -X POST http://localhost:3000/api/outbox/run \
  -H "X-CRON-SECRET: your-cron-secret"
```

**Expected Response:**
```json
{
  "success": true,
  "processed": 1,
  "failed": 0,
  "duration_ms": 1234
}
```

### Test 4.2: Job Processing & Retry Logic

**Manually insert test job:**
```sql
INSERT INTO outbox (job_type, payload, company_id, status)
VALUES (
  'zoho_sync_order',
  '{"order_id": "test-order-123", "company_id": "COMPANY123", "items": [], "total": 100, "currency": "GBP"}',
  'COMPANY123',
  'pending'
);
```

**Run worker and verify:**
```sql
-- Check job status
SELECT id, job_type, status, attempts, last_error, completed_at
FROM outbox
WHERE payload->>'order_id' = 'test-order-123';

-- If Zoho configured, check order updated
SELECT zoho_invoice_id, zoho_payment_id, zoho_synced_at
FROM orders
WHERE order_id = 'test-order-123';
```

---

## 5. Admin UI Testing

### Test 5.1: Engagement Timeline

1. Navigate to `/admin/customer/COMPANY123`
2. **Expected:**
   - Timeline shows all events for company
   - Events sorted by date (newest first)
   - Icons and colors match event types
   - Metadata displayed correctly

### Test 5.2: Suggestions Panel

1. Navigate to `/admin`
2. **Expected:**
   - Suggestions loaded from `v_next_best_actions`
   - Priority scores displayed
   - Action buttons functional
   - "View Customer" links work

---

## 6. Consent & Compliance Testing

### Test 6.1: Opted-Out Contact

**Setup:**
```sql
UPDATE contacts
SET marketing_status = 'opted_out'
WHERE contact_id = 'test-contact-uuid';
```

**Test:**
1. Generate token URL for this contact
2. Visit URL
3. **Expected:**
   - Generic (non-personalized) page shown
   - No offer details displayed
   - Link to "Manage preferences" shown

### Test 6.2: Active Consent

**Setup:**
```sql
UPDATE contacts
SET marketing_status = 'active',
    gdpr_consent_at = NOW()
WHERE contact_id = 'test-contact-uuid';
```

**Test:**
1. Visit same token URL
2. **Expected:**
   - Personalized offer shown
   - Company name displayed
   - Offer-specific content visible

---

## 7. Database Integrity Tests

### Test 7.1: Idempotency Constraints

**Test duplicate Stripe event:**
```sql
-- This should fail with unique constraint error
INSERT INTO engagement_events (
  company_id, source, source_event_id, event_name
) VALUES (
  'COMPANY123', 'stripe', 'cs_test_duplicate', 'checkout_completed'
);

-- Trying to insert again should fail:
INSERT INTO engagement_events (
  company_id, source, source_event_id, event_name
) VALUES (
  'COMPANY123', 'stripe', 'cs_test_duplicate', 'checkout_completed'
);
```

**Expected:** Second insert fails with `duplicate key` error.

### Test 7.2: Outbox Claim Function

```sql
-- Claim a job
SELECT * FROM claim_outbox_job(5);

-- Try to claim same job immediately (should skip locked)
SELECT * FROM claim_outbox_job(5);
```

**Expected:** Second call returns empty (job is locked).

---

## 8. End-to-End Integration Test

### Complete Purchase Flow

1. **Generate offer link:**
   ```bash
   # Use token generation script
   ```

2. **Visit link:**
   - Opens `/x/[token]`
   - Engagement event logged

3. **Click "View Portal":**
   - Navigate to portal
   - Browse products

4. **Add to cart & checkout:**
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

5. **Complete Stripe checkout:**
   - Use test card: 4242 4242 4242 4242
   - Complete payment

6. **Webhook received:**
   - Order created in database
   - Engagement event logged
   - Outbox job enqueued

7. **Worker processes job:**
   ```bash
   curl -X POST http://localhost:3000/api/outbox/run \
     -H "X-CRON-SECRET: secret"
   ```

8. **Verify complete flow:**
   ```sql
   SELECT
     o.order_id,
     o.status,
     o.payment_status,
     o.zoho_invoice_id,
     o.zoho_payment_id,
     COUNT(e.event_id) as event_count
   FROM orders o
   LEFT JOIN engagement_events e ON e.company_id = o.company_id
   WHERE o.stripe_checkout_session_id = 'cs_test_...'
   GROUP BY o.order_id, o.status, o.payment_status, o.zoho_invoice_id, o.zoho_payment_id;
   ```

---

## 9. Performance & Load Testing

### Test 9.1: Concurrent Outbox Workers

```bash
# Run 5 workers concurrently
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/outbox/run \
    -H "X-CRON-SECRET: secret" &
done
wait
```

**Expected:**
- No duplicate job processing (SKIP LOCKED works)
- All jobs processed exactly once
- No deadlocks or errors

### Test 9.2: Large Payload View

```sql
-- Test payload v2 view performance
EXPLAIN ANALYZE
SELECT * FROM vw_company_consumable_payload_v2
WHERE company_id = 'COMPANY123';
```

**Expected:** Query completes in < 2 seconds for typical company.

---

## 10. Error Handling & Edge Cases

### Test 10.1: Invalid Token

```bash
# Visit with tampered token
curl http://localhost:3000/x/invalid-token-here
```

**Expected:** "Invalid or Expired Link" page shown.

### Test 10.2: Expired Token

```typescript
// Generate token with 1-second TTL
const token = generateToken({
  company_id: 'COMPANY123',
  offer_key: 'test'
}, 0.0003); // ~1 second

// Wait 2 seconds, then visit
// Expected: "Invalid or Expired Link" page
```

### Test 10.3: Missing Stripe Product

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "COMPANY123",
    "items": [
      { "product_code": "NONEXISTENT-PRODUCT", "quantity": 1 }
    ]
  }'
```

**Expected:** 400 error with "Product not found" message.

---

## Automated Test Script

Create `scripts/run-tests.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running Technifold Test Suite..."

# 1. Check environment
echo "✓ Checking environment variables..."
[ -z "$SUPABASE_URL" ] && echo "❌ SUPABASE_URL not set" && exit 1
[ -z "$STRIPE_SECRET_KEY" ] && echo "❌ STRIPE_SECRET_KEY not set" && exit 1

# 2. Test Zoho webhook
echo "✓ Testing Zoho webhook..."
curl -sf -X POST http://localhost:3000/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zoho-Secret: $ZOHO_WEBHOOK_SECRET" \
  -d '{"event_type":"email_opened","event_id":"test-'$(date +%s)'","email":"test@example.com"}' \
  > /dev/null

# 3. Test outbox worker
echo "✓ Testing outbox worker..."
curl -sf -X POST http://localhost:3000/api/outbox/run \
  -H "X-CRON-SECRET: $CRON_SECRET" \
  > /dev/null

# 4. Test checkout (without completing)
echo "✓ Testing checkout API..."
curl -sf -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"company_id":"AAR002","items":[{"product_code":"MOULD-16","quantity":1}]}' \
  > /dev/null

echo "✅ All tests passed!"
```

Make executable: `chmod +x scripts/run-tests.sh`

---

## Troubleshooting Common Issues

### Issue: Webhook signature verification fails
- **Solution:** Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Use `stripe listen` for local testing

### Issue: Outbox jobs not processing
- **Solution:** Check cron is configured in Vercel
- Manually trigger: `curl -X POST .../api/outbox/run -H "X-CRON-SECRET: ..."`

### Issue: Token verification fails
- **Solution:** Ensure `TOKEN_HMAC_SECRET` is set and consistent
- Check token hasn't expired (default 72 hours)

### Issue: No engagement events created
- **Solution:** Check table exists and has proper indexes
- Verify idempotency constraints aren't blocking inserts

---

## Next Steps

1. Run all tests locally before deploying
2. Set up Vercel environment variables
3. Configure Stripe webhook in production
4. Test cron job execution in Vercel
5. Monitor error logs for first few days
