/**
 * POST /api/admin/marketing/prospects/import
 * Import prospects from CSV with deduplication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string;
    const sourceDetails = formData.get('source_details') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!source) {
      return NextResponse.json({ error: 'Source is required' }, { status: 400 });
    }

    // Read CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Required columns
    const companyNameIdx = headers.indexOf('company_name');
    const emailIdx = headers.indexOf('email');

    if (companyNameIdx === -1 || emailIdx === -1) {
      return NextResponse.json({
        error: 'CSV must have company_name and email columns'
      }, { status: 400 });
    }

    // Optional columns
    const firstNameIdx = headers.indexOf('first_name');
    const lastNameIdx = headers.indexOf('last_name');
    const phoneIdx = headers.indexOf('phone');
    const roleIdx = headers.indexOf('role');
    const seniorityIdx = headers.indexOf('seniority');
    const websiteIdx = headers.indexOf('website');
    const industryIdx = headers.indexOf('industry');
    const countryIdx = headers.indexOf('country');

    const supabase = getSupabaseClient();

    // Get existing emails to check for duplicates
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email');

    const { data: existingProspectContacts } = await supabase
      .from('prospect_contacts')
      .select('email');

    const existingEmails = new Set([
      ...(existingContacts || []).map(c => c.email.toLowerCase()),
      ...(existingProspectContacts || []).map(c => c.email.toLowerCase())
    ]);

    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        const companyName = values[companyNameIdx];
        const email = values[emailIdx]?.toLowerCase();

        if (!companyName || !email) {
          errors++;
          errorDetails.push(`Row ${i + 1}: Missing company_name or email`);
          continue;
        }

        // Check for duplicate
        if (existingEmails.has(email)) {
          duplicates++;
          continue;
        }

        // Create prospect company
        const { data: prospectCompany, error: companyError } = await supabase
          .from('prospect_companies')
          .insert({
            company_name: companyName,
            website: websiteIdx !== -1 ? values[websiteIdx] : null,
            industry: industryIdx !== -1 ? values[industryIdx] : null,
            country: countryIdx !== -1 ? values[countryIdx] : null,
            source,
            source_details: sourceDetails ? { note: sourceDetails } : null,
            lead_status: 'cold',
            lead_score: 0
          })
          .select()
          .single();

        if (companyError) {
          errors++;
          errorDetails.push(`Row ${i + 1}: ${companyError.message}`);
          continue;
        }

        // Create prospect contact
        const firstName = firstNameIdx !== -1 ? values[firstNameIdx] : null;
        const lastName = lastNameIdx !== -1 ? values[lastNameIdx] : null;
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

        const { error: contactError } = await supabase
          .from('prospect_contacts')
          .insert({
            prospect_company_id: prospectCompany.prospect_company_id,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            email,
            phone: phoneIdx !== -1 ? values[phoneIdx] : null,
            role: roleIdx !== -1 ? values[roleIdx] : null,
            seniority: seniorityIdx !== -1 ? values[seniorityIdx] : null,
            marketing_status: 'subscribed'
          });

        if (contactError) {
          errors++;
          errorDetails.push(`Row ${i + 1}: ${contactError.message}`);
          continue;
        }

        imported++;
        existingEmails.add(email); // Add to set to prevent duplicates within this batch

      } catch (error: any) {
        errors++;
        errorDetails.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      imported,
      duplicates,
      errors,
      error_details: errorDetails
    });

  } catch (error: any) {
    console.error('[Prospect Import] Error:', error);
    return NextResponse.json({
      error: error.message || 'Import failed'
    }, { status: 500 });
  }
}
