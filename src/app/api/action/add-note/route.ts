/**
 * POST /api/action/add-note
 * Add a note to a quote using a validated action token
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateActionToken } from '@/lib/actionTokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, note_text } = body;

    if (!token || !note_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip_address = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

    // Validate token
    const payload = await validateActionToken(token, ip_address);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify this action requires a quote_id
    if (!payload.quote_id) {
      return NextResponse.json(
        { success: false, error: 'No quote associated with this action' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('full_name')
      .eq('user_id', payload.user_id)
      .single();

    // Add note to quote
    const { error: insertError } = await supabase
      .from('quote_notes')
      .insert({
        quote_id: payload.quote_id,
        user_id: payload.user_id,
        user_name: user?.full_name || payload.user_id,
        note_text: note_text.trim(),
      });

    if (insertError) {
      console.error('[action/add-note] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to add note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
    });
  } catch (error) {
    console.error('[action/add-note] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
