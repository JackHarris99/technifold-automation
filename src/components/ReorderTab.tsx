'use client';

import { useState } from 'react';
import { ReorderItem, CartItem } from '@/types';
import { QuantityPicker } from './QuantityPicker';

interface ReorderTabProps {
  items: ReorderItem[];
  cart: CartItem[];
  onAddToCart: (item: ReorderItem, quantity: number) => void;
  onRemoveFromCart: (consumableCode: string) => void;
}

export function ReorderTab({ items, cart, onAddToCart, onRemoveFromCart }: ReorderTabProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (consumableCode: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [consumableCode]: quantity }));
    
    if (quantity > 0) {
      const item = items.find(i => i.consumable_code === consumableCode);
      if (item) {
        onAddToCart(item, quantity);
      }
    } else {
      onRemoveFromCart(consumableCode);
    }
  };

  const handleAddAll = () => {
    items.forEach(item => {
      const currentQty = quantities[item.consumable_code] || 0;
      const newQty = currentQty + 1;
      handleQuantityChange(item.consumable_code, newQty);
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never purchased';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        <button
          onClick={handleAddAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add All
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No previous orders found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const cartItem = cart.find(c => c.consumable_code === item.consumable_code);
            const currentQuantity = cartItem?.quantity || 0;
            
            return (
              <div
                key={item.consumable_code}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {item.description}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {item.consumable_code}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Last purchased: {formatDate(item.last_purchased)}
                    </span>
                    {item.price && (
                      <span className="font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <QuantityPicker
                    value={currentQuantity}
                    onChange={(qty) => handleQuantityChange(item.consumable_code, qty)}
                    max={99}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}