import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyPayload, Company, CustomerProfile, OrderHistory } from '@/types';

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

export async function getToolCategories() {
  try {
    const supabase = getSupabaseClient();

    // Get distinct categories for tools
    const { data, error } = await supabase
      .from('products')
      .select('category, product_code, description')
      .eq('type', 'tool')
      .order('category');

    if (error) {
      console.error('Error fetching tool categories:', error);
      return [];
    }

    // Group by category
    const categoriesMap = new Map();
    data?.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, {
          name: category,
          tools: [],
          exampleImage: `/product_images/${product.product_code}.jpg`
        });
      }
      categoriesMap.get(category).tools.push({
        code: product.product_code,
        description: product.description
      });
    });

    return Array.from(categoriesMap.values());
  } catch (error) {
    console.error('Error in getToolCategories:', error);
    return [];
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
        .select('company_id, company_name, created_at, updated_at, category')
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

// Get all unique categories from companies table
export async function getCompanyCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('companies')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    const uniqueCategories = [...new Set(data?.map(d => d.category) || [])];
    console.log('Available categories in database:', uniqueCategories);
    return uniqueCategories;
  } catch (error) {
    console.error('Error in getCompanyCategories:', error);
    return [];
  }
}

// Fetch companies by specific category
export async function getCompaniesByCategory(category: string): Promise<Company[]> {
  try {
    const supabase = getSupabaseClient();

    let allCompanies: Company[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const query = supabase
        .from('companies')
        .select('company_id, company_name, created_at, updated_at, category')
        .order('company_name')
        .range(from, from + batchSize - 1);

      // Only filter by category if it's specified
      if (category && category !== 'All') {
        query.eq('category', category);
      } else if (category === 'Uncategorized') {
        // Handle companies with null or empty categories
        query.or('category.is.null,category.eq.')
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${category} companies:`, error);
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

    console.log(`Loaded ${allCompanies.length} ${category} companies from database`);
    return allCompanies;
  } catch (error) {
    console.error(`Error in getCompaniesByCategory(${category}):`, error);
    return [];
  }
}



// Product catalog functions
export async function getProductCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('type', 'tool')
      .range(0, 9999); // Handle up to 10,000 products

    console.log('Product categories query:', { data, error });

    if (error || !data) {
      return [];
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
    console.log('Unique tool categories:', uniqueCategories);
    
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
}

export async function getToolsByCategory(category: string) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'tool')
      .eq('category', category)
      .range(0, 9999); // Handle up to 10,000 products per category

    console.log(`Tools in category "${category}":`, { data, error });

    if (error) {
      console.error('Error fetching tools by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getToolsByCategory:', error);
    return [];
  }
}

// Get all products for admin datasheet listing
export async function getAllProductsWithDatasheets() {
  try {
    const supabase = getSupabaseClient();

    // Fetch products with correct column names
    const { data, error, count } = await supabase
      .from('products')
      .select('product_code, description, category, type, price, currency, active', { count: 'exact' })
      .eq('type', 'tool')
      .order('category', { ascending: true })
      .order('description', { ascending: true })
      .range(0, 9999); // Explicitly request up to 10,000 records

    if (error) {
      console.error('Error fetching products with datasheets:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} tool products out of ${count} total matching records`);

    return data || [];
  } catch (error) {
    console.error('Error in getAllProductsWithDatasheets:', error);
    return [];
  }
}

// Technical product data sheet functions
export async function getToolByProductCode(productCode: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', productCode)
      .eq('type', 'tool')
      .single();

    console.log(`Tool details for "${productCode}":`, { data, error });

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching tool by product code:', error);
    return null;
  }
}

export async function getCompatibleConsumables(productCode: string) {
  try {
    console.log(`Looking for consumables compatible with "${productCode}" using tool_consumable_map`);
    const supabase = getSupabaseClient();
    
    // Query the tool_consumable_map table to find consumables for this tool
    const { data, error } = await supabase
      .from('tool_consumable_map')
      .select('consumable_code')
      .eq('tool_code', productCode)
      .limit(500);

    console.log(`Found ${data?.length || 0} compatible consumables for "${productCode}"`);

    if (error || !data || data.length === 0) {
      console.error('Error or no data in tool_consumable_map:', error);
      return [];
    }

    // Get the consumable codes
    const consumableCodes = data.map(item => item.consumable_code);

    // Fetch the actual product details for these consumables
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, price, currency, type, category')
      .in('product_code', consumableCodes)
      .limit(500);

    if (productsError) {
      console.error('Error fetching consumable products:', productsError);
      return [];
    }

    console.log(`Returning ${products?.length || 0} consumables`);
    return products || [];
  } catch (error) {
    console.error('Error in getCompatibleConsumables:', error);
    return [];
  }
}

// Get company contacts
export async function getCompanyContacts(companyId: string): Promise<Array<{
  contact_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
}>> {
  try {
    console.log(`[CONTACTS] Fetching contacts for company: ${companyId}`);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', companyId);

    console.log(`[CONTACTS] Found ${data?.length || 0} contacts for company ${companyId}`);

    if (error) {
      console.error('[CONTACTS] Error fetching contacts:', error);
      return [];
    }

    // Log first contact for debugging
    if (data && data.length > 0) {
      console.log('[CONTACTS] Sample contact:', data[0]);
    }

    return data || [];
  } catch (error) {
    console.error('[CONTACTS] Error in getCompanyContacts:', error);
    return [];
  }
}


// URL encoding/decoding utilities for product codes with forward slashes
export function encodeProductCodeForUrl(productCode: string): string {
  return productCode.replace(/\//g, '--');
}

export function decodeProductCodeFromUrl(encodedCode: string): string {
  return encodedCode.replace(/--/g, '/');
}

// Get all orders for admin dashboard
export async function getAllOrders(): Promise<Array<{
  order_id: string;
  company_id: string;
  company_name?: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  stripe_session_id?: string;
  items_count?: number;
}>> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        company_id,
        total_amount,
        currency,
        status,
        created_at,
        stripe_session_id,
        companies (company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return (data || []).map(order => ({
      order_id: order.order_id,
      company_id: order.company_id,
      company_name: (order.companies as any)?.company_name,
      total_amount: order.total_amount,
      currency: order.currency,
      status: order.status,
      created_at: order.created_at,
      stripe_session_id: order.stripe_session_id,
    }));
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return [];
  }
}

// Get all outbox jobs for admin dashboard
export async function getAllOutboxJobs(): Promise<Array<{
  id: string;
  job_id: string;
  job_type: string;
  status: string;
  payload: any;
  attempts: number;
  max_attempts: number;
  created_at: string;
  scheduled_for: string;
  locked_until: string | null;
  last_error: string | null;
  completed_at: string | null;
}>> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching outbox jobs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllOutboxJobs:', error);
    return [];
  }
}

// Export both the default name and the alias for compatibility
export { getSupabaseClient };
export { getSupabaseClient as supabase };