/**
 * POST /api/admin/tool-consumables/manage
 * Create or delete tool-consumable relationships
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
    const { action, tool_code, consumable_code, consumable_codes } = body;

    if (!action || !['create', 'delete', 'create_multiple'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (create, delete, create_multiple)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Handle DELETE
    if (action === 'delete') {
      if (!tool_code || !consumable_code) {
        return NextResponse.json(
          { error: 'tool_code and consumable_code are required for delete' },
          { status: 400 }
        );
      }

      const { error: deleteError } = await supabase
        .from('tool_consumable_map')
        .delete()
        .eq('tool_code', tool_code)
        .eq('consumable_code', consumable_code);

      if (deleteError) {
        console.error('[tool-consumables/manage] Delete error:', deleteError);
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      console.log('[tool-consumables/manage] Deleted relationship:', tool_code, consumable_code);

      return NextResponse.json({
        success: true,
        action: 'deleted',
      });
    }

    // Handle CREATE_MULTIPLE (for adding multiple consumables to one tool)
    if (action === 'create_multiple') {
      if (!tool_code || !consumable_codes || !Array.isArray(consumable_codes)) {
        return NextResponse.json(
          { error: 'tool_code and consumable_codes array are required for create_multiple' },
          { status: 400 }
        );
      }

      // Check for existing relationships
      const { data: existing } = await supabase
        .from('tool_consumable_map')
        .select('consumable_code')
        .eq('tool_code', tool_code)
        .in('consumable_code', consumable_codes);

      const existingCodes = new Set((existing || []).map((r: any) => r.consumable_code));

      // Filter out duplicates
      const newRelationships = consumable_codes
        .filter(code => !existingCodes.has(code))
        .map(consumable_code => ({
          tool_code,
          consumable_code,
        }));

      if (newRelationships.length === 0) {
        return NextResponse.json({
          success: true,
          action: 'created',
          message: 'All relationships already exist',
          created_count: 0,
        });
      }

      const { data: created, error: createError } = await supabase
        .from('tool_consumable_map')
        .insert(newRelationships)
        .select();

      if (createError) {
        console.error('[tool-consumables/manage] Create error:', createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      console.log('[tool-consumables/manage] Created', newRelationships.length, 'relationships for', tool_code);

      return NextResponse.json({
        success: true,
        action: 'created',
        created_count: newRelationships.length,
        relationships: created,
      });
    }

    // Handle single CREATE
    if (action === 'create') {
      if (!tool_code || !consumable_code) {
        return NextResponse.json(
          { error: 'tool_code and consumable_code are required for create' },
          { status: 400 }
        );
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('tool_consumable_map')
        .select('tool_code')
        .eq('tool_code', tool_code)
        .eq('consumable_code', consumable_code)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'This relationship already exists' },
          { status: 409 }
        );
      }

      const { data: relationship, error: createError } = await supabase
        .from('tool_consumable_map')
        .insert({ tool_code, consumable_code })
        .select()
        .single();

      if (createError) {
        console.error('[tool-consumables/manage] Create error:', createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      console.log('[tool-consumables/manage] Created relationship:', tool_code, consumable_code);

      return NextResponse.json({
        success: true,
        action: 'created',
        relationship,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[tool-consumables/manage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
