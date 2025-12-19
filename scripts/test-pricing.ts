/**
 * Test the tiered pricing engine
 */

import { calculateCartPricing, CartItem } from '../src/lib/pricing';

// Test scenarios
const scenarios = [
  {
    name: '£33 Products - Small Order (3 items)',
    items: [
      { product_code: 'SPACER-01', quantity: 2, category: 'Spacer', base_price: 33.00 },
      { product_code: 'BLADE-SEAL-01', quantity: 1, category: 'Blade Seal', base_price: 33.00 },
    ],
  },
  {
    name: '£33 Products - Medium Order (15 items)',
    items: [
      { product_code: 'SPACER-01', quantity: 5, category: 'Spacer', base_price: 33.00 },
      { product_code: 'NYLON-01', quantity: 10, category: 'Nylon Sleeve', base_price: 33.00 },
    ],
  },
  {
    name: '£33 Products - Large Order (35+ items)',
    items: [
      { product_code: 'RUBBER-01', quantity: 20, category: 'Rubber Creasing Band', base_price: 33.00 },
      { product_code: 'PLASTIC-01', quantity: 20, category: 'Plastic Creasing Band', base_price: 33.00 },
    ],
  },
  {
    name: 'Premium Products - Small Order (2 Cutting Boss)',
    items: [
      { product_code: 'CB-001', quantity: 2, category: 'Cutting Boss', base_price: 99.00 },
    ],
  },
  {
    name: 'Premium Products - Volume Discount (5 Micro-Perf)',
    items: [
      { product_code: 'MPB-001', quantity: 5, category: 'Micro-Perforation Blade', base_price: 79.00 },
    ],
  },
  {
    name: 'Premium Products - Max Discount (10 Cutting Knife)',
    items: [
      { product_code: 'CK-001', quantity: 10, category: 'Cutting Knife', base_price: 59.00 },
    ],
  },
  {
    name: 'Mixed Cart - £33 + Premium',
    items: [
      { product_code: 'SPACER-01', quantity: 10, category: 'Spacer', base_price: 33.00 },
      { product_code: 'NYLON-01', quantity: 10, category: 'Nylon Sleeve', base_price: 33.00 },
      { product_code: 'CB-001', quantity: 3, category: 'Cutting Boss', base_price: 99.00 },
      { product_code: 'MPB-001', quantity: 5, category: 'Micro-Perforation Blade', base_price: 79.00 },
    ],
  },
  {
    name: 'Validation Error - Exceeds Max Qty',
    items: [
      { product_code: 'SPACER-01', quantity: 25, category: 'Spacer', base_price: 33.00 },
    ],
  },
];

console.log('=== Tiered Pricing Engine Test ===\n');

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log('-'.repeat(70));

  const result = calculateCartPricing(scenario.items as CartItem[]);

  if (result.validation_errors.length > 0) {
    console.log('❌ VALIDATION ERRORS:');
    result.validation_errors.forEach(err => console.log(`   ${err}`));
  } else {
    console.log('Cart Items:');
    result.items.forEach(item => {
      const originalPrice = item.base_price;
      const savings = (originalPrice - item.unit_price) * item.quantity;
      console.log(`  ${item.product_code.padEnd(20)} x${item.quantity.toString().padStart(2)}`);
      console.log(`    ${item.category}`);
      console.log(`    Base: £${originalPrice.toFixed(2)} → Unit: £${item.unit_price.toFixed(2)} = £${item.line_total.toFixed(2)}`);
      if (item.discount_applied) {
        console.log(`    💰 ${item.discount_applied}`);
      }
      if (savings > 0) {
        console.log(`    💵 Saves: £${savings.toFixed(2)}`);
      }
    });

    const totalSavings = result.items.reduce((sum, item) => {
      return sum + ((item.base_price - item.unit_price) * item.quantity);
    }, 0);

    console.log(`\n  Subtotal: £${result.subtotal.toFixed(2)}`);
    if (totalSavings > 0) {
      console.log(`  Total Savings: £${totalSavings.toFixed(2)}`);
    }
  }
});

console.log('\n\n=== Test Complete ===');
