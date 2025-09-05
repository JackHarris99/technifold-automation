import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Company, CompanyStats, CompanyPayload } from '@/types';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseClient;
}

// Get all companies with their portal tokens
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const supabase = getSupabaseClient();
    
    let allCompanies: Company[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    // Fetch companies in batches to handle large datasets
    while (hasMore) {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, portal_token, created_at, updated_at')
        .order('company_name')
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('Error fetching companies:', error);
        break;
      }

      if (data && data.length > 0) {
        allCompanies = [...allCompanies, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`Loaded ${allCompanies.length} companies from database`);
    return allCompanies;
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    return [];
  }
}

// Get company statistics (orders, spending, etc)
export async function getCompanyStats(): Promise<CompanyStats[]> {
  try {
    const supabase = getSupabaseClient();
    
    // This would typically come from a view or complex query
    // For now, let's get basic company info
    const { data, error } = await supabase
      .from('companies')
      .select('company_id, company_name, portal_token');

    if (error) {
      console.error('Error fetching company stats:', error);
      return [];
    }

    // Transform to CompanyStats format with mock data for now
    return (data || []).map(company => ({
      ...company,
      total_orders: 0, // Would come from orders table
      total_spent: 0,  // Would be calculated from orders
      last_order_date: null,
      portal_last_accessed: null
    }));
  } catch (error) {
    console.error('Error in getCompanyStats:', error);
    return [];
  }
}

// Get specific company's portal data
export async function getCompanyPortalData(companyId: string): Promise<CompanyPayload | null> {
  try {
    const supabase = getSupabaseClient();

    // Get the payload from the view
    const { data, error } = await supabase
      .from('vw_company_consumable_payload')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as CompanyPayload;
  } catch (error) {
    console.error('Error fetching company portal data:', error);
    return null;
  }
}

// Generate portal URL for a company
export function generatePortalUrl(portalToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_PORTAL_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/r/${portalToken}`;
}

export { getSupabaseClient as supabase };