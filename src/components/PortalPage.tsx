'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CompanyPayload, CartItem, ReorderItem } from '@/types';
import { ReorderTab } from './ReorderTab';
import { ToolTab } from './ToolTab';
import { CartBar } from './CartBar';
import { InvoiceRequestModal } from './InvoiceRequestModal';

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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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

  const handleRequestInvoice = () => {
    if (cart.length === 0) return;
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSuccess = (orderId: string) => {
    console.log('[PortalPage] Invoice created successfully:', orderId);
    // Clear cart after successful invoice request
    setCart([]);
    setIsInvoiceModalOpen(false);
    // Show success message - invoice sent to email
  };

  const tabs = [
    { id: 'reorder', label: 'Previously Ordered', code: '', icon: 'clock' },
    ...(payload.by_tool_tabs || []).map(tab => ({
      id: tab.tool_code,
      label: tab.tool_desc || tab.tool_code,
      code: tab.tool_code,
      icon: 'tool'
    }))
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex items-center">
                <div className="relative w-36 h-10">
                  <Image
                    src="/technifold-logo-white.svg"
                    alt="Technifold"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="h-8 w-px bg-slate-600"></div>
              <div>
                <h1 className="text-lg font-bold text-white">{payload.company_name}</h1>
                <p className="text-xs text-slate-300">Consumables Reorder Portal</p>
              </div>
            </div>
            {contact && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-300">Welcome back,</p>
                <p className="text-sm font-medium text-white">{contact.full_name}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar Navigation */}
          <nav className="w-72 bg-white border-r border-slate-200 overflow-y-auto shadow-sm flex-shrink-0">
          <div className="p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Browse Products
            </h2>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon === 'clock' ? (
                      <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${activeTab === tab.id ? 'text-white' : ''}`}>
                        {tab.label}
                      </div>
                      {tab.code && (
                        <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {tab.code}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Box */}
          <div className="p-5 border-t border-slate-200">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Need Help?</h3>
              <p className="text-xs text-slate-500 mb-3">Our team is here to assist with your order.</p>
              <a href="tel:+441455554491" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                +44 (0)1455 554491
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
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
      </div>

      {/* Cart Bar */}
      <CartBar
        itemCount={getCartQuantity()}
        totalPrice={getTotalPrice()}
        cart={cart}
        onCheckout={handleRequestInvoice}
      />

      {/* Invoice Request Modal */}
      <InvoiceRequestModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        cart={cart}
        companyId={String(payload.company_id)}
        contactId={contact?.contact_id}
        onSuccess={handleInvoiceSuccess}
      />
    </div>
  );
}