/**
 * POST /api/admin/utils/migrate-site-branding
 * One-time migration to create site_branding table
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // Create site_branding table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS site_branding (
          brand_key TEXT PRIMARY KEY,
          brand_name TEXT NOT NULL,
          logo_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.error('[migrate-site-branding] Create table error:', createTableError);
      // Continue anyway - table might already exist
    }

    // Insert the 3 company brands
    const { error: insertError } = await supabase
      .from('site_branding')
      .upsert([
        { brand_key: 'technifold', brand_name: 'Technifold', logo_url: null },
        { brand_key: 'technicrease', brand_name: 'Technicrease', logo_url: null },
        { brand_key: 'creasestream', brand_name: 'CreaseStream', logo_url: null },
      ], { onConflict: 'brand_key' });

    if (insertError) {
      console.error('[migrate-site-branding] Insert error:', insertError);
      return NextResponse.json({
        error: 'Failed to insert site branding records',
        details: insertError
      }, { status: 500 });
    }

    // Verify records
    const { data: brands, error: selectError } = await supabase
      .from('site_branding')
      .select('*')
      .order('brand_key');

    if (selectError) {
      console.error('[migrate-site-branding] Select error:', selectError);
      return NextResponse.json({
        error: 'Table created but verification failed',
        details: selectError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Site branding table created and populated',
      brands: brands || []
    });
  } catch (err: any) {
    console.error('[migrate-site-branding] Unexpected error:', err);
    return NextResponse.json({
      error: 'Migration failed',
      details: err.message
    }, { status: 500 });
  }
}
