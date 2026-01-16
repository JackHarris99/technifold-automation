/**
 * GET /api/admin/companies/match-stripe-customers
 * Match companies to Stripe customers by email and name
 * Returns suggested matches for review
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

interface Match {
  company_id: string;
  company_name: string;
  current_stripe_customer_id: string | null;
  stripe_customer_id: string;
  stripe_customer_name: string;
  stripe_customer_email: string;
  match_type: 'exact_email' | 'exact_name' | 'partial_name' | 'already_linked';
  confidence: 'high' | 'medium' | 'low';
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Only directors can match customers
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    console.log('[match-stripe-customers] Fetching companies from database');

    // Get ALL companies with their contact info (paginate to bypass 1000 row limit)
    const allCompanies: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: companiesPage, error: companiesError } = await supabase
        .from('companies')
        .select(`
          company_id,
          company_name,
          stripe_customer_id,
          contacts (
            contact_id,
            email,
            full_name
          )
        `)
        .order('company_name')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (companiesError) {
        console.error('[match-stripe-customers] Error fetching companies:', companiesError);
        return NextResponse.json(
          { error: 'Failed to fetch companies' },
          { status: 500 }
        );
      }

      if (companiesPage && companiesPage.length > 0) {
        allCompanies.push(...companiesPage);
        hasMore = companiesPage.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }
    }

    const companies = allCompanies;

    console.log(`[match-stripe-customers] Found ${companies?.length || 0} companies`);

    // Fetch all Stripe customers
    console.log('[match-stripe-customers] Fetching customers from Stripe');
    const stripeCustomers: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });

      stripeCustomers.push(...customers.data);
      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }

      // Rate limit protection
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[match-stripe-customers] Found ${stripeCustomers.length} Stripe customers`);

    // Create lookup maps for efficient matching
    const stripeByEmail = new Map<string, any>();
    const stripeByName = new Map<string, any[]>();

    for (const customer of stripeCustomers) {
      if (customer.email) {
        stripeByEmail.set(customer.email.toLowerCase(), customer);
      }
      if (customer.name) {
        const nameLower = customer.name.toLowerCase();
        if (!stripeByName.has(nameLower)) {
          stripeByName.set(nameLower, []);
        }
        stripeByName.get(nameLower)!.push(customer);
      }
    }

    // Match companies to Stripe customers
    const matches: Match[] = [];
    const unmatched: any[] = [];

    for (const company of companies || []) {
      // Skip if already linked
      if (company.stripe_customer_id) {
        // Verify the link still exists in Stripe
        const stripeCustomer = stripeCustomers.find(c => c.id === company.stripe_customer_id);
        if (stripeCustomer) {
          matches.push({
            company_id: company.company_id,
            company_name: company.company_name,
            current_stripe_customer_id: company.stripe_customer_id,
            stripe_customer_id: stripeCustomer.id,
            stripe_customer_name: stripeCustomer.name || '',
            stripe_customer_email: stripeCustomer.email || '',
            match_type: 'already_linked',
            confidence: 'high',
          });
          continue;
        }
      }

      // Get first contact
      const contacts = Array.isArray(company.contacts) ? company.contacts : (company.contacts ? [company.contacts] : []);
      const primaryContact = contacts[0];

      let matched = false;

      // Try exact email match first (highest confidence)
      if (primaryContact?.email) {
        const emailLower = primaryContact.email.toLowerCase();
        const stripeCustomer = stripeByEmail.get(emailLower);
        if (stripeCustomer) {
          matches.push({
            company_id: company.company_id,
            company_name: company.company_name,
            current_stripe_customer_id: company.stripe_customer_id,
            stripe_customer_id: stripeCustomer.id,
            stripe_customer_name: stripeCustomer.name || '',
            stripe_customer_email: stripeCustomer.email || '',
            match_type: 'exact_email',
            confidence: 'high',
          });
          matched = true;
          continue;
        }
      }

      // Try exact company name match (medium confidence)
      if (!matched && company.company_name) {
        const nameLower = company.company_name.toLowerCase();
        const stripeCustomers = stripeByName.get(nameLower);
        if (stripeCustomers && stripeCustomers.length === 1) {
          matches.push({
            company_id: company.company_id,
            company_name: company.company_name,
            current_stripe_customer_id: company.stripe_customer_id,
            stripe_customer_id: stripeCustomers[0].id,
            stripe_customer_name: stripeCustomers[0].name || '',
            stripe_customer_email: stripeCustomers[0].email || '',
            match_type: 'exact_name',
            confidence: 'medium',
          });
          matched = true;
          continue;
        }
      }

      // Try partial name match (low confidence)
      if (!matched && company.company_name) {
        const companyNameLower = company.company_name.toLowerCase();
        const partialMatches = stripeCustomers.filter(c => {
          if (!c.name) return false;
          const stripeName = c.name.toLowerCase();
          return stripeName.includes(companyNameLower) || companyNameLower.includes(stripeName);
        });

        if (partialMatches.length === 1) {
          matches.push({
            company_id: company.company_id,
            company_name: company.company_name,
            current_stripe_customer_id: company.stripe_customer_id,
            stripe_customer_id: partialMatches[0].id,
            stripe_customer_name: partialMatches[0].name || '',
            stripe_customer_email: partialMatches[0].email || '',
            match_type: 'partial_name',
            confidence: 'low',
          });
          matched = true;
          continue;
        }
      }

      // No match found
      if (!matched) {
        unmatched.push({
          company_id: company.company_id,
          company_name: company.company_name,
          contact_email: primaryContact?.email || null,
        });
      }
    }

    console.log(`[match-stripe-customers] Matched ${matches.length} companies, ${unmatched.length} unmatched`);

    return NextResponse.json({
      success: true,
      total_companies: companies?.length || 0,
      total_stripe_customers: stripeCustomers.length,
      matched: matches.length,
      unmatched: unmatched.length,
      matches,
      unmatched_companies: unmatched,
      summary: {
        already_linked: matches.filter(m => m.match_type === 'already_linked').length,
        exact_email: matches.filter(m => m.match_type === 'exact_email').length,
        exact_name: matches.filter(m => m.match_type === 'exact_name').length,
        partial_name: matches.filter(m => m.match_type === 'partial_name').length,
      },
    });

  } catch (err: any) {
    console.error('[match-stripe-customers] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
