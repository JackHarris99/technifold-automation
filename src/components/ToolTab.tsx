'use client';

import { useState, useEffect } from 'react';
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

  // Create a set of previously ordered product codes for highlighting
  const previouslyOrderedCodes = new Set(
    toolTab.items.map(item => item.consumable_code)
  );

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

  return (
    <div className="space-y-4">
      {/* Tool Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
              <img
                src={`/product_images/${toolTab.tool_code}.jpg`}
                alt={toolTab.tool_desc || toolTab.tool_code}
                className="w-full h-full object-contain p-2 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/product-placeholder.svg';
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {toolTab.tool_desc || toolTab.tool_code}
              </h2>
              <p className="text-sm text-gray-500">Tool Code: {toolTab.tool_code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consumables List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Compatible Consumables</h3>

        {allItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
            No consumables found for this tool
          </div>
        ) : (
          <div className="space-y-2">
            {allItems.map((item) => {
              const currentQuantity = quantities[item.consumable_code] || 0;
              const wasOrdered = previouslyOrderedCodes.has(item.consumable_code);

              return (
                <div
                  key={item.consumable_code}
                  className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${
                    wasOrdered
                      ? 'border-green-400 ring-1 ring-green-100'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0">
                        <img
                          src={`/product_images/${item.consumable_code}.jpg`}
                          alt={item.description}
                          className="w-full h-full object-contain p-2"
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
                            {allCompatibleConsumables && 'category' in item && (item as any).category && (
                              <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {(item as any).category}
                              </span>
                            )}
                            {wasOrdered && (
                              <span className="inline-block ml-2 mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Previously Ordered
                              </span>
                            )}
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
        )}
      </div>
    </div>
  );
}