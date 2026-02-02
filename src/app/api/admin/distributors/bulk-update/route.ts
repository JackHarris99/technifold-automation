import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { distributors } = await request.json();

    if (!distributors || !Array.isArray(distributors)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const errors: string[] = [];
    let successCount = 0;

    // Update each distributor
    for (const dist of distributors) {
      const { error } = await supabase
        .from('companies')
        .update({
          pricing_tier: dist.pricing_tier,
          updated_at: new Date().toISOString(),
        })
        .eq('sage_customer_code', dist.sage_customer_code)
        .eq('type', 'distributor');

      if (error) {
        errors.push(`${dist.sage_customer_code}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { error: 'Failed to update distributors' },
      { status: 500 }
    );
  }
}
