/**
 * POST /api/admin/marketing/approve-csv
 * Approve and import cleaned CSV data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from('csv_processing_jobs')
      .select('*')
      .eq('job_id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'ready_for_review') {
      return NextResponse.json({
        error: `Job status is "${job.status}", expected "ready_for_review"`
      }, { status: 400 });
    }

    const cleanedData = job.cleaned_data || [];
    let importedCount = 0;
    const errors: any[] = [];

    // Group by company
    const companiesMap = new Map<string, any[]>();

    for (const row of cleanedData) {
      const companyKey = row.company_name.toLowerCase();
      if (!companiesMap.has(companyKey)) {
        companiesMap.set(companyKey, []);
      }
      companiesMap.get(companyKey)!.push(row);
    }

    // Import companies and contacts
    for (const [companyKey, contacts] of companiesMap.entries()) {
      try {
        const firstContact = contacts[0];

        // Create prospect company
        const { data: prospectCompany, error: companyError } = await supabase
          .from('prospect_companies')
          .insert({
            company_name: firstContact.company_name,
            website: firstContact.website || null,
            industry: firstContact.industry || null,
            country: firstContact.country || null,
            source: job.source,
            lead_status: 'cold',
            lead_score: 0,
          })
          .select()
          .single();

        if (companyError) {
          console.error('[ImportCSV] Company error:', companyError);
          errors.push({
            company: firstContact.company_name,
            error: companyError.message
          });
          continue;
        }

        // Create prospect contacts
        for (const contact of contacts) {
          const { error: contactError } = await supabase
            .from('prospect_contacts')
            .insert({
              prospect_company_id: prospectCompany.prospect_company_id,
              email: contact.email,
              first_name: contact.first_name || null,
              last_name: contact.last_name || null,
              full_name: contact.full_name || null,
              phone: contact.phone || null,
              marketing_status: 'subscribed',
            });

          if (contactError) {
            console.error('[ImportCSV] Contact error:', contactError);
            errors.push({
              email: contact.email,
              error: contactError.message
            });
          } else {
            importedCount++;
          }
        }

      } catch (error: any) {
        console.error('[ImportCSV] Error:', error);
        errors.push({
          company: firstContact?.company_name,
          error: error.message
        });
      }
    }

    // Update job status
    await supabase
      .from('csv_processing_jobs')
      .update({
        status: 'imported',
        imported_count: importedCount,
        imported_at: new Date().toISOString(),
        reviewed_by: user.user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('job_id', job_id);

    return NextResponse.json({
      success: true,
      imported_count: importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[ApproveCSV] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
