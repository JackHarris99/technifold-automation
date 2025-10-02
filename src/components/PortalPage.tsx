'use client';

import { useState } from 'react';
import { CompanyPayload, CartItem, ReorderItem } from '@/types';
import { ReorderTab } from './ReorderTab';
import { ToolTab } from './ToolTab';
import { CartBar } from './CartBar';

interface PortalPageProps {
  payload: CompanyPayload;
}

export function PortalPage({ payload }: PortalPageProps) {
  const [activeTab, setActiveTab] = useState<string>('reorder');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: ReorderItem, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        cartItem => cartItem.consumable_code === item.consumable_code
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity = quantity;
        return newCart;
      } else {
        return [...prevCart, {
          consumable_code: item.consumable_code,
          description: item.description,
          price: item.price,
          quantity
        }];
      }
    });
  };

  const removeFromCart = (consumableCode: string) => {
    setCart(prevCart => prevCart.filter(item => item.consumable_code !== consumableCode));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const getCartQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const tabs = [
    { id: 'reorder', label: 'Reorder' },
    ...payload.by_tool_tabs.map(tab => ({
      id: tab.tool_code,
      label: tab.tool_desc || tab.tool_code
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {payload.company_name} - Consumables Portal
          </h1>
          <div className="mt-2 text-sm text-gray-600">
            {payload.reorder_items.slice(0, 3).map(item => item.description).join(' · ')}
            {payload.reorder_items.length > 3 && '...'}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {tab.id === 'reorder' ? 'Reorder' : tab.label.length > 15 ? `${tab.label.substring(0, 15)}...` : tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'reorder' ? (
              <ReorderTab 
                items={payload.reorder_items}
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ) : (
              (() => {
                const toolTab = payload.by_tool_tabs.find(tab => tab.tool_code === activeTab);
                return toolTab ? (
                  <ToolTab 
                    toolTab={toolTab}
                    cart={cart}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                  />
                ) : null;
              })()
            )}
          </div>
        </div>
      </div>

      {/* Cart Bar */}
      <CartBar 
        itemCount={getCartQuantity()}
        totalPrice={getTotalPrice()}
        cart={cart}
      />
    </div>
  );
}