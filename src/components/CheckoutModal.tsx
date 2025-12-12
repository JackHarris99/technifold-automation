'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { CartItem } from '@/types';

// Load Stripe outside component to avoid recreating on re-renders
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  companyId: string;
  contactId?: string;
  onSuccess: (orderId: string) => void;
}

interface IntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  lineItems: Array<{
    product_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  companyId,
  contactId,
  onSuccess,
}: CheckoutModalProps) {
  const [intentData, setIntentData] = useState<IntentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create payment intent when modal opens
  useEffect(() => {
    if (isOpen && cart.length > 0 && !intentData) {
      createPaymentIntent();
    }
  }, [isOpen, cart]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIntentData(null);
      setError(null);
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_id: contactId,
          items: cart.map(item => ({
            product_code: item.consumable_code,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setIntentData(data);
    } catch (err) {
      console.error('[CheckoutModal] Error creating intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const elementsOptions: StripeElementsOptions = {
    clientSecret: intentData?.clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Complete your order securely
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-600">Preparing checkout...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button
                  onClick={createPaymentIntent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : intentData ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Order Summary</h3>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
                    {intentData.lineItems.map((item) => (
                      <div key={item.product_code} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-slate-700">{item.description}</span>
                          <span className="text-slate-400 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium text-slate-900">
                          £{item.total_price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="text-slate-900">£{intentData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">VAT (20%)</span>
                      <span className="text-slate-900">£{intentData.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900">£{intentData.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Company info */}
                  <div className="text-sm text-slate-500 pt-2">
                    <p>Ordering as: <span className="font-medium text-slate-700">{intentData.companyName}</span></p>
                    {intentData.contactName && (
                      <p>Contact: <span className="font-medium text-slate-700">{intentData.contactName}</span></p>
                    )}
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Payment Details</h3>
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <PaymentForm
                      intentData={intentData}
                      onSuccess={onSuccess}
                      onClose={onClose}
                    />
                  </Elements>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secured by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for the payment form (needs to be inside Elements provider)
interface PaymentFormProps {
  intentData: IntentData;
  onSuccess: (orderId: string) => void;
  onClose: () => void;
}

function PaymentForm({ intentData, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('[PaymentForm] Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('[PaymentForm] Payment succeeded:', paymentIntent.id);
      setPaymentSuccess(true);

      // Give webhook time to create order, then redirect
      setTimeout(() => {
        onSuccess(paymentIntent.id);
      }, 1500);
    } else if (paymentIntent && paymentIntent.status === 'processing') {
      // Some payment methods (like bank transfers) may take time to process
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess(paymentIntent.id);
      }, 1500);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Successful!</h3>
        <p className="text-slate-600">Thank you for your order. You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {paymentError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay £${intentData.amount.toFixed(2)}`
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-slate-600 py-2 text-sm hover:text-slate-900 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}
