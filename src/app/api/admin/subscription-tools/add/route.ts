/**
 * POST /api/admin/subscription-tools/add
 * Add a tool to a subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscription_id, tool_code } = body;

    if (!subscription_id || !tool_code) {
      return NextResponse.json(
        { error: 'subscription_id and tool_code are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if tool already exists in this subscription
    const { data: existing, error: checkError } = await supabase
      .from('subscription_tools')
      .select('tool_code')
      .eq('subscription_id', subscription_id)
      .eq('tool_code', tool_code)
      .is('removed_at', null)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is what we want
      console.error('[subscription-tools/add] Check error:', checkError);
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'This tool is already in the subscription' },
        { status: 409 }
      );
    }

    // Add tool to subscription
    const { data: subscriptionTool, error: insertError } = await supabase
      .from('subscription_tools')
      .insert({
        subscription_id,
        tool_code,
        added_by: 'admin',
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[subscription-tools/add] Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('[subscription-tools/add] Added tool to subscription:', subscription_id, tool_code);

    return NextResponse.json({
      success: true,
      subscription_tool: subscriptionTool,
    });
  } catch (error) {
    console.error('[subscription-tools/add] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
