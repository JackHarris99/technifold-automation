'use client';

import { useState } from 'react';
import { CompanyPayload, CartItem, ReorderItem } from '@/types';
import { ReorderTab } from './ReorderTab';
import { ToolTab } from './ToolTab';
import { CartBar } from './CartBar';

interface PortalPageProps {
  payload: CompanyPayload;
  contact?: {
    contact_id: string;
    full_name: string;
    email: string;
  };
}

export function PortalPage({ payload, contact }: PortalPageProps) {
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
    { id: 'reorder', label: 'Previously Ordered', code: '' },
    ...(payload.by_tool_tabs || []).map(tab => ({
      id: tab.tool_code,
      label: tab.tool_desc || tab.tool_code,
      code: tab.tool_code
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder */}
              <div className="flex items-center">
                <div className="w-32 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                  Technifold Logo
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{payload.company_name}</h1>
                <p className="text-xs text-gray-500">Consumables Portal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar Navigation */}
        <nav className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Select Products
            </h2>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {tab.label}
                  </div>
                  {tab.code && (
                    <div className="text-xs text-gray-500 mt-1">
                      Code: {tab.code}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
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
        </main>
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