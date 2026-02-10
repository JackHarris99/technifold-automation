/**
 * GET /api/marketing/templates
 * List all email templates with filtering
 *
 * POST /api/marketing/templates
 * Create a new email template
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Filtering options
    const active = searchParams.get('active');
    const category = searchParams.get('category');
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (active !== null) {
      query = query.eq('active', active === 'true');
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (manufacturer) {
      query = query.eq('target_manufacturer', manufacturer);
    }
    if (model) {
      query = query.eq('target_model', model);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('[Marketing Templates] Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
      count: templates?.length || 0,
    });
  } catch (error) {
    console.error('[Marketing Templates] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      subject,
      body: templateBody,
      preview_text,
      target_manufacturer,
      target_model,
      target_problem,
      target_machine_type,
      specificity_level,
      category,
      tags,
      active,
    } = body;

    // Validation
    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Create template
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        description,
        subject,
        body: templateBody,
        preview_text,
        target_manufacturer,
        target_model,
        target_problem,
        target_machine_type,
        specificity_level: specificity_level || 0,
        category,
        tags,
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Marketing Templates] Error creating template:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('[Marketing Templates] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
