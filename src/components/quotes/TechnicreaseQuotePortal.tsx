'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LineItem {
  quote_item_id: string;
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  parent_line_number: number | null;
  line_number: number;
  configuration: any;
  image_url: string | null;
}

interface TechnicreaseQuotePortalProps {
  quote: any;
  lineItems: LineItem[];
  company: any;
  contact: any;
  token: string;
  isTest: boolean;
  readOnly?: boolean;
  previewMode?: 'admin';
}

export function TechnicreaseQuotePortal({
  quote,
  lineItems,
  company,
  contact,
  token,
  isTest,
  readOnly = false,
  previewMode,
}: TechnicreaseQuotePortalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Use totals directly from quote (no recalculation)
  const subtotal = Number(quote.subtotal) || 0;
  const totalAmount = Number(quote.total_amount) || 0;
  const shippingAmount = quote.free_shipping ? 0 : 0; // TechniCrease typically has free shipping
  const vatAmount = 0; // VAT calculated on backend

  // Group line items by parent (machines with their tools)
  const machineGroups = lineItems
    .filter(item => item.parent_line_number === null)
    .map(machine => ({
      machine,
      tools: lineItems.filter(item => item.parent_line_number === machine.line_number),
    }));

  // Fetch shipping addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/portal/shipping-addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.success && data.addresses) {
          setShippingAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: any) => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.shipping_address_id);
          }
        }
      } catch (error) {
        console.error('[TechnicreaseQuote] Failed to fetch addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token]);

  const handleRequestInvoice = async () => {
    if (!selectedAddressId && shippingAddresses.length > 0) {
      alert('Please select a shipping address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/portal/create-invoice-interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          quote_id: quote.quote_id,
          shipping_address_id: selectedAddressId,
        }),
      });

      const data = await response.json();

      if (data.requires_approval) {
        // TechniCrease quote submitted for approval
        router.push('/quote/submitted-approval');
      } else if (data.success) {
        router.push('/quote/success');
      } else {
        alert('Failed to create invoice: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[TechnicreaseQuote] Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">TechniCrease Quote</h1>
          <p className="text-orange-100">
            Custom configured TechniCrease finishing system for {company.company_name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Quote Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Mode Banner */}
            {isTest && (
              <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-500 font-semibold">⚠️ TEST QUOTE - Not for production use</p>
              </div>
            )}

            {/* Admin Preview Banner */}
            {previewMode === 'admin' && (
              <div className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-4">
                <p className="text-blue-400 font-semibold">👁️ Admin Preview - Customers cannot see this banner</p>
              </div>
            )}

            {/* Quote Items Card */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quote Items</h2>
              <p className="text-sm text-gray-400 mb-6">
                {machineGroups.length} machine{machineGroups.length !== 1 ? 's' : ''} configured
              </p>

              <div className="space-y-6">
                {machineGroups.map(({ machine, tools }, index) => (
                  <div key={machine.quote_item_id} className="border border-gray-800 rounded-lg p-4">
                    {/* Machine */}
                    <div className="flex gap-4 mb-4">
                      {machine.image_url && (
                        <img
                          src={machine.image_url}
                          alt={machine.description}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{machine.description}</h3>
                        <p className="text-sm text-gray-400 mb-2">{machine.product_code}</p>
                        {machine.configuration?.width && (
                          <p className="text-sm text-orange-400">Width: {machine.configuration.width}</p>
                        )}
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-orange-500">
                            £{machine.unit_price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tools for this machine */}
                    {tools.length > 0 && (
                      <div className="ml-6 mt-4 space-y-2 border-l-2 border-gray-800 pl-4">
                        <p className="text-sm font-semibold text-gray-400 mb-2">Included Tools:</p>
                        {tools.map(tool => (
                          <div key={tool.quote_item_id} className="flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-lg">
                            {tool.image_url && (
                              <img
                                src={tool.image_url}
                                alt={tool.description}
                                className="w-12 h-12 object-cover rounded border border-gray-700"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-white">{tool.description}</p>
                              <p className="text-xs text-gray-500">{tool.product_code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Qty: {tool.quantity}</p>
                              <p className="font-semibold text-white">
                                {tool.unit_price === 0 ? (
                                  <span className="text-green-500">Included</span>
                                ) : (
                                  `£${tool.unit_price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold">£{subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-semibold text-green-500">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">VAT</span>
                  <span className="font-semibold">£{vatAmount.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-800 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Final Total</span>
                    <span className="text-2xl font-bold text-orange-500">
                      £{totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {readOnly ? (
                <div className="w-full py-4 bg-gray-700 text-gray-300 rounded-lg text-center border-2 border-dashed border-gray-600">
                  {previewMode === 'admin' ? 'Customers will see "Request Invoice" button here' : 'Quote Accepted - Invoice Sent'}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleRequestInvoice}
                    disabled={isSubmitting || (shippingAddresses.length > 0 && !selectedAddressId)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Invoice'}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    This quote requires approval. Our team will review and contact you shortly.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
