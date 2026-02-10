/**
 * POST /api/marketing/templates/[templateId]/preview
 * Preview a template with sample or real contact data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { renderEmailTemplate, previewTemplate } from '@/lib/marketing/template-renderer';

export async function POST(
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
    const { contact_id, sample_data } = body;

    const supabase = getSupabaseClient();

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, body, preview_text')
      .eq('template_id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If contact_id provided, use real contact data
    if (contact_id) {
      // Fetch contact with company and tags
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select(`
          contact_id,
          first_name,
          last_name,
          email,
          job_title,
          company_id,
          companies!inner (
            company_id,
            company_name,
            country,
            industry
          )
        `)
        .eq('contact_id', contact_id)
        .single();

      if (contactError || !contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      // Fetch tags
      const { data: tags } = await supabase
        .from('contact_tags')
        .select('*')
        .eq('contact_id', contact_id);

      const rendered = renderEmailTemplate(
        {
          subject: template.subject,
          body: template.body,
          preview_text: template.preview_text,
        },
        {
          contact: {
            contact_id: contact.contact_id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            job_title: contact.job_title,
            company_id: contact.company_id,
          },
          company: contact.companies as any,
          tags: tags || [],
          customData: sample_data,
        }
      );

      return NextResponse.json({
        success: true,
        preview: rendered,
        mode: 'real_contact',
      });
    }

    // Otherwise, use sample data
    const rendered = previewTemplate(
      {
        subject: template.subject,
        body: template.body,
        preview_text: template.preview_text,
      },
      sample_data
    );

    return NextResponse.json({
      success: true,
      preview: rendered,
      mode: 'sample_data',
    });
  } catch (error) {
    console.error('[Template Preview] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
