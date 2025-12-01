/**
 * Stripe client and helper functions for checkout and webhooks
 */

import Stripe from 'stripe';
import { getSupabaseClient } from './supabase';

// Lazy-load Stripe client to avoid build-time errors
let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return stripeClient;
}

// Export for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get: (_, prop) => {
    const client = getStripeClient();
    return client[prop as keyof Stripe];
  },
});

export interface CheckoutLineItem {
  product_code: string;
  quantity: number;
}

/**
 * Resolve product codes to Stripe price IDs
 * Falls back to creating Stripe products/prices if they don't exist
 */
export async function resolveStripePriceIds(
  items: CheckoutLineItem[]
): Promise<Array<{ price: string; quantity: number; product_code: string }>> {
  const supabase = getSupabaseClient();

  // Fetch product details from database
  const productCodes = items.map(item => item.product_code);
  const { data: products, error } = await supabase
    .from('products')
    .select('product_code, description, price, currency, stripe_product_id, stripe_price_id_default, is_marketable')
    .in('product_code', productCodes);

  if (error || !products) {
    throw new Error(`Failed to fetch products: ${error?.message}`);
  }

  // Validate all products are marketable
  const unmarketable = products.filter(p => !p.is_marketable);
  if (unmarketable.length > 0) {
    throw new Error(`Products not available for purchase: ${unmarketable.map(p => p.product_code).join(', ')}`);
  }

  const lineItems: Array<{ price: string; quantity: number; product_code: string }> = [];

  for (const item of items) {
    const product = products.find(p => p.product_code === item.product_code);
    if (!product) {
      throw new Error(`Product not found: ${item.product_code}`);
    }

    let priceId = product.stripe_price_id_default;

    // If no price ID exists, create Stripe product and price
    if (!priceId) {
      console.log(`[stripe] Creating Stripe product/price for ${product.product_code}`);

      // Create or retrieve Stripe product
      let stripeProductId = product.stripe_product_id;
      if (!stripeProductId) {
        const stripeProduct = await stripe.products.create({
          name: product.description || product.product_code,
          metadata: {
            product_code: product.product_code,
          },
        });
        stripeProductId = stripeProduct.id;

        // Update database with Stripe product ID
        await supabase
          .from('products')
          .update({ stripe_product_id: stripeProductId })
          .eq('product_code', product.product_code);
      }

      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round((product.price || 0) * 100), // Convert to cents
        currency: (product.currency || 'GBP').toLowerCase(),
      });
      priceId = stripePrice.id;

      // Update database with price ID
      await supabase
        .from('products')
        .update({ stripe_price_id_default: priceId })
        .eq('product_code', product.product_code);
    }

    lineItems.push({
      price: priceId,
      quantity: item.quantity,
      product_code: item.product_code,
    });
  }

  return lineItems;
}

/**
 * Ensure a Stripe customer exists for a company
 * Returns existing customer ID or creates a new one
 */
export async function ensureStripeCustomer(companyId: string): Promise<string> {
  const supabase = getSupabaseClient();

  // Check if company already has a Stripe customer ID
  const { data: company, error } = await supabase
    .from('companies')
    .select('company_id, company_name, stripe_customer_id')
    .eq('company_id', companyId)
    .single();

  if (error || !company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  if (company.stripe_customer_id) {
    return company.stripe_customer_id;
  }

  // Create new Stripe customer
  console.log(`[stripe] Creating Stripe customer for company ${companyId}`);
  const customer = await stripe.customers.create({
    name: company.company_name,
    metadata: {
      company_id: companyId,
    },
  });

  // Update database
  await supabase
    .from('companies')
    .update({ stripe_customer_id: customer.id })
    .eq('company_id', companyId);

  return customer.id;
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession(params: {
  companyId: string;
  contactId?: string;
  items: CheckoutLineItem[];
  offerKey?: string;
  campaignKey?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const { companyId, contactId, items, offerKey, campaignKey, successUrl, cancelUrl } = params;

  // Resolve product codes to Stripe price IDs
  const lineItems = await resolveStripePriceIds(items);

  // Ensure Stripe customer exists
  const customerId = await ensureStripeCustomer(companyId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'bacs_debit'], // Support both card and BACS Direct Debit
    customer: customerId,
    automatic_tax: { enabled: true },
    line_items: lineItems.map(item => ({
      price: item.price,
      quantity: item.quantity,
    })),
    metadata: {
      company_id: companyId,
      contact_id: contactId || '',
      offer_key: offerKey || '',
      campaign_key: campaignKey || '',
      product_codes: JSON.stringify(lineItems.map(item => item.product_code)),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['GB', 'IE', 'FR', 'DE', 'NL', 'BE', 'ES', 'IT', 'US', 'CA'],
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
