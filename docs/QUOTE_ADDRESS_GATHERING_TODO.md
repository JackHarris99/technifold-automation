# Quote Address Gathering - Implementation TODO

## Overview
Quotes need to follow the same address gathering process as the reorder portal to ensure:
- Correct shipping address collection
- Proper VAT calculation based on delivery location
- Accurate shipping cost estimates
- Test links bypass address collection for internal testing

## Current State
✅ Quote builders (tools & consumables) are fully functional
✅ Product selection via search and category browser
✅ Quote generation with tokenized URLs
✅ Preview functionality for sales team
✅ CRM page integration with pre-selection
❌ Address gathering not yet implemented
❌ Test token generation not yet implemented

## Requirements

### 1. Test Token Flag
Both quote builders need a "Generate Test Link" option that creates tokens with `isTest: true` flag.

**Location**:
- `/src/app/admin/quote-builder/consumables/page.tsx`
- `/src/app/admin/quote-builder/tools/page.tsx`

**Implementation**:
```typescript
// Add checkbox in quote generation UI
const [isTestToken, setIsTestToken] = useState(false);

// Pass to generate API
body: JSON.stringify({
  company_id: selectedCompany.company_id,
  contact_id: selectedContact.contact_id,
  line_items: lineItems,
  pricing_mode: pricingMode,
  quote_type: 'consumable_interactive',
  is_test: isTestToken, // NEW
})
```

**Token Generation** (`/src/lib/tokens.ts`):
Update `generateToken()` to include `isTest` in payload.

### 2. Quote Viewer Address Flow
The quote viewer (`/src/app/q/[token]/page.tsx`) needs to check for shipping address and show collection modal if needed.

**Pattern to Follow**: `/src/app/r/[token]/page.tsx` (reorder portal)

**Key Changes**:
```typescript
// Add to both InteractiveQuoteViewer and StaticToolQuoteViewer components

1. Import PortalAddressCollectionModal
2. Add state for address, loading, and modal visibility
3. Fetch address on mount via /api/portal/shipping-address?token=xxx
4. Show modal if no address exists AND isTest is false
5. Recalculate pricing when address is set (for VAT/shipping)
```

### 3. Address Collection Modal Integration

**Files to Update**:
- `/src/components/InteractiveQuoteViewer.tsx`
- `/src/components/StaticToolQuoteViewer.tsx`

**Example Integration**:
```typescript
const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
const [loadingAddress, setLoadingAddress] = useState(true);
const [showAddressModal, setShowAddressModal] = useState(false);

useEffect(() => {
  const fetchAddress = async () => {
    try {
      const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.success && data.address) {
        setShippingAddress(data.address);
      } else if (!isTestToken) {
        setShowAddressModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch shipping address:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  fetchAddress();
}, [token, isTestToken]);
```

### 4. VAT and Shipping Calculation

**API Endpoint**: `/api/portal/pricing-preview`

**Usage**: After address is collected, call this endpoint to get:
- VAT rate based on country
- VAT amount
- Shipping cost estimate
- Total with VAT and shipping

**Update Quote Display**:
Both quote viewers should show:
```
Subtotal: £XXX.XX
Shipping: £XX.XX
VAT (20%): £XX.XX
-------------------
Total: £XXX.XX
```

### 5. Token Payload Updates

**Current Token Payload**:
```typescript
{
  company_id: string,
  contact_id: string,
  quote_items: QuoteLineItem[],
  pricing_mode: 'standard' | 'premium',
  quote_type: 'consumable_interactive' | 'tool_static'
}
```

**Required Addition**:
```typescript
{
  // ... existing fields
  is_test?: boolean // NEW - bypasses address collection
}
```

### 6. Test Token UI in Quote Builders

Add checkbox in quote generation section:
```tsx
<div className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    id="test-token"
    checked={isTestToken}
    onChange={(e) => setIsTestToken(e.target.checked)}
    className="w-4 h-4 rounded border-gray-300"
  />
  <label htmlFor="test-token" className="text-sm text-gray-700">
    Generate test link (skips address collection)
  </label>
</div>
```

## Files to Modify

### Core Implementation:
1. `/src/lib/tokens.ts` - Add `is_test` to token payload type
2. `/src/app/api/admin/quotes/generate/route.ts` - Accept `is_test` parameter
3. `/src/app/admin/quote-builder/consumables/page.tsx` - Add test token checkbox
4. `/src/app/admin/quote-builder/tools/page.tsx` - Add test token checkbox
5. `/src/components/InteractiveQuoteViewer.tsx` - Add address flow
6. `/src/components/StaticToolQuoteViewer.tsx` - Add address flow

### Supporting Components:
7. `/src/components/portals/PortalAddressCollectionModal.tsx` - Already exists, reuse
8. `/src/app/api/portal/shipping-address/route.ts` - Already exists, supports token auth
9. `/src/app/api/portal/pricing-preview/route.ts` - Already exists for VAT calculation

## Testing Checklist

After implementation, test these scenarios:

### Normal Flow (Customer):
- [ ] Customer opens quote link
- [ ] Address modal appears (if no address exists)
- [ ] Customer enters shipping address
- [ ] VAT and shipping calculated correctly
- [ ] Quote shows correct total with VAT/shipping
- [ ] Customer can proceed to checkout

### Test Flow (Internal):
- [ ] Generate quote with "test link" checkbox enabled
- [ ] Open test quote link
- [ ] NO address modal appears
- [ ] Quote displays immediately without address requirement
- [ ] Can preview and test functionality

### Edge Cases:
- [ ] Expired token shows appropriate error
- [ ] Invalid address rejected with clear message
- [ ] VAT exempt countries handled correctly (e.g., non-UK)
- [ ] Shipping costs vary by country correctly
- [ ] Address can be updated if needed

## Reference Implementation

**Model After**: `/src/app/r/[token]/page.tsx` and `/src/components/PortalPage.tsx`

These files contain the complete working implementation of:
- Token verification
- Address fetching
- Modal display logic
- Test token bypass
- VAT/shipping calculation integration

## Priority

This feature is **HIGH PRIORITY** for production use because:
- Quotes without addresses can't calculate accurate totals
- VAT miscalculation could cause legal/compliance issues
- Shipping cost errors lead to lost revenue
- Test links needed for sales team to preview quotes internally

## Estimated Effort

- **Core Implementation**: 2-3 hours
- **Testing & Refinement**: 1-2 hours
- **Total**: 3-5 hours

## Dependencies

All required components and APIs already exist:
- ✅ PortalAddressCollectionModal component
- ✅ /api/portal/shipping-address endpoint
- ✅ /api/portal/pricing-preview endpoint
- ✅ Token generation and verification system

**No new infrastructure needed** - just integration work.
