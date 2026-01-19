/**
 * POST /api/admin/distributor-users/delete
 * Delete a distributor user (only if they have no orders)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get user details first
    const { data: user, error: userError } = await supabase
      .from('distributor_users')
      .select('user_id, email, full_name, company_id')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has any orders
    const { data: orders, error: ordersError } = await supabase
      .from('distributor_orders')
      .select('order_id')
      .eq('user_id', user_id)
      .limit(1);

    if (ordersError) {
      console.error('[delete distributor user] Error checking orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to check user orders' },
        { status: 500 }
      );
    }

    // If user has orders, prevent deletion
    if (orders && orders.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete user with order history',
          message: 'This user has placed orders. Use "Deactivate" instead to prevent login while preserving order history.',
          has_orders: true
        },
        { status: 400 }
      );
    }

    // Safe to delete - user has no orders
    const { error: deleteError } = await supabase
      .from('distributor_users')
      .delete()
      .eq('user_id', user_id);

    if (deleteError) {
      console.error('[delete distributor user] Error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.email} deleted successfully`,
    });

  } catch (err: any) {
    console.error('[delete distributor user] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
