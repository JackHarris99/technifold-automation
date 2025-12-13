'use client';

import { useState } from 'react';
import { CartItem } from '@/types';

interface CartBarProps {
  itemCount: number;
  totalPrice: number;
  cart: CartItem[];
  onCheckout: () => void;
}

export function CartBar({ itemCount, totalPrice, cart, onCheckout }: CartBarProps) {
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
        <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-20 max-h-80 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Your Cart</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.consumable_code} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">
                      {item.description}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {item.consumable_code}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      x{item.quantity}
                    </span>
                    {item.price && (
                      <span className="font-semibold text-slate-900 text-sm min-w-[80px] text-right">
                        £{(item.price * item.quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl z-20 border-t-4 border-blue-500">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-4 text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {itemCount}
                </div>
                <div className="text-white">
                  <div className="font-medium text-sm">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                  </div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    {isExpanded ? 'Hide details' : 'View details'}
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  £{totalPrice.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">excl. VAT</div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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