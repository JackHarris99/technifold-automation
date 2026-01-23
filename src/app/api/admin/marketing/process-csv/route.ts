/**
 * POST /api/admin/marketing/process-csv
 * Upload and process prospect CSV files
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string;

    if (!file || !source) {
      return NextResponse.json({ error: 'File and source are required' }, { status: 400 });
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Parse CSV headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate required columns
    const requiredColumns = ['email'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      return NextResponse.json({
        error: `Missing required columns: ${missingColumns.join(', ')}`
      }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch existing emails for deduplication
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email');

    const { data: existingProspectContacts } = await supabase
      .from('prospect_contacts')
      .select('email');

    const existingEmails = new Set([
      ...(existingContacts || []).map((c: any) => c.email.toLowerCase()),
      ...(existingProspectContacts || []).map((c: any) => c.email.toLowerCase())
    ]);

    // Process CSV rows
    const cleanedData: any[] = [];
    const issues: any[] = [];
    const seenEmailsInFile = new Set<string>();

    let validRows = 0;
    let duplicateEmails = 0;
    let invalidEmails = 0;
    let existingCustomers = 0;
    let existingProspects = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      // Validate email
      const email = row.email?.toLowerCase();
      if (!email || !isValidEmail(email)) {
        invalidEmails++;
        issues.push({
          type: 'Invalid Email',
          message: `Row ${i + 1}: Invalid or missing email "${row.email}"`
        });
        continue;
      }

      // Check for duplicates within this file
      if (seenEmailsInFile.has(email)) {
        duplicateEmails++;
        continue;
      }

      // Check against existing database
      if (existingEmails.has(email)) {
        const isCustomer = existingContacts?.some((c: any) => c.email.toLowerCase() === email);
        if (isCustomer) {
          existingCustomers++;
        } else {
          existingProspects++;
        }
        continue;
      }

      // Add to seen set
      seenEmailsInFile.add(email);

      // Clean and normalize data
      const cleanedRow = {
        company_name: normalizeCompanyName(row.company_name || row.company || ''),
        email: email,
        first_name: row.first_name || row.firstname || '',
        last_name: row.last_name || row.lastname || '',
        full_name: row.full_name || row.name || '',
        phone: row.phone || row.telephone || '',
        website: normalizeWebsite(row.website || row.url || ''),
        country: normalizeCountry(row.country || ''),
        industry: row.industry || row.sector || '',
      };

      cleanedData.push(cleanedRow);
      validRows++;
    }

    // Create processing job
    const { data: job, error: jobError } = await supabase
      .from('csv_processing_jobs')
      .insert({
        filename: file.name,
        source,
        status: 'ready_for_review',
        total_rows: lines.length - 1,
        valid_rows: validRows,
        duplicate_emails: duplicateEmails,
        invalid_emails: invalidEmails,
        existing_customers: existingCustomers,
        existing_prospects: existingProspects,
        cleaned_data: cleanedData,
        issues: issues,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    return NextResponse.json({
      success: true,
      job_id: job.job_id,
      valid_rows: validRows,
      duplicate_emails: duplicateEmails,
      invalid_emails: invalidEmails,
      existing_customers: existingCustomers,
      existing_prospects: existingProspects,
    });

  } catch (error: any) {
    console.error('[ProcessCSV] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map(v => v.replace(/^"|"$/g, ''));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function normalizeCompanyName(name: string): string {
  if (!name) return '';

  // Common variations
  let normalized = name.trim();
  normalized = normalized.replace(/\s+ltd\.?$/i, ' Ltd');
  normalized = normalized.replace(/\s+limited$/i, ' Limited');
  normalized = normalized.replace(/\s+inc\.?$/i, ' Inc');
  normalized = normalized.replace(/\s+llc$/i, ' LLC');
  normalized = normalized.replace(/\s+gmbh$/i, ' GmbH');

  return normalized;
}

function normalizeWebsite(url: string): string {
  if (!url) return '';

  let normalized = url.trim().toLowerCase();

  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//i, '');

  // Remove www
  normalized = normalized.replace(/^www\./i, '');

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');

  return normalized;
}

function normalizeCountry(country: string): string {
  if (!country) return '';

  const countryMap: Record<string, string> = {
    'usa': 'United States',
    'us': 'United States',
    'united states': 'United States',
    'uk': 'United Kingdom',
    'great britain': 'United Kingdom',
    'britain': 'United Kingdom',
    'england': 'United Kingdom',
    'deutschland': 'Germany',
    'de': 'Germany',
  };

  const normalized = country.trim().toLowerCase();
  return countryMap[normalized] || country.trim();
}
