/**
 * Create Campaign API
 * POST /api/admin/campaigns/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaign_name,
      campaign_type,
      product_codes,
      target_machine_category_id,
      target_knowledge_levels,
      subject_line_template,
      tagline_template,
      description,
    } = body;

    // Validation
    if (!campaign_name || !product_codes || product_codes.length === 0 || !target_machine_category_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate campaign key (slug from name + timestamp)
    const campaign_key = `${campaign_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    // Create campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        campaign_key,
        campaign_name,
        campaign_type: campaign_type || 'progressive',
        product_codes,
        target_machine_category_id,
        target_knowledge_levels: target_knowledge_levels || [1, 2, 3],
        subject_line_template,
        tagline_template,
        description,
        status: 'draft',
        created_by: 'admin', // TODO: Add actual user auth
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (error) {
    console.error('Error in create campaign API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
