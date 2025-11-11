/**
 * Content Blocks Library API
 * Manage the library of reusable content blocks (features, benefits, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all content blocks or filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockType = searchParams.get('type');

    let query = supabase
      .from('solution_content_blocks')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (blockType) {
      query = query.eq('block_type', blockType);
    }

    const { data: blocks, error } = await query;

    if (error) throw error;

    return NextResponse.json({ blocks: blocks || [] });
  } catch (error: any) {
    console.error('[content-blocks] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new content block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { block_type, title, content, icon } = body;

    if (!block_type || !content) {
      return NextResponse.json({ error: 'block_type and content are required' }, { status: 400 });
    }

    const { data: block, error } = await supabase
      .from('solution_content_blocks')
      .insert({
        block_type,
        title,
        content,
        icon,
        active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ block });
  } catch (error: any) {
    console.error('[content-blocks] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a content block
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { block_id, block_type, title, content, icon, active } = body;

    if (!block_id) {
      return NextResponse.json({ error: 'block_id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (block_type !== undefined) updateData.block_type = block_type;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;

    const { data: block, error } = await supabase
      .from('solution_content_blocks')
      .update(updateData)
      .eq('block_id', block_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ block });
  } catch (error: any) {
    console.error('[content-blocks] PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Soft delete a content block
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('block_id');

    if (!blockId) {
      return NextResponse.json({ error: 'block_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('solution_content_blocks')
      .update({ active: false })
      .eq('block_id', blockId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[content-blocks] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
