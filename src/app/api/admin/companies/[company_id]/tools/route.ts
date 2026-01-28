/**
 * GET/POST /api/admin/companies/[company_id]/tools
 * Manage tools assigned to a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET - Fetch all tools for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company_id: companyId } = await params;
    const supabase = getSupabaseClient();

    const { data: tools, error } = await supabase
      .from('company_tools')
      .select(`
        tool_code,
        total_units,
        first_seen_at,
        last_seen_at,
        products:tool_code (
          description,
          category,
          price
        )
      `)
      .eq('company_id', companyId)
      .order('last_seen_at', { ascending: false });

    if (error) {
      console.error('[companies/tools] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }

    return NextResponse.json({ tools: tools || [] });
  } catch (err) {
    console.error('[companies/tools] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Add or update a tool for a company
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id: companyId } = await params;
    const body = await request.json();
    const { tool_code, total_units } = body;

    if (!tool_code || total_units === undefined || total_units < 0) {
      return NextResponse.json(
        { error: 'tool_code and total_units (>=0) are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // If total_units is 0, remove the tool
    if (total_units === 0) {
      const { error } = await supabase
        .from('company_tools')
        .delete()
        .eq('company_id', companyId)
        .eq('tool_code', tool_code);

      if (error) {
        console.error('[companies/tools] Error deleting:', error);
        return NextResponse.json({ error: 'Failed to remove tool' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'deleted' });
    }

    // Otherwise, upsert the tool
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('company_tools')
      .upsert(
        {
          company_id: companyId,
          tool_code: tool_code,
          total_units: total_units,
          first_seen_at: today,
          last_seen_at: today,
        },
        {
          onConflict: 'company_id,tool_code',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[companies/tools] Error upserting:', error);
      return NextResponse.json({ error: 'Failed to save tool' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tool: data });
  } catch (err) {
    console.error('[companies/tools] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a specific tool from a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const tool_code = searchParams.get('tool_code');

    if (!tool_code) {
      return NextResponse.json({ error: 'tool_code parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('company_tools')
      .delete()
      .eq('company_id', companyId)
      .eq('tool_code', tool_code);

    if (error) {
      console.error('[companies/tools] Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[companies/tools] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
