/**
 * POST /api/admin/utils/assign-distributors
 * One-time utility: Assign all distributors to jack_harris
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // Update all distributors to jack_harris
    const { data, error, count } = await supabase
      .from('companies')
      .update({ account_owner: 'jack_harris' })
      .eq('category', 'distributor')
      .select();

    if (error) {
      console.error('[assign-distributors] Error:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${data?.length || 0} distributors to jack_harris`,
      updated: data?.length || 0
    });
  } catch (err) {
    console.error('[assign-distributors] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
