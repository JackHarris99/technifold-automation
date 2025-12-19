/**
 * Tiered Pricing Engine
 * Handles two separate pricing groups with different rules
 */

export interface CartItem {
  product_code: string;
  quantity: number;
  category: string;
  base_price: number;
  type?: string;
}

export interface PricedCartItem extends CartItem {
  unit_price: number;
  line_total: number;
  discount_applied?: string;
}

// Group 1: £33 Products - Categories that get tiered pricing
const TIER_33_CATEGORIES = [
  'Blade Seal',
  'Female Receiver Ring',
  'Gripper Band',
  'Nylon Sleeve',
  'Plastic Creasing Band',
  'Rubber Creasing Band',
  'Section Scoring Band',
  'Spacer',
  'Waste-Stripper',
];

// Group 2: Premium Products - Categories that get percentage discounts
const PREMIUM_CATEGORIES = [
  'Cutting Boss',
  'Cutting Knife',
  'Micro-Perforation Blade',
];

// Group 1 Pricing Tiers (based on total quantity across all £33 products)
const TIER_33_PRICING = [
  { min: 35, price: 20.00 },
  { min: 30, price: 21.00 },
  { min: 25, price: 22.00 },
  { min: 20, price: 23.00 },
  { min: 10, price: 25.00 },
  { min: 8, price: 27.00 },
  { min: 4, price: 29.00 },
  { min: 1, price: 33.00 },
];

// Group 2 Volume Discounts (based on individual SKU quantity)
const PREMIUM_DISCOUNTS = [
  { min: 10, discount: 0.25 }, // 25% off
  { min: 5, discount: 0.15 },  // 15% off
  { min: 3, discount: 0.07 },  // 7% off
  { min: 1, discount: 0.00 },  // 0% off
];

// Maximum order quantities
export const MAX_QTY_TIER_33 = 20;
export const MAX_QTY_PREMIUM = 10;

/**
 * Calculate prices for all items in cart
 */
export function calculateCartPricing(items: CartItem[]): {
  items: PricedCartItem[];
  subtotal: number;
  validation_errors: string[];
} {
  const validation_errors: string[] = [];
  const pricedItems: PricedCartItem[] = [];

  // Separate items into groups
  const tier33Items = items.filter(item => TIER_33_CATEGORIES.includes(item.category));
  const premiumItems = items.filter(item => PREMIUM_CATEGORIES.includes(item.category));
  const standardItems = items.filter(item =>
    !TIER_33_CATEGORIES.includes(item.category) &&
    !PREMIUM_CATEGORIES.includes(item.category)
  );

  // Validate max quantities
  tier33Items.forEach(item => {
    if (item.quantity > MAX_QTY_TIER_33) {
      validation_errors.push(
        `${item.product_code}: Maximum ${MAX_QTY_TIER_33} units per SKU (you have ${item.quantity})`
      );
    }
  });

  premiumItems.forEach(item => {
    if (item.quantity > MAX_QTY_PREMIUM) {
      validation_errors.push(
        `${item.product_code}: Maximum ${MAX_QTY_PREMIUM} units per SKU (you have ${item.quantity})`
      );
    }
  });

  // Calculate Group 1: £33 Products (tiered pricing based on total quantity)
  const tier33TotalQty = tier33Items.reduce((sum, item) => sum + item.quantity, 0);
  const tier33UnitPrice = getTier33Price(tier33TotalQty);

  tier33Items.forEach(item => {
    const unit_price = tier33UnitPrice;
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
      discount_applied: `Tier pricing: ${tier33TotalQty} total units @ £${tier33UnitPrice.toFixed(2)}`,
    });
  });

  // Calculate Group 2: Premium Products (percentage discount per SKU)
  premiumItems.forEach(item => {
    const discount = getPremiumDiscount(item.quantity);
    const unit_price = item.base_price * (1 - discount);
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
      discount_applied: discount > 0 ? `${(discount * 100).toFixed(0)}% volume discount` : undefined,
    });
  });

  // Calculate Group 3: Standard Products (no special pricing)
  standardItems.forEach(item => {
    const unit_price = item.base_price;
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
    });
  });

  const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);

  return {
    items: pricedItems,
    subtotal,
    validation_errors,
  };
}

/**
 * Get tier price for £33 products based on total quantity
 */
function getTier33Price(totalQuantity: number): number {
  for (const tier of TIER_33_PRICING) {
    if (totalQuantity >= tier.min) {
      return tier.price;
    }
  }
  return 33.00; // Default to highest price
}

/**
 * Get discount percentage for premium products based on SKU quantity
 */
function getPremiumDiscount(quantity: number): number {
  for (const tier of PREMIUM_DISCOUNTS) {
    if (quantity >= tier.min) {
      return tier.discount;
    }
  }
  return 0.00; // No discount
}

/**
 * Check if a category is in the £33 tier pricing group
 */
export function isTier33Category(category: string): boolean {
  return TIER_33_CATEGORIES.includes(category);
}

/**
 * Check if a category is in the premium discount group
 */
export function isPremiumCategory(category: string): boolean {
  return PREMIUM_CATEGORIES.includes(category);
}

/**
 * Get max quantity allowed for a product based on its category
 */
export function getMaxQuantity(category: string): number | null {
  if (TIER_33_CATEGORIES.includes(category)) return MAX_QTY_TIER_33;
  if (PREMIUM_CATEGORIES.includes(category)) return MAX_QTY_PREMIUM;
  return null; // No limit
}

/**
 * Get pricing info for a category (for display purposes)
 */
export function getCategoryPricingInfo(category: string): {
  type: 'tier_33' | 'premium' | 'standard';
  max_qty?: number;
  description: string;
} {
  if (TIER_33_CATEGORIES.includes(category)) {
    return {
      type: 'tier_33',
      max_qty: MAX_QTY_TIER_33,
      description: 'Tiered group pricing - lower prices for higher total quantities across all consumables',
    };
  }

  if (PREMIUM_CATEGORIES.includes(category)) {
    return {
      type: 'premium',
      max_qty: MAX_QTY_PREMIUM,
      description: 'Volume discount - 7% off at 3+, 15% off at 5+, 25% off at 10+',
    };
  }

  return {
    type: 'standard',
    description: 'Standard pricing',
  };
}
