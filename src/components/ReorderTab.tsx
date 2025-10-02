'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

  // Initialize quantities from cart
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    cart.forEach(item => {
      if (items.some(i => i.consumable_code === item.consumable_code)) {
        initialQuantities[item.consumable_code] = item.quantity;
      }
    });
    setQuantities(initialQuantities);
  }, [cart, items]);

  const handleQuantityChange = (consumableCode: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [consumableCode]: quantity }));

    const item = items.find(i => i.consumable_code === consumableCode);
    if (item) {
      if (quantity > 0) {
        onAddToCart(item, quantity);
      } else {
        onRemoveFromCart(consumableCode);
      }
    }
  };

  const handleAddToCart = (consumableCode: string) => {
    const currentQty = quantities[consumableCode] || 0;
    const newQty = currentQty > 0 ? currentQty : 1;
    handleQuantityChange(consumableCode, newQty);
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    console.log('Item:', item.consumable_code, 'Category:', item.category, 'Result:', category);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Previously Ordered Consumables</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
          No previous orders found
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
                {category}
              </h3>
              <div className="space-y-2">
                {groupedItems[category].map((item) => {
                  const currentQuantity = quantities[item.consumable_code] || 0;
            
                  return (
              <div
                key={item.consumable_code}
                className="bg-white rounded-lg border-2 border-green-400 ring-1 ring-green-100 transition-all hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0">
                      <Image
                        src={`/product_images/${item.consumable_code}.jpg`}
                        alt={item.description}
                        fill
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/product-placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.description}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Code: {item.consumable_code}
                          </p>
                          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Previously Ordered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {item.price ? (
                          <div className="text-lg font-semibold text-gray-900">
                            £{item.price.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Price on request
                          </div>
                        )}
                      </div>

                      {/* Quantity Picker and Add to Cart */}
                      <div className="flex items-center gap-2">
                        <QuantityPicker
                          value={currentQuantity}
                          onChange={(qty) => handleQuantityChange(item.consumable_code, qty)}
                          max={99}
                        />
                        <button
                          onClick={() => handleAddToCart(item.consumable_code)}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            currentQuantity > 0
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {currentQuantity > 0 ? 'Update' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}