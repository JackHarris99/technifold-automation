'use client';

import { useState } from 'react';
import { CartItem } from '@/types';

interface PricingLineItem {
  product_code: string;
  description: string;
  quantity: number;
  base_price: number;
  unit_price: number;
  line_total: number;
  discount_applied: string | null;
  image_url?: string | null;
  currency?: string;
}

interface CartBarProps {
  itemCount: number;
  totalPrice: number;
  cart: CartItem[];
  onCheckout: () => void;
  totalSavings?: number;
  shipping?: number;
  vatAmount?: number;
  total?: number;
  pricingLineItems?: PricingLineItem[];
}

export function CartBar({ itemCount, totalPrice, cart, onCheckout, totalSavings, shipping, vatAmount, total, pricingLineItems }: CartBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('[CartBar] Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Expanded Cart Details - shows above the bar */}
      {isExpanded && (
        <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t border-[#e8e8e8] shadow-2xl z-20 max-h-80 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0a0a0a]">Your Cart</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[#999] hover:text-[#666]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {(pricingLineItems && pricingLineItems.length > 0 ? pricingLineItems : cart).map((item) => {
                const isLineItem = 'unit_price' in item;
                const code = isLineItem ? item.product_code : item.consumable_code;
                const description = item.description;
                const quantity = item.quantity;
                const lineTotal = isLineItem ? item.line_total : (item.price * item.quantity);
                const unitPrice = isLineItem ? item.unit_price : item.price;
                const basePrice = isLineItem ? item.base_price : item.price;
                const hasDiscount = isLineItem && item.discount_applied;

                return (
                  <div key={code} className="flex justify-between items-center py-3 border-b border-[#f5f5f5] last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-[#0a0a0a] text-sm">
                        {description}
                      </div>
                      <div className="text-xs text-[#999] font-mono">
                        {code}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-[#16a34a] font-semibold mt-1">
                          {item.discount_applied}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#666] bg-[#f5f5f5] px-2 py-1 rounded">
                        x{quantity}
                      </span>
                      <div className="text-right min-w-[80px]">
                        {hasDiscount && basePrice !== unitPrice && (
                          <div className="text-xs text-[#999] line-through">
                            £{(basePrice * quantity).toFixed(2)}
                          </div>
                        )}
                        <span className="font-semibold text-[#0a0a0a] text-sm">
                          £{lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Breakdown */}
            <div className="mt-5 pt-4 border-t border-[#e8e8e8] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Subtotal:</span>
                <span className="font-semibold text-[#0a0a0a]">£{totalPrice.toFixed(2)}</span>
              </div>
              {shipping !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Shipping:</span>
                  <span className="font-semibold text-[#0a0a0a]">
                    {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
                  </span>
                </div>
              )}
              {vatAmount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">VAT:</span>
                  <span className="font-semibold text-[#0a0a0a]">£{vatAmount.toFixed(2)}</span>
                </div>
              )}
              {total !== undefined && (
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[#e8e8e8]">
                  <span className="text-[#0a0a0a]">Total:</span>
                  <span className="text-[#16a34a]">£{total.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] shadow-2xl z-20 border-t-4 border-[#16a34a]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-4 text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="bg-[#16a34a] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {itemCount}
                </div>
                <div className="text-white">
                  <div className="font-medium text-sm">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                  </div>
                  <div className="text-xs text-[#999] group-hover:text-[#ccc] transition-colors">
                    {isExpanded ? 'Hide details' : 'View details'}
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-[#999] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <div className="flex items-center gap-6">
              <div className="text-right">
                {totalSavings && totalSavings > 0 && (
                  <div className="text-xs text-[#16a34a] font-semibold mb-1">
                    Saving £{totalSavings.toFixed(2)}
                  </div>
                )}
                <div className="text-2xl font-bold text-white">
                  £{(total !== undefined ? total : totalPrice).toFixed(2)}
                </div>
                <div className="text-xs text-[#999]">
                  {total !== undefined ? 'inc. VAT & shipping' : 'excl. VAT'}
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-[#16a34a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Request Invoice'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}