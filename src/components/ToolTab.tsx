'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ToolTab as ToolTabType, CartItem } from '@/types';
import { QuantityPicker } from './QuantityPicker';

interface ToolTabProps {
  toolTab: ToolTabType;
  cart: CartItem[];
  allCompatibleConsumables?: Array<{
    consumable_code: string;
    description: string;
    price: number | null;
    category?: string;
    last_purchased: string | null;
  }>;
  onAddToCart: (item: ToolTabType['items'][0], quantity: number) => void;
  onRemoveFromCart: (consumableCode: string) => void;
}

export function ToolTab({
  toolTab,
  cart,
  allCompatibleConsumables,
  onAddToCart,
  onRemoveFromCart
}: ToolTabProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Get all consumables - either from allCompatibleConsumables or toolTab items
  const allItems = allCompatibleConsumables || toolTab.items;

  // Initialize quantities from cart
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    cart.forEach(item => {
      if (allItems.some(i => i.consumable_code === item.consumable_code)) {
        initialQuantities[item.consumable_code] = item.quantity;
      }
    });
    setQuantities(initialQuantities);
  }, [cart, allItems]);

  const handleQuantityChange = (consumableCode: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [consumableCode]: quantity }));

    const item = allItems.find(i => i.consumable_code === consumableCode);
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
  type ItemWithCategory = typeof allItems[0] & { category?: string };
  const groupedItems = allItems.reduce((acc, item) => {
    const itemWithCategory = item as ItemWithCategory;
    const category = itemWithCategory.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-6">
      {/* Tool Header Card */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white shadow-lg border border-[#333]">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 bg-white/10 rounded-xl flex-shrink-0 overflow-hidden">
            <Image
              src={`/product_images/${toolTab.tool_code}.jpg`}
              alt={toolTab.tool_desc || toolTab.tool_code}
              fill
              className="object-contain p-3"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/product-placeholder.svg';
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {toolTab.tool_desc || toolTab.tool_code}
            </h2>
            <p className="text-[#999] font-mono text-sm mt-1">{toolTab.tool_code}</p>
            <p className="text-[#ccc] text-sm mt-2">
              {allItems.length} compatible consumable{allItems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Consumables List */}
      {allItems.length === 0 ? (
        <div className="text-center py-16 bg-amber-50 rounded-2xl border-2 border-amber-200">
          <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Consumables Linked Yet</h3>
          <p className="text-amber-700 mb-4">
            Consumables for this tool haven't been set up in our system yet.
          </p>
          <p className="text-amber-800 font-medium">
            Please call us for assistance:
          </p>
          <a href="tel:+441455554491" className="inline-block mt-2 text-xl font-bold text-blue-600 hover:text-blue-800">
            +44 (0)1455 554491
          </a>
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