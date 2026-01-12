/**
 * GET/POST /api/admin/shipping-manifests
 * Manage shipping manifests for international shipments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET - Fetch all shipping manifests or filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user info
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'shipped', 'delivered'
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)

    const supabase = getSupabaseClient();
    let query = supabase
      .from('shipping_manifests')
      .select(`
        *,
        companies:company_id (company_name, country, account_owner),
        invoices:invoice_id (invoice_id, invoice_number, total_amount)
      `)
      .order('created_at', { ascending: false });

    if (status === 'pending') {
      query = query.is('shipped_at', null);
    } else if (status === 'shipped') {
      query = query.not('shipped_at', 'is', null).is('delivered_at', null);
    } else if (status === 'delivered') {
      query = query.not('delivered_at', 'is', null);
    }

    const { data: manifests, error } = await query;

    if (error) {
      console.error('[shipping-manifests] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch manifests' }, { status: 500 });
    }

    // Filter by account ownership if needed
    let filteredManifests = manifests || [];
    if (viewMode === 'my_customers') {
      filteredManifests = filteredManifests.filter(manifest =>
        manifest.companies?.account_owner === session.sales_rep_id
      );
    }

    return NextResponse.json({ manifests: filteredManifests });
  } catch (err) {
    console.error('[shipping-manifests] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Create a new shipping manifest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      invoice_id,
      subscription_id,
      destination_country,
      shipment_type,
      product_codes,
      courier,
      tracking_number,
      notes,
    } = body;

    if (!company_id || !destination_country || !shipment_type || !product_codes || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'company_id, destination_country, shipment_type, and product_codes are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // If invoice_id provided, fetch quantities from invoice_items
    let quantitiesMap: Record<string, number> = {};
    if (invoice_id) {
      const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('product_code, quantity')
        .eq('invoice_id', invoice_id);

      if (invoiceItems && invoiceItems.length > 0) {
        invoiceItems.forEach(item => {
          quantitiesMap[item.product_code] = item.quantity;
        });
      }
    }

    // Fetch product customs data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, hs_code, country_of_origin, customs_value_gbp, weight_kg')
      .in('product_code', product_codes);

    if (productsError || !products) {
      return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
    }

    // Build items array with customs info
    const items = products.map(product => ({
      product_code: product.product_code,
      description: product.description || product.product_code,
      hs_code: product.hs_code || '0000.00.00',
      country_of_origin: product.country_of_origin || 'GB',
      value_gbp: product.customs_value_gbp || 0,
      quantity: quantitiesMap[product.product_code] || 1, // Use actual quantity from order, default to 1
      weight_kg: product.weight_kg || 0,
    }));

    // Calculate totals
    const total_customs_value_gbp = items.reduce((sum, item) => sum + (item.value_gbp * item.quantity), 0);
    const total_weight_kg = items.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);

    // Generate customs invoice number
    const customs_invoice_number = `CI-${Date.now().toString().slice(-10)}`;

    // Create manifest
    const { data: manifest, error: manifestError } = await supabase
      .from('shipping_manifests')
      .insert({
        company_id,
        invoice_id: invoice_id || null,
        subscription_id: subscription_id || null,
        destination_country,
        shipment_type,
        courier: courier || null,
        tracking_number: tracking_number || null,
        customs_invoice_number,
        total_customs_value_gbp,
        total_weight_kg,
        items,
        notes: notes || null,
      })
      .select()
      .single();

    if (manifestError) {
      console.error('[shipping-manifests] Error creating:', manifestError);
      return NextResponse.json({ error: 'Failed to create manifest' }, { status: 500 });
    }

    return NextResponse.json({ success: true, manifest });
  } catch (err) {
    console.error('[shipping-manifests] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Update shipping manifest (mark as shipped/delivered)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { manifest_id, shipped_at, delivered_at, courier, tracking_number } = body;

    if (!manifest_id) {
      return NextResponse.json({ error: 'manifest_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (shipped_at !== undefined) updates.shipped_at = shipped_at;
    if (delivered_at !== undefined) updates.delivered_at = delivered_at;
    if (courier !== undefined) updates.courier = courier;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;

    const { data, error } = await supabase
      .from('shipping_manifests')
      .update(updates)
      .eq('manifest_id', manifest_id)
      .select()
      .single();

    if (error) {
      console.error('[shipping-manifests] Error updating:', error);
      return NextResponse.json({ error: 'Failed to update manifest' }, { status: 500 });
    }

    return NextResponse.json({ success: true, manifest: data });
  } catch (err) {
    console.error('[shipping-manifests] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
