import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyPayload } from '@/types';

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

    return data as CompanyPayload;
  } catch (error) {
    console.error('Error fetching payload by token:', error);
    return null;
  }
}

export { getSupabaseClient as supabase };