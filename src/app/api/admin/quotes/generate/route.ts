/**
 * POST /api/admin/quotes/generate
 * Creates quote in database and generates tokenized URL (SHORT token with quote_id reference)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

interface QuoteLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  product_type: 'tool' | 'consumable';
  category?: string;
  image_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, contact_id, line_items, pricing_mode, quote_type, is_test, created_by } = body;

    if (!company_id || !contact_id || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'company_id, contact_id, and line_items are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Calculate totals
    const subtotal = line_items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discountAmount = line_items.reduce((sum, item) =>
      sum + ((item.unit_price * item.quantity * item.discount_percent) / 100), 0
    );
    const total = subtotal - discountAmount;

    // Validate quote_type
    const validQuoteTypes = ['interactive', 'static'];
    const finalQuoteType = validQuoteTypes.includes(quote_type) ? quote_type : 'interactive';

    // 1. Create quote in database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        company_id,
        contact_id,
        quote_type: finalQuoteType,
        pricing_mode: pricing_mode || (finalQuoteType === 'interactive' ? 'standard' : null),
        status: 'draft',
        currency: 'GBP',
        subtotal,
        discount_amount: discountAmount,
        total_amount: total,
        is_test: is_test || false,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_by: created_by || 'system',
      })
      .select('quote_id')
      .single();

    if (quoteError || !quote) {
      console.error('[generate-quote] Database error:', quoteError);
      return NextResponse.json(
        { error: 'Failed to create quote in database' },
        { status: 500 }
      );
    }

    // 2. Create quote line items
    const quoteItems = line_items.map((item: QuoteLineItem, index: number) => ({
      quote_id: quote.quote_id,
      product_code: item.product_code,
      line_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      line_total: (item.unit_price * item.quantity) - ((item.unit_price * item.quantity * (item.discount_percent || 0)) / 100),
      product_type: item.product_type,
      category: item.category,
      image_url: item.image_url,
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems);

    if (itemsError) {
      console.error('[generate-quote] Line items error:', itemsError);
      // Rollback quote if items fail
      await supabase.from('quotes').delete().eq('quote_id', quote.quote_id);
      return NextResponse.json(
        { error: 'Failed to create quote line items' },
        { status: 500 }
      );
    }

    // 3. Generate SHORT token with just IDs (like reorder tokens)
    const token = generateToken({
      quote_id: quote.quote_id,
      company_id,
      contact_id,
      is_test: is_test || false,
    }, 720); // 30 days

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
    const url = `${baseUrl}/q/${token}`;

    // 4. DO NOT update status to 'sent' here - that happens when email is sent
    // Test links stay as 'draft', real quotes get 'sent' status when email sent via /api/admin/quote/send-email

    return NextResponse.json({ url, quote_id: quote.quote_id });
  } catch (error) {
    console.error('[generate-quote] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
