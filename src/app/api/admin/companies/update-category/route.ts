/**
 * POST /api/admin/companies/update-category
 * Update a company's category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { company_id, category } = await request.json();

    if (!company_id || !category) {
      return NextResponse.json(
        { error: 'company_id and category required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('companies')
      .update({ category })
      .eq('company_id', company_id);

    if (error) {
      console.error('[admin/update-category] Error:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/update-category] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
