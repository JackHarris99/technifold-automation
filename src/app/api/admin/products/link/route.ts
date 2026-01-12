/**
 * POST /api/admin/products/link - Link tool to consumable
 * DELETE /api/admin/products/link - Unlink tool from consumable
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { tool_code, consumable_code } = await request.json();

    if (!tool_code || !consumable_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('tool_consumable_map')
      .insert({ tool_code, consumable_code });

    if (error) {
      console.error('[Product Link] Error:', error);
      return NextResponse.json({ error: 'Failed to link products' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Product Link] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { tool_code, consumable_code } = await request.json();

    if (!tool_code || !consumable_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('tool_consumable_map')
      .delete()
      .eq('tool_code', tool_code)
      .eq('consumable_code', consumable_code);

    if (error) {
      console.error('[Product Unlink] Error:', error);
      return NextResponse.json({ error: 'Failed to unlink products' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Product Unlink] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
