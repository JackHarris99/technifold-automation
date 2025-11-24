/**
 * POST /api/admin/campaigns/configure
 * Save campaign content configuration (machine, problems, products)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      campaign_key,
      campaign_name,
      subject,
      machine_slug,
      problem_solution_ids,
      curated_skus,
    } = body;

    if (!campaign_key || !campaign_name || !machine_slug || !problem_solution_ids) {
      return NextResponse.json(
        { error: 'campaign_key, campaign_name, machine_slug, and problem_solution_ids are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if campaign already exists
    const { data: existing } = await supabase
      .from('campaigns')
      .select('campaign_key')
      .eq('campaign_key', campaign_key)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: campaign_name,
          machine_slug,
          problem_solution_ids,
          curated_skus: curated_skus || [],
          updated_at: new Date().toISOString(),
        })
        .eq('campaign_key', campaign_key);

      if (error) {
        console.error('[campaigns/configure] Update error:', error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('campaigns')
        .insert({
          campaign_key,
          name: campaign_name,
          status: 'draft',
          machine_slug,
          problem_solution_ids,
          curated_skus: curated_skus || [],
        });

      if (error) {
        console.error('[campaigns/configure] Insert error:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      campaign_key,
      message: 'Campaign configuration saved',
    });

  } catch (err) {
    console.error('[campaigns/configure] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/campaigns/configure?campaign_key=xxx
 * Load campaign configuration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaign_key = searchParams.get('campaign_key');

    if (!campaign_key) {
      return NextResponse.json({ error: 'campaign_key required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_key', campaign_key)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });

  } catch (err) {
    console.error('[campaigns/configure] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
