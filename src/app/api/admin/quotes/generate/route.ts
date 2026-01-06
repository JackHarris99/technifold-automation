/**
 * POST /api/admin/quotes/generate
 * Generates a tokenized quote URL with embedded line items
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/tokens';

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
    const { company_id, contact_id, line_items, pricing_mode, quote_type, is_test } = body;

    if (!company_id || !contact_id || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'company_id, contact_id, and line_items are required' },
        { status: 400 }
      );
    }

    // Generate token with quote data embedded (30 days TTL)
    const token = generateToken({
      company_id,
      contact_id,
      quote_items: line_items.map((item: QuoteLineItem) => ({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        product_type: item.product_type,
        category: item.category,
        image_url: item.image_url,
      })),
      pricing_mode: pricing_mode || 'standard',
      quote_type: quote_type || 'consumable_interactive', // Default to consumable
      is_test: is_test || false, // Test tokens bypass address collection
    }, 720); // 30 days

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
    const url = `${baseUrl}/q/${token}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[generate-quote] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
