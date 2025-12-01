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
      {/* Fixed Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-3 text-left"
            >
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </div>
              <span className="text-gray-600 text-sm hidden sm:inline">
                View cart details
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ${totalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Cart Details */}
      {isExpanded && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart Items</h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.consumable_code} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {item.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      Code: {item.consumable_code}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    {item.price && (
                      <span className="font-medium text-gray-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind cart */}
      <div className="h-20" />
    </>
  );
}