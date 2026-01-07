/**
 * Invoice Request Modal
 * For invoice-led billing in customer portal
 * Replaces checkout-led flow with Stripe Invoice
 */

'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import AddressCollectionModal from './portals/AddressCollectionModal';

interface PricingPreview {
  line_items: Array<{
    product_code: string;
    description: string;
    quantity: number;
    base_price: number;
    unit_price: number;
    line_total: number;
    discount_applied: string | null;
  }>;
  subtotal: number;
  shipping?: number;
  vat_amount?: number;
  vat_rate?: number;
  total?: number;
  total_savings: number;
}

interface InvoiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  companyId: string;
  contactId?: string;
  onSuccess: (orderId: string) => void;
  token: string; // HMAC token for API authentication
  pricingPreview?: PricingPreview | null;
  quoteType?: 'static' | 'interactive'; // Determines which invoice API to call
}

interface InvoiceResult {
  success: boolean;
  order_id: string;
  invoice_id: string;
  invoice_url: string;
  invoice_pdf_url?: string;
}

interface CompanyDetails {
  company_id: string;
  company_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  vat_number: string;
}

export function InvoiceRequestModal({
  isOpen,
  onClose,
  cart,
  companyId,
  contactId,
  onSuccess,
  token,
  pricingPreview,
  quoteType = 'interactive', // Default to interactive for backwards compatibility
}: InvoiceRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');

  if (!isOpen) return null;

  const handleRequestInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if company details are complete (with token authentication)
      const checkResponse = await fetch(`/api/companies/check-details-needed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const checkData = await checkResponse.json();

      if (checkData.details_needed) {
        // Show address collection modal
        setCompanyName(checkData.company.company_name || 'Your Company');
        setShowAddressModal(true);
        setLoading(false);
        return;
      }

      // Proceed with invoice creation
      await createInvoice();
    } catch (err) {
      console.error('[InvoiceRequestModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      // Use pricing preview if available (contains calculated tiered pricing)
      // Otherwise fall back to cart prices
      // IMPORTANT: Filter out items with quantity 0
      const invoiceItems = pricingPreview?.line_items && pricingPreview.line_items.length > 0
        ? pricingPreview.line_items
            .filter(item => item.quantity > 0)
            .map(item => ({
              product_code: item.product_code,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price, // Use CALCULATED price from pricing preview
            }))
        : cart
            .filter(item => item.quantity > 0)
            .map(item => ({
              product_code: item.consumable_code,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.price, // Fallback to cart price if no preview
            }));

      // Call correct API based on quote type
      const apiEndpoint = quoteType === 'static'
        ? '/api/portal/create-invoice-static'
        : '/api/portal/create-invoice-interactive';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, // Token for authentication
          contact_id: contactId,
          items: invoiceItems,
          currency: 'gbp',
          offer_key: quoteType === 'static' ? 'portal_quote_static' : 'portal_quote_interactive',
          campaign_key: `quote_${new Date().toISOString().split('T')[0]}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create invoice';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON (e.g., HTML error page), use generic message
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      setInvoiceResult(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      setLoading(false);
      throw err;
    }
  };

  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    setLoading(true);
    await createInvoice();
  };

  const handleAddressCancel = () => {
    setShowAddressModal(false);
  };

  const handleClose = () => {
    if (!loading) {
      setInvoiceResult(null);
      setError(null);
      setShowAddressModal(false);
      onClose();
    }
  };

  const handlePayNow = () => {
    if (invoiceResult?.invoice_url) {
      // Open Stripe hosted invoice page in new tab
      window.open(invoiceResult.invoice_url, '_blank');
      // Mark as success and close modal
      onSuccess(invoiceResult.order_id);
      handleClose();
    }
  };

  const handlePayLater = () => {
    if (invoiceResult?.order_id) {
      onSuccess(invoiceResult.order_id);
      handleClose();
    }
  };

  // Calculate totals from pricing preview if available
  const subtotal = pricingPreview?.subtotal ?? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = pricingPreview?.shipping ?? 0;
  const vatAmount = pricingPreview?.vat_amount ?? 0;
  const total = pricingPreview?.total ?? subtotal;

  // If showing address modal, render it standalone (not nested)
  if (showAddressModal) {
    return (
      <AddressCollectionModal
        isOpen={showAddressModal}
        onClose={handleAddressCancel}
        companyId={companyId}
        companyName={companyName}
        onSuccess={handleAddressSaved}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e8e8] bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {invoiceResult ? 'Invoice Created' : 'Request Invoice'}
            </h3>
            {!loading && (
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Invoice Created Success */}
          {invoiceResult ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Invoice Sent!
                </h4>
                <p className="text-gray-600">
                  Your invoice has been created and sent to your email.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-900 mb-1">What happens next?</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Check your email for the invoice from Stripe</li>
                      <li>• Click "Pay Now" below to pay immediately</li>
                      <li>• Or pay later using the link in your email</li>
                      <li>• Your order will be processed once payment is received</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePayNow}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Pay Now
                </button>
                <button
                  onClick={handlePayLater}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  I'll Pay Later
                </button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Invoice ID: {invoiceResult.invoice_id}
              </p>
            </div>
          ) : (
            // Request Invoice View
            <>
              {/* Order Summary */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#0a0a0a] mb-3">Order Summary</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(pricingPreview?.line_items && pricingPreview.line_items.length > 0
                        ? pricingPreview.line_items
                        : cart.map(item => ({
                            product_code: item.consumable_code,
                            description: item.description,
                            quantity: item.quantity,
                            base_price: item.price,
                            unit_price: item.price,
                            line_total: item.price * item.quantity,
                            discount_applied: null
                          }))
                      ).map((item) => (
                        <div
                          key={item.product_code}
                          className="flex justify-between items-center py-2 border-b border-[#f5f5f5] last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-[#0a0a0a] text-sm">
                              {item.description}
                            </div>
                            <div className="text-xs text-[#999] font-mono">
                              {item.product_code}
                            </div>
                            {item.discount_applied && (
                              <div className="text-xs text-[#16a34a] font-semibold mt-1">
                                {item.discount_applied}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-[#666]">
                              x{item.quantity}
                            </span>
                            <div className="text-right min-w-[80px]">
                              {item.discount_applied && item.base_price !== item.unit_price && (
                                <div className="text-xs text-[#999] line-through">
                                  £{(item.base_price * item.quantity).toFixed(2)}
                                </div>
                              )}
                              <span className="font-semibold text-[#0a0a0a] text-sm">
                                £{item.line_total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t-2 border-[#e8e8e8] pt-4 mb-6 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#666]">Subtotal:</span>
                      <span className="font-semibold text-[#0a0a0a]">
                        £{subtotal.toFixed(2)}
                      </span>
                    </div>
                    {pricingPreview && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#666]">Shipping:</span>
                          <span className="font-semibold text-[#0a0a0a]">
                            {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#666]">VAT:</span>
                          <span className="font-semibold text-[#0a0a0a]">
                            £{vatAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#e8e8e8]">
                          <span className="font-bold text-[#0a0a0a]">Total:</span>
                          <span className="font-bold text-[#16a34a] text-lg">
                            £{total.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {!pricingPreview && (
                      <div className="text-xs text-[#666] text-right">
                        VAT & shipping will be calculated
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 text-sm text-amber-800">
                        <strong>How it works:</strong> We'll create a Stripe invoice and send it to your email.
                        You can pay by card or bank transfer. Your order will be processed once payment is received.
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestInvoice}
                      disabled={loading}
                      className="flex-1 bg-[#16a34a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#15803d] transition-all shadow-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Request Invoice'
                      )}
                    </button>
                  </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
