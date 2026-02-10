/**
 * GET /api/marketing/templates/[templateId]
 * Get a single email template
 *
 * PATCH /api/marketing/templates/[templateId]
 * Update an email template
 *
 * DELETE /api/marketing/templates/[templateId]
 * Delete an email template
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = params;
    const supabase = getSupabaseClient();

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('[Marketing Template] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = params;
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

    const supabase = getSupabaseClient();

    // Build update object (only include provided fields)
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (subject !== undefined) updates.subject = subject;
    if (templateBody !== undefined) updates.body = templateBody;
    if (preview_text !== undefined) updates.preview_text = preview_text;
    if (target_manufacturer !== undefined) updates.target_manufacturer = target_manufacturer;
    if (target_model !== undefined) updates.target_model = target_model;
    if (target_problem !== undefined) updates.target_problem = target_problem;
    if (target_machine_type !== undefined) updates.target_machine_type = target_machine_type;
    if (specificity_level !== undefined) updates.specificity_level = specificity_level;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('template_id', templateId)
      .select()
      .single();

    if (error) {
      console.error('[Marketing Template] Error updating template:', error);

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('[Marketing Template] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = params;
    const supabase = getSupabaseClient();

    // Check if template exists
    const { data: template, error: fetchError } = await supabase
      .from('email_templates')
      .select('template_id, name')
      .eq('template_id', templateId)
      .single();

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete template (cascade will delete send history and queue entries)
    const { error: deleteError } = await supabase
      .from('email_templates')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) {
      console.error('[Marketing Template] Error deleting template:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('[Marketing Template] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
