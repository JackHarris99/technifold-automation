/**
 * GET/POST/PUT/DELETE /api/admin/content-blocks
 * Manage content blocks library
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * GET - Fetch all content blocks or filter by type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const supabase = getSupabaseClient();
    let query = supabase
      .from('content_blocks')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('block_type', type);
    }

    const { data: blocks, error } = await query;

    if (error) {
      console.error('[content-blocks] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
    }

    // Transform JSONB content to flat structure for admin UI
    const transformedBlocks = (blocks || []).map(block => ({
      block_id: block.block_id,
      block_type: block.block_type,
      title: block.content?.title || block.content?.heading || '',
      content: block.content?.text || block.content?.description || block.content?.quote || JSON.stringify(block.content, null, 2),
      icon: block.content?.icon || '',
      active: block.active,
      created_at: block.created_at,
      priority: block.priority,
      solution_slug: block.solution_slug,
      relevance_tags: block.relevance_tags,
    }));

    return NextResponse.json({ blocks: transformedBlocks });
  } catch (err) {
    console.error('[content-blocks] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Create a new content block
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { block_type, title, content, icon, solution_slug, relevance_tags, priority } = body;

    if (!block_type || !content) {
      return NextResponse.json(
        { error: 'block_type and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Transform flat structure to JSONB content based on block_type
    let contentJson: any = {};
    switch (block_type) {
      case 'feature':
        contentJson = { title, description: content, icon };
        break;
      case 'benefit':
        contentJson = { title, description: content, icon };
        break;
      case 'stat':
        contentJson = { value: title, label: content };
        break;
      case 'testimonial':
        contentJson = { quote: content, customer: title };
        break;
      case 'step':
        contentJson = { title, description: content };
        break;
      default:
        contentJson = { title, text: content, icon };
    }

    const { data, error } = await supabase
      .from('content_blocks')
      .insert({
        block_type,
        solution_slug: solution_slug || null,
        relevance_tags: relevance_tags || [],
        content: contentJson,
        priority: priority || 0,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[content-blocks] Error creating:', error);
      return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
    }

    return NextResponse.json({ success: true, block: data });
  } catch (err) {
    console.error('[content-blocks] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Update an existing content block
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { block_id, block_type, title, content, icon, active, solution_slug, relevance_tags, priority } = body;

    if (!block_id) {
      return NextResponse.json({ error: 'block_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Transform flat structure to JSONB content
    let contentJson: any = {};
    switch (block_type) {
      case 'feature':
        contentJson = { title, description: content, icon };
        break;
      case 'benefit':
        contentJson = { title, description: content, icon };
        break;
      case 'stat':
        contentJson = { value: title, label: content };
        break;
      case 'testimonial':
        contentJson = { quote: content, customer: title };
        break;
      case 'step':
        contentJson = { title, description: content };
        break;
      default:
        contentJson = { title, text: content, icon };
    }

    const { data, error } = await supabase
      .from('content_blocks')
      .update({
        block_type,
        content: contentJson,
        active: active !== undefined ? active : true,
        solution_slug: solution_slug || null,
        relevance_tags: relevance_tags || [],
        priority: priority !== undefined ? priority : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('block_id', block_id)
      .select()
      .single();

    if (error) {
      console.error('[content-blocks] Error updating:', error);
      return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
    }

    return NextResponse.json({ success: true, block: data });
  } catch (err) {
    console.error('[content-blocks] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a content block
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const block_id = searchParams.get('block_id');

    if (!block_id) {
      return NextResponse.json({ error: 'block_id parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('block_id', block_id);

    if (error) {
      console.error('[content-blocks] Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[content-blocks] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
