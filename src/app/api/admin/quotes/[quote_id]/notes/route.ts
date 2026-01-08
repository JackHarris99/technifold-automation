/**
 * POST /api/admin/quotes/[quote_id]/notes
 * Add an internal note to a quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    const { quote_id } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user info
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { note_text } = body;

    if (!note_text || !note_text.trim()) {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify quote exists
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('quote_id')
      .eq('quote_id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Insert note
    const { data: note, error: insertError } = await supabase
      .from('quote_notes')
      .insert({
        quote_id,
        user_id: session.user_id,
        user_name: session.full_name || session.user_id,
        note_text: note_text.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[quotes/notes] Error inserting note:', insertError);
      return NextResponse.json(
        { error: 'Failed to add note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('[quotes/notes] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
