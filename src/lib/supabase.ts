import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyPayload, Company, CompanyStats } from '@/types';

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

export async function getPayloadByToken(token: string): Promise<CompanyPayload | null> {
  try {
    // Validate token format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return null;
    }

    const supabase = getSupabaseClient();

    // First, get the company_id from the portal token
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('portal_token', token)
      .single();

    if (companyError || !companyData) {
      return null;
    }

    // Then get the payload from the view
    const { data, error } = await supabase
      .from('vw_company_consumable_payload')
      .select('*')
      .eq('company_id', companyData.company_id)
      .single();

    if (error || !data) {
      return null;
    }

    // Log data completeness to check for potential 1000-row limits
    const payload = data as CompanyPayload;
    console.log(`Company ${payload.company_name}:`);
    console.log(`- Reorder items: ${payload.reorder_items?.length || 0}`);
    console.log(`- Tool tabs: ${payload.by_tool_tabs?.length || 0}`);
    payload.by_tool_tabs?.forEach((tab, idx) => {
      console.log(`  - Tab ${idx + 1} (${tab.tool_code}): ${tab.items?.length || 0} items`);
    });
    
    // Warning if we hit suspicious round numbers (possible truncation)
    const totalItems = (payload.reorder_items?.length || 0) + 
      (payload.by_tool_tabs?.reduce((sum, tab) => sum + (tab.items?.length || 0), 0) || 0);
    
    if (totalItems >= 1000 || payload.reorder_items?.length === 1000) {
      console.warn(`⚠️  POTENTIAL DATA TRUNCATION: Company ${payload.company_name} has exactly ${totalItems} total items. This might indicate a 1000-row limit in the view.`);
    }

    return payload;
  } catch (error) {
    console.error('Error fetching payload by token:', error);
    return null;
  }
}

// Admin dashboard functions
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const supabase = getSupabaseClient();
    
    let allCompanies: Company[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

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

// Generate portal URL for a company
export function generatePortalUrl(portalToken: string): string {
  // In development, always use localhost. In production, use the configured base URL.
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com');
  return `${baseUrl}/${portalToken}`;
}

export { getSupabaseClient as supabase };