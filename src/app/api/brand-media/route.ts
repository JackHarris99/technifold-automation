/**
 * Brand Media API Route
 * Fetches logo and hero image for a brand
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Brand slug is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: brandMedia, error } = await supabase
      .from('brand_media')
      .select('logo_url, hero_url')
      .eq('brand_slug', slug)
      .single();

    if (error) {
      console.error('[brand-media] Error fetching brand media:', error);
      return NextResponse.json({ brandMedia: null });
    }

    return NextResponse.json({ brandMedia });
  } catch (error: any) {
    console.error('[brand-media] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch brand media' }, { status: 500 });
  }
}
