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
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Previously Ordered</h2>
          <p className="text-[#666] mt-1">Quick reorder from your purchase history</p>
        </div>
        {items.length > 0 && (
          <div className="text-sm text-[#666] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e8e8e8]">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e8e8e8]">
          <svg className="w-16 h-16 mx-auto text-[#ccc] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">No Previous Orders</h3>
          <p className="text-[#666]">Browse your tools to find compatible consumables</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-[#0a0a0a]">{category}</h3>
                <div className="flex-1 h-px bg-[#e8e8e8]"></div>
                <span className="text-sm text-[#666]">{groupedItems[category].length} items</span>
              </div>
              <div className="grid gap-3">
                {groupedItems[category].map((item) => {
                  const currentQuantity = quantities[item.consumable_code] || 0;
                  const isInCart = currentQuantity > 0;

                  return (
                    <div
                      key={item.consumable_code}
                      className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                        isInCart ? 'border-[#16a34a] shadow-md' : 'border-[#e8e8e8] hover:border-[#ccc]'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 bg-[#fafafa] rounded-lg flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
                            <Image
                              src={item.image_url || '/product-placeholder.svg'}
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
                            <h4 className="text-base font-semibold text-[#0a0a0a] leading-tight">
                              {item.description}
                            </h4>
                            <p className="text-sm text-[#999] font-mono mt-1">
                              {item.consumable_code}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right px-4">
                            {item.price ? (
                              <div className="text-xl font-bold text-[#0a0a0a]">
                                £{item.price.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-sm text-[#999]">
                                Price on request
                              </div>
                            )}
                          </div>

                          {/* Quantity Picker and Add to Cart */}
                          <div className="flex items-center gap-3">
                            <QuantityPicker
                              value={currentQuantity}
                              onChange={(qty) => handleQuantityChange(item.consumable_code, qty)}
                              max={99}
                            />
                            <button
                              onClick={() => handleAddToCart(item.consumable_code)}
                              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                                isInCart
                                  ? 'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-sm'
                                  : 'bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] shadow-sm'
                              }`}
                            >
                              {isInCart ? 'In Cart' : 'Add'}
                            </button>
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