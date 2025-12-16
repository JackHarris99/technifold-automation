'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subscription {
  subscription_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  company_id: string;
  contact_id: string | null;
  monthly_price: number;
  currency: string;
  tools: string[];
  status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  ratchet_max: number | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

interface SubscriptionEvent {
  event_id: string;
  event_type: string;
  event_name: string;
  old_value: any;
  new_value: any;
  performed_at: string;
  notes: string | null;
}

interface Company {
  company_name: string;
  billing_address: string | null;
}

interface Contact {
  full_name: string;
  email: string;
}

interface Product {
  product_code: string;
  description: string;
  price: number;
}

export default function SubscriptionManagePage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTool, setShowAddTool] = useState(false);
  const [showUpdatePrice, setShowUpdatePrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [selectedTool, setSelectedTool] = useState('');

  useEffect(() => {
    loadSubscription();
    loadEvents();
    loadProducts();
  }, [subscriptionId]);

  async function loadSubscription() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .single();

      if (subError || !subData) {
        alert('Subscription not found');
        router.push('/admin/subscriptions');
        return;
      }

      setSubscription(subData);
      setNewPrice(subData.monthly_price.toString());

      // Load company
      const { data: companyData } = await supabase
        .from('companies')
        .select('company_name, billing_address')
        .eq('company_id', subData.company_id)
        .single();

      setCompany(companyData);

      // Load contact if exists
      if (subData.contact_id) {
        const { data: contactData } = await supabase
          .from('contacts')
          .select('full_name, email')
          .eq('contact_id', subData.contact_id)
          .single();

        setContact(contactData);
      }
    } catch (error) {
      console.error('[SubscriptionManage] Load error:', error);
      alert('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    const supabase = createClient();
    const { data } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('performed_at', { ascending: false });

    setEvents(data || []);
  }

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('product_code, description, price')
      .eq('type', 'tool')
      .order('description');

    setProducts(data || []);
  }

  async function handleAddTool() {
    if (!selectedTool || !subscription) return;

    const supabase = createClient();

    const updatedTools = [...subscription.tools, selectedTool];

    const { error } = await supabase
      .from('subscriptions')
      .update({
        tools: updatedTools,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (error) {
      alert(`Failed to add tool: ${error.message}`);
      return;
    }

    // Log event
    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: 'tool_added',
      event_name: 'Tool added to subscription',
      old_value: { tools: subscription.tools },
      new_value: { tools: updatedTools },
      notes: `Added ${selectedTool}`,
    });

    alert('Tool added successfully! Don\'t forget to update the price if needed.');
    setShowAddTool(false);
    setSelectedTool('');
    loadSubscription();
    loadEvents();
  }

  async function handleUpdatePrice() {
    if (!newPrice || !subscription) return;

    const priceValue = parseFloat(newPrice);

    if (priceValue <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    // Ratcheting check
    if (subscription.ratchet_max && priceValue < subscription.ratchet_max) {
      const confirm = window.confirm(
        `Warning: This price (£${priceValue}) is lower than the maximum price ever charged (£${subscription.ratchet_max}). ` +
        `Ratcheting subscriptions should only increase. Are you sure you want to proceed?`
      );
      if (!confirm) return;
    }

    const supabase = createClient();

    const newRatchetMax = Math.max(
      priceValue,
      subscription.ratchet_max || 0
    );

    const { error } = await supabase
      .from('subscriptions')
      .update({
        monthly_price: priceValue,
        ratchet_max: newRatchetMax,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (error) {
      alert(`Failed to update price: ${error.message}`);
      return;
    }

    // Log event
    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: priceValue > subscription.monthly_price ? 'price_increased' : 'price_decreased',
      event_name: 'Subscription price updated',
      old_value: { monthly_price: subscription.monthly_price },
      new_value: { monthly_price: priceValue },
      notes: `Price changed from £${subscription.monthly_price} to £${priceValue}`,
    });

    alert('Price updated successfully!');
    setShowUpdatePrice(false);
    loadSubscription();
    loadEvents();
  }

  async function handleCancelSubscription() {
    if (!subscription) return;

    const reason = window.prompt('Cancellation reason (optional):');
    if (reason === null) return; // User clicked cancel

    const supabase = createClient();

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (error) {
      alert(`Failed to cancel subscription: ${error.message}`);
      return;
    }

    // Log event
    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: 'cancelled',
      event_name: 'Subscription cancelled',
      old_value: { status: subscription.status },
      new_value: { status: 'cancelled' },
      notes: reason || 'No reason provided',
    });

    alert('Subscription cancelled');
    loadSubscription();
    loadEvents();
  }

  async function handleActivateSubscription() {
    if (!subscription) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (error) {
      alert(`Failed to activate subscription: ${error.message}`);
      return;
    }

    // Log event
    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: 'reactivated',
      event_name: 'Subscription activated',
      old_value: { status: subscription.status },
      new_value: { status: 'active' },
    });

    alert('Subscription activated');
    loadSubscription();
    loadEvents();
  }

  function formatCurrency(amount: number, currency: string = 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status: string) {
    const styles = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  }

  if (loading || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const availableTools = products.filter(p => !subscription.tools.includes(p.product_code));

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/subscriptions"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Subscriptions
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company?.company_name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Subscription ID: {subscription.subscription_id}
              </p>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Monthly Price</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(subscription.monthly_price, subscription.currency)}
                  </div>
                  {subscription.ratchet_max && subscription.ratchet_max > subscription.monthly_price && (
                    <div className="text-xs text-gray-500 mt-1">
                      Peak: {formatCurrency(subscription.ratchet_max, subscription.currency)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-2">{getStatusBadge(subscription.status)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Contact</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {contact ? (
                      <>
                        <div>{contact.full_name}</div>
                        <div className="text-gray-500">{contact.email}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Created</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(subscription.created_at)}
                  </div>
                </div>

                {subscription.trial_end_date && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Trial Ends</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription.trial_end_date)}
                    </div>
                  </div>
                )}

                {subscription.next_billing_date && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Next Billing</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription.next_billing_date)}
                    </div>
                  </div>
                )}

                {subscription.stripe_subscription_id && (
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-500">Stripe Subscription ID</div>
                    <div className="mt-1 text-sm text-gray-900 font-mono">
                      {subscription.stripe_subscription_id}
                    </div>
                  </div>
                )}
              </div>

              {subscription.notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium text-gray-500 mb-1">Internal Notes</div>
                  <div className="text-sm text-gray-700">{subscription.notes}</div>
                </div>
              )}
            </div>

            {/* Tools */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tools Included</h2>
                {subscription.status !== 'cancelled' && (
                  <button
                    onClick={() => setShowAddTool(!showAddTool)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Tool
                  </button>
                )}
              </div>

              {showAddTool && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tool to Add
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedTool}
                      onChange={(e) => setSelectedTool(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a tool...</option>
                      {availableTools.map((product) => (
                        <option key={product.product_code} value={product.product_code}>
                          {product.description} ({product.product_code})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddTool}
                      disabled={!selectedTool}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTool(false);
                        setSelectedTool('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {subscription.tools && subscription.tools.length > 0 ? (
                <div className="space-y-2">
                  {subscription.tools.map((toolCode) => {
                    const product = products.find(p => p.product_code === toolCode);
                    return (
                      <div
                        key={toolCode}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product?.description || toolCode}
                          </div>
                          <div className="text-xs text-gray-500">{toolCode}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tools assigned</p>
              )}
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.event_id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.event_name}</div>
                        <div className="text-xs text-gray-500">{formatDate(event.performed_at)}</div>
                        {event.notes && (
                          <div className="text-xs text-gray-600 mt-1">{event.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activity yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                {subscription.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => setShowUpdatePrice(!showUpdatePrice)}
                      className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                    >
                      Update Price
                    </button>

                    {subscription.status === 'trial' && (
                      <button
                        onClick={handleActivateSubscription}
                        className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                      >
                        Activate Now
                      </button>
                    )}

                    <button
                      onClick={handleCancelSubscription}
                      className="w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}

                <Link
                  href={`/admin/company/${subscription.company_id}`}
                  className="block w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  View Company
                </Link>
              </div>

              {showUpdatePrice && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Monthly Price (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdatePrice}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setShowUpdatePrice(false);
                        setNewPrice(subscription.monthly_price.toString());
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {subscription.ratchet_max && parseFloat(newPrice) < subscription.ratchet_max && (
                    <div className="mt-2 text-xs text-red-600">
                      ⚠️ Warning: New price is below ratchet max (£{subscription.ratchet_max})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stripe Integration Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stripe Status</h2>
              {subscription.stripe_subscription_id ? (
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-green-700">Connected</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Billing is handled by Stripe
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-700">Not Connected</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Customer needs to enter payment details before billing starts
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
