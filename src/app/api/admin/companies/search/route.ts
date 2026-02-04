/**
 * GET /api/admin/companies/search?q=searchterm
 * Search all companies (customers, distributors, suppliers, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  console.log('[companies/search] Endpoint called');

  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    console.log('[companies/search] Query:', q);

    if (!q || q.length < 2) {
      console.log('[companies/search] Query too short, returning empty');
      return NextResponse.json({ companies: [] });
    }

    console.log('[companies/search] Getting Supabase client...');
    const supabase = getSupabaseClient();
    console.log('[companies/search] Supabase client obtained');

    // All users can see all companies (no territory filter on search)
    // But exclude dead companies from search results
    console.log('[companies/search] Running query...');

    // Search across multiple fields: name, ID, city, postal code, address, sage code, owner, country (all company types)
    const searchPattern = `%${q}%`;
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner, status, country, billing_city, billing_postal_code, billing_address_line_1, sage_customer_code, type')
      .or(`company_name.ilike.${searchPattern},company_id.ilike.${searchPattern},billing_city.ilike.${searchPattern},billing_postal_code.ilike.${searchPattern},billing_address_line_1.ilike.${searchPattern},sage_customer_code.ilike.${searchPattern},account_owner.ilike.${searchPattern},country.ilike.${searchPattern}`)
      .neq('status', 'dead')
      .order('company_name')
      .limit(15);

    // Also search in contacts (name and email) - all company types
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('company_id, email, full_name, first_name, last_name, companies!inner(company_id, company_name, account_owner, status, country, type)')
      .or(`email.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
      .neq('companies.status', 'dead')
      .limit(10);

    console.log('[companies/search] Query completed', {
      companyMatches: companyData?.length || 0,
      contactMatches: contactData?.length || 0
    });

    if (companyError && contactError) {
      console.error('[companies/search] Database error:', companyError || contactError);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Merge results and deduplicate
    const companiesFromContacts = contactData?.map(c => c.companies).filter(Boolean) || [];
    const allCompanies = [...(companyData || []), ...companiesFromContacts];

    // Deduplicate by company_id
    const uniqueCompanies = Array.from(
      new Map(allCompanies.map(c => [c.company_id, c])).values()
    ).slice(0, 20);

    console.log('[companies/search] Final results:', uniqueCompanies.length);

    return NextResponse.json({ companies: uniqueCompanies });
  } catch (err) {
    console.error('[companies/search] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
