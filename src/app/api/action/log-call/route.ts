/**
 * POST /api/action/log-call
 * Log a call using a validated action token
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateActionToken } from '@/lib/actionTokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, call_notes, outcome, follow_up_needed, follow_up_date } = body;

    if (!token || !call_notes) {
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

    const supabase = getSupabaseClient();

    // Add note to quote if quote_id present
    if (payload.quote_id) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('user_id', payload.user_id)
        .single();

      const noteText = `📞 Call logged\n\nOutcome: ${outcome}\n\n${call_notes}`;

      await supabase.from('quote_notes').insert({
        quote_id: payload.quote_id,
        user_id: payload.user_id,
        user_name: user?.full_name || payload.user_id,
        note_text: noteText,
      });
    }

    // Create follow-up task if needed
    if (follow_up_needed) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('user_id', payload.user_id)
        .single();

      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('company_id', payload.company_id)
        .single();

      const taskTitle = `Follow up with ${company?.company_name || 'customer'}`;
      const taskDescription = `Follow-up needed after call\n\nPrevious call notes:\n${call_notes}`;

      await supabase.from('tasks').insert({
        user_id: payload.user_id,
        task_type: 'quote_follow_up',
        priority: 60,
        status: 'pending',
        title: taskTitle,
        description: taskDescription,
        company_id: payload.company_id,
        quote_id: payload.quote_id || null,
        due_date: follow_up_date || null,
        auto_generated: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Call logged successfully',
    });
  } catch (error) {
    console.error('[action/log-call] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
