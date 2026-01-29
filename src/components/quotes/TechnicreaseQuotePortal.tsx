'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PortalAddressCollectionModal from '../portals/PortalAddressCollectionModal';

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
  company: {
    company_id: string;
    company_name: string;
    billing_address_line_1?: string;
    billing_address_line_2?: string;
    billing_city?: string;
    billing_state_province?: string;
    billing_postal_code?: string;
    billing_country?: string;
    vat_number?: string;
  };
  contact: {
    contact_id: string;
    full_name: string;
    email: string;
  } | null;
  token: string;
  isTest: boolean;
  readOnly?: boolean;
  previewMode?: 'admin' | 'original';
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
  const shippingAmount = quote.free_shipping ? 0 : 0;
  const vatAmount = 0;
  const isShippingTbc = quote.shipping_tbc || false;

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
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success && data.addresses) {
          setShippingAddresses(data.addresses);
          const defaultAddress = data.addresses.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].address_id);
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
    <>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Test Mode Banner */}
        {isTest && (
          <div className="bg-yellow-50 border-b-2 border-yellow-400 px-6 py-3">
            <div className="max-w-[1600px] mx-auto">
              <p className="text-yellow-800 text-sm font-semibold">⚠️ TEST QUOTE - Not for production use</p>
            </div>
          </div>
        )}

        {/* Admin Preview Banner */}
        {previewMode === 'admin' && (
          <div className="bg-blue-50 border-b-2 border-blue-400 px-6 py-3">
            <div className="max-w-[1600px] mx-auto">
              <p className="text-blue-800 text-sm font-semibold">👁️ Admin Preview - Customers cannot see this banner</p>
            </div>
          </div>
        )}

        {/* Top Branding Bar */}
        <div className="bg-white border-b border-[#e8e8e8]">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-8">
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                  alt="Technifold"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png"
                  alt="Technicrease"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png"
                  alt="Creasestream"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-12">
          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-7 space-y-4">
              {/* Customer Information Card */}
              <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
                <div className="mb-6">
                  <h1 className="text-[28px] font-[600] text-[#1e40af] mb-1 tracking-[-0.02em] leading-[1.2]">
                    {company.company_name}
                  </h1>
                  <p className="text-[13px] text-[#334155] font-[400]">
                    TechniCrease machine quotation
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Contact Info */}
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Contact</div>
                    {contact ? (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <div className="text-[13px] text-[#1e293b] font-[600]">{contact.full_name}</div>
                        <div className="text-[12px] text-[#334155] mt-0.5">{contact.email}</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[12px] text-[#475569] italic">No contact assigned</p>
                      </div>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Billing Address</div>
                      {!readOnly && (
                        <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
                      )}
                    </div>
                    {company.billing_address_line_1 ? (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <div className="text-[12px] font-[500] text-[#1e293b]">{company.billing_address_line_1}</div>
                        {company.billing_address_line_2 && <div className="text-[11px] text-[#334155]">{company.billing_address_line_2}</div>}
                        <div className="text-[11px] text-[#334155]">{company.billing_city}{company.billing_state_province ? `, ${company.billing_state_province}` : ''}</div>
                        <div className="text-[11px] text-[#334155]">{company.billing_postal_code}</div>
                        <div className="text-[12px] font-[500] text-[#1e293b] mt-1">{company.billing_country}</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[11px] text-red-600 italic">No billing address</p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Addresses */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Delivery Addresses</div>
                      {!readOnly && (
                        <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">+ Add</button>
                      )}
                    </div>
                    <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] max-h-[120px] overflow-y-auto">
                      {shippingAddresses.length > 0 ? (
                        shippingAddresses.map((addr, idx) => (
                          <div key={addr.address_id} className={`text-[11px] text-[#334155] ${idx > 0 ? 'mt-2 pt-2 border-t border-[#e2e8f0]' : ''}`}>
                            <div className="font-[500] text-[#1e293b]">{addr.address_line_1}</div>
                            {addr.address_line_2 && <div>{addr.address_line_2}</div>}
                            <div>{addr.city}, {addr.postal_code}</div>
                            <div className="font-[500]">{addr.country}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-[#475569] italic">No delivery addresses</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Items Card */}
              <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
                <div className="mb-4">
                  <div className="text-[12px] font-[700] text-[#475569] uppercase tracking-[0.05em]">Quote Items</div>
                  <p className="text-[13px] text-[#64748b] mt-1">
                    {machineGroups.length} machine{machineGroups.length !== 1 ? 's' : ''} quoted
                  </p>
                </div>

                <div className="space-y-6">
                  {machineGroups.map(({ machine, tools }) => (
                    <div key={machine.quote_item_id} className="border border-[#e2e8f0] rounded-[12px] p-4 bg-[#f8fafc]">
                      {/* Machine */}
                      <div className="flex gap-4 mb-4">
                        {machine.image_url && (
                          <div className="flex-shrink-0">
                            <Image
                              src={machine.image_url}
                              alt={machine.description}
                              width={96}
                              height={96}
                              className="rounded-[10px] border border-[#e2e8f0] object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-[16px] font-[600] text-[#1e293b] mb-1">{machine.description}</h3>
                          <p className="text-[12px] text-[#64748b] mb-2">{machine.product_code}</p>
                          {machine.configuration?.width && (
                            <p className="text-[13px] text-[#0ea5e9] font-[500] mb-2">Width: {machine.configuration.width}</p>
                          )}
                          <div className="text-[20px] font-[700] text-[#1e293b]">
                            £{machine.unit_price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Tools for this machine */}
                      {tools.length > 0 && (
                        <div className="ml-6 mt-4 pl-4 border-l-2 border-[#cbd5e1] space-y-2">
                          <p className="text-[11px] font-[600] text-[#64748b] uppercase tracking-wider mb-2">Included Tools</p>
                          {tools.map(tool => (
                            <div key={tool.quote_item_id} className="flex items-center gap-3 bg-white p-3 rounded-[10px] border border-[#e2e8f0]">
                              {tool.image_url && (
                                <Image
                                  src={tool.image_url}
                                  alt={tool.description}
                                  width={48}
                                  height={48}
                                  className="rounded-[8px] border border-[#e2e8f0] object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-[13px] font-[600] text-[#1e293b]">{tool.description}</p>
                                <p className="text-[11px] text-[#64748b]">{tool.product_code}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[12px] text-[#64748b]">Qty: {tool.quantity}</p>
                                <p className="text-[14px] font-[600] text-[#1e293b]">
                                  {tool.unit_price === 0 ? (
                                    <span className="text-[#16a34a]">Included</span>
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
            <div className="col-span-5">
              <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.24)] sticky top-6">
                <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                    <span className="font-[700] text-[17px] tracking-[-0.01em]">£{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                    <span className="font-[600] text-[16px]">
                      {isShippingTbc ? 'TBC' : 'FREE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                    <span className="text-[15px] text-[#999] font-[500]">VAT</span>
                    <span className="font-[600] text-[16px]">£{vatAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                    <span className="text-[17px] font-[700]">Final Total</span>
                    <span className="font-[800] text-[28px] tracking-[-0.02em] text-[#16a34a]">£{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {readOnly ? (
                  <div className="w-full mt-6 py-4 bg-gray-700 text-gray-300 rounded-[14px] text-[15px] font-[700] text-center border-2 border-dashed border-gray-600">
                    {previewMode === 'admin' ? 'Customers will see "Request Invoice" button here' : 'Quote Accepted - Invoice Sent'}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleRequestInvoice}
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-[14px] text-[15px] font-[700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(22,163,74,0.3)]"
                    >
                      {isSubmitting ? 'Submitting for Approval...' : 'Request Invoice'}
                    </button>
                    <p className="text-[11px] text-[#999] text-center mt-3">
                      This quote requires approval. Our team will review and contact you shortly.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <PortalAddressCollectionModal
          token={token}
          onClose={() => setShowAddressModal(false)}
          onSuccess={() => {
            setShowAddressModal(false);
            // Refresh page to update addresses
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
